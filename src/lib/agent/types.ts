import type { DeepPlan } from "@/lib/deepPlan";
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
    provider?: LlmProvider;
    /** When provider is cursor-agent: optional `cursor-agent --model` id; empty uses CLI default. */
    cursorAgentModel?: string;
};
