import type { DeepPlan } from "@/lib/deepPlan";
import { normalizeDeepPlan } from "@/lib/deepPlan";
import { sanitizeLlmOutputText } from "@/lib/sanitizeLlmOutput";
import {
    AGENT_COCKPIT_ORDER,
    buildAgentSingleFieldSystem,
    buildDeepPlanSystemInstruction,
    buildFiveFieldsSystemInstruction,
    agentFieldTaskLabel,
    type AgentCockpitKey,
} from "@/lib/llmOrchestrationPrompts";
import type { Language } from "@/lib/i18n";
import { translations } from "@/lib/i18n";
import { estimateTokens, type CognitiveModel, type LlmProvider } from "@/store/usePromptStore";

export type StructuredPromptResult = {
    intentLock: string;
    realityAnchor: string;
    constraintCage: string;
    actionSlice: string;
    responseContract: string;
    deepPlan: DeepPlan;
    orchestrationTokenTotal: number | null;
};

function usageTotal(data: unknown): number | null {
    const u = (data as { usageMetadata?: { totalTokenCount?: number } }).usageMetadata;
    return typeof u?.totalTokenCount === "number" ? u.totalTokenCount : null;
}

/** Prevent React/textarea from showing "[object Object]" when the model returns nested JSON for a string field. */
function normalizeStructuredStringField(v: unknown): string {
    if (typeof v === "string") return v;
    if (v == null) return "";
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return "";
    }
}

function sumNullableTokenParts(parts: (number | null)[]): number | null {
    let sum = 0;
    let any = false;
    for (const p of parts) {
        if (typeof p === "number") {
            sum += p;
            any = true;
        }
    }
    return any ? sum : null;
}

function sanitizePlainStageOutput(s: string): string {
    let t = s.trim();
    if (t.startsWith("```")) {
        const nl = t.indexOf("\n");
        if (nl !== -1) t = t.slice(nl + 1);
        const close = t.lastIndexOf("```");
        if (close !== -1) t = t.slice(0, close);
    }
    return sanitizeLlmOutputText(t.trim());
}

/* ----------------------------- cursor-agent path ----------------------------- */

function cursorAgentUpstreamMessage(upstream: unknown): string | null {
    if (upstream === null || upstream === undefined) return null;
    if (typeof upstream === "string") {
        const t = upstream.trim();
        return t.length ? t.slice(0, 2000) : null;
    }
    if (typeof upstream === "object") {
        const o = upstream as { stderr?: unknown; stdout?: unknown };
        if (typeof o.stderr === "string" && o.stderr.trim()) return o.stderr.trim().slice(0, 2000);
        if (typeof o.stdout === "string" && o.stdout.trim()) return o.stdout.trim().slice(0, 2000);
    }
    return null;
}

type CursorAgentResponse = {
    output: string;
    stderr: string | null;
    promptChars: number;
    outputChars: number;
};

async function callCursorAgent(prompt: string): Promise<CursorAgentResponse> {
    const res = await fetch("/api/cursor-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    const raw = await res.text();
    let data: unknown;
    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error(`Cursor-Agent proxy returned non-JSON (${res.status}): ${raw.slice(0, 300)}`);
    }
    if (!res.ok) {
        const envelope = data as {
            error?: string;
            code?: string;
            status?: number;
            upstream?: unknown;
        };
        const upstream = envelope.upstream;
        if (upstream !== undefined && upstream !== null) {
            const msg = cursorAgentUpstreamMessage(upstream);
            if (msg) throw new Error(msg);
        }
        const head = typeof envelope.error === "string" && envelope.error.trim() ? envelope.error.trim() : `HTTP ${res.status}`;
        throw new Error(head);
    }
    const r = data as Partial<CursorAgentResponse>;
    if (typeof r.output !== "string") {
        throw new Error("Cursor-Agent proxy: missing output field");
    }
    return {
        output: r.output,
        stderr: typeof r.stderr === "string" ? r.stderr : null,
        promptChars: typeof r.promptChars === "number" ? r.promptChars : prompt.length,
        outputChars: typeof r.outputChars === "number" ? r.outputChars : r.output.length,
    };
}

function combinedAgentPrompt(systemInstruction: string, userMessage: string): string {
    return `${systemInstruction}\n\n---\n\n${userMessage}`;
}

/** Strip status/banner lines and pull the first balanced JSON object from cursor-agent stdout. */
function extractJsonFromAgentOutput(stdout: string): string {
    const trimmed = stdout.trim();
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenceMatch?.[1]?.trim() ?? trimmed;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("No JSON object found in cursor-agent output");
    }
    return candidate.slice(start, end + 1);
}

