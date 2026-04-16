import type { DeepPlan } from "@/lib/deepPlan";
import { normalizeDeepPlan } from "@/lib/deepPlan";
import type { Language } from "@/lib/i18n";
import { translations } from "@/lib/i18n";
import type { CognitiveModel } from "@/store/usePromptStore";

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

/** Natural-language content in JSON strings follows app UI language; schema keys/enums stay as specified. */
function outputLanguageInstruction(language: Language | undefined): string {
    const lang = language ?? "en";
    if (lang === "ko") {
        return `Output language: Korean. Write every human-readable string in the JSON in natural Korean (clear technical prose). Keep JSON property names unchanged; keep intentRouting.category exactly one of the English enum literals listed in the schema. Preserve file paths, commands, API names, and code identifiers as they appear in the draft when quoting them.`;
    }
    return `Output language: English. Write every human-readable string in the JSON in clear English. Keep JSON property names unchanged; keep intentRouting.category exactly one of the English enum literals in the schema. Preserve file paths, commands, API names, and code identifiers as in the draft when quoting them.`;
}

function passASystemInstruction(compact: boolean, language: Language | undefined): string {
    const density = compact
        ? "Per bullets array: max 3 items; short phrases; use applicable:false + one-line notApplicableReason when N/A."
        : "Cover gaps with explicit assumptions; do not paste the draft back as filler.";

    return `The next user message is a raw task draft (any software topic). Turn it into ONE JSON value: valid JSON only, camelCase keys, no markdown fences, no **.

Schema (all top-level keys required):

{
  "intentRouting": {
    "category": "auth_session" | "data_model" | "integration" | "ui_ux" | "devops" | "refactor" | "unknown",
    "confidence01": number between 0 and 1,
    "rationale": string
  },
  "assumptions": string[],
  "definitionOfDone": string[],
  "taskSpec": {
    "applicable": boolean,
    "notApplicableReason"?: string,
    "inScope": string[],
    "outOfScope": string[],
    "userStories": string[]
  },
  "securityAndCompliance": { "applicable": boolean, "notApplicableReason"?: string, "bullets": string[] },
  "reliability": { "applicable": boolean, "notApplicableReason"?: string, "bullets": string[] },
  "acceptanceCriteria": { "applicable": boolean, "notApplicableReason"?: string, "bullets": string[] },
  "harness": { "applicable": boolean, "notApplicableReason"?: string, "bullets": string[] }
}

Semantics:
- intentRouting.category "unknown": still populate assumptions and definitionOfDone with testable statements; never address the user with questions.
- Inapplicable conditional blocks: applicable:false, one-line notApplicableReason, bullets may be [].
- securityAndCompliance: secrets, PII, logging, authz when relevant.
- reliability: retries, timeouts, idempotency, rate limits, backoff when relevant.
- acceptanceCriteria: verifiable outcomes and negative/edge cases.
- harness: agent/tool boundaries (e.g. patch-only, dependency policy) when relevant.
- ${density}

${outputLanguageInstruction(language)}`;
}

function passBSystemInstruction(language: Language | undefined): string {
    return `Input: deep-plan JSON plus the original draft. Output ONE JSON object with exactly these string keys (string values): intentLock, realityAnchor, constraintCage, actionSlice, responseContract. Valid JSON only; no markdown fences; no **.

Field meanings (do not copy this text into the values):
- intentLock: observable completion / success checks only; no repo paths or versions.
- realityAnchor: current facts and assumptions (stack, paths, what exists); no prescriptive "should".
- constraintCage: hard MUST/MUST NOT (architecture, deps, security); not reply formatting.
- actionSlice: this handoff only—in scope vs explicitly deferred; end with a single scope-freeze line if helpful.
- responseContract: how the downstream model should format its answer (sections, code fences, length); if you specify a language for the downstream reply, it must match the app output language below.

Do not restate these instructions inside the strings.

${outputLanguageInstruction(language)}`;
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

export async function generateStructuredPrompt(
    naturalPrompt: string,
    apiKey: string,
    options?: { compactPlanning?: boolean; language?: Language }
): Promise<StructuredPromptResult> {
    if (!apiKey) {
        throw new Error("No API key provided");
    }

    const compact = options?.compactPlanning === true;
    const language = options?.language;

    const passABody = {
        systemInstruction: { parts: [{ text: passASystemInstruction(compact, language) }] },
        contents: [{ parts: [{ text: `User draft:\n${JSON.stringify(naturalPrompt)}` }] }],
        generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
        },
    };

    const { data: dataA, tokens: tA } = await callGeminiProxy(apiKey, passABody, language);
    const textA = extractText(dataA);
    let deepRaw: unknown;
    try {
        deepRaw = JSON.parse(textA);
    } catch {
        throw new Error("Failed to parse Pass A JSON from model");
    }
    const deepPlan = normalizeDeepPlan(deepRaw);

    const passBUser = `Deep plan JSON:\n${JSON.stringify(deepPlan)}\n\nOriginal draft:\n${JSON.stringify(naturalPrompt)}`;

    const passBBody = {
        systemInstruction: { parts: [{ text: passBSystemInstruction(language) }] },
        contents: [{ parts: [{ text: passBUser }] }],
        generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json",
        },
    };

    const { data: dataB, tokens: tB } = await callGeminiProxy(apiKey, passBBody, language);
    const textB = extractText(dataB);
    let parsed: Partial<CognitiveModel>;
    try {
        parsed = JSON.parse(textB) as Partial<CognitiveModel>;
    } catch {
        throw new Error("Failed to parse Pass B JSON from model");
    }

    const orchestrationTokenTotal =
        tA != null && tB != null ? tA + tB : tA != null ? tA : tB != null ? tB : null;

    return {
        intentLock: parsed.intentLock || "",
        realityAnchor: parsed.realityAnchor || "",
        constraintCage: parsed.constraintCage || "",
        actionSlice: parsed.actionSlice || "",
        responseContract: parsed.responseContract || "",
        deepPlan,
        orchestrationTokenTotal,
    };
}
