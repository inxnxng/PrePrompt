import {
    type DeepPlan,
    deepPlanToSpecMarkdown,
    type ImplementationBlueprint,
    type TechnicalApproach,
} from "@/lib/deepPlan";
import {
    type HandoffAgentTarget
} from "@/lib/handoffAgentTargets";
import {
    archetypeAgentsAddendum,
    archetypeChatKickoff,
    archetypeHarnessAddendum,
    archetypeSpecAddendum,
    type HandoffArchetypeId,
} from "@/lib/handoffArchetypes";
import { type CognitiveModel, compileToPrompt } from "@/store/usePromptStore";
import { strToU8, zipSync } from "fflate";

export {
    DEFAULT_HANDOFF_TARGET, HANDOFF_AGENT_DEFINITIONS, HANDOFF_AGENT_TARGETS, handoffTargetOptionLabel
} from "@/lib/handoffAgentTargets";
export type { HandoffAgentTarget } from "@/lib/handoffAgentTargets";
export { HANDOFF_ARCHETYPE_IDS, HANDOFF_ARCHETYPES } from "@/lib/handoffArchetypes";
export type { HandoffArchetypeId } from "@/lib/handoffArchetypes";

export type HandoffZipOptions = {
    /** When set, SPEC / AGENTS / harness / CHAT_MESSAGE get type-specific addenda. */
    archetypeId?: HandoffArchetypeId | null;
};

export function handoffZipFilename(target: HandoffAgentTarget): string {
    return `preprompt-handoff-${target}.zip`;
}

/** ASCII tree for the path guide dialog (must match `buildHandoffZipBlob` paths). */
export function handoffLayoutTree(target: HandoffAgentTarget): string {
    const shared = [
        "./",
        "├── SPEC.md",
        "├── preprompt.task.json",
        "├── AGENTS.md",
        "├── CHAT_MESSAGE.txt",
    ] as const;
    if (target === "cursor") {
        return [...shared, "└── .cursor/", "    └── rules/", "        └── preprompt-handoff.mdc"].join("\n");
    }
    if (target === "claude") {
        return [...shared, "└── CLAUDE.md"].join("\n");
    }
    if (target === "gemini") {
        return [...shared, "└── GEMINI.md"].join("\n");
    }
    if (target === "copilot") {
        return [...shared, "└── .github/", "    └── copilot-instructions.md"].join("\n");
    }
    if (target === "windsurf") {
        return [...shared, "└── .windsurfrules"].join("\n");
    }
    return [...shared, "└── HANDOFF.md"].join("\n");
}

export type TaskPayload = {
    version: 1;
    generatedBy: "PrePrompt";
    /** When set, ZIP was built with a bundled handoff type (see SPEC addendum). */
    handoffArchetype: HandoffArchetypeId | null;
    intentRouting: DeepPlan["intentRouting"] | null;
    assumptions: string[];
    definitionOfDone: string[];
    /** Languages, frameworks, infra — mirrors SPEC.md "Technical stack & platform". */
    technicalApproach: TechnicalApproach | null;
    /** Paths, schema, APIs, build order — mirrors SPEC.md "Implementation blueprint". */
    implementationBlueprint: ImplementationBlueprint | null;
    compiledPrompt: string;
    orchestrationTokenTotal: number | null;
    naturalPrompt: string;
};

export function buildTaskPayload(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): TaskPayload {
    return {
        version: 1,
        generatedBy: "PrePrompt",
        handoffArchetype,
        intentRouting: model.deepPlan?.intentRouting ?? null,
        assumptions: model.deepPlan?.assumptions ?? [],
        definitionOfDone: model.deepPlan?.definitionOfDone ?? [],
        technicalApproach: model.deepPlan?.technicalApproach ?? null,
        implementationBlueprint: model.deepPlan?.implementationBlueprint ?? null,
        compiledPrompt: compileToPrompt(model),
        orchestrationTokenTotal: model.orchestrationTokenTotal,
        naturalPrompt: model.naturalPrompt,
    };
}

export function buildSpecMarkdown(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    const compiled = compileToPrompt(model);
    let body: string;
    if (model.deepPlan) {
        body = deepPlanToSpecMarkdown(model.naturalPrompt, compiled, model.deepPlan);
    } else {
        body = [
            "# PrePrompt handoff specification",
            "",
            "## Original draft",
            model.naturalPrompt.trim() || "(empty)",
            "",
            "## Compiled five-field prompt",
            "```text",
            compiled.trim() || "(empty)",
            "```",
            "",
            "_No deep plan yet — run Auto-Structure to generate intent routing and checklists._",
            "",
        ].join("\n");
    }
    if (handoffArchetype) {
        return `${body.trimEnd()}\n\n${archetypeSpecAddendum(handoffArchetype)}\n`;
    }
    return body;
}

/** Shared harness body (tool-agnostic contract + embedded compiled prompt). */
function handoffHarnessKernel(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    const body = compileToPrompt(model);
    const base = [
        "## Source of truth",
        "",
        "- Treat `SPEC.md` and `preprompt.task.json` in this handoff as the contract.",
        "- Do not expand scope beyond in-scope items unless the user explicitly changes the contract.",
        "- Prefer stated assumptions over asking clarifying questions.",
        "",
        "## Compiled prompt (embedded fallback)",
        "",
        "```text",
        body.trim() || "(empty)",
        "```",
        "",
    ].join("\n");
    if (handoffArchetype) {
        return `${base.trimEnd()}\n\n${archetypeHarnessAddendum(handoffArchetype)}\n`;
    }
    return base;
}

