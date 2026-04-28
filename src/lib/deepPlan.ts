import { sanitizeLlmOutputText } from "@/lib/sanitizeLlmOutput";

/**
 * Auto-Structure **deep plan** — intent routing, assumptions, conditional sections for any request type.
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

/** Concrete engineering context: languages, frameworks, infra — not product user stories. */
export type TechnicalApproach = {
    applicable: boolean;
    notApplicableReason?: string;
    /** e.g. "TypeScript 5.x", "Python 3.12" */
    languages: string[];
    /** e.g. "Next.js 15 (App Router)", "FastAPI" */
    frameworks: string[];
    /** e.g. "Node.js 22 LTS", "Browser ES2022 target" */
    runtimes: string[];
    /** DB, cache, queues, object storage */
    persistence: string[];
    /** REST/GraphQL/gRPC, webhooks, Server Actions */
    interfaces: string[];
    /** Hosting, containers, CI/CD, IaC */
    deployment: string[];
    /** Tests, lint, observability, SRE */
    quality: string[];
};

/** Self-contained build spec: paths, schema, APIs, order — not "how to format a chat reply". */
export type ImplementationBlueprint = {
    applicable: boolean;
    notApplicableReason?: string;
    /** Repo paths, routes, major modules (concrete strings). */
    repositoryLayout: string[];
    /** Tables/entities/columns or Prisma models — enough to implement migrations. */
    dataModel: string[];
    /** HTTP method + path + request/response shape (one endpoint per string). */
    apiSurface: string[];
    /** Numbered or ordered steps: what to build first so a stranger does not wander. */
    workSequence: string[];
    /** Env vars, feature flags, secrets policy (names only unless draft has values). */
    configuration: string[];
    /** Commands to run after implementation (test, lint, curl checks). */
    verificationCommands: string[];
};

type ImplementationBlueprintListKey = keyof Omit<ImplementationBlueprint, "applicable" | "notApplicableReason">;

