/**
 * Pass A "Deep plan" — intent routing, assumptions, conditional sections for any request type.
 */

export const INTENT_CATEGORIES = [
    "auth_session",
    "data_model",
    "integration",
    "ui_ux",
    "devops",
    "refactor",
    "unknown",
] as const;

export type IntentCategory = (typeof INTENT_CATEGORIES)[number];

export type ConditionalBullets = {
    applicable: boolean;
    notApplicableReason?: string;
    bullets: string[];
};

export type TaskSpecSection = {
    applicable: boolean;
    notApplicableReason?: string;
    inScope: string[];
    outOfScope: string[];
    userStories: string[];
};

export type DeepPlan = {
    intentRouting: {
        category: IntentCategory;
        confidence01: number;
        rationale: string;
    };
    assumptions: string[];
    definitionOfDone: string[];
    taskSpec: TaskSpecSection;
    securityAndCompliance: ConditionalBullets;
    reliability: ConditionalBullets;
    acceptanceCriteria: ConditionalBullets;
    harness: ConditionalBullets;
};

export function emptyDeepPlan(): DeepPlan {
    return {
        intentRouting: {
            category: "unknown",
            confidence01: 0,
            rationale: "",
        },
        assumptions: [],
        definitionOfDone: [],
        taskSpec: {
            applicable: true,
            inScope: [],
            outOfScope: [],
            userStories: [],
        },
        securityAndCompliance: { applicable: false, notApplicableReason: "Not filled", bullets: [] },
        reliability: { applicable: false, notApplicableReason: "Not filled", bullets: [] },
        acceptanceCriteria: { applicable: false, notApplicableReason: "Not filled", bullets: [] },
        harness: { applicable: false, notApplicableReason: "Not filled", bullets: [] },
    };
}

function bulletsBlock(title: string, section: ConditionalBullets): string[] {
    const lines: string[] = [`### ${title}`];
    if (!section.applicable) {
        lines.push(`- N/A: ${section.notApplicableReason || "not applicable"}`);
        return lines;
    }
    for (const b of section.bullets) {
        lines.push(`- ${b}`);
    }
    if (section.bullets.length === 0) lines.push("- (none)");
    return lines;
}

/** Human-readable SPEC body (no frontmatter) for SPEC.md export */
export function deepPlanToSpecMarkdown(
    naturalPrompt: string,
    compiledFiveFieldPrompt: string,
    plan: DeepPlan
): string {
    const ir = plan.intentRouting;
    const task = plan.taskSpec;
    const lines: string[] = [
        "# PrePrompt handoff specification",
        "",
        "## Original draft",
        naturalPrompt.trim() || "(empty)",
        "",
        "## Intent routing",
        `- Category: \`${ir.category}\``,
        `- Confidence: ${ir.confidence01}`,
        `- Rationale: ${ir.rationale}`,
        "",
        "## Assumptions",
        ...(plan.assumptions.length ? plan.assumptions.map((a) => `- ${a}`) : ["- (none explicit)"]),
        "",
        "## Definition of done",
        ...(plan.definitionOfDone.length ? plan.definitionOfDone.map((d) => `- ${d}`) : ["- (none)"]),
        "",
        "## Task scope",
    ];
    if (!task.applicable) {
        lines.push(`- N/A: ${task.notApplicableReason || "not applicable"}`);
    } else {
        lines.push("### In scope", ...(task.inScope.length ? task.inScope.map((s) => `- ${s}`) : ["- (none)"]));
        lines.push("", "### Out of scope", ...(task.outOfScope.length ? task.outOfScope.map((s) => `- ${s}`) : ["- (none)"]));
        lines.push("", "### User stories", ...(task.userStories.length ? task.userStories.map((s) => `- ${s}`) : ["- (none)"]));
    }
    lines.push("", ...bulletsBlock("Security & compliance", plan.securityAndCompliance));
    lines.push("", ...bulletsBlock("Reliability & operations", plan.reliability));
    lines.push("", ...bulletsBlock("Acceptance criteria", plan.acceptanceCriteria));
    lines.push("", ...bulletsBlock("Agent harness", plan.harness));
    lines.push(
        "",
        "## Compiled five-field prompt (for the target LLM)",
        "```text",
        compiledFiveFieldPrompt.trim() || "(empty)",
        "```",
        ""
    );
    return lines.join("\n");
}

export function isIntentCategory(x: string): x is IntentCategory {
    return (INTENT_CATEGORIES as readonly string[]).includes(x);
}

/** Lenient normalizer after JSON.parse from model output */
export function normalizeDeepPlan(raw: unknown): DeepPlan {
    const base = emptyDeepPlan();
    if (!raw || typeof raw !== "object") return base;
    const o = raw as Record<string, unknown>;

    const ir = o.intentRouting ?? o.intent_routing;
    if (ir && typeof ir === "object") {
        const r = ir as Record<string, unknown>;
        const cat = typeof r.category === "string" && isIntentCategory(r.category) ? r.category : "unknown";
        const conf = typeof r.confidence01 === "number" ? r.confidence01 : typeof r.confidence_0_to_1 === "number" ? r.confidence_0_to_1 : 0.5;
        base.intentRouting = {
            category: cat,
            confidence01: Math.min(1, Math.max(0, conf)),
            rationale: typeof r.rationale === "string" ? r.rationale : "",
        };
    }

    if (Array.isArray(o.assumptions)) base.assumptions = o.assumptions.filter((x) => typeof x === "string") as string[];
    if (Array.isArray(o.definitionOfDone))
        base.definitionOfDone = o.definitionOfDone.filter((x) => typeof x === "string") as string[];
    else if (Array.isArray(o.definition_of_done))
        base.definitionOfDone = o.definition_of_done.filter((x) => typeof x === "string") as string[];

    const ts = o.taskSpec ?? o.task_spec;
    if (ts && typeof ts === "object") {
        const t = ts as Record<string, unknown>;
        base.taskSpec = {
            applicable: t.applicable !== false,
            notApplicableReason: typeof t.notApplicableReason === "string" ? t.notApplicableReason : undefined,
            inScope: Array.isArray(t.inScope) ? (t.inScope as unknown[]).filter((x) => typeof x === "string") as string[] : [],
            outOfScope: Array.isArray(t.outOfScope)
                ? (t.outOfScope as unknown[]).filter((x) => typeof x === "string") as string[]
                : [],
            userStories: Array.isArray(t.userStories)
                ? (t.userStories as unknown[]).filter((x) => typeof x === "string") as string[]
                : [],
        };
    }

    const normBullets = (key: string, keySnake: string): ConditionalBullets => {
        const src = (o[key] ?? o[keySnake]) as Record<string, unknown> | undefined;
        if (!src || typeof src !== "object") return { applicable: false, notApplicableReason: "missing", bullets: [] };
        return {
            applicable: src.applicable !== false,
            notApplicableReason:
                typeof src.notApplicableReason === "string"
                    ? src.notApplicableReason
                    : typeof (src as { not_applicable_reason?: string }).not_applicable_reason === "string"
                      ? (src as { not_applicable_reason: string }).not_applicable_reason
                      : undefined,
            bullets: Array.isArray(src.bullets)
                ? (src.bullets as unknown[]).filter((x) => typeof x === "string") as string[]
                : [],
        };
    };

    base.securityAndCompliance = normBullets("securityAndCompliance", "security_and_compliance");
    base.reliability = normBullets("reliability", "reliability");
    base.acceptanceCriteria = normBullets("acceptanceCriteria", "acceptance_criteria");
    base.harness = normBullets("harness", "harness");

    return base;
}
