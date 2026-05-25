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
    if (f.harnessBundle) parts.push("설명서·할 일·에이전트 안내가 한 묶음");
    if (f.db) parts.push("DB·스키마·마이그레이션");
    if (f.auth) parts.push("인증·보안");
    if (f.api) parts.push("API·연동");
    if (f.tests) parts.push("테스트·검증·재현");
    if (f.manySteps) parts.push("번호 있는 다단계 실행 순서");
    if (f.tokensLong) parts.push("한 번에 넘기기엔 큰 분량의 합본");
    else if (f.tokensMid) parts.push("중간 분량의 합본");
    if (!parts.length) parts.push("성공 기준부터 검증까지 한꺼번에 담긴 전형적인 작업 결과");
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
    if (/\b(opus|gpt-5|o3-high|sonnet-4|claude-4)\b/.test(s)) return "상위(가장 비싼 쪽에 가까운) 등급으로 보입니다.";
    if (/\b(sonnet|gpt-4|4o)\b/.test(s)) return "균형 잡힌 상위 등급으로 보입니다.";
    if (/\b(mini|nano|flash|haiku|lite)\b/.test(s)) return "가벼운 등급으로 보입니다.";
    return "목록 라벨 기준으로 중간 이상으로 분류했습니다.";
}

/**
 * “장점/단점”은 두 카드가 같은 `profile.flags`만 공유하면 문장이 거의 같아져서,
 * **역할(성능 우선 vs 비용 대비)** 과 **PrePrompt의 다중 호출 구조** 기준으로 갈라 씁니다.
 */
function buildPerformanceProsConsKo(m: CatalogModel, profile: ImplementationProfile): { pros: string[]; cons: string[] } {
    const f = profile.flags;
    const label = (m.label ?? "").trim() || m.id;
    const pros: string[] = [];
    const cons: string[] = [];

    cons.push("비용·지연이 상대적으로 큽니다. 부담 추정이 낮은 편이면 ‘비용 대비 효율’ 카드 쪽이 과제에 더 맞을 수 있습니다.");
    cons.push("실제 코드 상태는 합본에 없을 수 있으니, 실행 후에는 Cursor 설정의 모델도 직접 바꿔 보세요.");

    pros.push(
        "PrePrompt가 Cursor Agent로 자동 구조화할 때는 먼저 전체 뼈대를 잡고, 이어서 다섯 칸을 순서대로 채웁니다. 앞 단계 결과가 다음 단계에 이어지므로, 한 번에 기억하고 짚는 힘이 큰 모델일수록 칸끼리 내용이 잘 맞습니다."
    );
    pros.push(
        `지금 고른 “${label}”은(는) 이번 합본의 추정 난이도에 맞춰 목록 안에서 한 번에 깊게 밀고 가기 좋은 쪽으로 올려 잡았습니다.`
    );

    if (f.tokensLong) {
        pros.push("합본 분량이 크면 전제·금지·순서가 한꺼번에 겹칩니다. 긴 맥락을 끝까지 붙들고 빠진 가정을 줄이는 데 유리합니다.");
        cons.push("입력 분량과 호출 비용이 커질 수 있습니다. 초안만 살짝 고치는 단계까지 최상급 모델을 쓰면 과할 수 있어요.");
    } else if (f.tokensMid) {
        pros.push("중간 분량이면 한 번에 넘겨도 읽을 범위가 잡힙니다. 다단계 호출에서 중간 요약이 덜 끼어들어 흐름이 안정적입니다.");
        cons.push("모델·설정에 따라 후반부가 잘릴 수 있으니, 완료 기준을 한 줄로 박아 두면 안전합니다.");
    }

    if (f.harnessBundle) {
        pros.push("설명서와 할 일 목록, 에이전트 안내가 함께 있으면 무엇이 약속이고 무엇이 실행 순서인지 한꺼번에 맞춰야 합니다. 여러 문서를 한 흐름으로 이어 읽는 데 강한 모델이 낫습니다.");
        cons.push("파일이 많을 때는 읽는 순서를 짧게 정하지 않으면 같은 질문을 돌려받을 수 있습니다.");
    }
    if (f.db) {
        pros.push("스키마·마이그레이션 단서가 있으면 데이터 축을 빠르게 고정해야 합니다. 제약을 한 번에 이해하지 못하면 이후 필드가 어긋나기 쉽습니다.");
        cons.push("로컬·스테이징 DB 준비와 마이그레이션 순서는 합본 밖에서 따로 챙겨야 할 수 있습니다.");
    }
    if (f.auth) {
        pros.push("인증·보안은 빠뜨리면 되돌리기 비싼 영역이라, 첫 호출부터 보수적으로 잡는 편이 안전합니다.");
        cons.push("시크릿·환경 변수·권한 범위는 실행 전에 사람이 한 번 더 확인하는 것이 좋습니다.");
    }
    if (f.api) {
        pros.push("API·연동이 보이면 입출력 형태와 실패 모드를 한 번에 정리하는 쪽이 유리합니다.");
        cons.push("모의 서버·스키마 버전이 어긋나면 연동 디버깅에 시간이 갈 수 있습니다.");
    }
    if (f.tests) {
        pros.push("검증·테스트·재현 경로가 있으면 ‘완료’의 의미가 길어집니다. 단계가 많을수록 상위 층이 실수를 덜 합니다.");
        cons.push("자동으로 돌리는 검사 환경이 다르면 실패 원인 추적에 시간이 들 수 있습니다.");
    }
    if (f.manySteps) {
        pros.push("번호 있는 다단계 순서는 중간에 한 단계만 틀어져도 전체가 흔들립니다. 순서 유지에 강한 모델이 맞습니다.");
        cons.push("단계가 많으면 요구가 바뀔 때 수정 범위가 넓어질 수 있습니다.");
    }

    if (!f.tokensLong && !f.tokensMid && !f.harnessBundle && !f.db && !f.auth && !f.api && !f.tests && !f.manySteps) {
        pros.push("이번 합본은 표준 다섯 칸 중심으로도 범위가 잡혀 있어, 한 번의 자동 구조화에서 필드를 안정적으로 채우기 좋습니다.");
    }

    return { pros: pros.slice(0, 3), cons: cons.slice(0, 3) };
}

