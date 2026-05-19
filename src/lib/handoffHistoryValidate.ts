import { normalizeDeepPlan } from "@/lib/deepPlan";
import type { HandoffHistorySnapshot, LlmProvider } from "@/store/usePromptStore";

const MAX_STR = 120_000;
const MAX_TITLE = 200;
const MAX_AUTHOR = 80;

function asTrimmedString(v: unknown, max: number): string | null {
    if (typeof v !== "string") return null;
    const s = v.trim();
    if (s.length > max) return null;
    return s;
}

/**
 * Parses and normalizes a client-provided snapshot.
 * Returns null if invalid or oversized.
 */
export function parseHandoffHistorySnapshot(raw: unknown): HandoffHistorySnapshot | null {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return null;
    const o = raw as Record<string, unknown>;

    const naturalPrompt = asTrimmedString(o.naturalPrompt, MAX_STR) ?? "";
    const intentLock = asTrimmedString(o.intentLock, MAX_STR) ?? "";
    const realityAnchor = asTrimmedString(o.realityAnchor, MAX_STR) ?? "";
    const constraintCage = asTrimmedString(o.constraintCage, MAX_STR) ?? "";
    const actionSlice = asTrimmedString(o.actionSlice, MAX_STR) ?? "";
    const responseContract = asTrimmedString(o.responseContract, MAX_STR) ?? "";

    const rawProvider = String(o.llmProvider ?? "gemini");
    const llmProvider: LlmProvider =
        rawProvider === "cursorAgent" || rawProvider === "ollama" ? "cursorAgent" : "gemini";

    const cursorAgentModel =
        typeof o.cursorAgentModel === "string" && o.cursorAgentModel.length <= 200
            ? o.cursorAgentModel
            : "";

    let orchestrationTokenTotal: number | null = null;
    if (o.orchestrationTokenTotal === null) orchestrationTokenTotal = null;
    else if (typeof o.orchestrationTokenTotal === "number" && Number.isFinite(o.orchestrationTokenTotal)) {
        orchestrationTokenTotal = Math.max(0, Math.floor(o.orchestrationTokenTotal));
    }

    let deepPlan = null;
    if (o.deepPlan != null && typeof o.deepPlan === "object") {
        try {
            deepPlan = normalizeDeepPlan(o.deepPlan as object);
        } catch {
            return null;
        }
    }

    const snap: HandoffHistorySnapshot = {
        naturalPrompt,
        intentLock,
        realityAnchor,
        constraintCage,
        actionSlice,
        responseContract,
        llmProvider,
        deepPlan,
        orchestrationTokenTotal,
        cursorAgentModel,
    };

    const size = JSON.stringify(snap).length;
    if (size > 1_400_000) return null;

    return snap;
}

export function parseAuthorName(raw: unknown): string | null {
    return asTrimmedString(raw, MAX_AUTHOR);
}

export function parseTitle(raw: unknown): string | null {
    if (raw === undefined || raw === null) return "";
    const s = asTrimmedString(raw, MAX_TITLE);
    return s === null ? null : s;
}

export function deriveTitleFromSnapshot(snap: HandoffHistorySnapshot, explicitTitle: string): string {
    const t = explicitTitle.trim();
    if (t) return t;
    const line = snap.naturalPrompt.split(/\r?\n/).find((l) => l.trim())?.trim() ?? "";
    if (!line) return "제목 없음";
    return line.length > 90 ? `${line.slice(0, 87)}…` : line;
}
