import { logCursorAgentQa } from "@/lib/server/agentQaLog";
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";

/**
 * Cursor-Agent CLI proxy.
 *
 * Spawns the local `cursor-agent` binary (https://docs.cursor.com/cli) on the Next.js
 * server and pipes the prompt to it. The harness owns the safety surface here:
 * - Hard timeout, output cap, body cap, IP rate limit.
 * - Default flags (`-p --force`) are picked so the agent runs non-interactively
 *   and never asks the user for confirmation. Override via `CURSOR_AGENT_FLAGS`
 *   if you want to mirror the legacy `--trust` shape (e.g. `CURSOR_AGENT_FLAGS="--trust"`).
 *
 * Server-only: this route shells out to a binary, so it only works in environments
 * where `cursor-agent` is installed and authenticated (typically local dev).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 180_000;
const MAX_BODY_BYTES = 900_000;
const MAX_OUTPUT_BYTES = 2_000_000;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
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

function resolveFlags(): string[] {
    const raw = process.env.CURSOR_AGENT_FLAGS;
    if (raw === undefined) {
        // Defaults: print mode + auto-accept tool prompts. Non-interactive on stdout pipe.
        return ["-p", "--force"];
    }
    const parts = raw.split(/\s+/).map((s) => s.trim()).filter((s) => s.length > 0);
    return parts;
}

type AgentRunResult = {
    output: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
    promptChars: number;
    outputChars: number;
};

async function runCursorAgent(prompt: string, model?: string): Promise<AgentRunResult> {
    const bin = resolveBin();
    const flags = resolveFlags();
    const m = typeof model === "string" ? model.trim() : "";
    const modelArgs = m.length > 0 ? ["--model", m] : [];
    const args = [...flags, ...modelArgs, prompt];

    return await new Promise<AgentRunResult>((resolve, reject) => {
        let proc;
        try {
            proc = spawn(bin, args, {
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
        let outputCapped = false;

        const killer = setTimeout(() => {
            timedOut = true;
            try {
                proc.kill("SIGTERM");
            } catch {
                /* noop */
            }
            setTimeout(() => {
                try {
                    proc.kill("SIGKILL");
                } catch {
                    /* noop */
                }
            }, 2_000);
        }, TIMEOUT_MS);

        proc.stdout?.on("data", (chunk: Buffer) => {
            if (outputCapped) return;
            const next = stdout + chunk.toString("utf8");
            if (next.length > MAX_OUTPUT_BYTES) {
                stdout = next.slice(0, MAX_OUTPUT_BYTES);
                outputCapped = true;
                try {
                    proc.kill("SIGTERM");
                } catch {
                    /* noop */
                }
                return;
            }
            stdout = next;
        });

        proc.stderr?.on("data", (chunk: Buffer) => {
            if (stderr.length > MAX_OUTPUT_BYTES) return;
            stderr += chunk.toString("utf8");
        });

        proc.on("error", (err: Error) => {
            clearTimeout(killer);
            reject(err);
        });

        proc.on("close", (code: number | null) => {
            clearTimeout(killer);
            resolve({
                output: stdout,
                stderr,
                exitCode: typeof code === "number" ? code : -1,
                timedOut,
                promptChars: prompt.length,
                outputChars: stdout.length,
            });
        });
    });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    if (!allow(clientIp(req))) {
        return NextResponse.json({ error: "Too many requests", code: "RATE_LIMIT" }, { status: 429 });
    }

    let body: { prompt?: unknown; model?: unknown };
    try {
        const text = await req.text();
        if (text.length > MAX_BODY_BYTES) {
            return NextResponse.json({ error: "Body too large", code: "PAYLOAD" }, { status: 413 });
        }
        body = JSON.parse(text) as { prompt?: unknown; model?: unknown };
    } catch {
        return NextResponse.json({ error: "Invalid JSON", code: "BAD_JSON" }, { status: 400 });
    }

    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const model = typeof body?.model === "string" ? body.model.trim() : "";
    if (!prompt) {
        return NextResponse.json({ error: "Empty prompt", code: "BAD_INPUT" }, { status: 400 });
    }

    let result: AgentRunResult;
    try {
        result = await runCursorAgent(prompt, model);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
            {
                error: `Failed to invoke cursor-agent: ${msg}. Install via 'curl https://cursor.com/install -fsSL | bash', then run 'cursor-agent login' on this machine.`,
                code: "SPAWN_ERROR",
            },
            { status: 500 }
        );
    }

    if (result.timedOut) {
        logCursorAgentQa({
            model: model || undefined,
            question: prompt,
            answer: `[TIMEOUT after ${Math.round(TIMEOUT_MS / 1000)}s]\n--- stderr ---\n${result.stderr}\n--- stdout (head) ---\n${result.output.slice(0, 12_000)}`,
            stderr: result.stderr,
        });
        return NextResponse.json(
            {
                error: `cursor-agent timed out after ${Math.round(TIMEOUT_MS / 1000)}s`,
                code: "TIMEOUT",
                upstream: { stderr: result.stderr.slice(0, 4000), stdout: result.output.slice(0, 4000) },
            },
            { status: 504 }
        );
    }

    if (result.exitCode !== 0) {
        logCursorAgentQa({
            model: model || undefined,
            question: prompt,
            answer: `[NON-ZERO EXIT ${result.exitCode}]\n--- stderr ---\n${result.stderr}\n--- stdout (head) ---\n${result.output.slice(0, 12_000)}`,
            stderr: result.stderr,
        });
        return NextResponse.json(
            {
                error: result.stderr.trim() || `cursor-agent exited with code ${result.exitCode}`,
                code: "AGENT_EXIT",
                status: result.exitCode,
                upstream: { stderr: result.stderr.slice(0, 4000), stdout: result.output.slice(0, 4000) },
            },
            { status: 502 }
        );
    }

    logCursorAgentQa({
        model: model || undefined,
        question: prompt,
        answer: result.output,
        stderr: result.stderr.trim() || null,
    });

    return NextResponse.json({
        output: result.output,
        stderr: result.stderr.trim() || null,
        promptChars: result.promptChars,
        outputChars: result.outputChars,
    });
}
