import { getHandoffArchetype } from "@/lib/handoffArchetypes";
import { HARNESS_GUIDE_STEPS, type HarnessGuideTemplate } from "@/lib/i18n.harness";
import { stripMarkdownBoldMarkers } from "@/lib/stripMarkdownBoldMarkers";

/** Last line prefix — user continues on the same line, then runs Auto-Structure on home step 0. */
export const PLAYBOOK_DRAFT_SUPPLEMENT_LINE_PREFIX = "추가 보완: ";

/**
 * Turns playbook answers (+ optional top template) into a single natural-language draft
 * for step 0. The final line is always `추가 보완: ` so the user can append in one place.
 */
export function buildPlaybookNaturalPromptDraft(input: {
  picked: (string | null)[];
  topTemplate: HarnessGuideTemplate | null;
}): string {
  const blocks: string[] = [];
  blocks.push("【플레이북 초안】");
  blocks.push("");

  for (let i = 0; i < HARNESS_GUIDE_STEPS.length; i++) {
    const step = HARNESS_GUIDE_STEPS[i];
    const id = input.picked[i];
    const opt = id ? step.options.find((o) => o.id === id) : undefined;
    blocks.push(`${i + 1}) ${step.question}`);
    if (opt) {
      blocks.push(`선택: ${opt.label}`);
      if (opt.hint) blocks.push(`참고: ${opt.hint}`);
    } else {
      blocks.push("선택: (미선택)");
    }
    blocks.push("");
  }

  if (input.topTemplate) {
    const arch = getHandoffArchetype(input.topTemplate.archetypeId);
    blocks.push("【추천 템플릿(1순위)】");
    blocks.push(`템플릿: ${input.topTemplate.title}`);
    blocks.push(`요약: ${input.topTemplate.description}`);
    blocks.push(`유형: ${arch.title} — ${arch.shortHint}`);
    blocks.push("");
  }

  blocks.push(PLAYBOOK_DRAFT_SUPPLEMENT_LINE_PREFIX);
  return stripMarkdownBoldMarkers(blocks.join("\n"));
}
