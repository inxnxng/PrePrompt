export type Language = "en" | "ko";

export type StageMeta = {
  placeholder: string;
  bad?: string;
  good?: string;
  tips: string[];
};

export type Translation = {
  // App shell
  appSubtitle: string;
  settings: string;
  resetAll: string;
  minimizeSidebar: string;
  expandSidebar: string;
  /** Nav label for /playbook (harness tradeoff playbook) */
  navPlaybook: string;
  promptPreview: string;
  compiledPrompt: string;
  copy: string;
  copied: string;
  tokens: string;
  draft: string;
  structured: string;
  fillStages: string;
  yourInput: string;
  previous: string;
  next: string;
  done: string;
  readyInSidebar: string;
  stepOf: (current: number, total: number) => string;
  autoStructure: string;
  autoStructuring: string;
  saveBaseline: string;
  baseline: string;
  // Settings modal
  settingsTitle: string;
  settingsDesc: string;
  settingsSecurity: string;
  geminiApiKey: string;
  geminiApiKeyPlaceholder: string;
  /** Text before the clickable https://aistudio.google.com/api-keys link */
  geminiApiKeyHintBefore: string;
  /** Text after the link (e.g. punctuation) */
  geminiApiKeyHintAfter: string;
  geminiApiKeyShow: string;
  geminiApiKeyHide: string;
  llmProvider: string;
  llmProviderGemini: string;
  llmProviderCursorAgent: string;
  /** Shown when Cursor Agent is selected: local CLI, server subprocess, env vars */
  cursorAgentHint: string;
  language: string;
  cancel: string;
  saveChanges: string;
  // Alerts
  alertNoApiKey: string;
  alertFailed: string;
  alertDialogNoticeTitle: string;
  alertDialogErrorTitle: string;
  alertDialogOk: string;
  /** Shown after Gemini proxy errors when HTTP status is 5xx; include https://aistudio.google.com/status */
  alertGeminiServerStatusHint: string;
  // Specificity indicator
  specificityLow: string;
  specificityMid: string;
  specificityHigh: string;
  specificityLabel: string;
  // Tips panel
  tipsLabel: string;
  rulesLabel: string;
  // Bad / Good labels
  bad: string;
  good: string;
  // Stages
  stages: {
    naturalPrompt: { label: string; description: string } & StageMeta;
    intentLock: { label: string; description: string } & StageMeta;
    realityAnchor: { label: string; description: string } & StageMeta;
    constraintCage: { label: string; description: string } & StageMeta;
    actionSlice: { label: string; description: string } & StageMeta;
    responseContract: { label: string; description: string } & StageMeta;
  };
  // Preview section labels
  sectionLabels: {
    intentLock: string;
    realityAnchor: string;
    constraintCage: string;
    actionSlice: string;
    responseContract: string;
  };
  // Handoff export
  exportTitle: string;
  /** Subheading above file download actions (SPEC, task, rules, ZIP, etc.) */
  exportGroupFiles: string;
  /** Subheading for the chat one-liner (clipboard only) */
  exportGroupChat: string;
  downloadZip: string;
  downloadSpec: string;
  downloadTaskJson: string;
  downloadCursorRules: string;
  /** Handoff file saved at repo root as AGENTS.md */
  downloadAgentsMd: string;
  copyOneLiner: string;
  copiedOneLiner: string;
  /** Opens dialog explaining target paths in the repo */
  exportPathGuide: string;
  exportPathGuideTitle: string;
  /** One line above the folder tree */
  exportPathGuideIntro: string;
  /** Reminder: keep filenames, only match paths */
  exportPathGuideKeepNames: string;
  /** Subheading for ZIP explanation */
  exportPathGuideZipTitle: string;
  /** What the ZIP contains vs single files; one-shot workflow */
  exportPathGuideZipBody: string;
  intentLabel: string;
  // Token story (PoC — only rounds adjustable)
  tokenScenarioTitle: string;
  tokenRounds: string;
  tokenPocLeadBefore: string;
  tokenPocLeadAfter: string;
  tokenFixedNote: string;
  tokenIllustrativeLabel: string;
  tokenPocDisclaimer: string;
  // Settings — planning mode
  compactPlanning: string;
  compactPlanningHint: string;
  // About page
  about: {
    title: string;
    description: string;
    howToUseTitle: string;
    backToHome: string;
    link: string;
    developerInfo: {
      title: string;
      email: string;
      github: string;
      blog: string;
    };
  };
};

