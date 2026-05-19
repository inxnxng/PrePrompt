import { incrementHandoffDownloadCount } from "@/lib/server/handoffHistoryStore";
import { allowBucket, clientIp } from "@/lib/server/ipBucketRateLimit";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
    if (!allowBucket(clientIp(req), "handoff-history-dl", 90, 60_000)) {
        return NextResponse.json({ error: "Too many requests", code: "RATE_LIMIT" }, { status: 429 });
    }
    const { id } = await ctx.params;
    try {
        const next = await incrementHandoffDownloadCount(id);
        if (next === null) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
        return NextResponse.json({ downloadCount: next });
    } catch (e) {
        console.error("[handoff-history download]", e);
        return NextResponse.json({ error: "기록 실패", code: "STORE" }, { status: 503 });
    }
}
