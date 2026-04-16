import type { DeepPlan } from "@/lib/deepPlan";
import { Language } from "@/lib/i18n";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CognitiveModel = {
    naturalPrompt: string; // Step 0: Initial draft/raw thought
    intentLock: string;
    realityAnchor: string;
    constraintCage: string;
    actionSlice: string;
    responseContract: string;
    apiKey: string;
    language: Language;
    isGenerating?: boolean; // Ephemeral state
    baselineTokens: number | null;
    /** Pass A deep plan (null until Auto-Structure runs with two-pass). */
    deepPlan: DeepPlan | null;
    /** Reported total tokens (Pass A + Pass B) from Gemini usageMetadata when available. */
    orchestrationTokenTotal: number | null;
    /** Shorter Pass A/B when true (fewer checklist bullets). */
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
                const p = (persisted ?? {}) as Partial<CognitiveModel>;
                return {
                    ...current,
                    ...p,
                    deepPlan: p.deepPlan ?? null,
                    orchestrationTokenTotal: p.orchestrationTokenTotal ?? null,
                    compactPlanning: p.compactPlanning ?? false,
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
        "naturalPrompt" | "apiKey" | "language" | "isGenerating" | "deepPlan" | "orchestrationTokenTotal" | "compactPlanning"
    >
): string {
    return [
        `Success criteria:\n${model.intentLock}`,
        `Ground (facts):\n${model.realityAnchor}`,
        `Hard rules:\n${model.constraintCage}`,
        `Handoff scope:\n${model.actionSlice}`,
        `Output format:\n${model.responseContract}`,
    ]
        .filter((section) => section.split("\n")[1].trim() !== "")
        .join("\n\n");
}
