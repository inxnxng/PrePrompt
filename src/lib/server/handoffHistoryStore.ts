import type { HandoffHistoryListItem, HandoffHistoryRecord, HandoffHistorySnapshot } from "@/lib/handoffHistoryTypes";
import { deriveTitleFromSnapshot, parseAuthorName, parseTitle } from "@/lib/handoffHistoryValidate";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

type DbShape = { v: 1; items: HandoffHistoryRecord[] };

const MAX_ITEMS = 400;
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "handoff-history.json");

let chain: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const p = chain.then(task, task);
    chain = p.then(
        () => undefined,
        () => undefined
    );
    return p;
}

async function readDb(): Promise<DbShape> {
    try {
        const text = await fs.readFile(DATA_FILE, "utf8");
        const parsed = JSON.parse(text) as DbShape;
        if (parsed?.v !== 1 || !Array.isArray(parsed.items)) return { v: 1, items: [] };
        return parsed;
    } catch (e: unknown) {
        const code = (e as NodeJS.ErrnoException)?.code;
        if (code === "ENOENT") return { v: 1, items: [] };
        throw e;
    }
}

async function writeDb(db: DbShape): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db), "utf8");
    await fs.rename(tmp, DATA_FILE);
}

function prune(db: DbShape): void {
    if (db.items.length <= MAX_ITEMS) return;
    db.items.sort((a, b) => a.createdAt - b.createdAt);
    db.items.splice(0, db.items.length - MAX_ITEMS);
}

export async function listHandoffHistoryMeta(): Promise<HandoffHistoryListItem[]> {
    return enqueue(async () => {
        const db = await readDb();
        return db.items
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(({ snapshot: _s, ...meta }) => meta);
    });
}

export async function getHandoffHistoryRecord(id: string): Promise<HandoffHistoryRecord | null> {
    const safeId = id.trim();
    if (!safeId || safeId.length > 80) return null;
    return enqueue(async () => {
        const db = await readDb();
        return db.items.find((x) => x.id === safeId) ?? null;
    });
}

export async function appendHandoffHistory(input: {
    authorName: unknown;
    titleRaw: unknown;
    snapshot: HandoffHistorySnapshot;
}): Promise<{ id: string } | { error: string; code: string }> {
    const author = parseAuthorName(input.authorName);
    if (!author) return { error: "표시 이름이 필요합니다.", code: "BAD_AUTHOR" };

    const titleParsed = parseTitle(input.titleRaw);
    if (titleParsed === null) return { error: "제목이 너무 깁니다.", code: "BAD_TITLE" };

    const title = deriveTitleFromSnapshot(input.snapshot, titleParsed);

    return enqueue(async () => {
        const db = await readDb();
        const id = randomUUID();
        const rec: HandoffHistoryRecord = {
            id,
            createdAt: Date.now(),
            authorName: author,
            title,
            downloadCount: 0,
            snapshot: input.snapshot,
        };
        db.items.push(rec);
        prune(db);
        await writeDb(db);
        return { id };
    });
}

export async function incrementHandoffDownloadCount(id: string): Promise<number | null> {
    const safeId = id.trim();
    if (!safeId || safeId.length > 80) return null;
    return enqueue(async () => {
        const db = await readDb();
        const item = db.items.find((x) => x.id === safeId);
        if (!item) return null;
        item.downloadCount += 1;
        await writeDb(db);
        return item.downloadCount;
    });
}
