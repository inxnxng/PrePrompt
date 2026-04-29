import { generateStructuredCursorAgentPerStage } from "@/lib/agent/cursorAgentOrchestration";
import { generateStructuredGemini } from "@/lib/agent/geminiOrchestration";
import type { GenerateStructuredPromptOptions, StructuredPromptResult } from "@/lib/agent/types";
import type { LlmProvider } from "@/store/usePromptStore";

export type { GenerateStructuredPromptOptions, StructuredPromptResult } from "@/lib/agent/types";

/**
 * Auto-Structure orchestration entrypoint.
 * - **Gemini**: `generateStructuredGemini` (two proxy calls).
 * - **Cursor Agent**: `generateStructuredCursorAgentPerStage` (sequential `/api/cursor-agent` calls).
 */
export async function generateStructuredPrompt(
    naturalPrompt: string,
    apiKey: string,
    options?: GenerateStructuredPromptOptions
): Promise<StructuredPromptResult> {
    const compact = options?.compactPlanning === true;
    const language = options?.language;
    const provider: LlmProvider = options?.provider ?? "gemini";

    if (provider === "cursorAgent") {
        return generateStructuredCursorAgentPerStage(naturalPrompt, compact, language);
    }

    return generateStructuredGemini(naturalPrompt, apiKey, compact, language);
}
