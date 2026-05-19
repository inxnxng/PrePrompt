export type {
  HarnessGuideOption,
  HarnessGuideStep,
  HarnessGuideTemplate
} from "./i18n.harness";

export {
  HARNESS_GUIDE_STEPS,
  HARNESS_GUIDE_TEMPLATES,
  HARNESS_GUIDE_UI
} from "./i18n.harness";

import { HARNESS_GUIDE_STEPS, HARNESS_GUIDE_TEMPLATES } from "./i18n.harness";

function optionTagsById(): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const step of HARNESS_GUIDE_STEPS) {
    for (const opt of step.options) {
      m.set(opt.id, opt.tags);
    }
  }
  return m;
}

const OPTION_TAGS = optionTagsById();

/** Short label for the progress strip; empty pick returns null. */
export function resolveProgressShort(stepIndex: number, picked: (string | null)[]): string | null {
  const id = picked[stepIndex];
  if (!id) return null;
  const step = HARNESS_GUIDE_STEPS[stepIndex];
  const opt = step.options.find((o) => o.id === id);
  return opt ? opt.progressShort : null;
}

export function collectUserTags(selectedOptionIds: string[]): string[] {
  const set = new Set<string>();
  for (const id of selectedOptionIds) {
    const tags = OPTION_TAGS.get(id);
    if (tags) for (const t of tags) set.add(t);
  }
  return [...set];
}

export function scoreByTagOverlap(matchTags: string[], userTags: Set<string>): number {
  let n = 0;
  for (const t of matchTags) {
    if (userTags.has(t)) n += 1;
  }
  return n;
}

export type RankedTemplate = {
  template: import("./i18n.harness").HarnessGuideTemplate;
  score: number;
};

export function rankTemplates(userTags: Set<string>): RankedTemplate[] {
  return HARNESS_GUIDE_TEMPLATES.map((template) => ({
    template,
    score: scoreByTagOverlap(template.matchTags, userTags),
  })).sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id));
}
