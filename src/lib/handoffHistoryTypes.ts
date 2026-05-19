import type { HandoffHistorySnapshot } from "@/store/usePromptStore";

export type { HandoffHistorySnapshot } from "@/store/usePromptStore";

export type HandoffHistoryRecord = {
    id: string;
    createdAt: number;
    authorName: string;
    /** Short label; may be derived from natural prompt if empty. */
    title: string;
    downloadCount: number;
    snapshot: HandoffHistorySnapshot;
};

/** List rows (no snapshot payload). */
export type HandoffHistoryListItem = Omit<HandoffHistoryRecord, "snapshot">;
