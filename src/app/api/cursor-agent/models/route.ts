import { resolveCursorAgentModelsCatalogTtlMs } from "@/lib/cursorAgentModelsCatalog";
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIST_TIMEOUT_MS = 60_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const buckets = new Map<string, { n: number; reset: number }>();

function clientIp(req: NextRequest): string {
    const xf = req.headers.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || "unknown";
    return req.headers.get("x-real-ip")?.trim() || "local";
}

function allow(ip: string): boolean {
    const now = Date.now();
    let b = buckets.get(ip);
    if (!b || now > b.reset) {
        b = { n: 0, reset: now + WINDOW_MS };
        buckets.set(ip, b);
    }
    b.n += 1;
    return b.n <= MAX_PER_WINDOW;
}

function resolveBin(): string {
    const raw = process.env.CURSOR_AGENT_BIN?.trim();
    return raw && raw.length > 0 ? raw : "cursor-agent";
}

/** Parse `cursor-agent --list-models` stdout lines like `slug - Human label`. */
function parseListModelsStdout(stdout: string): { id: string; label: string }[] {
    const lines = stdout
        .split(/\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    const sep = " - ";
    const out: { id: string; label: string }[] = [];
    for (const line of lines) {
        if (line === "Available models") continue;
        const i = line.indexOf(sep);
        if (i <= 0) continue;
        const id = line.slice(0, i).trim();
        const label = line.slice(i + sep.length).trim();
        if (id && label) out.push({ id, label });
    }
    return out;
}

async function runListModels(): Promise<{ stdout: string; stderr: string; exitCode: number; timedOut: boolean }> {
    const bin = resolveBin();
    return await new Promise((resolve, reject) => {
        let proc;
        try {
            proc = spawn(bin, ["--list-models"], {
                stdio: ["ignore", "pipe", "pipe"],
                env: { ...process.env },
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            reject(new Error(`spawn '${bin}' failed: ${msg}`));
            return;
        }

        let stdout = "";
        let stderr = "";
        let timedOut = false;
        const killer = setTimeout(() => {
            timedOut = true;
            try {
                proc.kill("SIGTERM");
            } catch {
                /* noop */
            }
        }, LIST_TIMEOUT_MS);

        proc.stdout?.on("data", (chunk: Buffer) => {
            stdout += chunk.toString("utf8");
        });
        proc.stderr?.on("data", (chunk: Buffer) => {
            stderr += chunk.toString("utf8");
        });
        proc.on("error", (err: Error) => {
            clearTimeout(killer);
            reject(err);
        });
        proc.on("close", (code: number | null) => {
            clearTimeout(killer);
            resolve({
                stdout,
                stderr,
                exitCode: typeof code === "number" ? code : -1,
                timedOut,
            });
        });
    });
}

type CatalogModel = { id: string; label: string };

let catalogCache: { bin: string; models: CatalogModel[]; expiresAt: number } | null = null;

function getCatalogFromCache(bin: string): CatalogModel[] | null {
    const e = catalogCache;
    if (!e || e.bin !== bin || Date.now() >= e.expiresAt) return null;
    return e.models;
}

function setCatalogCache(bin: string, models: CatalogModel[]): void {
    catalogCache = {
        bin,
        models,
        expiresAt: Date.now() + resolveCursorAgentModelsCatalogTtlMs(),
    };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    if (!allow(clientIp(req))) {
        return NextResponse.json({ error: "Too many requests", code: "RATE_LIMIT" }, { status: 429 });
    }

    const bin = resolveBin();
    const bypassCache =
        req.nextUrl.searchParams.get("refresh") === "1" || req.nextUrl.searchParams.get("nocache") === "1";

    if (!bypassCache) {
        const hit = getCatalogFromCache(bin);
        if (hit?.length) {
            return NextResponse.json({ models: hit, cached: true });
        }
    }

    let run: { stdout: string; stderr: string; exitCode: number; timedOut: boolean };
    try {
        run = await runListModels();
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
            {
                error: `Failed to invoke cursor-agent: ${msg}`,
                code: "SPAWN_ERROR",
            },
            { status: 500 }
        );
    }

    if (run.timedOut) {
        return NextResponse.json(
            { error: "cursor-agent --list-models timed out", code: "TIMEOUT" },
            { status: 504 }
        );
    }

    if (run.exitCode !== 0) {
        const detail = run.stderr.trim() || `exit ${run.exitCode}`;
        return NextResponse.json(
            {
                error: detail,
                code: "LIST_EXIT",
                status: run.exitCode,
            },
            { status: 502 }
        );
    }

    const models = parseListModelsStdout(run.stdout);
    if (!models.length) {
        return NextResponse.json(
            {
                error: "Could not parse model list from cursor-agent output",
                code: "PARSE",
                upstream: run.stdout.slice(0, 4000),
            },
            { status: 502 }
        );
    }

    setCatalogCache(bin, models);
    return NextResponse.json({ models, cached: false });
}
