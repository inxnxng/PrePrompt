/**
 * One-off benchmark: Auto-Structure via Gemini (2×) and/or cursor-agent (1 + 5× via Next proxy).
 *
 * Gemini:
 *   GEMINI_API_KEY=... npx --yes tsx scripts/token-benchmark.ts
 *   GEMINI_BENCHMARK_COOLDOWN_MS=8000 — pause between deep-plan and five-fields (429 mitigation; default 8000, 0=off).
 *
 * cursor-agent (requires `npm run dev` and working `cursor-agent` on the server):
 *   PREPROMPT_BENCHMARK_API_BASE=http://127.0.0.1:3000 npx --yes tsx scripts/token-benchmark.ts
 *   CURSOR_AGENT_BENCHMARK_COOLDOWN_MS=4000 — pause after each /api/cursor-agent call before the next (default 4000, 0=off).
 *
 * Providers (comma-separated, default `gemini,cursor-agent`):
 *   BENCHMARK_PROVIDERS=gemini
 *   BENCHMARK_PROVIDERS=cursor-agent
 *   BENCHMARK_PROVIDERS=gemini,cursor-agent
 */
import { normalizeDeepPlan, type DeepPlan } from "../src/lib/deepPlan";
import {
    AGENT_COCKPIT_ORDER,
    buildAgentSingleFieldSystem,
    buildDeepPlanSystemInstruction,
    buildFiveFieldsSystemInstruction,
    agentFieldTaskLabel,
    HARNESS_POLICY_VERSION,
    type AgentCockpitKey,
} from "../src/lib/llmOrchestrationPrompts";
import { estimateTokens } from "../src/store/usePromptStore";
import { sanitizeLlmOutputText } from "../src/lib/sanitizeLlmOutput";
import type { CognitiveModel } from "../src/store/usePromptStore";

const MODEL = "gemini-2.5-flash";

function parseCooldownMs(envName: string, defaultMs: number): number {
    const raw = process.env[envName];
    if (raw === undefined || raw.trim() === "") return defaultMs;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) return defaultMs;
    return n;
}

/** Pause between Gemini deep-plan and five-fields (429 mitigation). */
const GEMINI_INTER_CALL_COOLDOWN_MS = parseCooldownMs("GEMINI_BENCHMARK_COOLDOWN_MS", 8000);

/** Pause after each cursor-agent proxy invocation before the next. */
const CURSOR_AGENT_INTER_CALL_COOLDOWN_MS = parseCooldownMs("CURSOR_AGENT_BENCHMARK_COOLDOWN_MS", 4000);

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function parseProviders(): Set<"gemini" | "cursor-agent"> {
    const raw = (process.env.BENCHMARK_PROVIDERS ?? "gemini,cursor-agent").trim().toLowerCase();
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const set = new Set<"gemini" | "cursor-agent">();
    for (const p of parts) {
        if (p === "gemini" || p === "cursor-agent") set.add(p);
    }
    if (set.size === 0) {
        set.add("gemini");
        set.add("cursor-agent");
    }
    return set;
}

function benchmarkApiBase(): string {
    const raw = (process.env.PREPROMPT_BENCHMARK_API_BASE ?? "http://127.0.0.1:3000").trim().replace(/\/$/, "");
    return raw.length ? raw : "http://127.0.0.1:3000";
}

const SAMPLE_DRAFT_KO = `Next.js 16 앱에 결제 웹훅을 붙이고 싶어.
Stripe 웹훅으로 구독 상태를 동기화하고, 실패 시 재시도 큐(Redis)에 넣어줘.
로컬 개발용으로 stripe listen 스크립트도 문서에 적어줘.`;

function usageTotal(data: unknown): number | null {
    const u = (data as { usageMetadata?: { totalTokenCount?: number } }).usageMetadata;
    return typeof u?.totalTokenCount === "number" ? u.totalTokenCount : null;
}

function extractText(data: unknown): string {
    const c = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0];
    const text = c?.content?.parts?.[0]?.text;
    if (!text || typeof text !== "string") throw new Error("No candidate text");
    return text;
}

const GEMINI_RETRY_ATTEMPTS = 5;