const en: Translation = {
  appSubtitle: "5-stage Harness for safe AI collaboration",
  settings: "Settings",
  resetAll: "Reset All",
  minimizeSidebar: "Minimize sidebar",
  expandSidebar: "Expand sidebar",
  navPlaybook: "Harness playbook",
  promptPreview: "Prompt Preview",
  compiledPrompt: "compiled prompt",
  copy: "Copy",
  copied: "Copied",
  tokens: "Tokens",
  draft: "Draft",
  structured: "Structured",
  fillStages: "Fill in the stages to see\nyour compiled prompt here.",
  yourInput: "Your Input",
  previous: "Previous",
  next: "Next",
  done: "Done",
  readyInSidebar: "Ready in sidebar",
  stepOf: (c, t) => `Step ${c} of ${t}`,
  autoStructure: "✨ Auto-Structure",
  autoStructuring: "✨ Structuring...",
  saveBaseline: "Set Baseline",
  baseline: "Baseline",
  settingsTitle: "Settings",
  settingsDesc: "Configure your API keys and preferences.",
  settingsSecurity:
    "Your API key stays in this browser (local storage). It is sent to your deployment's /api/gemini only for that request and is not stored by the app. Do not use production secrets if you do not trust the environment.",
  geminiApiKey: "Gemini API Key",
  geminiApiKeyPlaceholder: "Paste key from Google AI Studio",
  geminiApiKeyHintBefore:
    'Used for the "Auto-Structure" feature. Get your key at ',
  geminiApiKeyHintAfter: ".",
  geminiApiKeyShow: "Show API key",
  geminiApiKeyHide: "Hide API key",
  llmProvider: "Auto-Structure backend",
  llmProviderGemini: "Google Gemini",
  llmProviderCursorAgent: "Cursor Agent (local CLI)",
  cursorAgentHint:
    "Auto-Structure calls `cursor-agent` on the Next.js server (Node). Install the Cursor CLI on that machine, run `cursor-agent login`, then start the app with `npm run dev`.",
  language: "Language",
  cancel: "Cancel",
  saveChanges: "Save changes",
  alertNoApiKey: "Please configure your Gemini API Key in Settings first.",
  alertFailed: "Failed to auto-structure prompt.",
  alertDialogNoticeTitle: "Notice",
  alertDialogErrorTitle: "Something went wrong",
  alertDialogOk: "OK",
  alertGeminiServerStatusHint:
    "For server errors (HTTP 5xx), you can check Google AI Studio service status: https://aistudio.google.com/status",
  specificityLow: "Too vague",
  specificityMid: "Getting specific",
  specificityHigh: "Well-specified",
  specificityLabel: "Specificity",
  tipsLabel: "Tips for a better prompt",
  rulesLabel: "Guidelines",
  bad: "Bad",
  good: "Good",
  stages: {
    naturalPrompt: {
      label: "Initial Draft",
      description: "Your original, natural language prompt",
      placeholder:
        "Dump what is in your head—messy is fine.\n\n- What you want to change or build\n- Why it matters (background, motivation)\n- What you already tried, where you are stuck, signals of success or failure\n- Who the reader should “be” (role), product or team context\n\nCoverage beats polish here; you will tighten this in later stages.",
      tips: [
        "Name one imagined reader (e.g., a senior teammate). Write background → goal → priorities in that voice.",
        "Capture early “definition of done” signals (tests, a URL, a screenshot). You will lift them into later stages verbatim.",
        "Jot deadlines, known risks, and anything already off-limits—even as rough notes.",
      ],
    },
    intentLock: {
      label: "Success criteria",
      description: "How you will know you are done",
      placeholder:
        "Only checkable completion signals—no stack traces, no file paths unless they are part of the success check.\n\n- One verifiable outcome per line (behavior, data, UX signal)\n- Prefer “when X then Y” over open verbs like “implement”\n- Number priorities when order matters\n\nWeak: “has login UX.” Strong: “this path reaches /dashboard without a 401.”",
      bad: "Make a login system.",
      good: "- Email/password authentication flow.\n- JWT issued on success, stored in httpOnly cookie.\n- No session storage used.\n- Redirect to /dashboard on login.",
      tips: [
        "If a line is a fact about today's repo (“we already have…”), move it to Ground truth.",
        "If a line is a rule (“never install deps”), move it to Hard rules.",
        "If a line is “not part of this handoff,” move it to Handoff scope—not here.",
      ],
    },
    realityAnchor: {
      label: "Ground truth",
      description: "Facts and assumptions about today",
      placeholder:
        "Only what is true now—reproducible from text.\n\n- Framework/runtime and pinned dependency versions\n- Paths, branch, what exists / missing / broken\n- Commands that reproduce locally\n\nDo not restate goals or rules; those belong in other stages.",
      bad: "Add login to my project.",
      good: "- Next.js 14 App Router (src/app directory).\n- Supabase connected via @supabase/ssr.\n- No existing auth system.\n- User table: id, email, created_at.\n- env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY.",
      tips: [
        "Write as if for an auditor: is/was/has—not should or will.",
        "Pin versions and real paths; “latest” hides breaking differences.",
        "One canonical entry file (README, main route) cuts exploratory drift.",
      ],
    },
    constraintCage: {
      label: "Hard rules",
      description: "Non-negotiables for the work itself",
      placeholder:
        "Solution constraints only—things that would void the work if violated.\n\n- MUST / MUST NOT / NEVER / ONLY\n- Security, privacy, licensing, compatibility, deps\n- Lint/architecture bans\n\nDo not put step-by-step file/API plans here — those belong in Auto-Structure's implementation blueprint and in the Implementation contract field.",
      bad: "Make the code clean and fast.\nUse whatever library you think is best.",
      good: "- MUST use Next.js App Router only. No Pages Router.\n- MUST NOT install new npm packages.\n- STRICTLY use Tailwind CSS. No custom CSS files.\n- NEVER modify /prisma/schema.prisma.\n- Avoid class components entirely.",
      tips: [
        "NEVER / MUST NOT beat “try to avoid” when the prohibition is real.",
        "Name one valid-but-unwanted approach and forbid it in one sentence.",
        "Keep chat-reply styling out of this box — use Implementation contract for build order.",
      ],
    },
    actionSlice: {
      label: "Handoff scope",
      description: "What this one prompt covers",
      placeholder:
        "Boundaries of this single structured handoff—not “your next message.”\n\n- In scope: areas, surfaces, or deliverables this package commits to\n- Out of scope / deferred: explicit exclusions (harness or sub-agents may plan those internally)\n- Optional hard closer: “Nothing outside this scope.”\n\nYou still send one user-facing prompt; internal ping-pong belongs in tooling, not here.",
      bad: "Implement full authentication system.",
      good: "In scope for this handoff:\n- Login UI in src/components/LoginForm.tsx (fields + submit only)\n- Wire to existing auth API once backend contract is merged\n\nExplicitly out of scope (handle in harness / later handoff):\n- Email templates, password reset, OAuth\n\nNothing outside this scope.",
      tips: [
        "Separate “what we prove done” (Success criteria) from “what turf this document owns” (here).",
        "Deferrals are allowed—name them so agents do not ask you the same question twice.",
        "A closing scope line reduces scope creep better than tone alone.",
      ],
    },
    responseContract: {
      label: "Implementation contract",
      description: "Ordered execution checklist (not chat reply shape)",
      placeholder:
        "What to build, in what order, where, and how to prove it — for someone who only reads this handoff.\n\n- Numbered steps tied to paths and APIs\n- Point to SPEC implementation blueprint sections\n- Verification commands or checks\n\nForbidden: 'respond in JSON', markdown templates for an LLM answer, word limits, or meta 'your reply should…'.",
      bad: "Answer in JSON with keys summary, stack, next steps.",
      good: "1) Add prisma models + migration per SPEC data model.\n2) Implement POST /api/event/spin with row locks as in SPEC.\n3) Wire src/app/event/page.tsx to the API; show win/lose copy from assumptions.\n4) Run pnpm test && pnpm lint; manual curl in SPEC verification section.",
      tips: [
        "If Auto-Structure filled an implementation blueprint, echo its order here in imperative form.",
        "Every step should be falsifiable (a reviewer can say done/not done).",
        "Keep chat-formatting rules out — this is build instructions, not prose styling.",
      ],
    },
  },
  sectionLabels: {
    intentLock: "Success criteria",
    realityAnchor: "Ground (facts)",
    constraintCage: "Hard rules",
    actionSlice: "Handoff scope",
    responseContract: "Implementation contract",
  },
  exportTitle: "Agent handoff",
  exportGroupFiles: "Save as files",
  exportGroupChat: "Paste in chat",
  downloadZip: "ZIP bundle",
  downloadSpec: "SPEC.md",
  downloadTaskJson: "preprompt.task.json",
  downloadCursorRules: "Cursor rule (.mdc)",
  downloadAgentsMd: "AGENTS.md",
  copyOneLiner: "Copy chat one-liner",
  copiedOneLiner: "Copied one-liner",
  exportPathGuide: "Where to place files",
  exportPathGuideTitle: "Folder layout (fixed paths)",
  exportPathGuideIntro:
    "Put files in your repo so it matches this tree (root = your project folder):",
  exportPathGuideKeepNames:
    "Keep every filename exactly as shown—only create the folders and drop the files.",
  exportPathGuideZipTitle: "ZIP bundle",
  exportPathGuideZipBody:
    "The ZIP already contains the same files with the same names. Unzip once, then copy them into your project following the tree—use either the ZIP or the individual downloads, not both. It also includes CHAT_MESSAGE.txt (same text as the chat one-liner) as an on-disk copy; pasting the one-liner into chat is still how you kick things off.",
  intentLabel: "Intent",
  tokenScenarioTitle: "Why this saves tokens",
  tokenRounds: "Assumed ping-pong rounds",
  tokenPocLeadBefore:
    "Each extra agent round usually re-sends a growing context. Without a structured handoff, roughly ",
  tokenPocLeadAfter:
    " rounds of back-and-forth can stack input tokens quickly. PrePrompt front-loads intent so you can skip most clarification ping-pong.",
  tokenFixedNote:
    "Fixed illustration: base 8k input per round, +2.5k growth each round, vs ~2 agent turns after structuring (plus Auto-Structure in this app). Not measured billing.",
  tokenIllustrativeLabel: "Illustrative avoided input tokens",
  tokenPocDisclaimer:
    "Only the round count is adjustable; other values stay fixed for this demo story.",
  compactPlanning: "Minimal deep plan (fewer bullets)",
  compactPlanningHint:
    "Smaller deep-plan step output; less detail in checklists.",
  about: {
    title: "About PrePrompt",
    description:
      "PrePrompt is a Pre-AI Cognitive Layer: a structured pass before you send work to an AI. Five fields hold different kinds of information—success checks, ground facts, hard rules for the solution, the boundary of this single handoff (so harnesses or sub-agents can subdivide without pulling you into more clarification rounds), and an implementation contract (ordered build/verify steps — not 'how the chat reply should look').\nAuto-Structure also emits a technical stack and an implementation blueprint (paths, data model, APIs) into SPEC / task JSON so a newcomer can execute without guessing.\nThe aim is less token-heavy ping-pong, less scope drift, and clearer control over what you actually asked for.",
    howToUseTitle: "How to use PrePrompt",
    backToHome: "Back to Home",
    link: "About / Guide",
    developerInfo: {
      title: "Developer Info",
      email: "Email",
      github: "GitHub Repository",
      blog: "Blog",
    },
  },
};

