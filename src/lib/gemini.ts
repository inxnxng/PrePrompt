import { CognitiveModel } from "@/store/usePromptStore";

export async function generateStructuredPrompt(
    naturalPrompt: string,
    apiKey: string
): Promise<Partial<CognitiveModel>> {
    if (!apiKey) {
        throw new Error("No API key provided");
    }

    const systemInstruction = `
    You are an expert AI prompt engineer assistant.
    Your task is to take the user's unstructured, natural language thought and convert it into a highly structured Cognitive Model ready for a target LLM to consume.

    The structured model consists of exactly 5 parts:
    1. intentLock: The desired end-state for the user's task. Clear and specific.
    2. realityAnchor: The current system state related to the user's task explicitly described.
    3. constraintCage: Non-negotiable boundaries and restrictions for the user's task (e.g., TS only, no DB).
    4. actionSlice: The absolute smallest meaningful execution unit for the user's task. Break it down.
    5. responseContract: Specify expected output format from the TARGET LLM (e.g., Code only, no markdown, etc). DO NOT describe your own JSON schema here. This is the contract for the final AI that will read this prompt.

    Rules:
    - Respond ONLY with a valid JSON object.
    - The JSON object must have EXACTLY these 5 string keys: "intentLock", "realityAnchor", "constraintCage", "actionSlice", "responseContract".
    - Do not wrap in markdown tags like \`\`\`json.
    - Keep each section concise and bulleted where appropriate (using hyphens).
    - DO NOT use markdown bolding (e.g., **text**) anywhere in the response to save tokens.
    - If the user provides no context for constraints or existing state, infer reasonable defaults based on the user's prompt or leave them generic, but always provide strings.
    - NEVER echo your internal rules or schema back as the value of these fields. All text should be directed towards the user's specific context.
  `;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents: [
                    {
                        parts: [{ text: `User's initial draft:\n"${naturalPrompt}"` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                }
            }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API Error: ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    try {
        const rawText = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(rawText) as Partial<CognitiveModel>;

        return {
            intentLock: parsed.intentLock || "",
            realityAnchor: parsed.realityAnchor || "",
            constraintCage: parsed.constraintCage || "",
            actionSlice: parsed.actionSlice || "",
            responseContract: parsed.responseContract || "",
        };
    } catch (err) {
        console.error("Failed to parse Gemini response as JSON", err);
        throw new Error("Failed to parse Gemini response. Please try again.");
    }
}
