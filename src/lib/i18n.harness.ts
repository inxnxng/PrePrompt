/** Playbook wizard copy + handoff archetype strings (Korean, single locale). */

export type HandoffArchetypeId =
  | "lean_ide"
  | "spike_ide"
  | "doc_oneshot"
  | "review_audit"
  | "balanced";

export const HANDOFF_ARCHETYPE_IDS: readonly HandoffArchetypeId[] = [
  "lean_ide",
  "spike_ide",
  "doc_oneshot",
  "review_audit",
  "balanced",
] as const;

export type HandoffArchetypeDefinition = {
  id: HandoffArchetypeId;
  /** Playbook / analytics alignment */
  matchTags: string[];
  title: string;
  shortHint: string;
  /** Appended to SPEC.md (after main body). */
  specAddendum: string;
  /** Appended after the default AGENTS.md body. */
  agentsAddendum: string;
  /** Appended after the default harness kernel (Cursor rule / CLAUDE.md / …). */
  harnessAddendum: string;
  /** First chat line when this type is active (ZIP + copy). */
  chatKickoff: string;
};

export const HANDOFF_ARCHETYPES: readonly HandoffArchetypeDefinition[] = [
  {
    id: "lean_ide",
    matchTags: ["channel:ide", "tokens:tight", "depth:lean", "iteration:multi", "deliverable:code"],
    title: "토큰 절약형 IDE 루프",
    shortHint: "범위 좁게, 배경 얇게, MUST NOT 단단히, 단계는 번호로.",
    specAddendum: `## 전달 유형: 토큰 절약형 IDE 루프

핑퐁 비용이 클 때 사용합니다.

### 다섯 칸

- 완료 기준: 검증 가능한 체크(경로·명령·스샷). 포부형 문장 금지.
- 배경·환경: 경로·스택·재현 앵커만 최소.
- 필수·금지: MUST NOT / NEVER 명시.
- 이번 작업 범위: 안/밖 한 화면; 미룬 일은 한 줄로.
- 작업 순서: 경로 묶인 번호 단계, 마지막에 검증 명령.

### 에이전트

- 질문은 1~2개로 끝내고 패치 단위 산출.`,
    agentsAddendum: `### 유형: 토큰 절약형 IDE 루프

- 막힐 때 질문 최대 두 개, 나머지는 순서대로.
- 범위 밖 리팩터 금지.`,
    harnessAddendum: `## 유형 규율 (절약형 IDE)

- 수직 슬라이스 우선, 확인 질문 최소화.
- 범위는 \`SPEC.md\`, \`preprompt.task.json\`만 따릅니다.`,
    chatKickoff:
      "절약형: SPEC·task JSON을 읽고 범위 안만. 질문 최대 두 개 후 패치로 구현하고 완료 기준으로 검증.",
  },
  {
    id: "spike_ide",
    matchTags: ["channel:ide", "speed:first", "context:minimal", "iteration:multi", "deliverable:code", "collab:solo"],
    title: "빠른 스파이크 (IDE)",
    shortHint: "범위 최소, 학습 목표 OK, 안전 규칙 단단, 빠른 반복.",
    specAddendum: `## 전달 유형: 빠른 스파이크

얇은 슬라이스·학습 결과가 1차 목표일 때.

### 다섯 칸

- 완료 기준: 학습 목표 + 관찰 가능한 데모 체크 하나.
- 배경·환경: 버전·진입 경로 등 최소만.
- 필수·금지: 안전 비협상(프로드 키·파괴적 변경 금지).
- 이번 작업 범위: 작게; 미룬 일은 범위 밖에 명시.
- 작업 순서: 최단 경로; 후속은 별도.

### 에이전트

- 필수·금지 안에서 대안 제안 가능.`,
    agentsAddendum: `### 유형: 빠른 스파이크

- 신호까지의 시간 우선, 완성도는 다음 패스.
- 한 경로 선택, 나머지는 범위 밖.`,
    harnessAddendum: `## 유형 규율 (스파이크)

- 범위 작게 유지, 완료 기준 밖 프로덕션 하드닝 금지.`,
    chatKickoff:
      "스파이크: SPEC·task JSON 읽고 가장 작은 수직 슬라이스. 후속·미명시 하드닝은 하지 않음.",
  },
  {
    id: "doc_oneshot",
    matchTags: ["channel:doc_flow", "quality:first", "context:rich", "iteration:oneshot", "deliverable:doc", "collab:team"],
    title: "문서·PR 원샷",
    shortHint: "결정·비목표·순서 체크리스트로 리뷰어와 같은 그림.",
    specAddendum: `## 전달 유형: 문서·PR 원샷

PR·RFC·위키 등 비동기 리뷰용.

### 다섯 칸

- 완료 기준: 통과/실패 말할 수 있는 불릿.
- 배경·환경: 내려진 결정·링크·diff 밖 제약.
- 필수·금지: 포맷·보안·컴플라이언스.
- 이번 작업 범위: 이 문서 소유분; 나머지는 링크로 분리.
- 작업 순서: 리뷰 흐름에 맞는 체크리스트.

### 에이전트

- 결정·비목표를 앞에 두어 확인 라운드 축소.`,
    agentsAddendum: `### 유형: 문서·PR 원샷

- 이 묶음만 읽는 리뷰어 가정.
- 말투보다 결정·비목표 기록.`,
    harnessAddendum: `## 유형 규율 (문서 원샷)

- 수락/거절이 분명한 문장. 대화 말투 규칙은 넣지 않음.`,
    chatKickoff: "문서 원샷: SPEC·task JSON을 계약으로 읽고, 결정·비목표 우선, 체크리스트형 산출.",
  },
  {
    id: "review_audit",
    matchTags: ["deliverable:review", "quality:first", "context:rich", "iteration:oneshot", "collab:team", "stakes:security"],
    title: "리뷰·감사 패스",
    shortHint: "근거·통과/실패, 몰래 리팩터 금지, 범위 명시.",
    specAddendum: `## 전달 유형: 리뷰·감사

보안·컴플라이언스·아키 점검(기능 개발 아님).

### 다섯 칸

- 완료 기준: 요건별 근거 + 통과/실패.
- 배경·환경: 신뢰 경계·데이터 흐름·위협 앵커.
- 필수·금지: 법·안전·승인 없이 바뀌면 안 되는 것.
- 이번 작업 범위: 미명시면 판정만; 수정은 순서에 있을 때만.
- 작업 순서: 수정 범위면 번호 목록, 아니면 발견만.

### 에이전트

- 몰래 리팩터 금지.`,
    agentsAddendum: `### 유형: 리뷰·감사

- 경로·명령·재현이 있는 발견.
- 수정 vs 권고 구분, 범위 확장 금지.`,
    harnessAddendum: `## 유형 규율 (리뷰·감사)

- 주장은 검증 가능하게. 구현이 범위 밖이면 권고에서 멈춤.`,
    chatKickoff: "리뷰·감사: SPEC·task JSON 읽고 요건별 통과/실패+근거. 미명시 구현·몰래 리팩터 금지.",
  },
  {
    id: "balanced",
    matchTags: ["channel:mixed", "tokens:balanced", "pace:balanced", "context:balanced", "deliverable:mixed"],
    title: "균형형 스타터",
    shortHint: "기본값: 검증 가능한 기준·적당한 맥락·금지 몇 줄·명시적 범위·순서 단계.",
    specAddendum: `## 전달 유형: 균형형 스타터

극단 패턴 전 기본값.

### 다섯 칸

- 완료 기준: 검증 가능.
- 배경·환경: 신규도 길 잃지 않을 분량.
- 필수·금지: 스타일이 아니라 진짜 금지만.
- 이번 작업 범위: 안/밖·미룬 일 이름.
- 작업 순서: 검증 포함 단계.

### 에이전트

- 막히면 짧은 확인 질문 허용.

### 목표 충돌 시

- 완료 기준 칸에 충돌 목표·지킬 것·양보할 것 한 블록.
- 범위 칸에 미룬 목표(out/다음 전달) 명시.
- 필수·금지는 유지, 우선순위는 사실·제약만.`,
    agentsAddendum: `### 유형: 균형형 스타터

- SPEC·task JSON 준수, 막힐 때만 짧게 질문.
- 후속은 다음 전달로 분리.`,
    harnessAddendum: `## 유형 규율 (균형)

- 에세이·과소명세 범위 모두 피함.`,
    chatKickoff: "균형형: SPEC·task JSON 읽고 범위 내 구현. 막힐 때만 질문, 미룬 일은 명시적으로 분리.",
  },
];


