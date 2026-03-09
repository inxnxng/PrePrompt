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
    geminiApiKeyHint: string;
    language: string;
    cancel: string;
    saveChanges: string;
    // Alerts
    alertNoApiKey: string;
    alertFailed: string;
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
        "Your tokens are never stored on any server or anywhere permanently, ensuring complete privacy. However, because there is no save feature, you may need to re-enter your key upon returning to the app.",
    geminiApiKey: "Gemini API Key",
    geminiApiKeyHint: 'Used for the "Auto-Structure" feature. Get your key from Google AI Studio.',
    language: "Language",
    cancel: "Cancel",
    saveChanges: "Save changes",
    alertNoApiKey: "Please configure your Gemini API Key in Settings first.",
    alertFailed: "Failed to auto-structure prompt.",
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
                "Write your initial, unstructured prompt here as you naturally would. Don't worry about precision yet — just capture your full intent. The more context you include (what you want, why, what exists already), the better the subsequent steps will be.",
            tips: [
                "Write as if explaining to a smart colleague — include the 'why', not just the 'what'.",
                "Mention the tech stack, domain, or business context you're working in.",
                "Don't self-censor. Dump everything; you'll refine it in the next steps.",
            ],
        },
        intentLock: {
            label: "Intent Lock",
            description: "Define the desired end-state",
            placeholder: "Define the desired end-state clearly and specifically.\n\nUse bullet points. Each point should be a concrete, verifiable outcome — not a vague direction.",
            bad: "Make a login system.",
            good: "- Email/password authentication flow.\n- JWT issued on success, stored in httpOnly cookie.\n- No session storage used.\n- Redirect to /dashboard on login.",
            tips: [
                "State WHAT should exist when the AI is done — not just what it should do.",
                "Each bullet should be independently verifiable (can you test it?). If not, it's still too vague.",
                "Avoid words like 'good', 'clean', 'proper'. Use measurable terms instead.",
            ],
        },
        realityAnchor: {
            label: "Reality Anchor",
            description: "Describe current system state",
            placeholder: "Describe your current system state explicitly.\n\nList exact versions, file names, existing code structures, and anything the AI must treat as 'already given'.",
            bad: "Add login to my project.",
            good: "- Next.js 14 App Router (src/app directory).\n- Supabase connected via @supabase/ssr.\n- No existing auth system.\n- User table: id, email, created_at.\n- env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY.",
            tips: [
                "List exact library versions (e.g. 'Next.js 14.2.3'). Version differences change behavior.",
                "Name the exact files and directories the AI should read, modify, or leave untouched.",
                "State what DOESN'T exist yet — the AI often hallucinates pre-existing code.",
            ],
        },
        constraintCage: {
            label: "Constraint Cage",
            description: "Define non-negotiable boundaries",
            placeholder: "List every non-negotiable boundary.\n\nUse strong language: MUST, MUST NOT, NEVER, STRICTLY. The AI respects explicit prohibitions far more than implied ones.",
            bad: "Make the code clean and fast.\nUse whatever library you think is best.",
            good: "- MUST use Next.js App Router only. No Pages Router.\n- MUST NOT install new npm packages.\n- STRICTLY use Tailwind CSS. No custom CSS files.\n- NEVER modify /prisma/schema.prisma.\n- Avoid class components entirely.",
            tips: [
                "Use 'MUST NOT' and 'NEVER' for hard prohibitions — these carry far more weight than 'avoid' or 'prefer not'.",
                "Think adversarially: what would a technically correct but wrong solution look like? Forbid that.",
                "Separate style constraints (formatting, naming) from architectural constraints (no new deps, specific patterns).",
            ],
        },
        actionSlice: {
            label: "Action Slice",
            description: "Smallest meaningful execution unit",
            placeholder: "Define the ONE thing the AI should do right now.\n\nEnd with a hard stop: 'Nothing else.' The smaller and more atomic the slice, the more accurate the output.",
            bad: "Implement full authentication system.",
            good: "Step 1: Create the LoginForm React component UI only.\n\n- File: src/components/LoginForm.tsx\n- Fields: email (text), password (password), submit button.\n- No API calls, no state management, no routing.\n\nNothing else.",
            tips: [
                "One action slice = one commit. If it would be two commits, it's two slices.",
                "End with 'Nothing else.' — this is surprisingly effective at stopping scope creep.",
                "Think about dependencies: only ask for things the current codebase can already support.",
            ],
        },
        responseContract: {
            label: "Response Contract",
            description: "Specify output format requirements",
            placeholder: "Specify exactly how the AI should format its response.\n\nDefine the output type, structure, length, and what must be omitted. The more explicit you are, the less post-processing you'll need.",
            bad: "Just give me the code.",
            good: "- Output as a single unified diff (git diff format).\n- Include ONLY the changed files.\n- No explanatory prose before or after the diff.\n- Add inline comments for any regex patterns.\n- If a file is unchanged, omit it entirely.",
            tips: [
                "Specify the exact format: unified diff, JSON object, markdown table, numbered list, etc.",
                "State what to OMIT: 'no preamble', 'no explanations', 'no closing remarks' saves you from skimming.",
                "If you want reasoning, ask for it in <thinking> tags — this keeps the final output clean.",
            ],
        },
    },
    sectionLabels: {
        intentLock: "Goal",
        realityAnchor: "Current State",
        constraintCage: "Constraints",
        actionSlice: "Current Task",
        responseContract: "Response Requirements",
    },
    about: {
        title: "About PrePrompt",
        description: "PrePrompt is a Pre-AI Cognitive Layer—a structured thinking protocol you pass through before sending a request to an AI system.\nIt is designed to reduce token usage, prevent AI over-generation, and give you back control over your AI outputs by forcing you to structure your intent into five distinct stages.",
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
        "토큰은 서버나 어디에도 영구적으로 저장되지 않아 완전한 개인 정보 보호가 보장됩니다. 단, 저장 기능이 없기 때문에 앱에 다시 접속하면 키를 다시 입력해야 할 수 있습니다.",
    geminiApiKey: "Gemini API 키",
    geminiApiKeyHint: '"자동 구조화" 기능에 사용됩니다. Google AI Studio에서 키를 발급받으세요.',
    language: "언어",
    cancel: "취소",
    saveChanges: "저장",
    alertNoApiKey: "먼저 설정에서 Gemini API 키를 입력해 주세요.",
    alertFailed: "프롬프트 자동 구조화에 실패했습니다.",
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
                "평소처럼 자연스럽게 처음 생각을 적어보세요. 아직 정확성에 신경 쓸 필요 없습니다. 원하는 것, 이유, 현재 상황 등 최대한 많은 맥락을 담을수록 이후 단계가 더 풍부해집니다.",
            tips: [
                "똑똑한 동료에게 설명하듯 작성하세요 — '무엇'뿐 아니라 '왜'도 포함하세요.",
                "사용 중인 기술 스택, 도메인, 비즈니스 맥락을 언급하세요.",
                "자기 검열하지 마세요. 일단 모두 쏟아내고 다음 단계에서 다듬으면 됩니다.",
            ],
        },
        intentLock: {
            label: "의도 고정",
            description: "원하는 최종 상태 정의",
            placeholder: "원하는 최종 상태를 명확하고 구체적으로 정의하세요.\n\n불릿으로 작성하세요. 각 항목은 추상적 방향이 아닌, 검증 가능한 구체적 결과여야 합니다.",
            bad: "로그인 시스템 만들어줘.",
            good: "- 이메일/비밀번호 인증 흐름 구현.\n- 로그인 성공 시 JWT 발급, httpOnly 쿠키에 저장.\n- 세션 스토리지 사용 금지.\n- 로그인 후 /dashboard로 리다이렉트.",
            tips: [
                "AI가 완료했을 때 무엇이 '존재해야 하는지'를 기술하세요 — AI가 무엇을 '해야 하는지'가 아닌.",
                "각 항목은 독립적으로 검증 가능해야 합니다 (테스트할 수 있나요?). 그렇지 않으면 아직 모호한 겁니다.",
                "'좋은', '깔끔한', '올바른' 같은 표현 대신 측정 가능한 용어를 사용하세요.",
            ],
        },
        realityAnchor: {
            label: "현실 고정",
            description: "현재 시스템 상태 설명",
            placeholder: "현재 시스템 상태를 명확하게 설명하세요.\n\n정확한 버전, 파일명, 기존 코드 구조 등 AI가 '이미 주어진 것'으로 전제해야 하는 모든 것을 나열하세요.",
            bad: "내 프로젝트에 로그인 추가해줘.",
            good: "- Next.js 14 App Router (src/app 디렉토리).\n- @supabase/ssr로 Supabase 연결됨.\n- 기존 인증 시스템 없음.\n- User 테이블: id, email, created_at.\n- env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY.",
            tips: [
                "라이브러리의 정확한 버전을 명시하세요 (예: 'Next.js 14.2.3'). 버전에 따라 동작이 다릅니다.",
                "AI가 읽어야 할, 수정해야 할, 건드리지 말아야 할 파일과 디렉토리를 명시하세요.",
                "아직 존재하지 않는 것도 명시하세요 — AI는 종종 없는 코드를 있다고 가정합니다.",
            ],
        },
        constraintCage: {
            label: "제약 설정",
            description: "협상 불가 경계 정의",
            placeholder: "모든 비협상적 경계를 나열하세요.\n\n강한 언어를 사용하세요: 반드시, 절대 ~하지 말 것, 금지. AI는 암묵적 금지보다 명시적 금지에 훨씬 잘 반응합니다.",
            bad: "코드를 깔끔하고 빠르게 만들어줘.\n어떤 라이브러리든 알아서 써.",
            good: "- 반드시 Next.js App Router만 사용. Pages Router 금지.\n- 새 npm 패키지 설치 절대 금지.\n- Tailwind CSS만 사용. 커스텀 CSS 파일 금지.\n- /prisma/schema.prisma 절대 수정 금지.\n- 클래스 컴포넌트 사용 금지.",
            tips: [
                "소프트한 '가능하면 피해줘' 대신 '절대 금지', '반드시 하지 말 것'으로 강하게 명시하세요.",
                "기술적으로는 맞지만 잘못된 결과물을 예상해보세요. 그것을 명시적으로 금지하세요.",
                "스타일 제약(포맷, 네이밍)과 아키텍처 제약(의존성 없음, 특정 패턴)을 구분하세요.",
            ],
        },
        actionSlice: {
            label: "액션 분할",
            description: "최소 단위의 실행 작업",
            placeholder: "AI가 지금 당장 해야 할 단 하나의 작업을 정의하세요.\n\n'그 외에는 아무것도 하지 말 것'으로 끝내세요. 작업이 작고 원자적일수록 결과물이 더 정확합니다.",
            bad: "전체 인증 시스템을 구현해줘.",
            good: "Step 1: LoginForm 리액트 컴포넌트 UI만 생성.\n\n- 파일: src/components/LoginForm.tsx\n- 필드: 이메일(text), 비밀번호(password), 제출 버튼.\n- API 호출, 상태 관리, 라우팅 없음.\n\n그 외에는 아무것도 하지 말 것.",
            tips: [
                "액션 슬라이스 하나 = 커밋 하나. 커밋 두 개가 필요하다면 슬라이스도 두 개입니다.",
                "'그 외에는 아무것도 하지 말 것'으로 끝내세요 — 범위 확장을 막는 데 놀랍도록 효과적입니다.",
                "의존성을 고려하세요: 현재 코드베이스가 이미 지원할 수 있는 것만 요청하세요.",
            ],
        },
        responseContract: {
            label: "응답 계약",
            description: "출력 형식 요구사항 명시",
            placeholder: "AI의 응답 형식을 정확히 명시하세요.\n\n출력 유형, 구조, 길이, 생략해야 할 내용을 정의하세요. 더 명시적일수록 후처리가 줄어듭니다.",
            bad: "그냥 코드만 줘.",
            good: "- 단일 unified diff (git diff 형식)로 출력.\n- 변경된 파일만 포함.\n- diff 앞뒤로 설명 없음.\n- 정규식 패턴에 인라인 주석 추가.\n- 변경 없는 파일은 완전히 생략.",
            tips: [
                "정확한 형식을 명시하세요: unified diff, JSON 객체, 마크다운 표, 번호 목록 등.",
                "생략할 것을 명시하세요: '서론 없음', '설명 없음', '마무리 말 없음'으로 스키밍을 줄이세요.",
                "추론 과정이 필요하면 <thinking> 태그 안에 요청하세요 — 최종 출력이 깔끔해집니다.",
            ],
        },
    },
    sectionLabels: {
        intentLock: "목표",
        realityAnchor: "현재 상태",
        constraintCage: "제약 조건",
        actionSlice: "현재 작업",
        responseContract: "응답 요구사항",
    },
    about: {
        title: "PrePrompt 소개",
        description: "PrePrompt는 AI 시스템에 요청을 보내기 전에 거치는 구조화된 사고 프로토콜(Pre-AI Cognitive Layer)입니다.\n토큰 사용량을 줄이고, AI의 과다 생성을 방지하며, 의도를 5가지 명확한 단계로 구조화하여 AI 출력에 대한 통제권을 되찾도록 설계되었습니다.",
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