async function callGemini(apiKey: string, body: Record<string, unknown>): Promise<{ data: unknown; tokens: number | null }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    let lastStatus = 0;
    let lastRaw = "";

    for (let attempt = 0; attempt < GEMINI_RETRY_ATTEMPTS; attempt++) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        lastStatus = res.status;
        const raw = await res.text();
        lastRaw = raw;

        let data: unknown;
        try {
            data = JSON.parse(raw);
        } catch {
            if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
                const backoff = 400 * (attempt + 1);
                console.warn(
                    `[token-benchmark] Gemini upstream non-JSON HTTP ${res.status}, retry in ${backoff}ms (${attempt + 1}/${GEMINI_RETRY_ATTEMPTS})`
                );
                await sleep(backoff);
                continue;
            }
            throw new Error(`Non-JSON (${res.status}): ${raw.slice(0, 400)}`);
        }

        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
            const backoff = 400 * (attempt + 1);
            console.warn(
                `[token-benchmark] Gemini HTTP ${res.status}, retry in ${backoff}ms (${attempt + 1}/${GEMINI_RETRY_ATTEMPTS})`
            );
            await sleep(backoff);
            continue;
        }

        if (!res.ok) {
            const msg = (data as { error?: { message?: string } })?.error?.message ?? raw.slice(0, 500);
            throw new Error(String(msg));
        }

        return { data, tokens: usageTotal(data) };
    }

    throw new Error(
        `Gemini failed after ${GEMINI_RETRY_ATTEMPTS} attempts (last HTTP ${lastStatus}): ${lastRaw.slice(0, 500)}`
    );
}

const CURSOR_AGENT_HTTP_RETRIES = 5;

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

type CursorAgentHttpResponse = {
    output: string;
    stderr: string | null;
    promptChars: number;
    outputChars: number;
};

async function callCursorAgentHttp(baseUrl: string, prompt: string): Promise<CursorAgentHttpResponse> {
    const url = `${baseUrl}/api/cursor-agent`;
    let lastStatus = 0;
    let lastRaw = "";

    for (let attempt = 0; attempt < CURSOR_AGENT_HTTP_RETRIES; attempt++) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });
        lastStatus = res.status;
        const raw = await res.text();
        lastRaw = raw;

        let data: unknown;
        try {
            data = JSON.parse(raw);
        } catch {
            if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
                const backoff = 500 * (attempt + 1);
                console.warn(
                    `[token-benchmark] cursor-agent non-JSON HTTP ${res.status}, retry in ${backoff}ms (${attempt + 1}/${CURSOR_AGENT_HTTP_RETRIES})`
                );
                await sleep(backoff);
                continue;
            }
            throw new Error(`Cursor-Agent proxy returned non-JSON (${res.status}): ${raw.slice(0, 300)}`);
        }

        if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
            const backoff = 500 * (attempt + 1);
            console.warn(
                `[token-benchmark] cursor-agent HTTP ${res.status}, retry in ${backoff}ms (${attempt + 1}/${CURSOR_AGENT_HTTP_RETRIES})`
            );
            await sleep(backoff);
            continue;
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
            const head =
                typeof envelope.error === "string" && envelope.error.trim()
                    ? envelope.error.trim()
                    : `HTTP ${res.status}`;
            throw new Error(head);
        }

        const r = data as Partial<CursorAgentHttpResponse>;
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

    throw new Error(
        `cursor-agent HTTP failed after ${CURSOR_AGENT_HTTP_RETRIES} attempts (last HTTP ${lastStatus}): ${lastRaw.slice(0, 500)}`
    );
}

async function cooldownCursorAgent(label: string): Promise<void> {
    if (CURSOR_AGENT_INTER_CALL_COOLDOWN_MS <= 0) return;
    const until = Date.now() + CURSOR_AGENT_INTER_CALL_COOLDOWN_MS;
    console.warn(
        `[token-benchmark] ${label}: 다음 cursor-agent 호출까지 ${CURSOR_AGENT_INTER_CALL_COOLDOWN_MS}ms 대기. ≈ ${new Date(until).toISOString()}`
    );
    await sleep(CURSOR_AGENT_INTER_CALL_COOLDOWN_MS);
}

function combinedAgentPrompt(systemInstruction: string, userMessage: string): string {
    return `${systemInstruction}\n\n---\n\n${userMessage}`;
}

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

