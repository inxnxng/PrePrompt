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
    shortHint: "범위는 좁게, 배경·환경은 얇게, MUST NOT은 단단히, 빌드 단계는 번호로.",
    specAddendum: `## 전달 유형: 토큰 절약형 IDE 루프

**핑퐁 비용**이 모든 사실을 앞에 쌓는 것보다 클 때 이 패키지를 씁니다.

### 다섯 칸 읽는 법

- **완료 기준**: 명령·경로·스크린샷 등 **검증 가능한** 체크—포부형 문장 금지.
- **배경·환경**: 경로·스택·재현 앵커만 최소로; 서술 남발 금지.
- **필수·금지**: 의존성·폴더·인증 방식 등 MUST NOT / NEVER를 명시.
- **이번 작업 범위**: 한 화면 안에 안/밖; 미룬 일은 한 번만 이름 붙이기.
- **작업 순서**: 경로에 묶인 **번호 있는** 명령형 단계; 마지막에 검증 명령.

### 에이전트 자세

- SPEC를 다시 쓰기보다 **질문은 1~2개**로 끝내기.
- 산출물은 **리뷰 가능한 패치** 형태를 우선합니다.`,
    agentsAddendum: `### 유형: 토큰 절약형 IDE 루프

- **막히는 질문은 최대 두 개**; 그 외에는 작업 순서대로 진행합니다.
- **범위 밖 리팩터 금지**—이번 작업 범위에 없으면 하지 않습니다.
- 배경·환경이 얇으면 가정을 불릿으로 짧게 박고 진행합니다.`,
    harnessAddendum: `## 유형 규율 (절약형 IDE)

- 확인 질문을 줄이고, 완료 기준에 맞는 **수직 슬라이스**를 우선합니다.
- 범위 계약은 \`SPEC.md\`와 \`preprompt.task.json\`만 따릅니다.`,
    chatKickoff: "절약형 IDE 전달: SPEC.md·preprompt.task.json을 먼저 읽고 범위 안에서만 작업하세요. 막히는 질문은 최대 두 개, 이후 패치 단위로 구현하고 완료 기준으로 검증하세요.",
  },
  {
    id: "spike_ide",
    matchTags: ["channel:ide", "speed:first", "context:minimal", "iteration:multi", "deliverable:code", "collab:solo"],
    title: "빠른 스파이크 (IDE)",
    shortHint: "범위 최소, 학습 목표 허용, 안전 규칙은 단단, 빠른 반복.",
    specAddendum: `## 전달 유형: 빠른 스파이크

첫 산출이 **완성도**가 아니라 얇은 수직 슬라이스나 **학습 결과**일 때 씁니다.

### 다섯 칸 읽는 법

- **완료 기준**: **학습 목표**(무엇을 알게 되는지) + 관찰 가능한 데모 체크 한 가지를 허용.
- **배경·환경**: 스파이크에 필요한 최소만—버전과 진입 경로 하나.
- **필수·금지**: 안전 비협상(프로드 키·스키마 파괴 금지 등).
- **이번 작업 범위**: 의도적으로 작게; 미룬 일은 범위 밖에 명시.
- **작업 순서**: 최단 경로 단계; 후속 과제는 따로 표시.

### 에이전트 자세

- 필수·금지 **안에서** 대안 제안 가능; 이후 패스를 전제로 합니다.`,
    agentsAddendum: `### 유형: 빠른 스파이크

- **신호까지의 시간**을 우선; 완성도는 다음 패스로 미룹니다.
- 트레이드오프를 짧게 제시, 한 경로를 고르고 나머지는 범위 밖으로 남깁니다.`,
    harnessAddendum: `## 유형 규율 (스파이크)

- 행동 우선; 범위는 의도적으로 작게 유지합니다.
- 완료 기준에 없는 프로덕션 하드닝으로 확장하지 않습니다.`,
    chatKickoff: "스파이크 전달: SPEC.md·preprompt.task.json을 읽고, 완료 기준을 만족하는 **가장 작은 수직 슬라이스**를 만드세요(학습 목표 허용). 범위 밖 후속은 명시만 하고, 명시되지 않은 프로덕션 하드닝은 하지 마세요.",
  },
  {
    id: "doc_oneshot",
    matchTags: ["channel:doc_flow", "quality:first", "context:rich", "iteration:oneshot", "deliverable:doc", "collab:team"],
    title: "문서·PR 원샷",
    shortHint: "리뷰어가 같은 그림—결정·비목표·순서 있는 체크리스트.",
    specAddendum: `## 전달 유형: 문서·PR 원샷

**PR·RFC·위키**에 붙고 비동기 리뷰를 견뎌야 할 때 씁니다.

### 다섯 칸 읽는 법

- **완료 기준**: 리뷰어가 통과/실패 말할 수 있는 불릿; 필요하면 병합될 문구·다이어그램과 연결.
- **배경·환경**: 이미 내려진 결정, 링크, diff만으로 안 보이는 제약.
- **필수·금지**: 포맷·네이밍·보안·컴플라이언스 등 리뷰에서 걸릴 항목.
- **이번 작업 범위**: 이 문서/PR이 소유하는 것; 연관되나 이번에 안 하는 일은 링크로 분리.
- **작업 순서**: 리뷰 코멘트·RFC 절과 맞춘 **순서 있는** 체크리스트.

### 에이전트 자세

- 확인 라운드를 줄이려면 결정·비목표를 **앞에** 박습니다.`,
    agentsAddendum: `### 유형: 문서·PR 원샷

- 이 묶음**만** 읽는 리뷰어를 가정합니다.
- 말투보다 **비목표·결정 기록**을 우선합니다.`,
    harnessAddendum: `## 유형 규율 (문서 원샷)

- 리뷰에서 **수락/거절**이 분명하도록 씁니다.
- 채팅 말투 규칙은 넣지 않습니다—대화가 아니라 계약입니다.`,
    chatKickoff: "문서/PR 원샷: SPEC.md·preprompt.task.json을 리뷰 계약으로 읽으세요. 확인 질문보다 앞에 박힌 결정·비목표가 우선입니다. 리뷰어가 수락/거절할 수 있는 체크리스트형 산출을 만드세요.",
  },
  {
    id: "review_audit",
    matchTags: ["deliverable:review", "quality:first", "context:rich", "iteration:oneshot", "collab:team", "stakes:security"],
    title: "리뷰·감사 패스",
    shortHint: "근거·통과/실패·몰래 리팩터 금지—보안·범위 경계를 명시.",
    specAddendum: `## 전달 유형: 리뷰·감사

**리스크·보안·컴플라이언스·아키텍처** 점검용이지 기능 개발용이 아닐 때 씁니다.

### 다섯 칸 읽는 법

- **완료 기준**: 요건별 **관찰 가능한 근거**와 명시적 통과/실패.
- **배경·환경**: 신뢰 경계, 데이터 흐름, 위협 모델 앵커.
- **필수·금지**: 법·안전 금지; 승인 없이 바뀌면 안 되는 것.
- **이번 작업 범위**: 명시되지 않으면 **판정만**; 코드 수정은 **작업 순서**에 있을 때만.
- **작업 순서**: 수정이 범위에 있으면 번호 목록; 아니면 **발견 사항만**.

### 에이전트 자세

- **몰래 리팩터 금지.** 작업 순서에 없으면 판정 범위만 수행합니다.`,
    agentsAddendum: `### 유형: 리뷰·감사

- **근거가 있는 발견**(경로·명령·재현)을 만듭니다.
- **반드시 수정**과 **권고**를 구분하고, 범위를 몰래 넓히지 않습니다.`,
    harnessAddendum: `## 유형 규율 (리뷰·감사)

- 모든 주장은 **검증 가능**하게 만듭니다.
- 구현이 범위 밖이면 권고에서 멈춥니다.`,
    chatKickoff: "리뷰·감사 전달: SPEC.md·preprompt.task.json을 읽고, 요건별 통과/실패를 **근거와 함께** 제시하세요. 몰래 리팩터 금지; 구현이 명시되지 않으면 판정만 수행합니다.",
  },
  {
    id: "balanced",
    matchTags: ["channel:mixed", "tokens:balanced", "pace:balanced", "context:balanced", "deliverable:mixed"],
    title: "균형형 스타터",
    shortHint: "기본 혼합—명확한 기준·솔직한 배경·환경·필수·금지 몇 줄·명시적 범위·순서 있는 단계.",
    specAddendum: `## 전달 유형: 균형형 스타터

아직 극단 패턴에 안 맞을 때의 기본값입니다.

### 다섯 칸 읽는 법

- **완료 기준**: 분명하고 검증 가능한 결과.
- **배경·환경**: 신규 참여자가 길을 잃지 않을 정도의 맥락.
- **필수·금지**: 스타일 선호가 아니라 **진짜 금지** 몇 줄.
- **이번 작업 범위**: 안/밖 명시; 미룬 일은 이름 붙이기.
- **작업 순서**: 검증을 포함한 순서 있는 단계.

### 에이전트 자세

- 막히면 **소수의** 확인 질문은 허용합니다.

### 목표가 서로 깨질 때 (우선순위 계약)

- **완료 기준** 칸: 충돌하는 목표를 한 줄씩 적고, **먼저 지킬 것**과 **이번 전달에서 양보하는 것**을 같은 칸에 둡니다.
- **이번 작업 범위** 칸: 양보한 목표가 **다음 전달**로 미뤄지는지, **이번에 명시적으로 out**인지 적습니다.
- **필수·금지**는 흔들지 말고, 우선순위는 사실·제약으로만 적습니다(설득형 에세이가 아니라 다운스트림이 따를 계약).`,
    agentsAddendum: `### 유형: 균형형 스타터

- SPEC·task JSON을 따르고, 막힐 때만 간결하게 질문합니다.
- 범위를 흔들지 말고, 후속은 다음 전달로 쪼갭니다.`,
    harnessAddendum: `## 유형 규율 (균형)

- 깊이와 실용성의 균형; 에세이형·과소명세 범위 둘 다 피합니다.`,
    chatKickoff: "균형형 전달: SPEC.md·preprompt.task.json을 읽고 범위 안에서 구현하세요. 막힐 때만 집중 질문을 하고 완료 기준으로 검증합니다. 미룬 일은 다음 전달을 위해 명시적으로 남깁니다.",
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
    question: "이 전달을 **처음으로** 어디에 붙여 넣나요? 첫날에 통해야 하는 화면이 어디인가요?",
    options: [
      {
        id: "ch_ide",
        tags: ["channel:ide", "theme:engineering"],
        label: "IDE 에이전트 (Cursor, Copilot류, 로컬 규칙)",
        progressShort: "IDE",
        hint: "레포 경로·하네스 파일·패치형 작업이 중심입니다. 배경·환경·작업 순서 칸을 촘촘히 쓰는 편이 좋아요.",
      },
      {
        id: "ch_chat",
        tags: ["channel:chat", "theme:async_comms"],
        label: "팀 채팅 스레드 (Slack, Teams, Discord)",
        progressShort: "채팅",
        hint: "스레드는 금방 묻힙니다. 긴 환경 설명보다 첫 메시지에 완료 기준·범위 안·밖이 이깁니다.",
      },
      {
        id: "ch_ticket",
        tags: ["channel:ticket", "theme:ops"],
        label: "티켓·온콜·지라형 큐",
        progressShort: "티켓",
        hint: "재현·영향·롤백·담당이 핵심입니다. 필수·금지·완료 기준 칸에 그대로 반영하세요.",
      },
      {
        id: "ch_cx",
        tags: ["channel:cx", "theme:customer_copy"],
        label: "고객 대면 (메일, 인앱, 헬프센터)",
        progressShort: "고객",
        hint: "톤·법무·로케일은 필수·금지 칸에, 완료 기준은 검수자가 ‘통과/실패’ 말할 수 있게 쓰세요.",
      },
      {
        id: "ch_doc",
        tags: ["channel:doc_flow", "theme:knowledge"],
        label: "문서·PR 설명·RFC·위키",
        progressShort: "문서",
        hint: "리뷰 가능한 결정·비목표·순서 있는 체크리스트가 핵심입니다. 작업 순서 칸에 두세요.",
      },
      {
        id: "ch_live",
        tags: ["channel:live", "theme:sync_review"],
        label: "실시간 회의·화면 공유 (이후 정리)",
        progressShort: "실시간",
        hint: "전달문은 ‘회의 후 스냅샷’입니다. 안건이 아니라 합의된 결정을 완료 기준·범위에 박으세요.",
      },
      {
        id: "ch_mixed",
        tags: ["channel:mixed"],
        label: "복합이거나 아직 표면이 정해지지 않음",
        progressShort: "복합",
        hint: "이번 작업 범위 칸에 안·밖을 문자 그대로 쓰고, 표면이 정해질 때까지 채널 전용 용어는 줄이세요.",
      },
    ],
  },
  {
    id: "stakes",
    question: "독자나 에이전트가 빗나가면 **가장 아픈 것**은 무엇인가요?",
    options: [
      {
        id: "stakes_rework",
        tags: ["stakes:rework", "tokens:tight", "depth:lean"],
        label: "재작업·핑퐁으로 시간·토큰이 새는 것",
        progressShort: "재작업",
        hint: "범위를 좁히고 배경·환경은 짧게, 작업 순서는 번호 목록으로—열린 질문을 줄이세요.",
      },
      {
        id: "stakes_schedule",
        tags: ["stakes:schedule", "quality:first", "iteration:oneshot"],
        label: "날짜·SLA·약속한 단위를 놓치는 것",
        progressShort: "일정",
        hint: "완료 기준은 그 단위에 묶인 예/아니오 검사로. 같은 전달에 ‘있으면 좋은 것’을 섞지 마세요. 다른 목표(품질·범위 등)와 충돌하면 한 줄로 **우선순위**를 완료 기준·이번 작업 범위 칸에 박으세요.",
      },
      {
        id: "stakes_security",
        tags: ["stakes:security", "quality:first", "context:rich", "deliverable:review"],
        label: "보안·컴플라이언스·데이터 노출",
        progressShort: "리스크",
        hint: "먼저 필수·금지, 그다음 신뢰 경계가 드러나는 배경·환경. 완료 기준에 감사·검증 가능한 항목을 넣으세요.",
      },
      {
        id: "stakes_wrong_product",
        tags: ["stakes:wrong_product", "quality:first", "context:rich", "iteration:oneshot"],
        label: "요구를 잘못 읽고 엉뚱한 것을 만드는 것",
        progressShort: "오해",
        hint: "의도가 고정되기 전에 구현 단계로 가지 마세요. 배경·환경·사용자에게 보이는 완료 기준을 앞에 두세요.",
      },
      {
        id: "stakes_alignment",
        tags: ["stakes:alignment", "collab:team", "context:rich", "quality:first"],
        label: "팀 기대 불일치·리뷰에서 같은 논의 반복",
        progressShort: "합의",
        hint: "결정·비목표·파일 소유를 이번 작업 범위 칸에. 리뷰어가 같은 그림을 보도록 완료 기준을 문서형으로 쓰세요. 일정·리스크와 겹치면 **충돌하는 목표**를 나열한 뒤 이번 전달에서 지킬 것·양보할 것을 같은 칸에 적어 계약으로 남기세요.",
      },
    ],
  },
  {
    id: "proof",
    question: "이 전달이 끝났다는 것을 **무엇으로 증명**할 건가요?",
    options: [
      {
        id: "proof_automation",
        tags: ["proof:automation", "iteration:oneshot", "quality:first"],
        label: "자동화: 테스트·CI·린트·빌드 통과",
        progressShort: "CI",
        hint: "작업 순서 칸에 실행할 명령을 박고, 완료 기준은 그 출력·동작을 가리키세요.",
      },
      {
        id: "proof_self",
        tags: ["proof:self_check", "iteration:multi", "tokens:balanced"],
        label: "본인 확인: 로컬 재현·스크린샷·임시 체크리스트",
        progressShort: "본인",
        hint: "재현 절차는 배경·환경에, 완료 기준은 CI 없이도 관찰 가능하게 쓰세요.",
      },
      {
        id: "proof_review",
        tags: ["proof:pr_review", "collab:team", "quality:first"],
        label: "사람 검토: PR 승인 또는 명시적 사인오프",
        progressShort: "리뷰",
        hint: "범위·건드릴 파일 목록을 이번 작업 범위 칸에. 완료 기준은 리뷰어가 수락/거절 말할 수 있게.",
      },
      {
        id: "proof_consensus",
        tags: ["proof:doc_consensus", "channel:doc_flow", "deliverable:doc", "quality:first"],
        label: "문서 합의: RFC·PR 코멘트에서 합의된 내용",
        progressShort: "합의",
        hint: "결정을 코멘트·문서 앵커에 묶고, 작업 순서 칸은 합의된 체크리스트를 그대로 따르게 하세요.",
      },
      {
        id: "proof_spike",
        tags: ["proof:unknown", "speed:first", "context:minimal", "iteration:multi"],
        label: "아직 없음—탐색·스파이크 단계",
        progressShort: "스파이크",
        hint: "완료 기준을 ‘학습 목표’로 둘 수는 있어도, 필수·금지로 안전 경로는 막으세요. 범위는 최소로.",
      },
    ],
  },
  {
    id: "agent_freedom",
    question: "에이전트에게 허용할 **탐색·질문·왕복**은 어느 정도인가요?",
    options: [
      {
        id: "agent_prescriptive",
        tags: ["iteration:oneshot", "tokens:tight", "depth:lean"],
        label: "최소—체크리스트 실행; 막힐 때만 질문",
        progressShort: "촘촘",
        hint: "작업 순서 칸은 길게, 확인은 짧게. 원샷 압력과 맞습니다.",
      },
      {
        id: "agent_standard",
        tags: ["iteration:multi", "tokens:balanced", "pace:balanced", "context:balanced"],
        label: "보통—빈칸은 소수의 집중 질문으로 메워도 됨",
        progressShort: "보통",
        hint: "배경·환경와 ‘범위 밖’을 균형 있게. 확인 라운드 1~2회를 전제로 쓰세요.",
      },
      {
        id: "agent_exploratory",
        tags: ["iteration:multi", "speed:first", "context:minimal"],
        label: "탐색형—제약 안에서 대안 제안 허용",
        progressShort: "탐색",
        hint: "필수·금지는 단단히, 범위는 작게, 배경·환경은 얇게. 속도는 반복으로, 앞장 에세이로가 아닙니다.",
      },
    ],
  },
  {
    id: "deliverable",
    question: "돌려받아야 할 **1차 산출물**은 무엇에 가깝나요?",
    options: [
      {
        id: "deliv_code",
        tags: ["deliverable:code"],
        label: "코드·패치·실행 가능한 변경",
        progressShort: "코드",
        hint: "작업 순서 칸에 경로·검증 명령, 배경·환경 칸에 스택·진입점을 고정하세요.",
      },
      {
        id: "deliv_doc",
        tags: ["deliverable:doc"],
        label: "문서형 스펙·계획·ADR류 서술",
        progressShort: "문서",
        hint: "완료 기준은 수용 테스트 불릿처럼, 필수·금지는 형식·비목표를 덮으세요.",
      },
      {
        id: "deliv_review",
        tags: ["deliverable:review"],
        label: "리뷰 결과·리스크 목록·통과/실패 판정",
        progressShort: "리뷰",
        hint: "완료 기준에 관찰 가능한 근거를. 범위는 판정까지이고 ‘몰래 리팩터’는 범위 밖으로.",
      },
      {
        id: "deliv_mixed",
        tags: ["deliverable:mixed"],
        label: "혼합 (코드 + 설명이 한 패키지)",
        progressShort: "혼합",
        hint: "코드 단계는 작업 순서 칸에, 설명형 산출은 완료 기준에 나눠 쓰세요.",
      },
    ],
  },
  {
    id: "audience",
    question: "내가 없을 때도 이 전달만 읽고 이해해야 하는 **주 독자**는 누구인가요?",
    options: [
      {
        id: "collab_solo",
        tags: ["collab:solo"],
        label: "나만 (솔로 루프)",
        progressShort: "솔로",
        hint: "미래의 나만 본다면 배경·환경를 줄여도 됩니다. 다만 완료 기준은 정직하게 두세요.",
      },
      {
        id: "collab_team",
        tags: ["collab:team"],
        label: "동료·리뷰어·온콜",
        progressShort: "팀",
        hint: "비공개 맥락이 없다고 가정하세요. 경로·오너·범위 안·밖이 사실상 필수입니다.",
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
    description: "이번 작업 범위를 좁히고 배경·환경은 짧게, 필수·금지는 강하게. 배경·환경 칸을 과하게 채우기보다 확인 질문을 소수 허용하는 패턴입니다.",
    reasons: [
      "핑퐁 비용이 아픈데 반복 다듬기는 허용할 때 맞습니다.",
      "좁은 범위·짧은 배경·환경 요약·번호 있는 실행 단계를 강조해요.",
    ],
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
    description: "리뷰어가 같은 그림을 보게 배경·환경·완료 기준을 앞에 두고, 작업 순서 칸은 단계별 체크리스트로 고정합니다. 채팅 말투 규칙이 아니라 실행·검증에 집중해요.",
    reasons: [
      "팀 합의·문서형 합의·지시형 실행 흐름과 맞습니다.",
      "문서 산출·원샷형 검증 전제와 잘 맞습니다.",
    ],
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
    description: "범위를 아주 작게, 배경·환경은 최소로, 범위 밖을 한 줄로 박아요. 첫 패스는 완전함보다 빠른 수직 슬라이스를 노립니다.",
    reasons: [
      "스파이크 단계·탐색형 에이전트·IDE 루프와 맞습니다.",
      "얇은 배경·환경·명시적 범위 밖·완전함보다 속도.",
    ],
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
    description: "필수·금지, 관찰 가능한 완료 기준, 비목표를 선명히 합니다. 보안·컴플라이언스·아키텍처 리뷰 패스에 맞춘 전달입니다.",
    reasons: [
      "보안·컴플라이언스 리스크와 관찰 가능한 통과/실패 검사.",
      "리뷰 산출·촘촘한 에이전트·팀 독자.",
    ],
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
    description: "다섯 칸을 균형 있게: 완료 기준·솔직한 배경·환경·필수·금지 몇 줄·명시적 범위 안·밖·단계별 작업 순서.",
    reasons: [
      "극단 선택 없이 섞인 목표에 맞습니다.",
      "아직 하네스 형태를 찾는 중일 때 좋습니다.",
    ],
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
      "일정·SLA와 팀 합의·문서 합의가 동시에 걸릴 때, 완료 기준과 이번 작업 범위 칸에 **서로 깨는 목표**를 짧게 나열하고 **우선순위**(지킬 것 vs 이번에 양보)를 제약으로 박습니다. 에이전트가 ‘조언’이 아니라 **계약**으로 읽도록 맥락을 줍니다.",
    reasons: [
      "일정 리스크와 합의 리스크가 같이 잡힌 태그 조합과 맞습니다.",
      "다섯 칸에 근거 한 줄(왜 이 우선순위인지)을 실을 때 이 템플릿이 가깝습니다.",
    ],
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
} = {
  pageTitle: "하네스 플레이북",
  pageSubtitle:
    "메인 에디터 다섯 칸(완료 기준 / 배경·환경 / 필수·금지 / 이번 작업 범위 / 작업 순서)을 어떻게 채울지, 아래 여섯 질문으로 방향을 잡습니다. 첫 표면, 실패 시 가장 아픈 지점, 완료 증명 방법, 에이전트 왕복 허용 범위, 1차 산출물, 나 없이 읽어야 할 독자. 태그로 스타터 템플릿 순위를 매기고, 비슷한 사이트 추천은 버튼을 눌렀을 때만 자동 구조화에 쓰는 백엔드로 전달됩니다.",
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
  editorHint:
    "홈 오른쪽 미리보기 ‘전달 유형’에서 아래와 같은 이름을 고른 뒤, 전달 대상(Cursor 등)만 골라 ZIP을 받을 수 있습니다.",
  backStep: "이전 단계",
  notChosen: "—",
  resultsTitle: "추천 결과",
  progressTrackLabel: "선택 진행",
  progressPending: "…",
  progressComplete: "모든 단계 선택 완료",
  stepsRemaining: (n) => (n === 1 ? "남은 단계 1" : `남은 단계 ${n}`),
  progressJumpToEdit: "이 단계로 돌아가서 다시 선택할 수 있어요",
};