const ko: Translation = {
  appSubtitle: "안전한 AI 협업을 위한 5단계 하네스",
  settings: "설정",
  resetAll: "초기화",
  minimizeSidebar: "사이드바 접기",
  expandSidebar: "사이드바 펼치기",
  navPlaybook: "하네스 플레이북",
  promptPreview: "프롬프트 미리보기",
  compiledPrompt: "완성된 프롬프트",
  copy: "복사",
  copied: "복사됨",
  tokens: "토큰",
  draft: "초안",
  structured: "구조화",
  fillStages: "각 단계를 채우면\n완성된 프롬프트가 여기에 표시됩니다.",
  yourInput: "입력",
  previous: "이전",
  next: "다음",
  done: "완료",
  readyInSidebar: "사이드바에서 확인하세요",
  stepOf: (c, t) => `${c} / ${t} 단계`,
  autoStructure: "✨ 자동 구조화",
  autoStructuring: "✨ 구조화 중...",
  saveBaseline: "임시 저장",
  baseline: "기준점",
  settingsTitle: "설정",
  settingsDesc: "API 키 및 환경설정을 관리합니다.",
  settingsSecurity:
    "Gemini: API 키는 이 브라우저(로컬 스토리지)에만 두고, 자동 구조화 시에만 /api/gemini로 전달되며 앱이 저장하지 않습니다. 신뢰할 수 없다고 판단할 경우, 키 값을 넣지 마세요.",
  geminiApiKey: "Gemini API 키",
  geminiApiKeyPlaceholder: "Google AI Studio에서 복사한 키를 붙여넣기",
  geminiApiKeyHintBefore: "Google AI Studio ",
  geminiApiKeyHintAfter: " 에서 키를 발급받으세요.",
  geminiApiKeyShow: "API 키 표시",
  geminiApiKeyHide: "API 키 숨기기",
  llmProvider: "자동 구조화 백엔드",
  llmProviderGemini: "Google Gemini",
  llmProviderCursorAgent: "Cursor Agent (로컬 CLI)",
  cursorAgentHint:
    "로컬에서만 실행 가능합니다. 해당 PC에 Cursor CLI를 설치한 뒤 `cursor-agent login`을 하고 `npm run dev`로 앱을 띄우세요.",
  language: "언어",
  cancel: "취소",
  saveChanges: "저장",
  alertNoApiKey: "먼저 설정에서 Gemini API 키를 입력해 주세요.",
  alertFailed: "프롬프트 자동 구조화에 실패했습니다.",
  alertDialogNoticeTitle: "알림",
  alertDialogErrorTitle: "오류",
  alertDialogOk: "확인",
  alertGeminiServerStatusHint:
    "서버 오류(HTTP 5xx)인 경우 Google AI Studio 상태 페이지를 확인해 보세요: https://aistudio.google.com/status",
  specificityLow: "너무 모호함",
  specificityMid: "구체화 중",
  specificityHigh: "잘 작성됨",
  specificityLabel: "구체성",
  tipsLabel: "더 나은 프롬프트 작성 팁",
  rulesLabel: "작성 지침",
  bad: "나쁜 예",
  good: "좋은 예",
  stages: {
    naturalPrompt: {
      label: "초안",
      description: "자연어로 작성한 원본 프롬프트",
      placeholder:
        "지금 머릿속에 있는 요청을 그대로 적어보세요. 문장이 어수선해도 괜찮습니다.\n\n- 무엇을 바꾸거나 만들고 싶은지\n- 왜 필요한지(배경·동기)\n- 이미 시도한 것, 막힌 지점, 성공/실패 신호\n- 독자(모델)가 알아야 할 사람·역할·제품 맥락\n\n여기서는 정리보다 ‘전부 말하기'가 목표입니다.",
      tips: [
        "독자를 한 명 정해보세요(예: 시니어 백엔드 동료). 그 사람에게 말하듯 배경→목표→우선순위 순으로 씁니다.",
        "‘끝났다'고 판단할 신호를 적어두세요(예: 테스트 통과, 스크린샷 기준, 특정 URL 동작). 다음 단계에서 그대로 옮기기 좋습니다.",
        "이미 알고 있는 제약·금지·마감·리스크를 메모하세요. 지금은 다듬지 않아도 됩니다.",
      ],
    },
    intentLock: {
      label: "완료 기준",
      description: "끝났는지 어떻게 알지",
      placeholder:
        "검증 가능한 ‘완료 신호'만 적으세요. 목표 문장이 아니라, 통과/실패를 판별할 수 있는 줄들입니다.\n\n- 한 줄에 관찰 가능한 결과 하나(동작·데이터·화면 신호)\n- ‘만들어줘'보다 ‘이렇게 되면 된다'\n- 우선순위가 있으면 (1)(2)처럼 표시\n\n여기엔 레포 사실·금지 규칙·구현 계약(실행 순서)을 넣지 마세요. 다른 단계입니다.",
      bad: "로그인 시스템 만들어줘.",
      good: "- 이메일/비밀번호 인증 흐름 구현.\n- 로그인 성공 시 JWT 발급, httpOnly 쿠키에 저장.\n- 세션 스토리지 사용 금지.\n- 로그인 후 /dashboard로 리다이렉트.",
      tips: [
        "‘지금 이미 있다/없다' 같은 사실은 바탕 사실 단계로 옮기세요.",
        "‘절대 하면 안 되는 것'은 필수·금지 단계로 옮기세요.",
        "‘이 전달에서 다루지 않는 것'은 전달 범위로 옮기세요.",
      ],
    },
    realityAnchor: {
      label: "바탕 사실",
      description: "지금 전제로 두는 것만",
      placeholder:
        "오늘 기준으로 사실인 것만 적습니다. 원하거나 금지하는 것은 다른 칸입니다.\n\n- 프레임워크·런타임·버전, 경로, 브랜치\n- 이미 있는 것 / 없는 것 / 깨진 것\n- 로컬 재현 명령\n\n‘이렇게 되면 좋겠다'는 완료 기준으로, 경로·API·빌드 순서 블루프린트는 자동 구조화 결과(SPEC)와 구현 계약으로 보내세요.",
      bad: "내 프로젝트에 로그인 추가해줘.",
      good: "- Next.js 14 App Router (src/app 디렉토리).\n- @supabase/ssr로 Supabase 연결됨.\n- 기존 인증 시스템 없음.\n- User 테이블: id, email, created_at.\n- env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY.",
      tips: [
        "감사관에게 말하듯: ~이다 / ~였다 / ~가 있다. ‘해야 한다'는 이 칸이 아닙니다.",
        "버전·경로를 숫자와 실제 문자열로 고정하세요.",
        "진입점 파일 하나(README, 핵심 라우트)를 찍으면 탐색이 줄어듭니다.",
      ],
    },
    constraintCage: {
      label: "필수·금지",
      description: "작업 자체의 강제 규칙",
      placeholder:
        "구현·아키텍처·보안 등 일을 하는 방식의 협상 불가 조건만.\n\n- MUST / MUST NOT / NEVER / ONLY\n- 의존성, 스택, 보안, 호환성\n\n파일/API 단계별 실행 계획은 자동 구조화의 implementation blueprint와 구현 계약 필드에 적습니다.",
      bad: "코드를 깔끔하고 빠르게 만들어줘.\n어떤 라이브러리든 알아서 써.",
      good: "- 반드시 Next.js App Router만 사용. Pages Router 금지.\n- 새 npm 패키지 설치 절대 금지.\n- Tailwind CSS만 사용. 커스텀 CSS 파일 금지.\n- /prisma/schema.prisma 절대 수정 금지.\n- 클래스 컴포넌트 사용 금지.",
      tips: [
        "진짜 금지는 NEVER·MUST NOT로 씁니다.",
        "‘답변에 서론 넣지 마' 같은 말은 채팅 꾸밈 규칙이므로 구현 계약이 아니라 별도 작업 지침에 두세요.",
        "스타일 제약과 아키텍처 제약을 섞지 말고 나눠 적습니다.",
      ],
    },
    actionSlice: {
      label: "전달 범위",
      description: "이 전달문이 맡는 경계",
      placeholder:
        "‘사용자가 채팅을 여러 번 나눈다'는 뜻이 아닙니다. 이 구조화된 프롬프트 한 덩어리가 책임지는 범위를 정합니다.\n\n- 포함: 이번 전달이 다루는 영역·산출물\n- 제외·연기: 명시적으로 빼는 것(하네스·다른 모델이 내부에서 쪼개 계획)\n- 선택: 마지막에 범위 고정 문구(예: 이 범위 밖은 하지 않는다)\n\n필요한 핑퐁은 도구·에이전트가 하고, 사람에게 같은 질문을 되풀이하지 않게 경계를 밝힙니다.",
      bad: "전체 인증 시스템을 구현해줘.",
      good: "이번 전달 범위:\n- LoginForm UI (src/components/LoginForm.tsx, 필드+제출만)\n- 백엔드 계약이 머지되면 기존 API에 연결\n\n범위 밖(하네스·후속 전달):\n- 이메일 템플릿, 비밀번호 재설정, OAuth\n\n이 범위 밖 작업은 하지 않는다.",
      tips: [
        "‘무엇이 완료면 통과인가'는 완료 기준, ‘이 문서가 어디까지 소유하는가'가 전달 범위입니다.",
        "미루는 일을 이름 붙이면, 모델이 사용자에게 되묻는 횟수가 줄어듭니다.",
        "범위 고정 한 줄은 확장 방지에 효과적입니다.",
      ],
    },
    responseContract: {
      label: "구현 계약",
      description: "실행 순서 체크리스트(답장 꾸밈이 아님)",
      placeholder:
        "레포를 모르는 사람이 이 전달물만 보고 구현·검증할 수 있게, 순서와 경로·API를 적습니다.\n\n- 번호 단계 + SPEC의 implementation blueprint와 대응\n- 검증 명령 또는 수동 확인\n\n금지: 'JSON으로 답해', LLM 답변용 마크다운 템플릿, 글자 수 제한, '너의 답은 다음을 포함해야…' 같은 메타 지시.",
      bad: "요약·기술스택·API예시·다음단계 키를 가진 JSON으로 답해.",
      good: "1) SPEC의 데이터 모델대로 Prisma 스키마+migrate.\n2) POST /api/event/spin — 행 락·당첨 쿼터 반영.\n3) src/app/event/page.tsx에서 API 호출 및 당첨/실패 문구 표시.\n4) pnpm test && pnpm lint 후 SPEC의 curl 검증 수행.",
      tips: [
        "자동 구조화로 블루프린트가 채워졌다면 그 순서를 명령형으로 다시 적어 실행 동기를 맞춥니다.",
        "각 단계는 완료 여부를 판정할 수 있어야 합니다.",
        "채팅 꾸밈 규칙은 여기 넣지 않습니다.",
      ],
    },
  },
  sectionLabels: {
    intentLock: "완료 기준",
    realityAnchor: "바탕 사실",
    constraintCage: "필수·금지",
    actionSlice: "전달 범위",
    responseContract: "구현 계약",
  },
  exportTitle: "에이전트 전달",
  exportGroupFiles: "파일로 저장",
  exportGroupChat: "채팅에 붙여넣기",
  downloadZip: "ZIP 묶음",
  downloadSpec: "SPEC.md",
  downloadTaskJson: "preprompt.task.json",
  downloadCursorRules: "Cursor 규칙 (.mdc)",
  downloadAgentsMd: "AGENTS.md",
  copyOneLiner: "채팅 한 줄 복사",
  copiedOneLiner: "한 줄 복사됨",
  exportPathGuide: "옮길 위치 안내",
  exportPathGuideTitle: "폴더 구조 (경로 고정)",
  exportPathGuideIntro:
    "작업할 프로젝트 폴더를 맨 위(루트)로 두고, 아래와 똑같이만 맞추면 됩니다.",
  exportPathGuideKeepNames:
    "파일 이름은 절대 바꾸지 말고, 폴더만 만들어서 그대로 넣으세요.",
  exportPathGuideZipTitle: "ZIP 묶음",
  exportPathGuideZipBody:
    "ZIP 안에는 이름이 같은 파일 묶음이 이미 들어 있습니다. 한 번 풀고 위 트리대로 프로젝트에 옮기면 끝이며, ZIP과 개별 파일을 둘 다 받을 필요는 없습니다. CHAT_MESSAGE.txt는 채팅 한 줄과 같은 문구를 디스크에 둔 참고용이고, 실제로는 채팅 한 줄 붙여넣기로 시작하면 됩니다.",
  intentLabel: "의도",
  tokenScenarioTitle: "토큰을 아끼는 원리",
  tokenRounds: "가정하는 핑퐁 횟수",
  tokenPocLeadBefore:
    "에이전트와 라운드가 늘수록 매번 컨텍스트가 커져 입력 토큰이 누적됩니다. 구조화된 전달 없이 대략 ",
  tokenPocLeadAfter:
    "번 정도 왔다갔다했다고 가정하면 부담이 커집니다. PrePrompt는 의도를 앞에서 정리해 확인용 핑퐁을 줄이는 방향입니다.",
  tokenFixedNote:
    "참고용 비유입니다. 고정 가정: 라운드당 기본 입력 8k, 라운드마다 +2.5k 증가, 구조화 후 에이전트 약 2턴과 비교(이 앱의 자동 구조화 비용 포함). 실제 과금과 다릅니다.",
  tokenIllustrativeLabel: "참고 · 줄어든 입력 토큰(대략)",
  tokenPocDisclaimer:
    "슬라이더는 핑퐁 횟수만 바꿀 수 있고, 나머지 값은 PoC용으로 고정되어 있습니다.",
  compactPlanning: "딥플랜 최소화 (불릿 축소)",
  compactPlanningHint: "딥플랜 단계 출력을 짧게; 체크리스트 세부도 줄어듭니다.",
  about: {
    title: "PrePrompt 소개",
    description:
      "PrePrompt는 작업을 AI에 넘기기 전에 한 번 거치는 Pre-AI Cognitive Layer입니다. 다섯 칸은 서로 겹치지 않게 역할이 나뉩니다. 완료를 어떻게 확인할지, 지금 전제로 두는 사실, 일에 대한 필수·금지, 이 전달문 한 벌이 맡는 범위(하네스나 모델이 내부에서 쪼개 계획하게 하려는 경계), 그리고 구현 계약(무엇을 어떤 순서로 만들고 어떻게 검증할지 — '답장을 어떻게 쓸지'가 아닙니다)입니다.\n자동 구조화는 SPEC·task JSON에 기술 스택과 implementation blueprint(경로·데이터 모델·API·검증)를 채워, 처음 보는 사람도 추측 없이 진행할 수 있게 합니다.\n같은 확인을 되풀이하는 채팅과 범위가 밀려 나가는 현상을 줄이고, 무엇을 요청했는지 더 선명하게 남기는 것이 목표입니다.",
    howToUseTitle: "PrePrompt 사용 방법",
    backToHome: "홈으로 돌아가기",
    link: "소개 / 가이드",
    developerInfo: {
      title: "개발자 정보",
      email: "이메일",
      github: "GitHub 저장소",
      blog: "블로그",
    },
  },
};

export const translations: Record<Language, Translation> = { en, ko };