export type HarnessGuideOption = {
  id: string;
  tags: string[];
  label: string;
  /** Very short label for the top progress strip */
  progressShort: string;
  hint?: string;
};

export type HarnessGuideStep = {
  id: string;
  question: string;
  options: HarnessGuideOption[];
};

export type HarnessGuideTemplate = {
  id: string;
  /** Bundled ZIP / export type — matches `HandoffArchetypeId` in the main app */
  archetypeId: HandoffArchetypeId;
  /** Higher score when more of these appear in the user's accumulated tags */
  matchTags: string[];
  title: string;
  description: string;
  /** Short bullets explaining fit (shown after scoring) */
  reasons: string[];
  /** Reserved for future zip / deep-link wiring */
  bundleHint?: string;
};


export const HARNESS_GUIDE_STEPS: HarnessGuideStep[] = [
  {
    id: "surface",
    question: "이 전달이 처음 붙는 곳은?",
    options: [
      {
        id: "ch_ide",
        tags: ["channel:ide", "theme:engineering"],
        label: "IDE 에이전트 (Cursor, Copilot류, 로컬 규칙)",
        progressShort: "IDE",
        hint: "경로·하네스·패치 중심. 배경·작업 순서를 촘촘히.",
      },
      {
        id: "ch_chat",
        tags: ["channel:chat", "theme:async_comms"],
        label: "팀 채팅 스레드 (Slack, Teams, Discord)",
        progressShort: "채팅",
        hint: "첫 메시지에 완료 기준·범위 안/밖이 긴 환경설명보다 낫습니다.",
      },
      {
        id: "ch_ticket",
        tags: ["channel:ticket", "theme:ops"],
        label: "티켓·온콜·지라형 큐",
        progressShort: "티켓",
        hint: "재현·영향·롤백·담당을 필수·금지·완료 기준에 반영.",
      },
      {
        id: "ch_cx",
        tags: ["channel:cx", "theme:customer_copy"],
        label: "고객 대면 (메일, 인앱, 헬프센터)",
        progressShort: "고객",
        hint: "톤·법무는 필수·금지, 완료 기준은 검수자가 통과/실패 말할 수 있게.",
      },
      {
        id: "ch_doc",
        tags: ["channel:doc_flow", "theme:knowledge"],
        label: "문서·PR 설명·RFC·위키",
        progressShort: "문서",
        hint: "결정·비목표·순서 체크리스트를 작업 순서에.",
      },
      {
        id: "ch_live",
        tags: ["channel:live", "theme:sync_review"],
        label: "실시간 회의·화면 공유 (이후 정리)",
        progressShort: "실시간",
        hint: "회의 후 스냅샷: 합의된 결정을 완료 기준·범위에 박기.",
      },
      {
        id: "ch_mixed",
        tags: ["channel:mixed"],
        label: "복합이거나 표면 미정",
        progressShort: "복합",
        hint: "범위 칸에 안/밖을 문자로; 채널 전용 용어는 줄이기.",
      },
    ],
  },
  {
    id: "stakes",
    question: "빗나가면 가장 큰 손해는?",
    options: [
      {
        id: "stakes_rework",
        tags: ["stakes:rework", "tokens:tight", "depth:lean"],
        label: "재작업·핑퐁으로 시간·토큰 소모",
        progressShort: "재작업",
        hint: "범위 좁히기, 배경 짧게, 순서는 번호 목록.",
      },
      {
        id: "stakes_schedule",
        tags: ["stakes:schedule", "quality:first", "iteration:oneshot"],
        label: "날짜·SLA·약속 단위 놓침",
        progressShort: "일정",
        hint: "완료 기준은 예/아니오로. 충돌 시 우선순위 한 줄을 완료 기준·범위에.",
      },
      {
        id: "stakes_security",
        tags: ["stakes:security", "quality:first", "context:rich", "deliverable:review"],
        label: "보안·컴플라이언스·데이터 노출",
        progressShort: "리스크",
        hint: "필수·금지 먼저, 신뢰 경계는 배경에. 완료 기준에 검증 가능 항목.",
      },
      {
        id: "stakes_wrong_product",
        tags: ["stakes:wrong_product", "quality:first", "context:rich", "iteration:oneshot"],
        label: "요구 오해로 엉뚱한 산출",
        progressShort: "오해",
        hint: "의도 고정 전 구현 금지. 사용자에게 보이는 완료 기준을 앞에.",
      },
      {
        id: "stakes_alignment",
        tags: ["stakes:alignment", "collab:team", "context:rich", "quality:first"],
        label: "팀 기대 불일치·같은 논의 반복",
        progressShort: "합의",
        hint: "결정·비목표·소유를 범위에. 일정과 겹치면 지킬 것/양보를 같은 칸에.",
      },
    ],
  },
  {
    id: "proof",
    question: "끝났음을 무엇으로 증명하나요?",
    options: [
      {
        id: "proof_automation",
        tags: ["proof:automation", "iteration:oneshot", "quality:first"],
        label: "자동화: 테스트·CI·린트·빌드 통과",
        progressShort: "CI",
        hint: "순서 칸에 명령, 완료 기준은 출력·동작을 가리키기.",
      },
      {
        id: "proof_self",
        tags: ["proof:self_check", "iteration:multi", "tokens:balanced"],
        label: "본인 확인: 로컬 재현·스크린샷·임시 체크리스트",
        progressShort: "본인",
        hint: "재현은 배경에, 완료 기준은 CI 없이도 관찰 가능하게.",
      },
      {
        id: "proof_review",
        tags: ["proof:pr_review", "collab:team", "quality:first"],
        label: "사람 검토: PR 승인 또는 사인오프",
        progressShort: "리뷰",
        hint: "건드릴 파일·범위는 범위 칸, 완료 기준은 수락/거절 가능하게.",
      },
      {
        id: "proof_consensus",
        tags: ["proof:doc_consensus", "channel:doc_flow", "deliverable:doc", "quality:first"],
        label: "문서 합의: RFC·PR 코멘트 합의분",
        progressShort: "합의",
        hint: "결정을 코멘트·문서에 앵커, 순서는 합의 체크리스트 그대로.",
      },
      {
        id: "proof_spike",
        tags: ["proof:unknown", "speed:first", "context:minimal", "iteration:multi"],
        label: "아직 없음 — 탐색·스파이크",
        progressShort: "스파이크",
        hint: "학습 목표는 OK, 필수·금지로 안전은 막고 범위는 최소.",
      },
    ],
  },
  {
    id: "agent_freedom",
    question: "에이전트 탐색·질문·왕복은 어느 정도까지?",
    options: [
      {
        id: "agent_prescriptive",
        tags: ["iteration:oneshot", "tokens:tight", "depth:lean"],
        label: "최소 — 체크리스트 실행, 막힐 때만 질문",
        progressShort: "촘촘",
        hint: "순서 칸은 길게, 확인은 짧게.",
      },
      {
        id: "agent_standard",
        tags: ["iteration:multi", "tokens:balanced", "pace:balanced", "context:balanced"],
        label: "보통 — 집중 질문으로 빈칸 일부 보완",
        progressShort: "보통",
        hint: "배경과 범위 밖 균형, 확인 1~2회 전제.",
      },
      {
        id: "agent_exploratory",
        tags: ["iteration:multi", "speed:first", "context:minimal"],
        label: "탐색형 — 제약 안 대안 제안 허용",
        progressShort: "탐색",
        hint: "금지는 단단히, 범위는 작게, 배경은 얇게. 반복으로 속도.",
      },
    ],
  },
  {
    id: "deliverable",
    question: "1차 산출물은 무엇에 가깝나요?",
    options: [
      {
        id: "deliv_code",
        tags: ["deliverable:code"],
        label: "코드·패치·실행 가능한 변경",
        progressShort: "코드",
        hint: "순서에 경로·검증 명령, 배경에 스택·진입점.",
      },
      {
        id: "deliv_doc",
        tags: ["deliverable:doc"],
        label: "문서형 스펙·계획·ADR류",
        progressShort: "문서",
        hint: "완료 기준은 수용 테스트형, 필수·금지는 형식·비목표.",
      },
      {
        id: "deliv_review",
        tags: ["deliverable:review"],
        label: "리뷰·리스크·통과/실패 판정",
        progressShort: "리뷰",
        hint: "근거 있는 완료 기준, 범위는 판정까지, 몰래 리팩터는 밖.",
      },
      {
        id: "deliv_mixed",
        tags: ["deliverable:mixed"],
        label: "혼합 (코드 + 설명 한 패키지)",
        progressShort: "혼합",
        hint: "코드는 순서, 설명은 완료 기준에 나누기.",
      },
    ],
  },
  {
    id: "audience",
    question: "나 없이도 이 전달만 읽는 주 독자는?",
    options: [
      {
        id: "collab_solo",
        tags: ["collab:solo"],
        label: "나만 (솔로 루프)",
        progressShort: "솔로",
        hint: "배경은 줄여도 완료 기준은 정직하게.",
      },
      {
        id: "collab_team",
        tags: ["collab:team"],
        label: "동료·리뷰어·온콜",
        progressShort: "팀",
        hint: "비공개 맥락 없다 가정. 경로·오너·범위 안/밖 필수.",
      },
    ],
  },
];

