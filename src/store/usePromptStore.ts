import { normalizeDeepPlan, type DeepPlan } from "@/lib/deepPlan";
import { stripMarkdownBoldMarkers } from "@/lib/stripMarkdownBoldMarkers";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LlmProvider = "gemini" | "cursorAgent";

/**
 * When adding a dedicated rationale field (e.g. `whyThisHandoff` / `tradeoffPrinciple`), expect to touch:
 * - This type, `initialState`, `compileToPrompt`, and `persist.merge` in this file.
 * - `AgentCockpitKey`, ordered keys, and `buildFiveFieldsSystemInstruction` / `buildAgentSingleFieldSystem` in `src/lib/llmOrchestrationPrompts.ts`.
 * - `fiveFields.preamble` + `fieldMeaningsBullets` + `agent.fieldSpec` + `fieldTaskLabel` in `src/prompts/orchestration.en.json` (and any JSON schema if five-fields output is schema-validated).
 * - Parsing/merging in `src/lib/agent/geminiOrchestration.ts`, `src/lib/agent/cursorAgentOrchestration.ts`, and `src/lib/agent/types.ts`.
 * - UI: `src/components/StageNav.tsx`, `src/components/StageForm.tsx`, `src/lib/i18n.ts` stage copy, `src/components/PromptPreview.tsx`, `src/app/page.tsx` (`structured` apply to store).
 * - Exports/handoff ZIP builders under `src/lib/exports.ts` (or peers) if bundled prompts include the new section.
 * Note: `DeepPlan` already has `intentRouting.rationale`; a cockpit-level field would be user-facing handoff text, not a duplicate of that internal routing field.
 */
export type CognitiveModel = {
    naturalPrompt: string; // Step 0: Initial draft/raw thought
    intentLock: string;
    realityAnchor: string;
    constraintCage: string;
    actionSlice: string;
    responseContract: string;
    apiKey: string;
    /** Auto-Structure backend: Google Gemini (cloud, API key) or local cursor-agent CLI via /api/cursor-agent. */
    llmProvider: LlmProvider;
    isGenerating?: boolean; // Ephemeral state
    /** Deep-plan JSON from Auto-Structure (null until orchestration runs). */
    deepPlan: DeepPlan | null;
    /** Deep-plan + five-field steps: Gemini usageMetadata; for cursor-agent, estimated by char heuristic. */
    orchestrationTokenTotal: number | null;
    /** `cursor-agent --model` id when llmProvider is cursorAgent; empty string = CLI default. */
    cursorAgentModel: string;
};

/** Saved to shared history — excludes secrets and ephemeral UI flags. */
export type HandoffHistorySnapshot = Omit<CognitiveModel, "apiKey" | "isGenerating">;

type PromptStore = CognitiveModel & {
    setField: <K extends keyof CognitiveModel>(field: K, value: CognitiveModel[K]) => void;
    reset: () => void;
    /** Apply a server-stored handoff snapshot; keeps current apiKey and isGenerating. */
    applyHistorySnapshot: (snap: HandoffHistorySnapshot) => void;
};

const initialState: CognitiveModel = {
    naturalPrompt: "",
    intentLock: "",
    realityAnchor: "",
    constraintCage: "",
    actionSlice: "",
    responseContract: "",
    apiKey: "",
    llmProvider: "gemini",
    isGenerating: false,
    deepPlan: null,
    orchestrationTokenTotal: null,
    cursorAgentModel: "",
};

export const usePromptStore = create<PromptStore>()(
    persist(
        (set) => ({
            ...initialState,
            setField: (field, value) =>
                set((state) => ({ ...state, [field]: value })),
            reset: () => set(initialState),
            applyHistorySnapshot: (snap) =>
                set((state) => ({
                    ...state,
                    naturalPrompt: snap.naturalPrompt,
                    intentLock: snap.intentLock,
                    realityAnchor: snap.realityAnchor,
                    constraintCage: snap.constraintCage,
                    actionSlice: snap.actionSlice,
                    responseContract: snap.responseContract,
                    llmProvider: snap.llmProvider,
                    deepPlan: snap.deepPlan,
                    orchestrationTokenTotal: snap.orchestrationTokenTotal,
                    cursorAgentModel: snap.cursorAgentModel,
                })),
        }),
        {
            name: "preprompt-storage", // Key in localStorage
            merge: (persisted, current) => {
                const p = (persisted ?? {}) as Partial<CognitiveModel> & {
                    /** Legacy persisted values include "ollama" (removed); coerce to cursorAgent. */
                    llmProvider?: unknown;
                    /** Removed from schema; ignore if still in localStorage. */
                    baselineTokens?: unknown;
                    /** Removed UI locale; ignore if still in localStorage. */
                    language?: unknown;
                    /** Removed compact deep-plan mode; ignore if still in localStorage. */
                    compactPlanning?: unknown;
                };
                const {
                    baselineTokens: _legacyBaseline,
                    language: _legacyLanguage,
                    compactPlanning: _legacyCompact,
                    ...restPersisted
                } = p;
                void _legacyLanguage;
                void _legacyBaseline;
                void _legacyCompact;
                const mergedDeep =
                    restPersisted.deepPlan != null ? normalizeDeepPlan(restPersisted.deepPlan as object) : null;
                const rawProvider = String((p as { llmProvider?: unknown }).llmProvider ?? "");
                const provider: LlmProvider =
                    rawProvider === "cursorAgent" || rawProvider === "ollama" ? "cursorAgent" : "gemini";
                return {
                    ...current,
                    ...restPersisted,
                    deepPlan: mergedDeep,
                    orchestrationTokenTotal: restPersisted.orchestrationTokenTotal ?? null,
                    llmProvider: provider,
                    cursorAgentModel:
                        typeof restPersisted.cursorAgentModel === "string" ? restPersisted.cursorAgentModel : "",
                };
            },
        }
    )
);

export function estimateTokens(text: string): number {
    // A rough heuristic: 1 token ≈ 4 characters in English
    return Math.ceil(text.length / 4);
}

export function compileToPrompt(
    model: Omit<
        CognitiveModel,
        | "naturalPrompt"
        | "apiKey"
        | "isGenerating"
        | "deepPlan"
        | "orchestrationTokenTotal"
        | "llmProvider"
        | "cursorAgentModel"
    >
): string {
    const raw = [
        `Success criteria:\n${model.intentLock}`,
        `Ground (facts):\n${model.realityAnchor}`,
        `Hard rules:\n${model.constraintCage}`,
        `Handoff scope:\n${model.actionSlice}`,
        `Implementation contract:\n${model.responseContract}`,
    ]
        .filter((section) => section.split("\n")[1].trim() !== "")
        .join("\n\n");
    return stripMarkdownBoldMarkers(raw);
}
