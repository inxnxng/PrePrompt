import type { Language } from "@/lib/i18n";

type Localized = Record<Language, string>;

export type HarnessGuideOption = {
  id: string;
  tags: string[];
  label: Localized;
  /** Very short label for the top progress strip */
  progressShort: Localized;
  hint?: Localized;
};

export type HarnessGuideStep = {
  id: string;
  question: Localized;
  options: HarnessGuideOption[];
};

export type HarnessGuideTemplate = {
  id: string;
  /** Higher score when more of these appear in the user’s accumulated tags */
  matchTags: string[];
  title: Localized;
  description: Localized;
  /** Short bullets explaining fit (shown after scoring) */
  reasons: Localized[];
  /** Reserved for future zip / deep-link wiring */
  bundleHint?: Localized;
};

const L = (en: string, ko: string): Localized => ({ en, ko });

export const HARNESS_GUIDE_STEPS: HarnessGuideStep[] = [
  {
    id: "channel",
    question: L(
      "Where does this handoff mainly live? (channel / theme)",
      "이 전달이 주로 쓰이는 채널·주제에 가깝나요?"
    ),
    options: [
      {
        id: "ch_ide",
        tags: ["channel:ide", "theme:engineering"],
        label: L("IDE agent loop (Cursor, Copilot-style)", "IDE 에이전트 루프 (Cursor, Copilot 등)"),
        progressShort: L("IDE", "IDE"),
        hint: L("Repo-aware work, rules files, patch-shaped outputs.", "레포 맞춤 작업·규칙 파일·패치형 산출에 가깝습니다."),
      },
      {
        id: "ch_chat",
        tags: ["channel:chat", "theme:async_comms"],
        label: L("Team chat (Slack, Teams, Discord)", "팀 채팅 (Slack, Teams, Discord)"),
        progressShort: L("Chat", "채팅"),
        hint: L("Thread boundaries and a crisp ‘definition of done’ matter.", "스레드 단위·짧은 완료 정의가 중요해요."),
      },
      {
        id: "ch_ticket",
        tags: ["channel:ticket", "theme:ops"],
        label: L("Tickets / on-call / Jira-style queue", "티켓·온콜·지라형 큐"),
        progressShort: L("Ticket", "티켓"),
        hint: L("Repro steps, blast radius, rollback, and owners.", "재현·영향 범위·롤백·담당자가 중심이에요."),
      },
      {
        id: "ch_cx",
        tags: ["channel:cx", "theme:customer_copy"],
        label: L("Customer-facing copy (email, in-app, help center)", "고객 대면 카피 (메일, 인앱, 헬프센터)"),
        progressShort: L("CX", "고객"),
        hint: L("Tone, compliance, and localization dominate.", "톤·컴플라이언스·현지화 제약이 많아요."),
      },
      {
        id: "ch_doc",
        tags: ["channel:doc_flow", "theme:knowledge"],
        label: L("Docs, PRs, RFCs, internal wiki", "문서·PR·RFC·내부 위키"),
        progressShort: L("Docs", "문서"),
        hint: L("Reviewability and traceable decisions beat chatty tone.", "리뷰 가능성·결정 추적이 말투보다 중요해요."),
      },
      {
        id: "ch_live",
        tags: ["channel:live", "theme:sync_review"],
        label: L("Live meeting / screen-share / bridge", "실시간 회의·화면 공유·브릿지"),
        progressShort: L("Live", "실시간"),
        hint: L("Capture decisions and owners before the room disappears.", "회의가 끝나기 전에 결정·오너를 박아 두기."),
      },
      {
        id: "ch_mixed",
        tags: ["channel:mixed"],
        label: L("Mixed or channel not pinned yet", "복합이거나 아직 채널이 정해지지 않음"),
        progressShort: L("Mixed", "복합"),
        hint: L("Keep in/out scope lines extra explicit.", "범위 안·밖 선을 특히 또렷하게 두는 편이 좋아요."),
      },
    ],
  },
  {
    id: "tokens",
    question: L(
      "How should this handoff use tokens?",
      "이번 전달에서 토큰을 어떻게 쓰고 싶나요?"
    ),
    options: [
      {
        id: "tok_generous",
        tags: ["tokens:generous", "depth:rich"],
        label: L("I can spend tokens freely", "여유 있게 토큰을 써도 돼요"),
        progressShort: L("Generous", "넉넉"),
        hint: L("Richer context and longer SPEC sections are OK.", "맥락·SPEC을 넉넉히 넣어도 괜찮아요."),
      },
      {
        id: "tok_tight",
        tags: ["tokens:tight", "depth:lean"],
        label: L("Save tokens as much as possible", "최대한 토큰을 아끼고 싶어요"),
        progressShort: L("Tight", "절약"),
        hint: L("Prefer tight scope, minimal ping-pong.", "범위를 좁히고 확인 질문을 줄이는 쪽이에요."),
      },
      {
        id: "tok_balanced",
        tags: ["tokens:balanced"],
        label: L("Balanced", "적당히 균형 있게"),
        progressShort: L("Balanced", "균형"),
        hint: L("Neither extreme.", "극단은 피하고 중간이에요."),
      },
    ],
  },
  {
    id: "pace",
    question: L(
      "What matters more for the first useful output?",
      "첫 쓸만한 결과물 기준으로 무엇이 더 중요한가요?"
    ),
    options: [
      {
        id: "pace_quality",
        tags: ["quality:first"],
        label: L("Quality over speed", "속도보다 결과 품질"),
        progressShort: L("Quality", "품질"),
        hint: L("Willing to iterate or wait for depth.", "깊이 있게 맞추는 편이 좋아요."),
      },
      {
        id: "pace_speed",
        tags: ["speed:first"],
        label: L("Speed over polish", "품질보다 빨리 나오게"),
        progressShort: L("Fast", "속도"),
        hint: L("Spike / draft first, refine later.", "초안·스파이크 먼저, 다듬기는 나중에."),
      },
      {
        id: "pace_balanced",
        tags: ["pace:balanced"],
        label: L("Balance both", "둘 다 비슷하게"),
        progressShort: L("Balanced", "균형"),
        hint: L("Good enough fast, then tighten.", "먼저 쓸 만하게, 이후에 조여요."),
      },
    ],
  },
  {
    id: "context",
    question: L(
      "How much context should you front-load in the handoff?",
      "전달문에 맥락을 얼마나 앞당겨 넣을까요?"
    ),
    options: [
      {
        id: "ctx_rich",
        tags: ["context:rich"],
        label: L("Put rich repo / domain context in", "레포·도메인 맥락을 많이 넣을게요"),
        progressShort: L("Rich", "풍부"),
        hint: L("Fewer “what stack is this?” rounds.", "스택·배경 확인 라운드를 줄여요."),
      },
      {
        id: "ctx_minimal",
        tags: ["context:minimal"],
        label: L("Keep the handoff minimal", "최소 정보만 넣을게요"),
        progressShort: L("Minimal", "최소"),
        hint: L("Let the agent ask targeted follow-ups.", "필요할 때만 에이전트가 묻게."),
      },
      {
        id: "ctx_balanced",
        tags: ["context:balanced"],
        label: L("In the middle", "중간 정도"),
        progressShort: L("Balanced", "균형"),
        hint: L("Key facts only, defer the rest.", "핵심 사실만, 나머지는 연기."),
      },
    ],
  },
  {
    id: "iteration",
    question: L(
      "How strict is the “first answer must land” requirement?",
      "첫 답이 거의 바로 맞아야 하나요?"
    ),
    options: [
      {
        id: "iter_oneshot",
        tags: ["iteration:oneshot"],
        label: L("Must land in one shot", "한 번에 맞아야 해요"),
        progressShort: L("One-shot", "원샷"),
        hint: L("Strong rules, tight scope, explicit checks.", "규칙·범위·검증을 강하게 걸어요."),
      },
      {
        id: "iter_multi",
        tags: ["iteration:multi"],
        label: L("OK to refine over a few turns", "몇 번 왔다 갔다해도 돼요"),
        progressShort: L("Iterate", "반복"),
        hint: L("Harness / chat can narrow details.", "하네스·채팅으로 세부를 좁혀요."),
      },
    ],
  },
  {
    id: "deliverable",
    question: L(
      "What is the primary shape of the outcome?",
      "기대하는 산출물의 형태는 무엇에 가깝나요?"
    ),
    options: [
      {
        id: "deliv_code",
        tags: ["deliverable:code"],
        label: L("Code / patch / implementation", "코드·패치·구현"),
        progressShort: L("Code", "코드"),
      },
      {
        id: "deliv_doc",
        tags: ["deliverable:doc"],
        label: L("Doc / spec / plan", "문서·스펙·계획"),
        progressShort: L("Docs", "문서"),
      },
      {
        id: "deliv_review",
        tags: ["deliverable:review"],
        label: L("Review / audit / risk pass", "리뷰·감사·리스크 점검"),
        progressShort: L("Review", "리뷰"),
      },
      {
        id: "deliv_mixed",
        tags: ["deliverable:mixed"],
        label: L("Mixed (code + narrative)", "혼합 (코드 + 설명)"),
        progressShort: L("Mixed", "혼합"),
      },
    ],
  },
  {
    id: "collab",
    question: L(
      "Who is the main consumer of this handoff?",
      "이 전달문의 주된 독자는 누구에 가깝나요?"
    ),
    options: [
      {
        id: "collab_solo",
        tags: ["collab:solo"],
        label: L("Mostly me (solo loop)", "주로 나 혼자 쓸게요"),
        progressShort: L("Solo", "솔로"),
      },
      {
        id: "collab_team",
        tags: ["collab:team"],
        label: L("Teammates / PR reviewers", "동료·PR 리뷰어"),
        progressShort: L("Team", "팀"),
        hint: L("Extra clarity on scope and file layout.", "범위·파일 배치 설명을 조금 더 해요."),
      },
    ],
  },
];