export const HARNESS_GUIDE_TEMPLATES: HarnessGuideTemplate[] = [
  {
    id: "tpl-lean-handoff",
    archetypeId: "lean_ide",
    matchTags: [
      "channel:ide",
      "tokens:tight",
      "depth:lean",
      "iteration:multi",
      "deliverable:code",
      "stakes:rework",
    ],
    title: "토큰 절약형 코드 전달",
    description: "범위 좁게, 배경 짧게, 금지 강하게. 짧은 확인 질문과 번호 단계.",
    reasons: ["핑퐁 비용이 큰데 반복은 허용할 때.", "좁은 범위·짧은 맥락·실행 단계 강조."],
    bundleHint: "예정: 슬림 SPEC + .mdc 스타터 zip.",
  },
  {
    id: "tpl-spec-quality",
    archetypeId: "doc_oneshot",
    matchTags: [
      "channel:doc_flow",
      "quality:first",
      "context:rich",
      "iteration:oneshot",
      "deliverable:doc",
      "collab:team",
      "stakes:alignment",
      "proof:doc_consensus",
    ],
    title: "원샷 SPEC·문서 패키지",
    description: "리뷰어가 같은 그림을 보도록 앞에 맥락·완료 기준, 순서는 체크리스트로.",
    reasons: ["팀·문서 합의와 지시형 흐름.", "문서 산출·원샷 검증 전제."],
    bundleHint: "예정: SPEC 템플릿 + AGENTS.md zip.",
  },
  {
    id: "tpl-spike-fast",
    archetypeId: "spike_ide",
    matchTags: [
      "channel:ide",
      "speed:first",
      "context:minimal",
      "iteration:multi",
      "deliverable:code",
      "collab:solo",
      "proof:unknown",
    ],
    title: "빠른 스파이크 경로",
    description: "범위 최소, 배경 얇게, 범위 밖 한 줄. 첫 패스는 속도 우선.",
    reasons: ["스파이크·탐색형 에이전트·IDE 루프.", "완전함보다 얇은 슬라이스."],
    bundleHint: "예정: 최소 task JSON + 채팅 한 줄 팩.",
  },
  {
    id: "tpl-review-harness",
    archetypeId: "review_audit",
    matchTags: [
      "channel:ticket",
      "channel:doc_flow",
      "deliverable:review",
      "quality:first",
      "context:rich",
      "iteration:oneshot",
      "collab:team",
      "stakes:security",
    ],
    title: "리뷰·감사 하네스",
    description: "금지·완료 기준·비목표를 선명히. 보안·컴플라이언스·아키 점검용.",
    reasons: ["리스크와 통과/실패 검사.", "리뷰 산출·촘촘한 에이전트·팀 독자."],
    bundleHint: "예정: 체크리스트 중심 리뷰어용 zip.",
  },
  {
    id: "tpl-balanced-default",
    archetypeId: "balanced",
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
    title: "균형형 PrePrompt 스타터",
    description: "다섯 칸 균형: 기준·맥락·금지·범위 안/밖·순서.",
    reasons: ["극단 없이 섞인 목표.", "형태를 아직 고르는 중일 때."],
    bundleHint: "예정: 메인 앱 export 트리와 같은 범용 zip.",
  },
  {
    id: "tpl-tradeoff-priority",
    archetypeId: "balanced",
    matchTags: [
      "stakes:schedule",
      "stakes:alignment",
      "quality:first",
      "collab:team",
      "iteration:oneshot",
      "channel:doc_flow",
      "proof:doc_consensus",
    ],
    title: "목표 충돌·우선순위 전달",
    description:
      "일정·합의가 겹칠 때 완료 기준·범위 칸에 충돌 목표와 우선순위(지킬 것/양보)를 짧게. 계약으로 읽히게.",
    reasons: ["일정+합의 태그가 같이 잡힐 때.", "근거 한 줄을 같은 칸에 실을 때."],
    bundleHint: "예정: 균형형 zip + SPEC에 우선순위 소절.",
  },
];

