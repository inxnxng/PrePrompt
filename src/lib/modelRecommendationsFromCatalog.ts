export type CatalogModel = { id: string; label: string };

/** Built from the compiled harness / handoff text (not generic browsing). */
export type ImplementationProfile = {
    /** 0–1: how heavy implementing *this* handoff likely is. */
    demand01: number;
    /** Korean clauses tied to detected signals (max a few). */
    signalLinesKo: string[];
    approxTokens: number;
};

function haystack(m: CatalogModel): string {
    return `${m.id} ${m.label}`.toLowerCase();
}

/** Higher = more capable tier (heuristic on id+label). */
export function scorePerformanceHeuristic(m: CatalogModel): number {
    const s = haystack(m);
    let sc = 0;
    if (/\b(opus|o3|gpt-5|5\.|sonnet-4|claude-4|claude-4\.|4\.5)\b/.test(s)) sc += 14;
    if (/\b(thinking|reason|pro[- ]max|1m|128k|200k)\b/.test(s)) sc += 8;
    if (/\b(sonnet|gpt-4|4o)\b/.test(s)) sc += 5;
    if (/\b(mini|nano|flash|haiku|lite|small|fast)\b/.test(s)) sc -= 12;
    return sc;
}

/** Higher = cheaper / lighter tier (heuristic). */
export function scoreValueHeuristic(m: CatalogModel): number {
    const s = haystack(m);
    let sc = 0;
    if (/\b(mini|nano|flash|haiku|lite|small|fast|4\.1-mini|4o-mini)\b/.test(s)) sc += 14;
    if (/\b(opus|o3|max|high)\b/.test(s)) sc -= 6;
    return sc;
}

function sortedByPerformanceDesc(models: CatalogModel[]): CatalogModel[] {
    return [...models].sort((a, b) => scorePerformanceHeuristic(b) - scorePerformanceHeuristic(a));
}

/**
 * Reads the **compiled handoff** (what you will ship / implement), not the model list alone.
 * Returns `null` when there is no harness text to anchor recommendations.
 */
export function analyzeImplementationProfile(compiled: string): ImplementationProfile | null {
    const text = compiled.trim();
    if (!text) return null;

    const lower = text.toLowerCase();
    const approxTokens = Math.ceil(text.length / 4);

    let demand = 0.16;
    const lines: string[] = [];

    if (approxTokens > 1100) {
        demand += 0.16;
        lines.push("합본 분량이 길어 컨텍스트를 한 번에 맞추기 어렵습니다.");
    } else if (approxTokens > 520) {
        demand += 0.08;
        lines.push("합본이 어느 정도 길어 구현 시 참고할 줄이 많습니다.");
    }

    if (/spec\.md|preprompt\.task|agents\.md/i.test(text)) {
        demand += 0.12;
        lines.push("SPEC·task·AGENTS 등 전달 산출물이 묶여 있습니다.");
    }

    if (/prisma|migrate|drizzle|schema\.prisma|supabase|postgres|mysql|sqlite|knex|typeorm/i.test(lower)) {
        demand += 0.14;
        lines.push("스키마·마이그레이션·DB 관련 단서가 있습니다.");
    }

    if (/vitest|jest|playwright|cypress|pnpm test|npm test|pytest|\bcurl\b|integration test/i.test(lower)) {
        demand += 0.08;
        lines.push("검증·테스트·재현(curl 등)이 언급됩니다.");
    }

    if (/oauth|jwt|session|password|csrf|login|auth\b|httponly/i.test(lower)) {
        demand += 0.08;
        lines.push("인증·보안 맥락이 있습니다.");
    }

    const stepLines = (text.match(/\n\s*\d+[\).\]]\s+/g) ?? []).length;
    if (stepLines >= 7) {
        demand += 0.1;
        lines.push("번호 있는 구현·확인 단계가 많습니다.");
    }

    if (/\/(api|graphql)\b|fetch\s*\(|axios\.|rest\b|grpc/i.test(lower)) {
        demand += 0.05;
        lines.push("API·연동 작업이 포함됩니다.");
    }

    demand = Math.min(1, demand);

    if (!lines.length) {
        lines.push("이번 합본 범위를 기준으로, 구현 에이전트에 맞는 모델만 골랐습니다.");
    }

    return {
        demand01: demand,
        signalLinesKo: lines.slice(0, 4),
        approxTokens,
    };
}