function buildAgentStageUserContent(
    naturalPrompt: string,
    deepPlan: DeepPlan,
    field: AgentCockpitKey,
    partial: Record<AgentCockpitKey, string>
): string {
    const blocks: string[] = [
        `User draft:\n${JSON.stringify(naturalPrompt)}`,
        `Deep plan JSON:\n${JSON.stringify(deepPlan)}`,
    ];
    const idx = AGENT_COCKPIT_ORDER.indexOf(field);
    if (idx > 0) {
        const prevLines: string[] = [];
        for (let i = 0; i < idx; i++) {
            const k = AGENT_COCKPIT_ORDER[i];
            const v = partial[k].trim();
            if (v) prevLines.push(`## ${k}\n${v}`);
        }
        if (prevLines.length) {
            blocks.push(`Sections already drafted (stay consistent, no contradictions):\n\n${prevLines.join("\n\n")}`);
        }
    }
    blocks.push(
        `Write ONLY the content for: ${agentFieldTaskLabel(field)}.\nDo not repeat the draft verbatim as filler.`
    );
    return blocks.join("\n\n---\n\n");
}

async function generateStructuredCursorAgentPerStage(
    naturalPrompt: string,
    compact: boolean,
    language?: Language
): Promise<StructuredPromptResult> {
    const tokenParts: (number | null)[] = [];

    const deepPlanPrompt = combinedAgentPrompt(
        buildDeepPlanSystemInstruction(compact, language),
        `User draft:\n${JSON.stringify(naturalPrompt)}`
    );
    const planRun = await callCursorAgent(deepPlanPrompt);
    tokenParts.push(estimateTokens(deepPlanPrompt) + estimateTokens(planRun.output));

    let deepRaw: unknown;
    try {
        deepRaw = JSON.parse(extractJsonFromAgentOutput(planRun.output));
    } catch {
        throw new Error("Failed to parse deep-plan JSON from cursor-agent");
    }
    const deepPlan = normalizeDeepPlan(deepRaw);

    const partial: Record<AgentCockpitKey, string> = {
        intentLock: "",
        realityAnchor: "",
        constraintCage: "",
        actionSlice: "",
        responseContract: "",
    };

    for (const key of AGENT_COCKPIT_ORDER) {
        const sys = buildAgentSingleFieldSystem(key, language);
        const user = buildAgentStageUserContent(naturalPrompt, deepPlan, key, partial);
        const fieldPrompt = combinedAgentPrompt(sys, user);
        const fieldRun = await callCursorAgent(fieldPrompt);
        tokenParts.push(estimateTokens(fieldPrompt) + estimateTokens(fieldRun.output));
        partial[key] = sanitizePlainStageOutput(normalizeStructuredStringField(fieldRun.output));
    }

    return {
        intentLock: partial.intentLock,
        realityAnchor: partial.realityAnchor,
        constraintCage: partial.constraintCage,
        actionSlice: partial.actionSlice,
        responseContract: partial.responseContract,
        deepPlan,
        orchestrationTokenTotal: sumNullableTokenParts(tokenParts),
    };
}

/* --------------------------------- Gemini --------------------------------- */

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

const DEFAULT_SERVER_STATUS_HINT =
    "For server errors (HTTP 5xx), you can check Google AI Studio service status: https://aistudio.google.com/status";

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

function serverStatusHint(httpStatus: number, language: Language | undefined): string {
    if (httpStatus < 500 || httpStatus > 599) return "";
    const line = language ? translations[language].alertGeminiServerStatusHint : DEFAULT_SERVER_STATUS_HINT;
    return `\n\n${line}`;
}

async function callGeminiProxy(
    apiKey: string,
    googleBody: Record<string, unknown>,
    language?: Language
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
        const hint = serverStatusHint(res.status, language);
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

export type GenerateStructuredPromptOptions = {
    compactPlanning?: boolean;
    language?: Language;
    provider?: LlmProvider;
};

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
 * Auto-Structure orchestration:
 * - **Gemini**: two API calls — (1) deep-plan JSON, (2) five cockpit fields as one JSON object.
 * - **Cursor Agent**: one deep-plan JSON call, then one plain-text call per UI field
 *   (intentLock → … → responseContract). Output is parsed leniently to tolerate banner lines.
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

    if (!apiKey.trim()) {
        throw new Error("No API key provided");
    }

    const deepPlanBody = {
        systemInstruction: { parts: [{ text: buildDeepPlanSystemInstruction(compact, language) }] },
        contents: [{ parts: [{ text: `User draft:\n${JSON.stringify(naturalPrompt)}` }] }],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
        },
    };

    const { data: dataA, tokens: tA } = await callGeminiProxy(apiKey, deepPlanBody, language);
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
        systemInstruction: { parts: [{ text: buildFiveFieldsSystemInstruction(language) }] },
        contents: [{ parts: [{ text: fiveFieldsUser }] }],
        generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json",
        },
    };

    const { data: dataB, tokens: tB } = await callGeminiProxy(apiKey, fiveFieldsBody, language);
    const fiveFieldsJsonText = extractText(dataB);

    return mergeStructuredFromDeepPlanAndFiveFieldsJson(deepPlanJsonText, fiveFieldsJsonText, tA, tB);
}
