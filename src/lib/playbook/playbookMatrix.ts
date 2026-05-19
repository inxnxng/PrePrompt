import { collectUserTags, HARNESS_GUIDE_STEPS } from "@/lib/harnessGuideContent";

export type PlaybookStepDimension = {
  stepIndex: number;
  stepId: string;
  branchCount: number;
  optionIds: string[];
};

/** Branch counts per wizard step (order matches `HARNESS_GUIDE_STEPS`). */
export function getPlaybookStepDimensions(): PlaybookStepDimension[] {
  return HARNESS_GUIDE_STEPS.map((step, stepIndex) => ({
    stepIndex,
    stepId: step.id,
    branchCount: step.options.length,
    optionIds: step.options.map((o) => o.id),
  }));
}

/** Cartesian product size: one choice per step. */
export function countPlaybookCombinations(): number {
  return getPlaybookStepDimensions().reduce((acc, d) => acc * d.branchCount, 1);
}

export type PlaybookPickVector = readonly (string | null)[];

/** Tags accumulated from a full pick vector (same as wizard results). */
export function tagsForPlaybookPicks(picks: PlaybookPickVector): string[] {
  const ids = picks.filter((x): x is string => typeof x === "string" && x.length > 0);
  return collectUserTags(ids);
}

/**
 * Enumerate every combination as ordered option-id tuples.
 * Length matches `countPlaybookCombinations()` (currently 4,200).
 */
export function* iteratePlaybookPickTuples(): Generator<string[]> {
  const dims = getPlaybookStepDimensions();
  if (dims.length === 0) {
    yield [];
    return;
  }
  const indices = dims.map(() => 0);
  const last = dims.length - 1;
  let done = false;
  while (!done) {
    yield dims.map((d, i) => d.optionIds[indices[i]!]!);
    let k = last;
    while (k >= 0) {
      indices[k]! += 1;
      if (indices[k]! < dims[k]!.branchCount) break;
      indices[k]! = 0;
      k -= 1;
    }
    done = k < 0;
  }
}
