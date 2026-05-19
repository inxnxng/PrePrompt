import { normalizeStructuredStringField } from "@/lib/agent/outputHelpers";
import type { StructuredPromptResult } from "@/lib/agent/types";
import { normalizeDeepPlan } from "@/lib/deepPlan";
import { t } from "@/lib/i18n";
import { buildDeepPlanSystemInstruction, buildFiveFieldsSystemInstruction } from "@/lib/llmOrchestrationPrompts";
import { sanitizeLlmOutputText } from "@/lib/sanitizeLlmOutput";
import type { CognitiveModel } from "@/store/usePromptStore";

function usageTotal(data: unknown): number | null {
    const u = (data as { usageMetadata?: { totalTokenCount?: number } }).usageMetadata;
    return typeof u?.totalTokenCount === "number" ? u.totalTokenCount : null;
}

function extractText(data: unknown): string {
    const c = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0];
    const reason = (c as { finishReason?: string } | undefined)?.finishReason;
    if (reason && reason !== "STOP" && reason !== "MAX_TOKENS") {
        throw new Error(`Generation blocked or empty (finishReason: ${reason})`);
    }
    const text = c?.content?.parts?.[0]?.text;
    if (!text || typeof text !== "string") {
        throw new Error("No candidate text in model response");
    }
    return text;
}

const MODEL = "gemini-2.5-flash";

function geminiUpstreamMessage(upstream: unknown): string | null {
    if (upstream === null || upstream === undefined) return null;
    if (typeof upstream === "string") {
        try {
            const o = JSON.parse(upstream) as { error?: { message?: unknown } };
            if (typeof o?.error?.message === "string" && o.error.message.trim()) return o.error.message.trim();
        } catch {
            const t = upstream.trim();
            return t.length ? t.slice(0, 2000) : null;
        }
        return null;
    }
    if (typeof upstream === "object") {
        const msg = (upstream as { error?: { message?: unknown } }).error?.message;
        if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
    return null;
}

function serverStatusHint(httpStatus: number): string {
    if (httpStatus < 500 || httpStatus > 599) return "";
    return `\n\n${t.alertGeminiServerStatusHint}`;
}

async function callGeminiProxy(
    apiKey: string,
    googleBody: Record<string, unknown>
): Promise<{ data: unknown; tokens: number | null }> {
    const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({ model: MODEL, ...googleBody }),
    });

    const raw = await res.text();
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error(`Gemini proxy returned non-JSON (${res.status}): ${raw.slice(0, 300)}`);
    }

    if (!res.ok) {
        const hint = serverStatusHint(res.status);
        const envelope = data as {
            error?: string;
            code?: string;
            status?: number;
            upstream?: unknown;
            snippet?: string;
        };
        const upstream = envelope.upstream;
        if (upstream !== undefined && upstream !== null) {
            const googleMsg = geminiUpstreamMessage(upstream);
            if (googleMsg) throw new Error(googleMsg + hint);
            const fallback =
                typeof upstream === "string" ? upstream.slice(0, 2000) : JSON.stringify(upstream, null, 2);
            throw new Error(fallback + hint);
        }
        const fallback =
            data && typeof data === "object" ? JSON.stringify(data, null, 2) : raw.slice(0, 8000);
        const head =
            typeof envelope.error === "string" && envelope.error.trim()
                ? `${envelope.error.trim()}\n\n`
                : `HTTP ${res.status}\n\n`;
        throw new Error((fallback ? head + fallback : head + `Gemini proxy error ${res.status}`).trim() + hint);
    }

    return { data, tokens: usageTotal(data) };
}

function mergeStructuredFromDeepPlanAndFiveFieldsJson(
    deepPlanJsonText: string,
    fiveFieldsJsonText: string,
    tA: number | null,
    tB: number | null
): StructuredPromptResult {
    let deepRaw: unknown;
    try {
        deepRaw = JSON.parse(deepPlanJsonText);
    } catch {
        throw new Error("Failed to parse deep-plan JSON from model");
    }
    const deepPlan = normalizeDeepPlan(deepRaw);

    let parsed: Pick<
        CognitiveModel,
        "intentLock" | "realityAnchor" | "constraintCage" | "actionSlice" | "responseContract"
    >;
    try {
        parsed = JSON.parse(fiveFieldsJsonText) as typeof parsed;
    } catch {
        throw new Error("Failed to parse five-field panel JSON from model");
    }

    const orchestrationTokenTotal =
        tA != null && tB != null ? tA + tB : tA != null ? tA : tB != null ? tB : null;

    return {
        intentLock: sanitizeLlmOutputText(normalizeStructuredStringField(parsed.intentLock)),
        realityAnchor: sanitizeLlmOutputText(normalizeStructuredStringField(parsed.realityAnchor)),
        constraintCage: sanitizeLlmOutputText(normalizeStructuredStringField(parsed.constraintCage)),
        actionSlice: sanitizeLlmOutputText(normalizeStructuredStringField(parsed.actionSlice)),
        responseContract: sanitizeLlmOutputText(normalizeStructuredStringField(parsed.responseContract)),
        deepPlan,
        orchestrationTokenTotal,
    };
}

/**
 * Auto-Structure via **Gemini** (two calls): deep-plan JSON, then five cockpit fields as one JSON object.
 */
export async function generateStructuredGemini(
    naturalPrompt: string,
    apiKey: string
): Promise<StructuredPromptResult> {
    if (!apiKey.trim()) {
        throw new Error("No API key provided");
    }

    const deepPlanBody = {
        systemInstruction: { parts: [{ text: buildDeepPlanSystemInstruction() }] },
        contents: [{ parts: [{ text: `User draft:\n${JSON.stringify(naturalPrompt)}` }] }],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
        },
    };

    const { data: dataA, tokens: tA } = await callGeminiProxy(apiKey, deepPlanBody);
    const deepPlanJsonText = extractText(dataA);

    let deepRaw: unknown;
    try {
        deepRaw = JSON.parse(deepPlanJsonText);
    } catch {
        throw new Error("Failed to parse deep-plan JSON from model");
    }
    const deepPlan = normalizeDeepPlan(deepRaw);

    const fiveFieldsUser = `Deep plan JSON:\n${JSON.stringify(deepPlan)}\n\nOriginal draft:\n${JSON.stringify(naturalPrompt)}`;

    const fiveFieldsBody = {
        systemInstruction: { parts: [{ text: buildFiveFieldsSystemInstruction() }] },
        contents: [{ parts: [{ text: fiveFieldsUser }] }],
        generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json",
        },
    };

    const { data: dataB, tokens: tB } = await callGeminiProxy(apiKey, fiveFieldsBody);
    const fiveFieldsJsonText = extractText(dataB);

    return mergeStructuredFromDeepPlanAndFiveFieldsJson(deepPlanJsonText, fiveFieldsJsonText, tA, tB);
}
