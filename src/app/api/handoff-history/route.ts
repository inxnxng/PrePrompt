import { parseHandoffHistorySnapshot } from "@/lib/handoffHistoryValidate";
import { appendHandoffHistory, listHandoffHistoryMeta } from "@/lib/server/handoffHistoryStore";
import { allowBucket, clientIp } from "@/lib/server/ipBucketRateLimit";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
    if (!allowBucket(clientIp(req), "handoff-history-get", 120, 60_000)) {
        return NextResponse.json({ error: "Too many requests", code: "RATE_LIMIT" }, { status: 429 });
    }
    try {
        const items = await listHandoffHistoryMeta();
        return NextResponse.json({ items });
    } catch (e) {
        console.error("[handoff-history GET]", e);
        return NextResponse.json(
            { error: "히스토리를 읽을 수 없습니다. 서버에 쓰기 가능한 `.data` 폴더가 있는지 확인하세요.", code: "STORE" },
            { status: 503 }
        );
    }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    if (!allowBucket(clientIp(req), "handoff-history-post", 30, 60_000)) {
        return NextResponse.json({ error: "Too many requests", code: "RATE_LIMIT" }, { status: 429 });
    }

    let body: Record<string, unknown>;
    try {
        const text = await req.text();
        if (text.length > 2_000_000) {
            return NextResponse.json({ error: "Body too large", code: "PAYLOAD" }, { status: 413 });
        }
        body = JSON.parse(text) as Record<string, unknown>;
    } catch {
        return NextResponse.json({ error: "Invalid JSON", code: "BAD_JSON" }, { status: 400 });
    }

    const snap = parseHandoffHistorySnapshot(body.snapshot);
    if (!snap) {
        return NextResponse.json({ error: "유효하지 않은 스냅샷입니다.", code: "BAD_SNAPSHOT" }, { status: 400 });
    }

    try {
        const out = await appendHandoffHistory({
            authorName: body.authorName,
            titleRaw: body.title,
            snapshot: snap,
        });
        if ("error" in out) {
            return NextResponse.json({ error: out.error, code: out.code }, { status: 400 });
        }
        return NextResponse.json({ id: out.id });
    } catch (e) {
        console.error("[handoff-history POST]", e);
        return NextResponse.json(
            { error: "저장에 실패했습니다. 디스크 쓰기 권한을 확인하세요.", code: "STORE" },
            { status: 503 }
        );
    }
}