export const HARNESS_GUIDE_UI: {
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
  /** Primary: fill home step-0 draft from playbook picks, then go home */
  sendToHomeDraft: string;
  sendToHomeDraftHint: string;
  openEditor: string;
  /** Open home without overwriting the store */
  openEditorBare: string;
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
  /** Results card: ZIP download hint with dynamic archetype title */
  zipHandoffHint: (archetypeTitle: string) => string;
} = {
  pageTitle: "하네스 플레이북",
  pageSubtitle:
    "여섯 질문으로 전달 방향을 잡고, 태그로 스타터 템플릿을 추천합니다. 비슷한 사이트는 버튼을 눌렀을 때만 요청됩니다.",
  backHome: "홈으로",
  stepLabel: (c, t) => `${c} / ${t} 단계`,
  recommendedTitle: "추천 템플릿",
  matchScore: (n) => `맞춤 점수: ${n}`,
  reasonsTitle: "왜 맞는지",
  similarSitesTitle: "비슷한 사이트 추천",
  similarSitesIntro: "버튼 전까지는 요청이 나가지 않습니다. 홈의 자동 구조화와 같은 백엔드(Gemini 키 또는 Cursor CLI)입니다.",
  similarSitesDisclaimer: "모델 생성 답변입니다. 링크는 직접 확인하세요.",
  similarSitesButton: "비슷한 사이트 추천받기",
  similarSitesLoading: "에이전트에 질문하는 중…",
  similarSitesNeedApiKey: "Gemini 키를 넣거나 자동 구조화를 Cursor Agent로 바꿔 주세요.",
  similarSitesBackendGemini: "백엔드: Google Gemini",
  similarSitesBackendCursor: "백엔드: Cursor Agent (로컬 CLI)",
  similarSitesEmptyHint: "버튼을 누르면 여기에 표시됩니다.",
  startOver: "처음부터",
  openEditor: "메인 에디터로",
  editorHint: "ZIP은 홈 미리보기에서 전달 유형과 대상을 고른 뒤 받으세요.",
  backStep: "이전 단계",
  notChosen: "—",
  resultsTitle: "추천 결과",
  progressTrackLabel: "선택 진행",
  progressPending: "…",
  progressComplete: "모든 단계 선택 완료",
  stepsRemaining: (n) => (n === 1 ? "남은 단계 1" : `남은 단계 ${n}`),
  progressJumpToEdit: "탭하면 이 단계로 돌아가 다시 고를 수 있어요",
  sendToHomeDraft: "홈에 초안 넣기",
  sendToHomeDraftHint: "선택을 자연어 초안으로 스텝 0에 넣고 이동합니다. 다른 필드는 비웁니다.",
  openEditorBare: "초안 없이 홈으로",
  zipHandoffHint: (t) => `ZIP: 홈 미리보기에서 「${t}」 유형과 전달 대상을 고른 뒤 다운로드하세요.`,
};
