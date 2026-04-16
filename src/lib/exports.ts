import { type DeepPlan, deepPlanToSpecMarkdown } from "@/lib/deepPlan";
import { type CognitiveModel, compileToPrompt } from "@/store/usePromptStore";
import { strToU8, zipSync } from "fflate";

export type TaskPayload = {
    version: 1;
    generatedBy: "PrePrompt";
    intentRouting: DeepPlan["intentRouting"] | null;
    assumptions: string[];
    definitionOfDone: string[];
    compiledPrompt: string;
    orchestrationTokenTotal: number | null;
    naturalPrompt: string;
};

export function buildTaskPayload(model: CognitiveModel): TaskPayload {
    return {
        version: 1,
        generatedBy: "PrePrompt",
        intentRouting: model.deepPlan?.intentRouting ?? null,
        assumptions: model.deepPlan?.assumptions ?? [],
        definitionOfDone: model.deepPlan?.definitionOfDone ?? [],
        compiledPrompt: compileToPrompt(model),
        orchestrationTokenTotal: model.orchestrationTokenTotal,
        naturalPrompt: model.naturalPrompt,
    };
}

export function buildSpecMarkdown(model: CognitiveModel): string {
    const compiled = compileToPrompt(model);
    if (model.deepPlan) {
        return deepPlanToSpecMarkdown(model.naturalPrompt, compiled, model.deepPlan);
    }
    return [
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

export function buildCursorRulesMarkdown(model: CognitiveModel): string {
    const body = compileToPrompt(model);
    return [
        "---",
        "description: PrePrompt-generated harness (merge into .cursor/rules as needed)",
        "globs:",
        "  - \"**/*\"",
        "---",
        "",
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
}

export function buildAgentsMarkdownSnippet(model: CognitiveModel): string {
    const body = compileToPrompt(model);
    return [
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
}

export function buildChatOneLiner(model: CognitiveModel, locale: "en" | "ko"): string {
    if (locale === "ko") {
        return "SPEC.md와 preprompt.task.json을 먼저 읽고, 그 범위와 가정만으로 구현하세요. 완료 후 definition_of_done을 검증하세요.";
    }
    return "First read SPEC.md and preprompt.task.json, implement only within that scope and assumptions, then verify definition_of_done.";
}

export function buildHandoffZipBlob(model: CognitiveModel): Blob {
    const files: Record<string, Uint8Array> = {
        "SPEC.md": strToU8(buildSpecMarkdown(model)),
        "preprompt.task.json": strToU8(JSON.stringify(buildTaskPayload(model), null, 2)),
        "cursor-rules.preprompt.md": strToU8(buildCursorRulesMarkdown(model)),
        "AGENTS.preprompt.md": strToU8(buildAgentsMarkdownSnippet(model)),
        "CHAT_MESSAGE.txt": strToU8(buildChatOneLiner(model, model.language === "ko" ? "ko" : "en")),
    };
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

export function downloadTextFile(content: string, filename: string, mime: string): void {
    downloadFile(new Blob([content], { type: mime }), filename);
}
