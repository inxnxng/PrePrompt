import type { Language } from "@/lib/i18n";
import schemaPack from "@/prompts/deepPlan.schema.json";
import orchestration from "@/prompts/orchestration.en.json";

export type AgentCockpitKey = "intentLock" | "realityAnchor" | "constraintCage" | "actionSlice" | "responseContract";

export const AGENT_COCKPIT_ORDER: AgentCockpitKey[] = [
    "intentLock",
    "realityAnchor",
    "constraintCage",
    "actionSlice",
    "responseContract",
];

/** Harness policy version surfaced in the UI so users can audit which constraint pack produced a run. */
export const HARNESS_POLICY_VERSION: number = orchestration.version;

function localeKey(language: Language | undefined): "en" | "ko" {
    return language === "ko" ? "ko" : "en";
}

function formatGlobalConstraintsBlock(): string {
    return ["[Global Constraints]", ...orchestration.globalConstraints.map((line) => `- ${line}`)].join("\n");
}

/** Deep-plan step: English base prompt + locale suffix (human-readable strings inside JSON). */
export function buildDeepPlanSystemInstruction(compact: boolean, language: Language | undefined): string {
    const p = orchestration.deepPlan;
    const density = compact ? p.densityCompact : p.densityDefault;
    return [
        formatGlobalConstraintsBlock(),
        "",
        ...p.intro,
        "",
        "Schema (all top-level keys required):",
        "",
        schemaPack.schema,
        "",
        "Semantics:",
        ...p.semanticsBullets.map((b) => `- ${b}`),
        `- ${density}`,
        "",
        orchestration.localeSuffix.structuredJson[localeKey(language)],
    ].join("\n");
}

/** Five-field step: English base prompt + same structured JSON locale suffix as deep-plan step. */
export function buildFiveFieldsSystemInstruction(language: Language | undefined): string {
    const b = orchestration.fiveFields;
    return [
        formatGlobalConstraintsBlock(),
        "",
        b.preamble,
        "",
        b.fieldMeaningsIntro,
        ...b.fieldMeaningsBullets.map((line) => `- ${line}`),
        "",
        b.closing,
        "",
        orchestration.localeSuffix.structuredJson[localeKey(language)],
    ].join("\n");
}

/** Per-field plain-text fill (used by local agent backends like cursor-agent). */
export function buildAgentSingleFieldSystem(field: AgentCockpitKey, language: Language | undefined): string {
    const o = orchestration.agent;
    const spec = o.fieldSpec[field];
    return [
        formatGlobalConstraintsBlock(),
        "",
        o.rolePreamble,
        "",
        spec,
        "",
        orchestration.localeSuffix.agentPlainSlot[localeKey(language)],
        "",
        o.plainOutputRules,
    ].join("\n");
}

/** English-only task label in the user message (no UI/i18n coupling). */
export function agentFieldTaskLabel(field: AgentCockpitKey): string {
    return orchestration.agent.fieldTaskLabel[field];
}
