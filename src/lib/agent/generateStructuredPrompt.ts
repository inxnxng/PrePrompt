import { generateStructuredCursorAgentPerStage } from "@/lib/agent/cursorAgentOrchestration";
import { generateStructuredGemini } from "@/lib/agent/geminiOrchestration";
import type { GenerateStructuredPromptOptions, StructuredPromptResult } from "@/lib/agent/types";
import { stripMarkdownBoldMarkers } from "@/lib/stripMarkdownBoldMarkers";
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
    const provider: LlmProvider = options?.provider ?? "gemini";
    const draft = stripMarkdownBoldMarkers(naturalPrompt);

    if (provider === "cursorAgent") {
        const cursorModel =
            typeof options?.cursorAgentModel === "string" ? options.cursorAgentModel.trim() : "";
        return generateStructuredCursorAgentPerStage(draft, cursorModel);
    }

    return generateStructuredGemini(draft, apiKey);
}