function buildValueProsConsKo(m: CatalogModel, profile: ImplementationProfile): { pros: string[]; cons: string[] } {
    const f = profile.flags;
    const label = (m.label ?? "").trim() || m.id;
    const demand = demandWordKo(profile.demand01);
    const pros: string[] = [];
    const cons: string[] = [];

    cons.push("난이도 신호가 겹칠수록 누락·단순화 위험이 커집니다. 결과가 얕게 나오면 곧바로 ‘성능 우선’ 모델로 올려 보세요.");
    cons.push("실제 코드 상태는 합본에 없을 수 있으니, 실행 후에는 Cursor 설정의 모델도 직접 바꿔 보세요.");

    pros.push(
        "요청 초안을 다듬으며 자동 구조화를 여러 번 돌리거나, 설정에서 모델만 바꿔 실험할 때는 호출이 반복됩니다. 같은 합본이라도 횟수가 늘면 체감 비용이 커지므로, 부담을 덜한 후보가 따로 필요합니다."
    );
    pros.push(
        `“${label}”은(는) 이번 합본의 추정 난이도(${demand})를 만족시키는 선에서 목록 안에서 상대적으로 가벼운 층으로 골랐습니다.`
    );

    if (f.tokensLong) {
        pros.push("분량이 크면 한 번 호출할 때마다 입력 비용이 눈에 띕니다. 초안·표현만 고치는 루프에는 가벼운 모델이 실속이 납니다.");
        cons.push("맥락이 길면 가벼운 모델이 중간 전제를 놓치면 필드 간 어긋남이 생길 수 있습니다. 이상하면 ‘성능 우선’으로 한 단계 올리세요.");
    } else if (f.tokensMid) {
        pros.push("중간 분량이면 상위 모델 없이도 다섯 칸을 채울 여지가 있습니다. 특히 초안 반복 단계에서 비용을 아끼기 좋습니다.");
        cons.push("후반부 요구가 잘리거나 단순화되면, 완료 기준이 약해 보일 때 상위 모델을 섞어 보세요.");
    }

    if (f.harnessBundle) {
        pros.push("자료가 한 묶음이어도 ‘설명서 한 줄만 고친다’ 같은 작은 반복이라면, 매번 가장 비싼 모델일 필요는 없습니다.");
        cons.push("여러 문서를 동시에 맞춰야 할 때는 서로 어긋나기 쉽습니다. 막판 구현 전에는 성능 우선 쪽을 권합니다.");
    }
    if (f.db) {
        pros.push("스키마 변경이 이번 범위의 한 코너뿐이면, 반복 호출로 문장만 다듬는 단계에서 가성비 후보가 유리합니다.");
        cons.push("마이그레이션 순서·데이터 호환 같은 리스크가 크면 상위 모델로 한 번 더 검증하는 편이 안전합니다.");
    }
    if (f.auth) {
        pros.push("인증 문구를 다듬는 단계와 실제 코드 착수를 나눌 수 있다면, 앞 단계는 가벼운 모델로 돌려도 됩니다.");
        cons.push("시크릿·권한 경계는 한 번 틀리면 비용이 큽니다. 착수 직전에는 성능 우선 쪽을 쓰는 것을 권합니다.");
    }
    if (f.api) {
        pros.push("연동 설명을 짧게 고치는 루프라면 반복 호출에 가벼운 모델이 맞습니다.");
        cons.push("경계 조건·에러 계약이 복잡하면 가벼운 모델이 입출력을 단순화할 수 있습니다.");
    }
    if (f.tests) {
        pros.push("테스트 문구나 커맨드만 조정하는 반복에는 가성비 후보가 체감상 이득입니다.");
        cons.push("CI까지 맞춰야 하는 완료 정의라면, 최종 정리는 성능 우선 쪽이 덜 헛돕니다.");
    }
    if (f.manySteps) {
        pros.push("단계가 많아도 ‘순서 문장만 고친다’는 식의 편집 루프라면 가벼운 모델로도 충분할 때가 많습니다.");
        cons.push("실제 구현에서 단계를 한꺼번에 밀어야 하면, 순서 유지에는 성능 우선이 더 낫습니다.");
    }

    if (!f.tokensLong && !f.tokensMid && !f.harnessBundle && !f.db && !f.auth && !f.api && !f.tests && !f.manySteps) {
        pros.push("이번 합본 부담이 낮게 보이면, 자동 구조화를 자주 돌릴수록 가벼운 쪽이 이득입니다.");
    }

    return { pros: pros.slice(0, 3), cons: cons.slice(0, 3) };
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
        `이번에 만든 합본(약 ${approx}치 분량, 글자 수로 본 대략값)에서는 ${focus} 같은 신호가 겹쳐 보이고, 그래서 구현·검증 부담을 ${demand}으로 잡았습니다.`
    );

    const s = haystack(m);
    const looksLight = /\b(mini|nano|flash|haiku|lite|small|fast)\b/.test(s);
    if (profile.demand01 >= 0.45 && looksLight) {
        lines.push(
            `그런데도 “${label}”이 잡혔다면 목록 분포 때문일 수 있어요. 체감이 가볍다면 한 단계 위 모델로 바꿔 보는 걸 권합니다.`
        );
    } else if (profile.demand01 >= 0.45) {
        lines.push(`“${label}”은(는) Cursor 모델 목록에서 상대적으로 앞선, 한 번에 기억하고 짚는 힘이 큰 층으로 분류돼, 방금 합본에 묶인 변경을 한 흐름으로 밀고 가기 좋습니다.`);
    } else if (profile.demand01 >= 0.28) {
        lines.push(
            `“${label}”은(는) 이번 부담(중간)에 맞춰 최상급 모델까지 과하게 쓰지 않되, 목록 안에서는 앞쪽 층으로 골라 균형을 맞췄습니다.`
        );
    } else {
        lines.push(
            `부담이 낮게 보여 “${label}”로도 범위를 빠르게 닫을 가능성이 큽니다. 다만 합본에 숨은 엣지가 있으면 한 단계 올려 보세요.`
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
        lines.push(`같은 합본(약 ${approx}치 분량, ${focus} 중심)을 기준으로 비용을 줄일 수 있는 후보도 따로 잡았습니다.`);
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

    lines.push(
        "같은 합본으로 자동 구조화를 여러 번 돌리거나 모델만 바꿔 실험할 때는 호출 횟수가 곧 비용입니다. 그런 루프에는 위 모델처럼 상대적으로 가벼운 쪽을 설정에 두는 편이 체감상 이득인 경우가 많습니다."
    );

    return lines.slice(0, 4);
}

export function buildPerformanceCardRationaleKo(
    m: CatalogModel,
    profile: ImplementationProfile,
    ctx?: ModelRecommendationContext
): ModelCardRationaleKo {
    const { pros, cons } = buildPerformanceProsConsKo(m, profile);
    return {
        lead: performanceLeadKo(m, profile, ctx),
        pros,
        cons,
        footnote: `선택 모델: ${modelTierKo(m)} · 이 컴퓨터의 Cursor Agent 모델 목록 안에서만 골랐습니다.`,
    };
}

export function buildValueCardRationaleKo(
    m: CatalogModel,
    profile: ImplementationProfile,
    ctx?: ModelRecommendationContext
): ModelCardRationaleKo {
    const { pros, cons } = buildValueProsConsKo(m, profile);
    return {
        lead: valueLeadKo(m, profile, ctx),
        pros,
        cons,
        footnote: `선택 모델: ${modelTierKo(m)} · 목록과 이름만 보고 짚은 추천이며, 실제로 맞는지는 실행해 보며 조정하세요.`,
    };
}
