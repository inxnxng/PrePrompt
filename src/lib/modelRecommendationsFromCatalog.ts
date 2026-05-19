export type CatalogModel = { id: string; label: string };

/** Detected traits of the compiled handoff (drives copy + demand). */
export type ImplementationSignalFlags = {
    tokensLong: boolean;
    tokensMid: boolean;
    harnessBundle: boolean;
    db: boolean;
    tests: boolean;
    auth: boolean;
    manySteps: boolean;
    api: boolean;
};

/** Built from the compiled harness / handoff text (not generic browsing). */
export type ImplementationProfile = {
    /** 0–1: how heavy implementing *this* handoff likely is. */
    demand01: number;
    flags: ImplementationSignalFlags;
    approxTokens: number;
};

/** Optional UI context so copy can cite the user’s draft, not only the compiled harness. */
export type ModelRecommendationContext = {
    /** Usually the first lines of `naturalPrompt`; falls back to “Success criteria” in compile output. */
    requestHint?: string;
};

/** Structured rationale for the result UI (short lead + scannable bullets). */
export type ModelCardRationaleKo = {
    /** 1–2 lines: why this pick for this handoff */
    lead: string[];
    pros: string[];
    cons: string[];
    footnote: string;
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

    const tokensLong = approxTokens > 1100;
    const tokensMid = approxTokens > 520 && !tokensLong;
    if (tokensLong) demand += 0.16;
    else if (tokensMid) demand += 0.08;

    const harnessBundle = /spec\.md|preprompt\.task|agents\.md/i.test(text);
    if (harnessBundle) demand += 0.12;

    const db = /prisma|migrate|drizzle|schema\.prisma|supabase|postgres|mysql|sqlite|knex|typeorm/i.test(lower);
    if (db) demand += 0.14;

    const tests = /vitest|jest|playwright|cypress|pnpm test|npm test|pytest|\bcurl\b|integration test/i.test(lower);
    if (tests) demand += 0.08;

    const auth = /oauth|jwt|session|password|csrf|login|auth\b|httponly/i.test(lower);
    if (auth) demand += 0.08;

    const stepLines = (text.match(/\n\s*\d+[\).\]]\s+/g) ?? []).length;
    const manySteps = stepLines >= 7;
    if (manySteps) demand += 0.1;

    const api = /\/(api|graphql)\b|fetch\s*\(|axios\.|rest\b|grpc/i.test(lower);
    if (api) demand += 0.05;

    demand = Math.min(1, demand);

    return {
        demand01: demand,
        flags: {
            tokensLong,
            tokensMid,
            harnessBundle,
            db,
            tests,
            auth,
            manySteps,
            api,
        },
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

function ellipsizeKo(s: string, max: number): string {
    const t = s.trim();
    if (t.length <= max) return t;
    return `${t.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Prefer the user’s own words; otherwise the first line under “Success criteria” in the compiled handoff.
 */
export function buildModelRequestHintKo(compiled: string, naturalPrompt: string): string {
    const n = naturalPrompt.trim();
    if (n) {
        const lines = n
            .split(/\n/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 2);
        return ellipsizeKo(lines.join(" · "), 200);
    }
    const m = compiled.match(/Success criteria:\s*\n+([^\n]+)/i);
    if (m?.[1]) return ellipsizeKo(m[1].trim(), 200);
    return "";
}

function activeSignalLabelsKo(f: ImplementationSignalFlags): string[] {
    const parts: string[] = [];
    if (f.harnessBundle) parts.push("하네스 번들(SPEC·task·AGENTS 류)");
    if (f.db) parts.push("DB·스키마·마이그레이션");
    if (f.auth) parts.push("인증·보안");
    if (f.api) parts.push("API·연동");
    if (f.tests) parts.push("테스트·검증·재현");
    if (f.manySteps) parts.push("번호 있는 다단계 실행 순서");
    if (f.tokensLong) parts.push("한 번에 넘기기엔 큰 분량의 합본");
    else if (f.tokensMid) parts.push("중간 분량의 합본");
    if (!parts.length) parts.push("성공기준·사실·제약·스코프·구현 계약이 압축된 표준 핸드오프");
    return parts;
}

function formatSignalEnumerationKo(parts: string[]): string {
    if (parts.length === 1) return parts[0]!;
    if (parts.length === 2) return `${parts[0]!}과(와) ${parts[1]!}`;
    return `${parts.slice(0, -1).join(", ")}, 그리고 ${parts[parts.length - 1]!}`;
}

function demandWordKo(demand01: number): string {
    if (demand01 >= 0.55) return "높음";
    if (demand01 >= 0.3) return "중간";
    return "낮은 편";
}

function primaryFocusSignalsKo(parts: string[], max: number): string {
    const n = Math.min(max, parts.length);
    return formatSignalEnumerationKo(parts.slice(0, n));
}

function modelTierKo(m: CatalogModel): string {
    const s = haystack(m);
    if (/\b(opus|gpt-5|o3-high|sonnet-4|claude-4)\b/.test(s)) return "상위(플래그십에 가까운) 등급으로 보입니다.";
    if (/\b(sonnet|gpt-4|4o)\b/.test(s)) return "균형 잡힌 상위 등급으로 보입니다.";
    if (/\b(mini|nano|flash|haiku|lite)\b/.test(s)) return "가벼운 등급으로 보입니다.";
    return "목록 라벨 기준으로 중간 이상으로 분류했습니다.";
}

function buildSharedProsConsKo(f: ImplementationSignalFlags): { pros: string[]; cons: string[] } {
    const pros: string[] = [];
    const cons: string[] = [];

    if (f.tokensLong) {
        pros.push(
            "요구사항·맥락·확인 포인트가 한 문서에 모여 있어, 중간 질문 없이 구현 흐름을 한 번에 이어가기 좋습니다."
        );
        cons.push("입력 토큰·호출 비용이 커질 수 있어, 필요하면 단계별 요약이나 분할 실행을 검토하세요.");
    } else if (f.tokensMid) {
        pros.push("합본이 적당히 풍부해 착수에 필요한 단서를 한 번에 전달하기 좋습니다.");
        cons.push("모델·설정에 따라 후반부가 잘릴 수 있으니, 우선순위를 한 줄로 박아 두면 안전합니다.");
    }

    if (f.harnessBundle) {
        pros.push("SPEC·task·AGENTS 등 전달 산출물이 묶여 있어 역할과 산출물 경계가 분명합니다.");
        cons.push("파일이 많을 때 읽는 순서를 짧게 정하면 더 빨리 수렴합니다.");
    }
    if (f.db) {
        pros.push("스키마·마이그레이션 단서가 있어 데이터 변경 축을 잡기 쉽습니다.");
        cons.push("로컬·스테이징 DB 준비와 마이그레이션 순서를 따로 챙겨야 할 수 있습니다.");
    }
    if (f.auth) {
        pros.push("인증·보안 맥락이 드러나 접근 통제를 빠뜨리기 어렵습니다.");
        cons.push("시크릿·환경 변수·권한 범위는 실행 전에 한 번 더 점검하는 편이 안전합니다.");
    }
    if (f.api) {
        pros.push("API·연동 단서가 있어 경계와 입출력 형태를 잡기 좋습니다.");
        cons.push("모의 서버·스키마 버전이 어긋나면 연동 디버깅에 시간이 갈 수 있습니다.");
    }
    if (f.tests) {
        pros.push("검증·테스트·재현 경로가 보여 완료 정의를 맞추기 쉽습니다.");
        cons.push("CI·런처 환경이 다르면 실패 원인 추적에 시간이 들 수 있습니다.");
    }
    if (f.manySteps) {
        pros.push("번호 있는 구현·확인 단계로 진행 상황을 추적하기 좋습니다.");
        cons.push("단계가 많아 요구가 바뀌면 수정 범위가 넓어질 수 있습니다.");
    }

    if (!pros.length) {
        pros.push("이번 합본만으로도 구현 범위를 특정하고 에이전트에 바로 넘기기에 충분해 보입니다.");
    }
    if (!cons.length) {
        cons.push("실제 코드베이스 상태에 따라 세부 단계는 조정될 수 있습니다.");
    }

    return { pros: pros.slice(0, 6), cons: cons.slice(0, 5) };
}

function performanceLeadKo(m: CatalogModel, profile: ImplementationProfile, ctx?: ModelRecommendationContext): string[] {
    const hint = (ctx?.requestHint ?? "").trim();
    const signals = activeSignalLabelsKo(profile.flags);
    const focus = primaryFocusSignalsKo(signals, 3);
    const demand = demandWordKo(profile.demand01);
    const label = (m.label ?? "").trim() || m.id;
    const approx = profile.approxTokens.toLocaleString("ko-KR");

    const lines: string[] = [];
    if (hint) {
        lines.push(`지금 요청으로 읽히는 한 덩어리는 이렇게 정리됩니다: “${hint}”`);
    }
    lines.push(
        `이번에 만든 합본(약 ${approx}토큰)에서는 ${focus} 같은 신호가 겹쳐 보이고, 그래서 구현·검증 부담을 ${demand}으로 잡았습니다.`
    );

    const s = haystack(m);
    const looksLight = /\b(mini|nano|flash|haiku|lite|small|fast)\b/.test(s);
    if (profile.demand01 >= 0.45 && looksLight) {
        lines.push(
            `그런데도 “${label}”이 잡혔다면 목록 분포 때문일 수 있어요. 체감이 가볍다면 한 단계 위 모델로 바꿔 보는 걸 권합니다.`
        );
    } else if (profile.demand01 >= 0.45) {
        lines.push(
            `“${label}”은(는) Cursor 모델 목록에서 상대적으로 앞선(컨텍스트·추론 여유가 큰) 층으로 분류돼, 방금 합본에 묶인 변경을 한 흐름으로 밀고 가기 좋습니다.`
        );
    } else if (profile.demand01 >= 0.28) {
        lines.push(
            `“${label}”은(는) 이번 부담(중간)에 맞춰 플래그십까지 과하게 쓰지 않되, 목록 안에서는 앞쪽 층으로 골라 균형을 맞췄습니다.`
        );
    } else {
        lines.push(
            `부담이 낮게 보여 “${label}”로도 스코프를 빠르게 닫을 가능성이 큽니다. 다만 합본에 숨은 엣지가 있으면 한 단계 올려 보세요.`
        );
    }

    return lines.slice(0, 4);
}

function valueLeadKo(m: CatalogModel, profile: ImplementationProfile, ctx?: ModelRecommendationContext): string[] {
    const hint = (ctx?.requestHint ?? "").trim();
    const signals = activeSignalLabelsKo(profile.flags);
    const focus = primaryFocusSignalsKo(signals, 2);
    const label = (m.label ?? "").trim() || m.id;
    const approx = profile.approxTokens.toLocaleString("ko-KR");

    const lines: string[] = [];
    if (hint) {
        lines.push(`같은 요청(“${ellipsizeKo(hint, 120)}”)과 합본을 기준으로, 비용을 줄일 수 있는 후보도 따로 잡았습니다.`);
    } else {
        lines.push(`같은 합본(약 ${approx}토큰, ${focus} 중심)을 기준으로 비용을 줄일 수 있는 후보도 따로 잡았습니다.`);
    }

    if (profile.demand01 >= 0.5) {
        lines.push(
            `난이도가 높게 잡혀 너무 가벼운 모델은 제외했고, 그 안에서 “${label}”처럼 상대적으로 부담이 덜한 쪽을 골랐습니다.`
        );
    } else {
        lines.push(
            `부담이 크지 않아 품질 바닥을 지키면서도 호출 부담을 줄이기 좋은 쪽으로 “${label}”을(를) 매칭했습니다.`
        );
    }

    lines.push(`특히 ${focus} 맥락을 유지한 채로 반복 실행·리팩터링할 때 체감이 좋은 조합입니다.`);

    return lines.slice(0, 4);
}

export function buildPerformanceCardRationaleKo(
    m: CatalogModel,
    profile: ImplementationProfile,
    ctx?: ModelRecommendationContext
): ModelCardRationaleKo {
    const { pros, cons } = buildSharedProsConsKo(profile.flags);
    return {
        lead: performanceLeadKo(m, profile, ctx),
        pros,
        cons,
        footnote: `선택 모델: ${modelTierKo(m)} · 로컬 \`cursor-agent --list-models\` 목록 범위에서만 고릅니다.`,
    };
}

export function buildValueCardRationaleKo(
    m: CatalogModel,
    profile: ImplementationProfile,
    ctx?: ModelRecommendationContext
): ModelCardRationaleKo {
    const { pros, cons } = buildSharedProsConsKo(profile.flags);
    return {
        lead: valueLeadKo(m, profile, ctx),
        pros,
        cons,
        footnote: `선택 모델: ${modelTierKo(m)} · 목록·라벨 휴리스틱이며, 실제 적합도는 실행해 보며 조정하세요.`,
    };
}
