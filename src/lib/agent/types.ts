import type { DeepPlan } from "@/lib/deepPlan";
import type { Language } from "@/lib/i18n";
import type { LlmProvider } from "@/store/usePromptStore";

export type StructuredPromptResult = {
    intentLock: string;
    realityAnchor: string;
    constraintCage: string;
    actionSlice: string;
    responseContract: string;
    deepPlan: DeepPlan;
    orchestrationTokenTotal: number | null;
};

export type GenerateStructuredPromptOptions = {
    compactPlanning?: boolean;
    language?: Language;
    provider?: LlmProvider;
};
