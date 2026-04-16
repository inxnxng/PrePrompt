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
    downloadZip: string;
    downloadSpec: string;
    downloadTaskJson: string;
    copyCursorRules: string;
    copyAgents: string;
    copyOneLiner: string;
    copiedOneLiner: string;
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
    appSubtitle: "PrePrompt v1.0",
    settings: "Settings",
    resetAll: "Reset All",
    minimizeSidebar: "Minimize sidebar",
    expandSidebar: "Expand sidebar",
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
        "Your API key is kept in this browser (local storage). Auto-Structure calls go through this app's /api/gemini route: the key is sent to your server only for that request to reach Google and is not stored by the app. Do not use a production key if you do not trust the deployment.",
    geminiApiKey: "Gemini API Key",
    geminiApiKeyPlaceholder: "Paste key from Google AI Studio (often starts with AIza…)",
    geminiApiKeyHintBefore: 'Used for the "Auto-Structure" feature. Get your key at ',
    geminiApiKeyHintAfter: ".",
    geminiApiKeyShow: "Show API key",
    geminiApiKeyHide: "Hide API key",
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
                "If a line is a fact about today’s repo (“we already have…”), move it to Ground truth.",
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
                "Solution constraints only—things that would void the work if violated.\n\n- MUST / MUST NOT / NEVER / ONLY\n- Security, privacy, licensing, compatibility, deps\n- Lint/architecture bans\n\nDo not put reply formatting here; that is Output format.",
            bad: "Make the code clean and fast.\nUse whatever library you think is best.",
            good: "- MUST use Next.js App Router only. No Pages Router.\n- MUST NOT install new npm packages.\n- STRICTLY use Tailwind CSS. No custom CSS files.\n- NEVER modify /prisma/schema.prisma.\n- Avoid class components entirely.",
            tips: [
                "NEVER / MUST NOT beat “try to avoid” when the prohibition is real.",
                "Name one valid-but-unwanted approach and forbid it in one sentence.",
                "Keep layout-of-answer rules out of this box.",
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
            label: "Output format",
            description: "Shape of the model’s reply only",
            placeholder:
                "Message layout only—sections, fences, length, language.\n\n- Section order (summary → steps → code)\n- Prose vs tables vs fenced blocks\n- Banned fluff (no preamble, no permission-seeking)\n\nDo not repeat product rules from Hard rules here unless you need them echoed in the answer layout.",
            bad: "Just give me the code.",
            good: "- Output as a single unified diff (git diff format).\n- Include ONLY the changed files.\n- No explanatory prose before or after the diff.\n- Add inline comments for any regex patterns.\n- If a file is unchanged, omit it entirely.",
            tips: [
                "Fixed ordering makes skim-copying predictable.",
                "Ban intros, apologies, and long alternative stacks explicitly.",
                "Optional: short self-review checklist at the end—still about format, not new requirements.",
            ],
        },
    },
    sectionLabels: {
        intentLock: "Success criteria",
        realityAnchor: "Ground (facts)",
        constraintCage: "Hard rules",
        actionSlice: "Handoff scope",
        responseContract: "Output format",
    },
    exportTitle: "Agent handoff",
    downloadZip: "ZIP bundle",
    downloadSpec: "SPEC.md",
    downloadTaskJson: "preprompt.task.json",
    copyCursorRules: "Copy .cursor rules",
    copyAgents: "Copy AGENTS.md",
    copyOneLiner: "Copy chat one-liner",
    copiedOneLiner: "Copied one-liner",
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
    tokenPocDisclaimer: "Only the round count is adjustable; other values stay fixed for this demo story.",
    compactPlanning: "Minimal deep plan (fewer bullets)",
    compactPlanningHint: "Smaller Pass A output; less detail in checklists.",
    about: {
        title: "About PrePrompt",
        description:
            "PrePrompt is a Pre-AI Cognitive Layer: a structured pass before you send work to an AI. Five fields hold different kinds of information—success checks, ground facts, hard rules for the solution, the boundary of this single handoff (so harnesses or sub-agents can subdivide without pulling you into more clarification rounds), and output format for the reply.\nThe aim is less token-heavy ping-pong, less scope drift, and clearer control over what you actually asked for.",
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
    appSubtitle: "PrePrompt v1.0",
    settings: "설정",
    resetAll: "초기화",
    minimizeSidebar: "사이드바 접기",
    expandSidebar: "사이드바 펼치기",
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
        "API 키는 이 브라우저(로컬 스토리지)에만 보관됩니다. 키는 자동 구조화 요청 처리용으로만 서버에 전달되고 앱이 저장하지 않습니다.",
    geminiApiKey: "Gemini API 키",
    geminiApiKeyPlaceholder: "Google AI Studio에서 복사한 키를 붙여넣기 (대개 AIza로 시작)",
    geminiApiKeyHintBefore: "Google AI Studio ",
    geminiApiKeyHintAfter: " 에서 키를 발급받으세요.",
    geminiApiKeyShow: "API 키 표시",
    geminiApiKeyHide: "API 키 숨기기",
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
                "지금 머릿속에 있는 요청을 그대로 적어보세요. 문장이 어수선해도 괜찮습니다.\n\n- 무엇을 바꾸거나 만들고 싶은지\n- 왜 필요한지(배경·동기)\n- 이미 시도한 것, 막힌 지점, 성공/실패 신호\n- 독자(모델)가 알아야 할 사람·역할·제품 맥락\n\n여기서는 정리보다 ‘전부 말하기’가 목표입니다.",
            tips: [
                "독자를 한 명 정해보세요(예: 시니어 백엔드 동료). 그 사람에게 말하듯 배경→목표→우선순위 순으로 씁니다.",
                "‘끝났다’고 판단할 신호를 적어두세요(예: 테스트 통과, 스크린샷 기준, 특정 URL 동작). 다음 단계에서 그대로 옮기기 좋습니다.",
                "이미 알고 있는 제약·금지·마감·리스크를 메모하세요. 지금은 다듬지 않아도 됩니다.",
            ],
        },
        intentLock: {
            label: "완료 기준",
            description: "끝났는지 어떻게 알지",
            placeholder:
                "검증 가능한 ‘완료 신호’만 적으세요. 목표 문장이 아니라, 통과/실패를 판별할 수 있는 줄들입니다.\n\n- 한 줄에 관찰 가능한 결과 하나(동작·데이터·화면 신호)\n- ‘만들어줘’보다 ‘이렇게 되면 된다’\n- 우선순위가 있으면 (1)(2)처럼 표시\n\n여기엔 레포 사실·금지 규칙·답장 형식을 넣지 마세요. 다른 단계입니다.",
            bad: "로그인 시스템 만들어줘.",
            good: "- 이메일/비밀번호 인증 흐름 구현.\n- 로그인 성공 시 JWT 발급, httpOnly 쿠키에 저장.\n- 세션 스토리지 사용 금지.\n- 로그인 후 /dashboard로 리다이렉트.",
            tips: [
                "‘지금 이미 있다/없다’ 같은 사실은 바탕 사실 단계로 옮기세요.",
                "‘절대 하면 안 되는 것’은 필수·금지 단계로 옮기세요.",
                "‘이 전달에서 다루지 않는 것’은 전달 범위로 옮기세요.",
            ],
        },
        realityAnchor: {
            label: "바탕 사실",
            description: "지금 전제로 두는 것만",
            placeholder:
                "오늘 기준으로 사실인 것만 적습니다. 원하거나 금지하는 것은 다른 칸입니다.\n\n- 프레임워크·런타임·버전, 경로, 브랜치\n- 이미 있는 것 / 없는 것 / 깨진 것\n- 로컬 재현 명령\n\n‘이렇게 되면 좋겠다’는 완료 기준으로, ‘이렇게 답해줘’는 답장 형식으로 보내세요.",
            bad: "내 프로젝트에 로그인 추가해줘.",
            good: "- Next.js 14 App Router (src/app 디렉토리).\n- @supabase/ssr로 Supabase 연결됨.\n- 기존 인증 시스템 없음.\n- User 테이블: id, email, created_at.\n- env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY.",
            tips: [
                "감사관에게 말하듯: ~이다 / ~였다 / ~가 있다. ‘해야 한다’는 이 칸이 아닙니다.",
                "버전·경로를 숫자와 실제 문자열로 고정하세요.",
                "진입점 파일 하나(README, 핵심 라우트)를 찍으면 탐색이 줄어듭니다.",
            ],
        },
        constraintCage: {
            label: "필수·금지",
            description: "작업 자체의 강제 규칙",
            placeholder:
                "구현·아키텍처·보안 등 일을 하는 방식의 협상 불가 조건만.\n\n- MUST / MUST NOT / NEVER / ONLY\n- 의존성, 스택, 보안, 호환성\n\n답장을 짧게 쓰라는 규칙은 답장 형식에 두세요.",
            bad: "코드를 깔끔하고 빠르게 만들어줘.\n어떤 라이브러리든 알아서 써.",
            good: "- 반드시 Next.js App Router만 사용. Pages Router 금지.\n- 새 npm 패키지 설치 절대 금지.\n- Tailwind CSS만 사용. 커스텀 CSS 파일 금지.\n- /prisma/schema.prisma 절대 수정 금지.\n- 클래스 컴포넌트 사용 금지.",
            tips: [
                "진짜 금지는 NEVER·MUST NOT로 씁니다.",
                "‘답변에 서론 넣지 마’ 같은 말은 산출물 규칙이므로 답장 형식으로 옮기세요.",
                "스타일 제약과 아키텍처 제약을 섞지 말고 나눠 적습니다.",
            ],
        },
        actionSlice: {
            label: "전달 범위",
            description: "이 전달문이 맡는 경계",
            placeholder:
                "‘사용자가 채팅을 여러 번 나눈다’는 뜻이 아닙니다. 이 구조화된 프롬프트 한 덩어리가 책임지는 범위를 정합니다.\n\n- 포함: 이번 전달이 다루는 영역·산출물\n- 제외·연기: 명시적으로 빼는 것(하네스·다른 모델이 내부에서 쪼개 계획)\n- 선택: 마지막에 범위 고정 문구(예: 이 범위 밖은 하지 않는다)\n\n필요한 핑퐁은 도구·에이전트가 하고, 사람에게 같은 질문을 되풀이하지 않게 경계를 밝힙니다.",
            bad: "전체 인증 시스템을 구현해줘.",
            good: "이번 전달 범위:\n- LoginForm UI (src/components/LoginForm.tsx, 필드+제출만)\n- 백엔드 계약이 머지되면 기존 API에 연결\n\n범위 밖(하네스·후속 전달):\n- 이메일 템플릿, 비밀번호 재설정, OAuth\n\n이 범위 밖 작업은 하지 않는다.",
            tips: [
                "‘무엇이 완료면 통과인가’는 완료 기준, ‘이 문서가 어디까지 소유하는가’가 전달 범위입니다.",
                "미루는 일을 이름 붙이면, 모델이 사용자에게 되묻는 횟수가 줄어듭니다.",
                "범위 고정 한 줄은 확장 방지에 효과적입니다.",
            ],
        },
        responseContract: {
            label: "답장 형식",
            description: "말하는 모양만",
            placeholder:
                "답장이 어떤 모습일지만 적습니다. 제품 규칙·완료 정의와 겹치지 않게.\n\n- 섹션 순서, 코드 펜스, 표/산문\n- 길이, 언어\n- 금지: 서론, 사과, 확인 질문 등\n\n필수·금지에 이미 쓴 내용을 여기서 반복하지 않아도 됩니다.",
            bad: "그냥 코드만 줘.",
            good: "- 단일 unified diff (git diff 형식)로 출력.\n- 변경된 파일만 포함.\n- diff 앞뒤로 설명 없음.\n- 정규식 패턴에 인라인 주석 추가.\n- 변경 없는 파일은 완전히 생략.",
            tips: [
                "순서를 고정하면 복붙·검토가 쉬워집니다.",
                "서론·대안 나열 금지를 구체적으로 씁니다.",
                "마지막 체크리스트 요청은 ‘형식’으로 짧게만.",
            ],
        },
    },
    sectionLabels: {
        intentLock: "완료 기준",
        realityAnchor: "바탕 사실",
        constraintCage: "필수·금지",
        actionSlice: "전달 범위",
        responseContract: "답장 형식",
    },
    exportTitle: "에이전트 전달",
    downloadZip: "ZIP 묶음",
    downloadSpec: "SPEC.md",
    downloadTaskJson: "preprompt.task.json",
    copyCursorRules: ".cursor 규칙 복사",
    copyAgents: "AGENTS.md 복사",
    copyOneLiner: "채팅 한 줄 복사",
    copiedOneLiner: "한 줄 복사됨",
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
    tokenPocDisclaimer: "슬라이더는 핑퐁 횟수만 바꿀 수 있고, 나머지 값은 PoC용으로 고정되어 있습니다.",
    compactPlanning: "딥플랜 최소화 (불릿 축소)",
    compactPlanningHint: "Pass A 출력을 짧게; 체크리스트 세부도 줄어듭니다.",
    about: {
        title: "PrePrompt 소개",
        description:
            "PrePrompt는 작업을 AI에 넘기기 전에 한 번 거치는 Pre-AI Cognitive Layer입니다. 다섯 칸은 서로 겹치지 않게 역할이 나뉩니다. 완료를 어떻게 확인할지, 지금 전제로 두는 사실, 일에 대한 필수·금지, 이 전달문 한 벌이 맡는 범위(하네스나 모델이 내부에서 쪼개 계획하게 하려는 경계), 답장 형식입니다.\n같은 확인을 되풀이하는 채팅과 범위가 밀려 나가는 현상을 줄이고, 무엇을 요청했는지 더 선명하게 남기는 것이 목표입니다.",
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