function buildAgentStageUserContent(
    naturalPrompt: string,
    deepPlan: DeepPlan,
    field: AgentCockpitKey,
    partial: Record<AgentCockpitKey, string>
): string {
    const blocks: string[] = [`User draft:\n${JSON.stringify(naturalPrompt)}`, `Deep plan JSON:\n${JSON.stringify(deepPlan)}`];
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

function sumNullableTokenParts(parts: number[]): number | null {
    if (parts.length === 0) return null;
    return parts.reduce((a, b) => a + b, 0);
}

function compileToPromptLocal(
    fields: Pick<CognitiveModel, "intentLock" | "realityAnchor" | "constraintCage" | "actionSlice" | "responseContract">
): string {
    return [
        `Success criteria:\n${fields.intentLock}`,
        `Ground (facts):\n${fields.realityAnchor}`,
        `Hard rules:\n${fields.constraintCage}`,
        `Handoff scope:\n${fields.actionSlice}`,
        `Implementation contract:\n${fields.responseContract}`,
    ]
        .filter((section) => section.split("\n")[1]?.trim() !== "")
        .join("\n\n");
}

/** Rough "manual chat" model: each turn pays full prior transcript + new user line + assistant reply. */
function simulateManualMultiTurnTokens(params: {
    systemChars: number;
    userTurns: string[];
    assistantReplies: string[];
}): number {
    const sys = Math.ceil(params.systemChars / 4);
    let history = "";
    let total = 0;
    for (let i = 0; i < params.userTurns.length; i++) {
        const u = params.userTurns[i] ?? "";
        const a = params.assistantReplies[i] ?? "";
        const turnInput = sys + Math.ceil((history + u).length / 4);
        const turnOut = Math.ceil(a.length / 4);
        total += turnInput + turnOut;
        history += `\n\nUser:\n${u}\n\nAssistant:\n${a}`;
    }
    return total;
}

type HarnessFields = Pick<
    CognitiveModel,
    "intentLock" | "realityAnchor" | "constraintCage" | "actionSlice" | "responseContract"
>;

async function runGeminiBenchmark(apiKey: string, naturalPrompt: string, compact: boolean, language: "ko"): Promise<{
    call1_totalTokenCount: number | null;
    call2_totalTokenCount: number | null;
    orchestrationTotalTokenCount: number | null;
    deepPlanJsonText: string;
    fiveFieldsJsonText: string;
    fields: HarnessFields;
}> {
    const deepSys = buildDeepPlanSystemInstruction(compact, language);
    const deepUser = `User draft:\n${JSON.stringify(naturalPrompt)}`;
    const deepBody = {
        systemInstruction: { parts: [{ text: deepSys }] },
        contents: [{ parts: [{ text: deepUser }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    };

    const { data: dataA, tokens: tA } = await callGemini(apiKey, deepBody);
    const deepPlanJsonText = extractText(dataA);
    const deepPlan = normalizeDeepPlan(JSON.parse(deepPlanJsonText));

    if (GEMINI_INTER_CALL_COOLDOWN_MS > 0) {
        const until = Date.now() + GEMINI_INTER_CALL_COOLDOWN_MS;
        console.warn(
            `[token-benchmark] Gemini deep-plan 완료. five-fields 전 ${GEMINI_INTER_CALL_COOLDOWN_MS}ms 대기. ≈ ${new Date(until).toISOString()}`
        );
        await sleep(GEMINI_INTER_CALL_COOLDOWN_MS);
    }

    const fiveSys = buildFiveFieldsSystemInstruction(language);
    const fiveUser = `Deep plan JSON:\n${JSON.stringify(deepPlan)}\n\nOriginal draft:\n${JSON.stringify(naturalPrompt)}`;
    const fiveBody = {
        systemInstruction: { parts: [{ text: fiveSys }] },
        contents: [{ parts: [{ text: fiveUser }] }],
        generationConfig: { temperature: 0.15, responseMimeType: "application/json" },
    };

    const { data: dataB, tokens: tB } = await callGemini(apiKey, fiveBody);
    const fiveFieldsJsonText = extractText(dataB);
    const parsed = JSON.parse(fiveFieldsJsonText) as HarnessFields;

    const fields: HarnessFields = {
        intentLock: sanitizeLlmOutputText(String(parsed.intentLock ?? "")),
        realityAnchor: sanitizeLlmOutputText(String(parsed.realityAnchor ?? "")),
        constraintCage: sanitizeLlmOutputText(String(parsed.constraintCage ?? "")),
        actionSlice: sanitizeLlmOutputText(String(parsed.actionSlice ?? "")),
        responseContract: sanitizeLlmOutputText(String(parsed.responseContract ?? "")),
    };

    const orchestrationTotalTokenCount = tA != null && tB != null ? tA + tB : tA ?? tB ?? null;

    return {
        call1_totalTokenCount: tA,
        call2_totalTokenCount: tB,
        orchestrationTotalTokenCount,
        deepPlanJsonText,
        fiveFieldsJsonText,
        fields,
    };
}

async function runCursorAgentBenchmark(
    baseUrl: string,
    naturalPrompt: string,
    compact: boolean,
    language: "ko"
): Promise<{
    orchestrationTokenTotalEst: number | null;
    perStepTokensEst: number[];
    stepLabels: string[];
    deepPlanJsonText: string;
    fields: HarnessFields;
}> {
    const tokenParts: number[] = [];
    const stepLabels: string[] = [];

    const deepPlanPrompt = combinedAgentPrompt(
        buildDeepPlanSystemInstruction(compact, language),
        `User draft:\n${JSON.stringify(naturalPrompt)}`
    );
    stepLabels.push("deepPlan");
    const planRun = await callCursorAgentHttp(baseUrl, deepPlanPrompt);
    tokenParts.push(estimateTokens(deepPlanPrompt) + estimateTokens(planRun.output));

    let deepRaw: unknown;
    try {
        deepRaw = JSON.parse(extractJsonFromAgentOutput(planRun.output));
    } catch {
        throw new Error("Failed to parse deep-plan JSON from cursor-agent");
    }
    const deepPlan = normalizeDeepPlan(deepRaw);
    const deepPlanJsonText = JSON.stringify(deepPlan);

    const partial: Record<AgentCockpitKey, string> = {
        intentLock: "",
        realityAnchor: "",
        constraintCage: "",
        actionSlice: "",
        responseContract: "",
    };

    for (const key of AGENT_COCKPIT_ORDER) {
        await cooldownCursorAgent(`cursor-agent 단계 ${key} 직전`);

        const sys = buildAgentSingleFieldSystem(key, language);
        const user = buildAgentStageUserContent(naturalPrompt, deepPlan, key, partial);
        const fieldPrompt = combinedAgentPrompt(sys, user);
        stepLabels.push(key);
        const fieldRun = await callCursorAgentHttp(baseUrl, fieldPrompt);
        tokenParts.push(estimateTokens(fieldPrompt) + estimateTokens(fieldRun.output));
        partial[key] = sanitizePlainStageOutput(normalizeStructuredStringField(fieldRun.output));
    }

    const fields: HarnessFields = {
        intentLock: partial.intentLock,
        realityAnchor: partial.realityAnchor,
        constraintCage: partial.constraintCage,
        actionSlice: partial.actionSlice,
        responseContract: partial.responseContract,
    };

    return {
        orchestrationTokenTotalEst: sumNullableTokenParts(tokenParts),
        perStepTokensEst: tokenParts,
        stepLabels,
        deepPlanJsonText,
        fields,
    };
}

async function main(): Promise<void> {
    const providers = parseProviders();
    const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_API_KEY?.trim();
    const baseUrl = benchmarkApiBase();

    if (providers.has("gemini") && !apiKey) {
        console.error("[token-benchmark] Gemini가 선택됐는데 GEMINI_API_KEY(또는 GOOGLE_AI_API_KEY)가 없습니다.");
        process.exit(1);
    }

    const naturalPrompt = SAMPLE_DRAFT_KO;
    const compact = false;
    const language = "ko" as const;

    const report: Record<string, unknown> = {
        harnessPolicyVersion: HARNESS_POLICY_VERSION,
        sampleDraftChars: naturalPrompt.length,
        sampleDraftTokensEst: estimateTokens(naturalPrompt),
        providersRequested: [...providers],
        cooldowns: {
            geminiMsBetweenCalls: GEMINI_INTER_CALL_COOLDOWN_MS,
            cursorAgentMsAfterEachCall: CURSOR_AGENT_INTER_CALL_COOLDOWN_MS,
        },
        benchmarkApiBase: providers.has("cursor-agent") ? baseUrl : null,
    };

    const implSystemChars = 2800;
    const manualTurns = [
        "이 프로젝트에 Stripe 웹훅으로 구독 동기화 넣어줘. Redis 재시도도.",
        "스키마랑 API 목록부터 잡고, idempotent 처리와 서명 검증 포함해줘.",
        "로컬은 stripe CLI로 검증하고, 운영은 env로 키 분리해줘.",
        "이제 위 내용을 Success criteria / Ground / Hard rules / Handoff / Contract 다섯 블록으로 정리해서 한 번에 붙여넣을 수 있게 마크다운으로 줘.",
    ];
    const manualReplies = [
        "알겠습니다. 우선 `/api/webhooks/stripe` 라우트와 `Subscription` 테이블 필드부터 설계하겠습니다. 질문: Redis는 이미 있나요?",
        "서명 검증은 `stripe.webhooks.constructEvent`, idempotency는 `event.id` 유니크 인덱스로 처리하겠습니다. 재시도는 리스트 기반 큐로…",
        "로컬은 `stripe listen --forward-to localhost:3000/api/webhooks/stripe` 문서화하겠습니다. 운영은 `STRIPE_WEBHOOK_SECRET` 분리.",
        "```markdown\n## Success criteria\n…\n## Implementation contract\n…\n```\n(중략: 실제로는 더 길어짐)",
    ];
    const manualSim = simulateManualMultiTurnTokens({
        systemChars: implSystemChars,
        userTurns: manualTurns,
        assistantReplies: manualReplies.map((s) => s + "\n" + "x".repeat(1200)),
    });
    report.manual4TurnSimulatedTokensEst = manualSim;

    if (providers.has("gemini") && apiKey) {
        const g = await runGeminiBenchmark(apiKey, naturalPrompt, compact, language);
        const harness = compileToPromptLocal(g.fields);
        const harnessTok = estimateTokens(harness);
        report.gemini = {
            model: MODEL,
            call1_totalTokenCount: g.call1_totalTokenCount,
            call2_totalTokenCount: g.call2_totalTokenCount,
            orchestrationTotalTokenCount: g.orchestrationTotalTokenCount,
            compiledHarnessChars: harness.length,
            compiledHarnessTokensEst: harnessTok,
            deepPlanOutputChars: g.deepPlanJsonText.length,
            fiveFieldsOutputChars: g.fiveFieldsJsonText.length,
            oneShotHandoffToImplTokensEst: estimateTokens("x".repeat(implSystemChars)) + harnessTok,
            note: "orchestrationTotalTokenCount from Gemini usageMetadata; harness size heuristic char/4.",
        };
        report.geminiHarnessPreview = harness.slice(0, 900);
    }

    if (providers.has("cursor-agent")) {
        try {
            const c = await runCursorAgentBenchmark(baseUrl, naturalPrompt, compact, language);
            const harness = compileToPromptLocal(c.fields);
            const harnessTok = estimateTokens(harness);
            report.cursorAgent = {
                proxy: `${baseUrl}/api/cursor-agent`,
                orchestrationTokenTotalEst: c.orchestrationTokenTotalEst,
                perStepTokensEst: c.perStepTokensEst,
                stepLabels: c.stepLabels,
                compiledHarnessChars: harness.length,
                compiledHarnessTokensEst: harnessTok,
                deepPlanOutputChars: c.deepPlanJsonText.length,
                oneShotHandoffToImplTokensEst: estimateTokens("x".repeat(implSystemChars)) + harnessTok,
                note: "Token totals are in-app estimates (prompt+output char/4), same as usePromptStore for cursorAgent path.",
            };
            report.cursorAgentHarnessPreview = harness.slice(0, 900);
        } catch (e) {
            report.cursorAgent = null;
            report.cursorAgentError = e instanceof Error ? e.message : String(e);
            console.warn("[token-benchmark] cursor-agent 벤치 실패(Next 미기동·cursor-agent 미설치 등).", report.cursorAgentError);
        }
    }

    console.log(JSON.stringify(report, null, 2));

    if (typeof report.geminiHarnessPreview === "string") {
        console.log("\n--- Gemini compiled harness preview (first 900 chars) ---\n");
        console.log(report.geminiHarnessPreview);
    }
    if (typeof report.cursorAgentHarnessPreview === "string") {
        console.log("\n--- cursor-agent compiled harness preview (first 900 chars) ---\n");
        console.log(report.cursorAgentHarnessPreview);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