export const HARNESS_GUIDE_TEMPLATES: HarnessGuideTemplate[] = [
  {
    id: "tpl-lean-handoff",
    matchTags: ["channel:ide", "tokens:tight", "depth:lean", "context:minimal", "iteration:multi", "deliverable:code"],
    title: L("Lean code handoff", "토큰 절약형 코드 전달"),
    description: L(
      "Narrow handoff scope, short ground truth, strict must-not rules. Let the agent ask one or two focused follow-ups instead of over-filling Reality anchor.",
      "전달 범위를 좁히고 바탕 사실은 짧게, 필수·금지는 강하게. 바탕 사실 칸을 과하게 채우기보다 확인 질문을 소수 허용하는 패턴입니다."
    ),
    reasons: [
      L("Matches token-tight + minimal context.", "토큰 절약·최소 맥락 조합과 맞습니다."),
      L("Implementation-heavy with room to iterate.", "구현 위주이면서 반복 다듬기에 열려 있어요."),
    ],
    bundleHint: L("Future: zip with slim SPEC + .mdc starter.", "예정: 슬림 SPEC + .mdc 스타터 zip."),
  },
  {
    id: "tpl-spec-quality",
    matchTags: [
      "channel:doc_flow",
      "quality:first",
      "context:rich",
      "iteration:oneshot",
      "deliverable:doc",
      "collab:team",
    ],
    title: L("One-shot SPEC / doc package", "원샷 SPEC·문서 패키지"),
    description: L(
      "Front-load facts and success checks so reviewers see the same picture. Strong response contract as an ordered checklist, not chat styling.",
      "리뷰어가 같은 그림을 보게 바탕·완료 기준을 앞에 두고, 구현 계약은 순서 있는 체크리스트로 고정합니다. 채팅 말투 규칙이 아니라 실행·검증에 집중해요."
    ),
    reasons: [
      L("Quality-first + rich context + team readers.", "품질 우선·풍부한 맥락·팀 독자에 맞춥니다."),
      L("Documentation-shaped deliverable.", "문서·스펙형 산출에 맞습니다."),
    ],
    bundleHint: L("Future: handoff zip with SPEC template + AGENTS.md.", "예정: SPEC 템플릿 + AGENTS.md zip."),
  },
  {
    id: "tpl-spike-fast",
    matchTags: ["channel:ide", "speed:first", "context:minimal", "iteration:multi", "deliverable:code", "collab:solo"],
    title: L("Fast spike path", "빠른 스파이크 경로"),
    description: L(
      "Tiny scope, minimal ground truth, explicit “out of scope” lines. Prefer a quick vertical slice over completeness in the first pass.",
      "범위를 아주 작게, 바탕은 최소로, 범위 밖을 한 줄로 박아요. 첫 패스는 완전함보다 빠른 수직 슬라이스를 노립니다."
    ),
    reasons: [
      L("Speed-first + solo + code.", "속도 우선·솔로·코드 조합과 잘 맞습니다."),
      L("Iterative refinement is expected.", "이후 턴에서 다듬는 전제와 맞습니다."),
    ],
    bundleHint: L("Future: minimal task JSON + chat one-liner pack.", "예정: 최소 task JSON + 채팅 한 줄 팩."),
  },
  {
    id: "tpl-review-harness",
    matchTags: [
      "channel:ticket",
      "channel:doc_flow",
      "deliverable:review",
      "quality:first",
      "context:rich",
      "iteration:oneshot",
      "collab:team",
    ],
    title: L("Review / audit harness", "리뷰·감사 하네스"),
    description: L(
      "Emphasize hard rules, observable success criteria, and explicit non-goals. Good for security, compliance, or architecture review passes.",
      "필수·금지, 관찰 가능한 완료 기준, 비목표를 선명히 합니다. 보안·컴플라이언스·아키텍처 리뷰 패스에 맞춘 전달입니다."
    ),
    reasons: [
      L("Review-shaped outcome with one-shot pressure.", "리뷰형 산출·원샷 압력과 맞습니다."),
      L("Rich context helps auditors trust the frame.", "감사·리뷰 쪽에 맥락이 많을수록 유리해요."),
    ],
    bundleHint: L("Future: checklist-heavy zip for reviewers.", "예정: 체크리스트 중심 리뷰어용 zip."),
  },
  {
    id: "tpl-balanced-default",
    matchTags: [
      "channel:mixed",
      "channel:chat",
      "channel:cx",
      "channel:live",
      "tokens:balanced",
      "pace:balanced",
      "context:balanced",
      "deliverable:mixed",
    ],
    title: L("Balanced PrePrompt starter", "균형형 PrePrompt 스타터"),
    description: L(
      "Default five-slot balance: clear success criteria, honest ground truth, a few hard rules, explicit in/out scope, ordered implementation contract.",
      "다섯 칸을 균형 있게: 완료 기준·정직한 바탕·필수·금지 몇 줄·명시적 범위 안·밖·순서 있는 구현 계약."
    ),
    reasons: [
      L("Fits mixed goals without extreme tradeoffs.", "극단 선택 없이 섞인 목표에 맞습니다."),
      L("Good when you are still discovering the right harness.", "아직 하네스 형태를 찾는 중일 때 좋습니다."),
    ],
    bundleHint: L("Future: generic zip mirroring main app export tree.", "예정: 메인 앱 export 트리와 같은 범용 zip."),
  },
];

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
export function resolveProgressShort(
  lang: Language,
  stepIndex: number,
  picked: (string | null)[]
): string | null {
  const id = picked[stepIndex];
  if (!id) return null;
  const step = HARNESS_GUIDE_STEPS[stepIndex];
  const opt = step.options.find((o) => o.id === id);
  return opt ? opt.progressShort[lang] : null;
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

export type RankedTemplate = { template: HarnessGuideTemplate; score: number };

export function rankTemplates(userTags: Set<string>): RankedTemplate[] {
  return HARNESS_GUIDE_TEMPLATES.map((template) => ({
    template,
    score: scoreByTagOverlap(template.matchTags, userTags),
  })).sort((a, b) => b.score - a.score || a.template.id.localeCompare(b.template.id));
}

export const HARNESS_GUIDE_UI: Record<
  Language,
  {
    pageTitle: string;
    pageSubtitle: string;
    backHome: string;
    stepLabel: (current: number, total: number) => string;
    recommendedTitle: string;
    matchScore: (n: number) => string;
    reasonsTitle: string;
    similarSitesTitle: string;
    similarSitesIntro: string;
    similarSitesDisclaimer: string;
    similarSitesButton: string;
    similarSitesLoading: string;
    similarSitesNeedApiKey: string;
    similarSitesBackendGemini: string;
    similarSitesBackendCursor: string;
    similarSitesEmptyHint: string;
    startOver: string;
    openEditor: string;
    editorHint: string;
    backStep: string;
    notChosen: string;
    resultsTitle: string;
    progressTrackLabel: string;
    /** Shown in a step cell before an answer exists */
    progressPending: string;
    /** All picks filled (results view) */
    progressComplete: string;
    /** How many steps still have no selection (wizard) */
    stepsRemaining: (n: number) => string;
    /** Progress cell: can jump back to re-pick */
    progressJumpToEdit: string;
  }
> = {
  en: {
    pageTitle: "Harness playbook",
    pageSubtitle:
      "Pick where the handoff lives (IDE, chat, tickets, etc.), then a few tradeoffs—token budget, quality vs speed, how much context to front-load, and who reads it. We suggest starter templates; optionally ask your configured agent for documentation links (button only).",
    backHome: "Back to Home",
    stepLabel: (c, t) => `Step ${c} of ${t}`,
    recommendedTitle: "Suggested templates",
    matchScore: (n) => `Match score: ${n}`,
    reasonsTitle: "Why this fits",
    similarSitesTitle: "Similar sites to explore",
    similarSitesIntro:
      "Nothing is sent until you press the button. Uses the same backend as Settings → Auto-Structure (Gemini with your API key, or Cursor Agent on this machine).",
    similarSitesDisclaimer:
      "Suggestions are model-generated. PrePrompt does not fetch or verify third-party pages—open links at your own discretion.",
    similarSitesButton: "Get similar site suggestions",
    similarSitesLoading: "Asking the agent…",
    similarSitesNeedApiKey: "Add a Gemini API key in Settings, or switch Auto-Structure to Cursor Agent.",
    similarSitesBackendGemini: "Backend: Google Gemini",
    similarSitesBackendCursor: "Backend: Cursor Agent (local CLI)",
    similarSitesEmptyHint: "Press the button to fetch suggestions.",
    startOver: "Start over",
    openEditor: "Open main editor",
    editorHint: "Wire your own prefills or zip bundles to these template IDs later.",
    backStep: "Previous step",
    notChosen: "—",
    resultsTitle: "Recommendations",
    progressTrackLabel: "Choices",
    progressPending: "…",
    progressComplete: "All steps answered",
    stepsRemaining: (n) => (n === 1 ? "1 step left" : `${n} steps left`),
    progressJumpToEdit: "Go to this step to change your choice",
  },
  ko: {
    pageTitle: "하네스 플레이북",
    pageSubtitle:
      "먼저 전달이 쓰이는 채널·주제(IDE, 채팅, 티켓 등)를 고르고, 이어서 토큰·품질·맥락·독자 같은 트레이드오프를 고르면 스타터 템플릿을 제안합니다. 비슷한 공개 문서 링크는 버튼을 눌렀을 때만 설정된 에이전트에게 물어볼 수 있습니다.",
    backHome: "홈으로",
    stepLabel: (c, t) => `${c} / ${t} 단계`,
    recommendedTitle: "추천 템플릿",
    matchScore: (n) => `맞춤 점수: ${n}`,
    reasonsTitle: "왜 맞는지",
    similarSitesTitle: "비슷한 사이트 추천",
    similarSitesIntro:
      "버튼을 누르기 전까지는 요청이 나가지 않습니다. 설정의 자동 구조화 백엔드와 동일합니다(Gemini는 API 키, Cursor Agent는 이 PC의 CLI).",
    similarSitesDisclaimer:
      "답변은 모델이 생성한 것이며, PrePrompt가 외부 페이지를 대신 열어보거나 검증하지 않습니다. 링크는 본인 책임으로 확인하세요.",
    similarSitesButton: "비슷한 사이트 추천받기",
    similarSitesLoading: "에이전트에 질문하는 중…",
    similarSitesNeedApiKey: "설정에서 Gemini API 키를 넣거나, 자동 구조화를 Cursor Agent로 바꿔 주세요.",
    similarSitesBackendGemini: "백엔드: Google Gemini",
    similarSitesBackendCursor: "백엔드: Cursor Agent (로컬 CLI)",
    similarSitesEmptyHint: "버튼을 누르면 여기에 추천이 표시됩니다.",
    startOver: "처음부터",
    openEditor: "메인 에디터로",
    editorHint: "나중에 템플릿 ID에 맞춰 zip·프리필을 연결하면 됩니다.",
    backStep: "이전 단계",
    notChosen: "—",
    resultsTitle: "추천 결과",
    progressTrackLabel: "선택 진행",
    progressPending: "…",
    progressComplete: "모든 단계 선택 완료",
    stepsRemaining: (n) => (n === 1 ? "남은 단계 1" : `남은 단계 ${n}`),
    progressJumpToEdit: "이 단계로 돌아가서 다시 선택할 수 있어요",
  },
};