export function buildCursorRulesMarkdown(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    return [
        "---",
        "description: PrePrompt-generated harness (merge into .cursor/rules as needed)",
        "globs:",
        "  - \"**/*\"",
        "---",
        "",
        handoffHarnessKernel(model, handoffArchetype),
    ].join("\n");
}

/** Root `CLAUDE.md` for Claude Code–style project instructions. */
export function buildClaudeHandoffMarkdown(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    return [
        "# PrePrompt (Claude Code)",
        "",
        "Keep this file at the repository root when your workflow reads `CLAUDE.md` as project context. Place `SPEC.md` and `preprompt.task.json` beside it.",
        "",
        handoffHarnessKernel(model, handoffArchetype),
    ].join("\n");
}

/** Root `GEMINI.md` for Gemini editor / CLI workflows that load project instructions. */
export function buildGeminiHandoffMarkdown(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    return [
        "# PrePrompt (Gemini)",
        "",
        "Keep this file at the repository root when your workflow reads `GEMINI.md`. Place `SPEC.md` and `preprompt.task.json` beside it.",
        "",
        handoffHarnessKernel(model, handoffArchetype),
    ].join("\n");
}

/** `.github/copilot-instructions.md` for GitHub Copilot workspace instructions. */
export function buildCopilotInstructionsMarkdown(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    return [
        "# PrePrompt (GitHub Copilot)",
        "",
        "Keep this file at `.github/copilot-instructions.md` so Copilot picks up repository-scoped guidance. Place `SPEC.md` and `preprompt.task.json` at the repository root.",
        "",
        handoffHarnessKernel(model, handoffArchetype),
    ].join("\n");
}

/** Root `.windsurfrules` for Windsurf cascade rules. */
export function buildWindsurfRulesMarkdown(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    return [
        "# PrePrompt (Windsurf)",
        "",
        "Keep this file at the repository root as `.windsurfrules` when your Windsurf workflow loads cascade rules from there. Place `SPEC.md` and `preprompt.task.json` beside it.",
        "",
        handoffHarnessKernel(model, handoffArchetype),
    ].join("\n");
}

/** Root `HANDOFF.md` — no IDE-specific rule format. */
export function buildGenericHandoffMarkdown(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    return [
        "# PrePrompt handoff",
        "",
        "Tool-agnostic agent instructions. Read `SPEC.md` and `preprompt.task.json` first; use this file as the short operating contract.",
        "",
        handoffHarnessKernel(model, handoffArchetype),
    ].join("\n");
}

export function buildAgentsMarkdownSnippet(model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    const body = compileToPrompt(model);
    const base = [
        "## PrePrompt agent brief",
        "",
        "### Operating mode",
        "",
        "- Read `SPEC.md` + `preprompt.task.json` before editing code.",
        "- Stay inside the stated handoff scope; decompose work internally or via harness/sub-agents without asking the user follow-up questions unless truly blocked.",
        "",
        "### Embedded compiled prompt",
        "",
        "```text",
        body.trim() || "(empty)",
        "```",
        "",
    ].join("\n");
    if (handoffArchetype) {
        return `${base.trimEnd()}\n\n${archetypeAgentsAddendum(handoffArchetype)}\n`;
    }
    return base;
}

export function buildChatOneLiner(_model: CognitiveModel, handoffArchetype: HandoffArchetypeId | null): string {
    if (handoffArchetype) {
        return archetypeChatKickoff(handoffArchetype);
    }
    return "SPEC.md와 preprompt.task.json을 먼저 읽고, 그 범위와 가정만으로 구현하세요. 완료 후 definition_of_done을 검증하세요.";
}

export function buildHandoffZipBlob(
    model: CognitiveModel,
    target: HandoffAgentTarget,
    options?: HandoffZipOptions | null
): Blob {
    const handoffArchetype = options?.archetypeId ?? null;
    const chat = buildChatOneLiner(model, handoffArchetype);
    const files: Record<string, Uint8Array> = {
        "SPEC.md": strToU8(buildSpecMarkdown(model, handoffArchetype)),
        "preprompt.task.json": strToU8(JSON.stringify(buildTaskPayload(model, handoffArchetype), null, 2)),
        "AGENTS.md": strToU8(buildAgentsMarkdownSnippet(model, handoffArchetype)),
        "CHAT_MESSAGE.txt": strToU8(chat),
    };
    if (target === "cursor") {
        files[".cursor/rules/preprompt-handoff.mdc"] = strToU8(buildCursorRulesMarkdown(model, handoffArchetype));
    } else if (target === "claude") {
        files["CLAUDE.md"] = strToU8(buildClaudeHandoffMarkdown(model, handoffArchetype));
    } else if (target === "gemini") {
        files["GEMINI.md"] = strToU8(buildGeminiHandoffMarkdown(model, handoffArchetype));
    } else if (target === "copilot") {
        files[".github/copilot-instructions.md"] = strToU8(buildCopilotInstructionsMarkdown(model, handoffArchetype));
    } else if (target === "windsurf") {
        files[".windsurfrules"] = strToU8(buildWindsurfRulesMarkdown(model, handoffArchetype));
    } else {
        files["HANDOFF.md"] = strToU8(buildGenericHandoffMarkdown(model, handoffArchetype));
    }
    const zipped = zipSync(files, { level: 6 });
    return new Blob([Uint8Array.from(zipped)], { type: "application/zip" });
}

export function downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
