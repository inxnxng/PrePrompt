import type { NextRequest } from "next/server";

const buckets = new Map<string, { n: number; reset: number }>();

export function clientIp(req: NextRequest): string {
    const xf = req.headers.get("x-forwarded-for");
    if (xf) return xf.split(",")[0]?.trim() || "unknown";
    return req.headers.get("x-real-ip")?.trim() || "local";
}

/** Simple fixed-window counter per (ip, routeKey). */
export function allowBucket(ip: string, routeKey: string, maxPerWindow: number, windowMs: number): boolean {
    const key = `${ip}::${routeKey}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.reset) {
        b = { n: 0, reset: now + windowMs };
        buckets.set(key, b);
    }
    b.n += 1;
    return b.n <= maxPerWindow;
}