export type DeepPlan = {
    intentRouting: {
        category: IntentCategory;
        confidence01: number;
        rationale: string;
    };
    assumptions: string[];
    definitionOfDone: string[];
    /** Recommended or implied stack for implementers (versions when inferable). */
    technicalApproach: TechnicalApproach;
    /** Executable blueprint: a new hire should implement from this + assumptions alone. */
    implementationBlueprint: ImplementationBlueprint;
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
        technicalApproach: {
            applicable: true,
            languages: [],
            frameworks: [],
            runtimes: [],
            persistence: [],
            interfaces: [],
            deployment: [],
            quality: [],
        },
        implementationBlueprint: {
            applicable: true,
            repositoryLayout: [],
            dataModel: [],
            apiSurface: [],
            workSequence: [],
            configuration: [],
            verificationCommands: [],
        },
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

const TA_SUBHEADS: { key: keyof TechnicalApproach; title: string }[] = [
    { key: "languages", title: "Languages" },
    { key: "frameworks", title: "Frameworks & libraries" },
    { key: "runtimes", title: "Runtimes & targets" },
    { key: "persistence", title: "Persistence & messaging" },
    { key: "interfaces", title: "APIs & integration style" },
    { key: "deployment", title: "Deployment & delivery" },
    { key: "quality", title: "Quality, observability & testing" },
];

function technicalApproachBlock(ta: TechnicalApproach): string[] {
    const lines: string[] = ["## Technical stack & platform", ""];
    if (!ta.applicable) {
        lines.push(`- N/A: ${ta.notApplicableReason || "not applicable"}`, "");
        return lines;
    }
    let any = false;
    for (const { key, title } of TA_SUBHEADS) {
        const items = ta[key];
        if (!Array.isArray(items) || items.length === 0) continue;
        any = true;
        lines.push(`### ${title}`, ...items.map((s) => `- ${s}`), "");
    }
    if (!any) lines.push("- (none specified — re-run Auto-Structure or fill manually)", "");
    return lines;
}

const IB_SUBHEADS: { key: ImplementationBlueprintListKey; title: string }[] = [
    { key: "repositoryLayout", title: "Repository & routes" },
    { key: "dataModel", title: "Data model" },
    { key: "apiSurface", title: "API surface" },
    { key: "workSequence", title: "Work sequence (execution order)" },
    { key: "configuration", title: "Configuration & secrets" },
    { key: "verificationCommands", title: "Verification" },
];

function implementationBlueprintBlock(ib: ImplementationBlueprint): string[] {
    const lines: string[] = ["## Implementation blueprint", ""];
    if (!ib.applicable) {
        lines.push(`- N/A: ${ib.notApplicableReason || "not applicable"}`, "");
        return lines;
    }
    let any = false;
    for (const { key, title } of IB_SUBHEADS) {
        const items = ib[key];
        if (!Array.isArray(items) || items.length === 0) continue;
        any = true;
        lines.push(`### ${title}`, ...items.map((s) => `- ${s}`), "");
    }
    if (!any) lines.push("- (none specified — re-run Auto-Structure or fill manually)", "");
    return lines;
}

function normalizeImplementationBlueprint(raw: unknown): ImplementationBlueprint {
    const emptyLists = (): Omit<ImplementationBlueprint, "applicable" | "notApplicableReason"> => ({
        repositoryLayout: [],
        dataModel: [],
        apiSurface: [],
        workSequence: [],
        configuration: [],
        verificationCommands: [],
    });
    if (!raw || typeof raw !== "object") {
        return { applicable: true, ...emptyLists() };
    }
    const o = raw as Record<string, unknown>;
    const strList = (k: string): string[] =>
        Array.isArray(o[k]) ? (o[k] as unknown[]).filter((x) => typeof x === "string") as string[] : [];
    return {
        applicable: o.applicable !== false,
        notApplicableReason:
            typeof o.notApplicableReason === "string"
                ? o.notApplicableReason
                : typeof (o as { not_applicable_reason?: string }).not_applicable_reason === "string"
                  ? (o as { not_applicable_reason: string }).not_applicable_reason
                  : undefined,
        repositoryLayout: (() => {
            const a = strList("repositoryLayout");
            return a.length ? a : strList("repository_layout");
        })(),
        dataModel: (() => {
            const a = strList("dataModel");
            return a.length ? a : strList("data_model");
        })(),
        apiSurface: (() => {
            const a = strList("apiSurface");
            return a.length ? a : strList("api_surface");
        })(),
        workSequence: (() => {
            const a = strList("workSequence");
            return a.length ? a : strList("work_sequence");
        })(),
        configuration: strList("configuration"),
        verificationCommands: (() => {
            const a = strList("verificationCommands");
            return a.length ? a : strList("verification_commands");
        })(),
    };
}

function normalizeTechnicalApproach(raw: unknown): TechnicalApproach {
    const emptyLists = (): Omit<TechnicalApproach, "applicable" | "notApplicableReason"> => ({
        languages: [],
        frameworks: [],
        runtimes: [],
        persistence: [],
        interfaces: [],
        deployment: [],
        quality: [],
    });
    if (!raw || typeof raw !== "object") {
        return { applicable: true, ...emptyLists() };
    }
    const o = raw as Record<string, unknown>;
    const strList = (k: string): string[] =>
        Array.isArray(o[k]) ? (o[k] as unknown[]).filter((x) => typeof x === "string") as string[] : [];
    return {
        applicable: o.applicable !== false,
        notApplicableReason:
            typeof o.notApplicableReason === "string"
                ? o.notApplicableReason
                : typeof (o as { not_applicable_reason?: string }).not_applicable_reason === "string"
                  ? (o as { not_applicable_reason: string }).not_applicable_reason
                  : undefined,
        languages: strList("languages"),
        frameworks: strList("frameworks"),
        runtimes: strList("runtimes"),
        persistence: strList("persistence"),
        interfaces: strList("interfaces"),
        deployment: strList("deployment"),
        quality: strList("quality"),
    };
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
        ...technicalApproachBlock(plan.technicalApproach),
        ...implementationBlueprintBlock(plan.implementationBlueprint),
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
        "## Worker prompt (five-field compiled contract)",
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

function sanitizeDeepPlanStrings(plan: DeepPlan): void {
    plan.intentRouting.rationale = sanitizeLlmOutputText(plan.intentRouting.rationale);
    plan.assumptions = plan.assumptions.map(sanitizeLlmOutputText);
    plan.definitionOfDone = plan.definitionOfDone.map(sanitizeLlmOutputText);

    const ta = plan.technicalApproach;
    if (typeof ta.notApplicableReason === "string") {
        ta.notApplicableReason = sanitizeLlmOutputText(ta.notApplicableReason);
    }
    ta.languages = ta.languages.map(sanitizeLlmOutputText);
    ta.frameworks = ta.frameworks.map(sanitizeLlmOutputText);
    ta.runtimes = ta.runtimes.map(sanitizeLlmOutputText);
    ta.persistence = ta.persistence.map(sanitizeLlmOutputText);
    ta.interfaces = ta.interfaces.map(sanitizeLlmOutputText);
    ta.deployment = ta.deployment.map(sanitizeLlmOutputText);
    ta.quality = ta.quality.map(sanitizeLlmOutputText);

    const ib = plan.implementationBlueprint;
    if (typeof ib.notApplicableReason === "string") {
        ib.notApplicableReason = sanitizeLlmOutputText(ib.notApplicableReason);
    }
    ib.repositoryLayout = ib.repositoryLayout.map(sanitizeLlmOutputText);
    ib.dataModel = ib.dataModel.map(sanitizeLlmOutputText);
    ib.apiSurface = ib.apiSurface.map(sanitizeLlmOutputText);
    ib.workSequence = ib.workSequence.map(sanitizeLlmOutputText);
    ib.configuration = ib.configuration.map(sanitizeLlmOutputText);
    ib.verificationCommands = ib.verificationCommands.map(sanitizeLlmOutputText);

    const task = plan.taskSpec;
    if (typeof task.notApplicableReason === "string") {
        task.notApplicableReason = sanitizeLlmOutputText(task.notApplicableReason);
    }
    task.inScope = task.inScope.map(sanitizeLlmOutputText);
    task.outOfScope = task.outOfScope.map(sanitizeLlmOutputText);
    task.userStories = task.userStories.map(sanitizeLlmOutputText);

    const scrubBullets = (b: ConditionalBullets) => {
        if (typeof b.notApplicableReason === "string") {
            b.notApplicableReason = sanitizeLlmOutputText(b.notApplicableReason);
        }
        b.bullets = b.bullets.map(sanitizeLlmOutputText);
    };
    scrubBullets(plan.securityAndCompliance);
    scrubBullets(plan.reliability);
    scrubBullets(plan.acceptanceCriteria);
    scrubBullets(plan.harness);
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

    base.technicalApproach = normalizeTechnicalApproach(o.technicalApproach ?? o.technical_approach);
    base.implementationBlueprint = normalizeImplementationBlueprint(
        o.implementationBlueprint ?? o.implementation_blueprint
    );

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

    sanitizeDeepPlanStrings(base);
    return base;
}
