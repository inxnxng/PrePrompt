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
};

type PromptStore = CognitiveModel & {
    setField: (field: keyof CognitiveModel, value: string | boolean | number | null) => void;
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
    language: "en",
    isGenerating: false,
    baselineTokens: null,
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
        }
    )
);

export function estimateTokens(text: string): number {
    // A rough heuristic: 1 token ≈ 4 characters in English
    return Math.ceil(text.length / 4);
}

export function compileToPrompt(model: Omit<CognitiveModel, "naturalPrompt" | "apiKey" | "language" | "isGenerating">): string {
    return [
        `Goal:\n${model.intentLock}`,
        `Current State:\n${model.realityAnchor}`,
        `Constraints:\n${model.constraintCage}`,
        `Current Task:\n${model.actionSlice}`,
        `Response Requirements:\n${model.responseContract}`,
    ]
        .filter((section) => section.split("\n")[1].trim() !== "")
        .join("\n\n");
}
