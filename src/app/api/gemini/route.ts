import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 40;
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

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    if (!allow(clientIp(req))) {
        return NextResponse.json({ error: "Too many requests", code: "RATE_LIMIT" }, { status: 429 });
    }

    const key = req.headers.get("x-goog-api-key")?.trim();
    if (!key) {
        return NextResponse.json({ error: "Missing x-goog-api-key header", code: "NO_KEY" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        const text = await req.text();
        if (text.length > 900_000) {
            return NextResponse.json({ error: "Body too large", code: "PAYLOAD" }, { status: 413 });
        }
        body = JSON.parse(text) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON", code: "BAD_JSON" }, { status: 400 });
    }

    const model =
        typeof body.model === "string" && body.model.trim()
            ? body.model.trim()
            : "gemini-2.5-flash";

    const googleBody = { ...body };
    delete googleBody.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

    const maxAttempts = 4;
    let lastStatus = 502;
    let lastText = "";

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(googleBody),
        });
        lastStatus = res.status;
        lastText = await res.text();

        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
            await sleep(400 * (attempt + 1));
            continue;
        }

        let json: unknown;
        try {
            json = JSON.parse(lastText);
        } catch {
            return NextResponse.json(
                { error: "Upstream returned non-JSON", code: "UPSTREAM_PARSE", snippet: lastText.slice(0, 400) },
                { status: 502 }
            );
        }

        if (!res.ok) {
            const msg =
                typeof (json as { error?: { message?: string } })?.error?.message === "string"
                    ? (json as { error: { message: string } }).error.message
                    : lastText.slice(0, 400);
            return NextResponse.json(
                {
                    error: msg,
                    code: "GEMINI_HTTP",
                    status: res.status,
                    upstream: json,
                },
                { status: res.status }
            );
        }

        return NextResponse.json(json);
    }

    let retryBody: unknown = lastText.slice(0, 4000);
    try {
        retryBody = JSON.parse(lastText);
    } catch {
        /* keep text slice */
    }
    return NextResponse.json(
        {
            error: lastText.slice(0, 400) || "Upstream unavailable after retries",
            code: "UPSTREAM_RETRY",
            upstream: retryBody,
        },
        { status: lastStatus >= 400 ? lastStatus : 502 }
    );
}
