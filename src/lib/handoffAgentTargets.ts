import type { Translation } from "@/lib/i18n";

/** Handoff ZIP layout + harness entry file (see `buildHandoffZipBlob`). */
export type HandoffAgentTarget = "cursor" | "claude" | "gemini" | "copilot" | "windsurf" | "generic";

export const HANDOFF_AGENT_TARGETS: readonly HandoffAgentTarget[] = [
  "cursor",
  "claude",
  "gemini",
  "copilot",
  "windsurf",
  "generic",
] as const;

export const DEFAULT_HANDOFF_TARGET: HandoffAgentTarget = "cursor";

/** Stable metadata for UI, path guides, and future agent-specific bundles. */
export const HANDOFF_AGENT_DEFINITIONS: readonly {
  id: HandoffAgentTarget;
  /** Primary harness path inside the ZIP (repo-relative). */
  harnessPath: string;
  /** Rough product family for docs / future mapping (Copilot → IDE family, etc.). */
  family: "ide_rules" | "root_markdown" | "github_markdown" | "generic_markdown";
}[] = [
  { id: "cursor", harnessPath: ".cursor/rules/preprompt-handoff.mdc", family: "ide_rules" },
  { id: "claude", harnessPath: "CLAUDE.md", family: "root_markdown" },
  { id: "gemini", harnessPath: "GEMINI.md", family: "root_markdown" },
  { id: "copilot", harnessPath: ".github/copilot-instructions.md", family: "github_markdown" },
  { id: "windsurf", harnessPath: ".windsurfrules", family: "root_markdown" },
  { id: "generic", harnessPath: "HANDOFF.md", family: "generic_markdown" },
] as const;

export function handoffTargetOptionLabel(t: Translation, id: HandoffAgentTarget): string {
  switch (id) {
    case "cursor":
      return t.handoffTargetCursor;
    case "claude":
      return t.handoffTargetClaude;
    case "gemini":
      return t.handoffTargetGemini;
    case "copilot":
      return t.handoffTargetCopilot;
    case "windsurf":
      return t.handoffTargetWindsurf;
    default:
      return t.handoffTargetGeneric;
  }
}
