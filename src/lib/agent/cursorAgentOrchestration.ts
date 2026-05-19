import {
    normalizeStructuredStringField,
    sanitizePlainStageOutput,
    sumNullableTokenParts,
} from "@/lib/agent/outputHelpers";
import type { StructuredPromptResult } from "@/lib/agent/types";
import type { DeepPlan } from "@/lib/deepPlan";
import { normalizeDeepPlan } from "@/lib/deepPlan";
import {
    AGENT_COCKPIT_ORDER,
    agentFieldTaskLabel,
    buildAgentSingleFieldSystem,
    buildDeepPlanSystemInstruction,
    type AgentCockpitKey,
} from "@/lib/llmOrchestrationPrompts";
import { estimateTokens } from "@/store/usePromptStore";

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

async function callCursorAgent(prompt: string, model?: string): Promise<CursorAgentResponse> {
    const m = typeof model === "string" ? model.trim() : "";
    const res = await fetch("/api/cursor-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m.length > 0 ? { prompt, model: m } : { prompt }),
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

/**
 * Auto-Structure via local **cursor-agent** CLI (proxied by `/api/cursor-agent`):
 * one deep-plan JSON call, then one plain-text call per cockpit field.
 */
export async function generateStructuredCursorAgentPerStage(
    naturalPrompt: string,
    cursorAgentModel?: string
): Promise<StructuredPromptResult> {
    const tokenParts: (number | null)[] = [];

    const deepPlanPrompt = combinedAgentPrompt(
        buildDeepPlanSystemInstruction(),
        `User draft:\n${JSON.stringify(naturalPrompt)}`
    );
    const planRun = await callCursorAgent(deepPlanPrompt, cursorAgentModel);
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
        const sys = buildAgentSingleFieldSystem(key);
        const user = buildAgentStageUserContent(naturalPrompt, deepPlan, key, partial);
        const fieldPrompt = combinedAgentPrompt(sys, user);
        const fieldRun = await callCursorAgent(fieldPrompt, cursorAgentModel);
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
