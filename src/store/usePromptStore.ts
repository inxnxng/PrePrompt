import { normalizeDeepPlan, type DeepPlan } from "@/lib/deepPlan";
import { Language } from "@/lib/i18n";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LlmProvider = "gemini" | "cursorAgent";

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
    language: Language;
    isGenerating?: boolean; // Ephemeral state
    baselineTokens: number | null;
    /** Deep-plan JSON from Auto-Structure (null until orchestration runs). */
    deepPlan: DeepPlan | null;
    /** Deep-plan + five-field steps: Gemini usageMetadata; for cursor-agent, estimated by char heuristic. */
    orchestrationTokenTotal: number | null;
    /** Shorter deep-plan / five-field prompts when true (fewer checklist bullets). */
    compactPlanning: boolean;
};

type PromptStore = CognitiveModel & {
    setField: <K extends keyof CognitiveModel>(field: K, value: CognitiveModel[K]) => void;
    reset: () => void;
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
    language: "ko",
    isGenerating: false,
    baselineTokens: null,
    deepPlan: null,
    orchestrationTokenTotal: null,
    compactPlanning: false,
};

export const usePromptStore = create<PromptStore>()(
    persist(
        (set) => ({
            ...initialState,
            setField: (field, value) =>
                set((state) => ({ ...state, [field]: value })),
            reset: () => set(initialState),
        }),
        {
            name: "preprompt-storage", // Key in localStorage
            merge: (persisted, current) => {
                const p = (persisted ?? {}) as Partial<CognitiveModel> & {
                    /** Legacy persisted values include "ollama" (removed); coerce to cursorAgent. */
                    llmProvider?: unknown;
                };
                const mergedDeep = p.deepPlan != null ? normalizeDeepPlan(p.deepPlan as object) : null;
                const rawProvider = String((p as { llmProvider?: unknown }).llmProvider ?? "");
                const provider: LlmProvider =
                    rawProvider === "cursorAgent" || rawProvider === "ollama" ? "cursorAgent" : "gemini";
                return {
                    ...current,
                    ...p,
                    deepPlan: mergedDeep,
                    orchestrationTokenTotal: p.orchestrationTokenTotal ?? null,
                    compactPlanning: p.compactPlanning ?? false,
                    llmProvider: provider,
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
        | "language"
        | "isGenerating"
        | "deepPlan"
        | "orchestrationTokenTotal"
        | "compactPlanning"
        | "llmProvider"
    >
): string {
    return [
        `Success criteria:\n${model.intentLock}`,
        `Ground (facts):\n${model.realityAnchor}`,
        `Hard rules:\n${model.constraintCage}`,
        `Handoff scope:\n${model.actionSlice}`,
        `Implementation contract:\n${model.responseContract}`,
    ]
        .filter((section) => section.split("\n")[1].trim() !== "")
        .join("\n\n");
}
