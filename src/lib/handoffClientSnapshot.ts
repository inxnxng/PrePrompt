import type { CognitiveModel, HandoffHistorySnapshot } from "@/store/usePromptStore";

export function toHandoffHistorySnapshot(model: CognitiveModel): HandoffHistorySnapshot {
    return {
        naturalPrompt: model.naturalPrompt,
        intentLock: model.intentLock,
        realityAnchor: model.realityAnchor,
        constraintCage: model.constraintCage,
        actionSlice: model.actionSlice,
        responseContract: model.responseContract,
        llmProvider: model.llmProvider,
        deepPlan: model.deepPlan,
        orchestrationTokenTotal: model.orchestrationTokenTotal,
        cursorAgentModel: model.cursorAgentModel,
    };
}