/**
 * Picks two models from the Cursor catalog for **implementing this handoff**:
 * - performance: scales toward the strongest tiers when `demand01` is high
 * - value: among models that clear a quality floor derived from demand, prefer lighter tiers
 */
export function recommendModelsForImplementation(
    models: CatalogModel[],
    profile: ImplementationProfile
): { performance: CatalogModel; value: CatalogModel } {
    const n = models.length;
    const byPerf = sortedByPerformanceDesc(models);

    const offset = Math.min(
        n - 1,
        Math.round((1 - profile.demand01) ** 1.12 * Math.max(0, n - 1) * 0.52)
    );
    let performance = byPerf[offset] ?? byPerf[0]!;

    const perfTop = scorePerformanceHeuristic(byPerf[0]!);
    const perfMid = scorePerformanceHeuristic(byPerf[Math.min(n - 1, Math.max(0, Math.floor(n / 3)))]!);
    const requiredPerf = perfMid + profile.demand01 * Math.max(0, perfTop - perfMid);

    const valueSorted = [...models].sort((a, b) => scoreValueHeuristic(b) - scoreValueHeuristic(a));
    let value =
        valueSorted.find((m) => scorePerformanceHeuristic(m) >= requiredPerf - 1.5) ?? valueSorted[0] ?? byPerf[0]!;

    if (value.id === performance.id && n > 1) {
        const alt = valueSorted.find((m) => m.id !== performance.id);
        value = alt ?? value;
    }

    return { performance, value };
}

function modelTierKo(m: CatalogModel): string {
    const s = haystack(m);
    if (/\b(opus|gpt-5|o3-high|sonnet-4|claude-4)\b/.test(s)) return "상위(플래그십에 가까운) 등급으로 보입니다.";
    if (/\b(sonnet|gpt-4|4o)\b/.test(s)) return "균형 잡힌 상위 등급으로 보입니다.";
    if (/\b(mini|nano|flash|haiku|lite)\b/.test(s)) return "가벼운 등급으로 보입니다.";
    return "목록 라벨 기준으로 중간 이상으로 분류했습니다.";
}

export function buildPerformanceRationaleKo(m: CatalogModel, profile: ImplementationProfile): string {
    const signals = profile.signalLinesKo.join(" ");
    const demandNote =
        profile.demand01 >= 0.55
            ? "이번 전달의 구현 부담이 높게 잡혀, 여유 있는 상위 모델을 우선했습니다."
            : profile.demand01 >= 0.3
                ? "부담이 중간 수준이라 상위권에서도 과하지 않은 지점을 골랐습니다."
                : "부담이 낮게 보여, 과한 플래그십 대신 상위권 안에서 비교적 앞선 모델을 골랐습니다.";
    return `${signals} ${demandNote} 선택한 모델: ${modelTierKo(m)} (로컬 \`cursor-agent --list-models\` 목록 안에서만 고릅니다.)`;
}

export function buildValueRationaleKo(m: CatalogModel, profile: ImplementationProfile): string {
    const signals = profile.signalLinesKo.join(" ");
    const floor =
        profile.demand01 >= 0.5
            ? "구현 난이도가 있어 너무 가벼운 모델은 제외하고, 그 안에서 비용 대비를 노렸습니다."
            : "이번 합본 부담이 크지 않아, 상대적으로 가벼운 쪽을 우선했습니다.";
    return `${signals} ${floor} 선택한 모델: ${modelTierKo(m)} (목록·라벨 휴리스틱이며 실제 적합도는 실행해 보며 조정하세요.)`;
}
