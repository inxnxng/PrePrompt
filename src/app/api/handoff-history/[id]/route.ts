import { getHandoffHistoryRecord } from "@/lib/server/handoffHistoryStore";
import { allowBucket, clientIp } from "@/lib/server/ipBucketRateLimit";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
    if (!allowBucket(clientIp(req), "handoff-history-id-get", 120, 60_000)) {
        return NextResponse.json({ error: "Too many requests", code: "RATE_LIMIT" }, { status: 429 });
    }
    const { id } = await ctx.params;
    try {
        const rec = await getHandoffHistoryRecord(id);
        if (!rec) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
        return NextResponse.json(rec);
    } catch (e) {
        console.error("[handoff-history id GET]", e);
        return NextResponse.json({ error: "읽기 실패", code: "STORE" }, { status: 503 });
    }
}
