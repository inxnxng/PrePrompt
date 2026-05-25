export type StageMeta = {
  placeholder: string;
  bad?: string;
  good?: string;
  tips: string[];
};

export type Translation = {
  //** App shell
  appSubtitle1: string;
  appSubtitle2: string;
  settings: string;
  resetAll: string;
  /** Settings — session reset subsection */
  settingsResetSection: string;
  settingsResetHint: string;
  resetConfirmTitle: string;
  resetConfirmBody: string;
  minimizeSidebar: string;
  expandSidebar: string;
  /** Right prompt preview panel — collapse to narrow strip (like left sidebar) */
  minimizePromptPreview: string;
  expandPromptPreview: string;
  /** Left sidebar footer — short heading above playbook/settings */
  sidebarLinksLabel: string;
  /** Nav label for /playbook (harness tradeoff playbook) */
  navPlaybook: string;
  /** Nav label for /result (ZIP + model picks) */
  navResult: string;
  /** Nav label for /history (shared saved handoffs) */
  navHistory: string;
  /** Nav label — return to app hub (/) from /work sidebar */
  navStartScreen: string;
  /** App hub (/) — page title */
  hubTitle: string;
  /** App hub (/) — same tagline as `appSubtitle1` + `appSubtitle2`, one line */
  hubSubtitle: string;
  /** App hub — card title for /work */
  hubWorkTitle: string;
  hubWorkDesc: string;
  /** App hub — card blurb for /playbook */
  hubPlaybookDesc: string;
  /** App hub — card blurb for /history */
  hubHistoryDesc: string;
  /** /history — shared handoff dashboard */
  historyPageTitle: string;
  historyPageSubtitle: string;
  historyServerNote: string;
  historyRefresh: string;
  historyFilterAll: string;
  historyFilterMine: string;
  historyEmpty: string;
  historyLoadError: string;
  historyTableTitle: string;
  historyTableAuthor: string;
  historyTableWhen: string;
  historyTableDownloads: string;
  historyActions: string;
  historyLoadButton: string;
  historyZipButton: string;
  historyDisplayNameBanner: string;
  historySetNameHint: string;
  historySaveDialogTitle: string;
  historySaveDialogDesc: string;
  historyAuthorLabel: string;
  historyAuthorPlaceholder: string;
  historyAuthorHint: string;
  historyTitleLabel: string;
  historyTitlePlaceholder: string;
  historySaveSubmit: string;
  historySaving: string;
  historySaveAuthorRequired: string;
  historySaveError: string;
  historySaveToServer: string;
  historyBackResult: string;
  historyBackHome: string;
  historyPanelTitle: string;
  historyPanelDesc: string;
  /** /history — board hint under filters */
  historyBoardHint: string;
  /** /history — mini popup title */
  historyDetailTitle: string;
  /** /history — natural prompt snippet in popup */
  historyDraftPreviewLabel: string;
  /** /history — when natural prompt empty in popup */
  historyDraftPreviewEmpty: string;
  /** /result — page title */
  resultPageTitle: string;
  resultPageSubtitle: string;
  resultBackHome: string;
  resultModelRecommendationsTitle: string;
  resultModelRecommendationsDesc: string;
  resultModelPerfTitle: string;
  resultModelValueTitle: string;
  /** Harness compile length → rough token estimate (same heuristic as store); not billing. */
  resultModelHarnessTokensApprox: string;
  resultModelHarnessTokensHint: string;
  resultModelsRefresh: string;
  resultModelsEmpty: string;
  resultModelsHeuristicNote: string;
  promptPreview: string;
  promptPreviewSubtitle: string;
  /** Preview panel — toolbar */
  previewToolbarTitle: string;
  previewToolbarHint: string;
  copy: string;
  copied: string;
  fillStages: string;
  yourInput: string;
  previous: string;
  next: string;
  done: string;
  /** Toolbar — explicit draft checkpoint (browser storage) */
  draftSave: string;
  draftSavedShort: string;
  /** Last step — completes flow and opens the handoff / result screen */
  doneOpenPreview: string;
  /** Failed to write UI session /** draft key */
  draftSaveFailed: string;
  /** One-shot after playbook filled step-0 draft */
  playbookDraftLoadedFeedback: string;
  readyInSidebar: string;
  stepOf: (current: number, total: number) => string;
  autoStructure: string;
  autoStructuring: string;
  //** Settings modal
  settingsTitle: string;
  settingsDesc: string;
  /** Settings modal — body when LLM backend is Cursor Agent (no Gemini key / proxy copy) */
  settingsDescCursorAgent: string;
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
  /** Cursor Agent — model select label */
  cursorAgentModel: string;
  /** Empty value: do not pass --model (CLI default). */
  cursorAgentModelDefault: string;
  cursorAgentModelRefresh: string;
  cursorAgentModelsLoading: string;
  cursorAgentModelsError: string;
  cancel: string;
  saveChanges: string;
  //** Alerts
  alertNoApiKey: string;
  alertFailed: string;
  alertDialogNoticeTitle: string;
  alertDialogErrorTitle: string;
  alertDialogOk: string;
  /** Shown after Gemini proxy errors when HTTP status is 5xx; include https://aistudio.google.com/status */
  alertGeminiServerStatusHint: string;
  //** Specificity indicator
  specificityLow: string;
  specificityMid: string;
  specificityHigh: string;
  specificityLabel: string;
  //** Tips panel
  tipsLabel: string;
  rulesLabel: string;
  //** Bad /** Good labels
  bad: string;
  good: string;
  //** Stages
  stages: {
    naturalPrompt: { label: string; description: string } & StageMeta;
    intentLock: { label: string; description: string } & StageMeta;
    realityAnchor: { label: string; description: string } & StageMeta;
    constraintCage: { label: string; description: string } & StageMeta;
    actionSlice: { label: string; description: string } & StageMeta;
    responseContract: { label: string; description: string } & StageMeta;
  };
  //** Preview section labels
  sectionLabels: {
    intentLock: string;
    realityAnchor: string;
    constraintCage: string;
    actionSlice: string;
    responseContract: string;
  };
  //** Handoff export (preview)
  exportTitle: string;
  previewHandoffCardDesc: string;
  previewSectionsHeading: string;
  previewOneLinerPreviewLabel: string;
  downloadZip: string;
  /** Handoff target (ZIP layout + harness file) */
  exportHandoffTarget: string;
  /** Optional archetype — shapes SPEC/AGENTS addenda and chat kickoff in ZIP */
  exportHandoffArchetype: string;
  exportHandoffArchetypeNone: string;
  exportHandoffArchetypeHint: string;
  /** Short hint under handoff target select */
  exportHandoffZipHint: string;
  handoffTargetCursor: string;
  handoffTargetClaude: string;
  handoffTargetGemini: string;
  handoffTargetCopilot: string;
  handoffTargetWindsurf: string;
  handoffTargetGeneric: string;
  copyOneLiner: string;
  copiedOneLiner: string;
  /** Opens dialog explaining target paths in the repo */
  exportPathGuide: string;
  exportPathGuideTitle: string;
  /** One line above the folder tree */
  exportPathGuideIntro: string;
  /** Shown under intro: tree follows the selected handoff target */
  exportPathGuideTargetHint: string;
  /** Target-specific placement notes */
  pathGuideExtraCursor: string;
  pathGuideExtraClaude: string;
  pathGuideExtraGemini: string;
  pathGuideExtraCopilot: string;
  pathGuideExtraWindsurf: string;
  pathGuideExtraGeneric: string;
  /** Reminder: keep filenames, only match paths */
  exportPathGuideKeepNames: string;
  /** Subheading for ZIP explanation */
  exportPathGuideZipTitle: string;
  exportPathGuideZipBody: string;
  intentLabel: string;
  //** About page
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

/** Work sidebar + hub — shared tagline (two lines on /work, one line on hub). */
const APP_SUBTITLE_LINE1 = "안전한 AI 협업을 위한";
const APP_SUBTITLE_LINE2 = "단계별로 정리하는 작업 요청";

export const t: Translation = {
  appSubtitle1: APP_SUBTITLE_LINE1,
  appSubtitle2: APP_SUBTITLE_LINE2,
  settings: "설정",
  resetAll: "초기화",
  settingsResetSection: "세션",
  settingsResetHint:
    "모든 단계 입력과 진행 상태를 지웁니다. 실행 후에는 되돌릴 수 없습니다.",
  resetConfirmTitle: "PrePrompt를 초기화할까요?",
  resetConfirmBody:
    "각 칸에 적은 내용과 단계 진행이 모두 사라집니다. 설정에 저장한 API 키는 유지됩니다.",
  minimizeSidebar: "사이드바 접기",
  expandSidebar: "사이드바 펼치기",
  minimizePromptPreview: "프롬프트 미리보기 접기",
  expandPromptPreview: "프롬프트 미리보기 펼치기",
  sidebarLinksLabel: "바로가기",
  navPlaybook: "플레이북",
  navResult: "작업 결과",
  navHistory: "히스토리",
  navStartScreen: "시작 화면",
  hubTitle: "PrePrompt",
  hubSubtitle: `${APP_SUBTITLE_LINE1} ${APP_SUBTITLE_LINE2}`,
  hubWorkTitle: "작업하기",
  hubWorkDesc: "다섯 단계로 요청을 정리하고 미리보기·작업 결과로 이어집니다.",
  hubPlaybookDesc: "질문에 답하며 방향을 잡고, 추천 템플릿으로 초안을 채웁니다.",
  hubHistoryDesc: "서버에 저장된 작업 결과을 보거나 불러와 이어서 씁니다.",
  historyPageTitle: "히스토리",
  historyPageSubtitle:
    "이 서버에 저장된 작업 결과 기록입니다. 누가 언제 올렸는지, ZIP을 몇 번 받았는지 볼 수 있고, 다른 사람이 올린 것도 불러와 이어서 쓸 수 있습니다.",
  historyServerNote:
    "목록은 이 앱이 돌아가는 서버에만 쌓입니다. 읽기 전용 호스팅이나 여러 대가 동시에 뜨는 배포에서는 저장이 안 되거나 목록이 비어 보일 수 있습니다. 그럴 때는 내 컴퓨터에서 앱을 한 대만 띄운 뒤 쓰는 편이 안전합니다.",
  historyRefresh: "새로고침",
  historyFilterAll: "전체",
  historyFilterMine: "내가 저장한 항목",
  historyEmpty: "아직 저장된 항목이 없습니다. 작업 결과 화면에서 서버에 저장을 눌러 보세요.",
  historyLoadError: "불러오지 못했습니다.",
  historyTableTitle: "제목",
  historyTableAuthor: "저장한 사람",
  historyTableWhen: "저장 시각",
  historyTableDownloads: "다운로드",
  historyActions: "동작",
  historyLoadButton: "에디터에 불러오기",
  historyZipButton: "ZIP 받기",
  historyDisplayNameBanner: "내가 저장한 항목만 볼 때 쓰는 표시 이름",
  historySetNameHint: "아래에 적은 이름과 저장 기록의 이름이 같으면 내 항목으로 묶입니다.",
  historySaveDialogTitle: "서버에 이 작업 결과 저장",
  historySaveDialogDesc:
    "다섯 칸에 적은 내용, 깊게 짜 둔 계획, 앱 설정(비밀 키는 빼고)이 이 서버에 함께 저장됩니다. 같은 주소로 들어온 사람은 목록에서 함께 볼 수 있습니다.",
  historyAuthorLabel: "표시 이름",
  historyAuthorPlaceholder: "예: 김프롬프트",
  historyAuthorHint: "같은 브라우저에 기억해 두었다가 다음 저장 때 다시 채웁니다.",
  historyTitleLabel: "제목 (선택)",
  historyTitlePlaceholder: "비우면 요청 초안 첫 줄로 제목을 만듭니다.",
  historySaveSubmit: "저장",
  historySaving: "저장 중…",
  historySaveAuthorRequired: "표시 이름을 한 글자 이상 입력해 주세요.",
  historySaveError: "저장에 실패했습니다. 네트워크와 이 서버의 저장 공간·권한을 확인해 주세요.",
  historySaveToServer: "서버에 저장",
  historyBackResult: "작업 결과로",
  historyBackHome: "작성 화면으로",
  historyPanelTitle: "필터와 ZIP 받기 설정",
  historyPanelDesc:
    "내가 저장한 항목은 표시 이름과 저장할 때 적은 이름이 같을 때만 골라 보여 줍니다. ZIP은 아래에서 고른 넘길 대상 기준으로 받습니다.",
  historyBoardHint: "카드를 누르면 작은 창에서 미리보기와 동작을 선택할 수 있습니다.",
  historyDetailTitle: "저장된 작업 결과",
  historyDraftPreviewLabel: "요청 초안 미리보기",
  historyDraftPreviewEmpty: "(요청 초안이 비어 있습니다)",
  resultPageTitle: "작업 결과",
  resultPageSubtitle:
    "에이전트에 넘길 ZIP과 첫으로 보낼 말을 확인합니다. Cursor Agent 모델 추천은 다섯 칸을 모두 합친 뒤에만, 그 내용을 실제로 만들 때를 가정해 보여 줍니다.",
  resultBackHome: "작성 화면으로",
  resultModelRecommendationsTitle: "이번 내용에 맞는 Cursor Agent 모델",
  resultModelRecommendationsDesc:
    "지금 합쳐진 다섯 칸을 읽고 난이도를 짚은 뒤, 이 컴퓨터에 연결된 Cursor Agent 모델 목록 안에서 두 가지만 골랐습니다. 웹에서 흔히 보이는 순위표와는 별개입니다.",
  resultModelPerfTitle: "성능 우선",
  resultModelValueTitle: "비용 대비 효율",
  resultModelHarnessTokensApprox: "합쳐진 글자 수로 본 대략치",
  resultModelHarnessTokensHint:
    "(글자 수를 네로 나눈 값입니다. 실제 과금이나 모델이 읽는 분량과 같지 않을 수 있습니다.)",
  resultModelsRefresh: "목록 새로고침",
  resultModelsEmpty: "추천할 모델이 없습니다. 설정에서 Cursor Agent 목록을 불러올 수 있는지 확인해 주세요.",
  resultModelsHeuristicNote:
    "키워드와 분량만으로 짚은 추천입니다. 팀 규칙이나 오래된 코드 난이도는 글 안에 없을 수 있으니, 실행할 모델은 직접 조정하세요. 공식 요금표나 성능 순위가 아닙니다.",
  promptPreview: "프롬프트 미리보기",
  promptPreviewSubtitle: "다섯 칸이 합쳐진 텍스트를 확인하고 복사합니다. ZIP과 모델 추천은 작업 결과 화면에서 이어집니다.",
  previewToolbarTitle: "묶어서 보기",
  previewToolbarHint:
    "다섯 칸이 한 덩어로 이어진 텍스트입니다. 그대로 복사해 쓰거나, 아래 패키지 카드에서 ZIP으로 받아 작업 폴더에 풀 수 있습니다.",
  copy: "복사",
  copied: "복사됨",
  fillStages: "각 단계를 채우면\n완성된 프롬프트가 여기에 표시됩니다.",
  yourInput: "입력",
  previous: "이전",
  next: "다음",
  done: "완료",
  draftSave: "임시저장",
  draftSavedShort: "이 브라우저에 저장했습니다.",
  doneOpenPreview: "작업 결과 보러 가기",
  draftSaveFailed: "브라우저 저장소에 저장하지 못했습니다. 용량이 부족하거나 차단되었을 수 있습니다.",
  playbookDraftLoadedFeedback:
    "플레이북 초안을 넣었습니다. 맨 아래 '추가 보완:'로 시작하는 줄 뒤를 채운 뒤 자동 구조화를 누르세요.",
  readyInSidebar: "아래 버튼으로 작업 결과 화면에서 ZIP과 모델 추천을 확인하세요",
  stepOf: (c, t) => `${c} / ${t} 단계`,
  autoStructure: "✨ 자동 구조화",
  autoStructuring: "✨ 구조화 중...",
  settingsTitle: "설정",
  settingsDesc: "API 키 및 환경설정을 관리합니다.",
  settingsDescCursorAgent:
    "이 모드에서는 자동 구조화가 이 컴퓨터에 설치된 Cursor Agent로 실행됩니다. Gemini API 키는 쓰이지 않습니다.",
  settingsSecurity:
    "Gemini: API 키는 이 브라우저에만 두고, 자동 구조화를 돌릴 때만 서버로 전송됩니다. 앱이 따로 서버에 키를 저장하지는 않습니다. 불안하면 값을 넣지 마세요.",
  geminiApiKey: "Gemini API 키",
  geminiApiKeyPlaceholder: "Google AI Studio에서 복사한 키를 붙여넣기",
  geminiApiKeyHintBefore: "Google AI Studio ",
  geminiApiKeyHintAfter: " 에서 키를 발급받으세요.",
  geminiApiKeyShow: "API 키 표시",
  geminiApiKeyHide: "API 키 숨기기",
  llmProvider: "자동 구조화에 쓸 연결",
  llmProviderGemini: "Google Gemini",
  llmProviderCursorAgent: "Cursor Agent(이 컴퓨터)",
  cursorAgentModel: "Cursor Agent 모델",
  cursorAgentModelDefault: "기본값(도구가 정한 모델)",
  cursorAgentModelRefresh: "목록 새로고침",
  cursorAgentModelsLoading: "모델 목록을 불러오는 중…",
  cursorAgentModelsError:
    "모델 목록을 불러오지 못했습니다. Cursor Agent가 설치되어 있고 로그인까지 끝났는지 확인해 주세요.",
  cancel: "취소",
  saveChanges: "저장",
  alertNoApiKey: "먼저 설정에서 Gemini API 키를 입력해 주세요.",
  alertFailed: "프롬프트 자동 구조화에 실패했습니다.",
  alertDialogNoticeTitle: "알림",
  alertDialogErrorTitle: "오류",
  alertDialogOk: "확인",
  alertGeminiServerStatusHint:
    "서버 쪽 오류일 때는 Google AI Studio 상태 페이지를 확인해 보세요: https://aistudio.google.com/status",
  specificityLow: "너무 모호함",
  specificityMid: "구체화 중",
  specificityHigh: "잘 작성됨",
  specificityLabel: "구체성",
  tipsLabel: "이 칸만 보고도 쓸 수 있는 팁",
  rulesLabel: "작성 지침",
  bad: "나쁜 예",
  good: "좋은 예",
  stages: {
    naturalPrompt: {
      label: "요청 초안",
      description: "정리하기 전, 떠오르는 대로 적는 칸",
      placeholder:
        "말로 동료에게 설명하듯 적어 보세요. 문장이 산만해도 됩니다.\n\n예시로 넣을 만한 것:\n- 하고 싶은 변경이나 새 기능 한 줄 요약\n- 왜 지금 필요한지\n- 이미 해 본 것, 막힌 에러나 의문\n\n다음 칸에서 확인 방법·사실·금지·이번에 할 일의 테두리·순서로 나눕니다. 여기서는 빠짐없이 적는 것이 목표입니다.",
      bad: "로그인 좀 해줘.",
      good:
        "- 관리자 페이지에 로그인을 붙이고 싶어요.\n- 지금은 세션 없이 목업만 있고, Supabase 프로젝트는 만들어 둔 상태예요.\n- 이메일 로그인만 필요하고 OAuth는 나중에 할게요.\n- App Router와 미들웨어 조합이 처음이라 어디부터 손대야 할지 모르겠어요.",
      tips: [
        "'누가 읽나요?'를 한 명으로 정해 보세요. 그 사람이 레포를 처음 본다고 가정하고 말해 보세요.",
        "'다 됐다'고 말할 수 있는 장면을 하나만이라도 적어 두면, 다음 칸(완료 기준)으로 옮기기 쉽습니다.",
        "금지나 마감처럼 이미 아는 제약은 일단 메모만 해 두세요. 나중에 필수·금지 칸으로 옮깁니다.",
      ],
    },
    intentLock: {
      label: "완료 기준",
      description: "끝났는지 눈으로·테스트로 확인할 조건",
      placeholder:
        "'잘 만들어줘'가 아니라, 통과면 O·아니면 X로 말할 수 있는 조건만 적습니다.\n\n- 한 줄에 확인 가능한 결과 하나(화면·서버 응답·터미널 결과 등)\n- 우선순위가 있으면 1), 2)처럼 번호\n\n버전·폴더 같은 사실은 배경·환경 칸으로, 하면 안 되는 일은 필수·금지 칸으로, 몇 번째로 무엇을 할지는 작업 순서 칸으로 나눕니다.",
      bad: "로그인 잘 되게 만들어줘.",
      good:
        "- 이메일+비밀번호로 로그인 폼 제출 시 200 응답.\n- 성공 시 JWT가 httpOnly 쿠키에만 있고, 세션스토리지·로컬스토리지에는 토큰 없음.\n- 로그인 후 브라우저에서 /dashboard URL이 열림(리다이렉트).",
      tips: [
        "'이미 있다/없다' 같은 상황 설명은 배경·환경 칸으로 옮기세요.",
        "'절대 하면 안 되는 것'은 필수·금지 칸으로 옮기세요.",
        "'이번에 안 하는 것'은 이번 작업 범위 칸의 '안 할 일'로 옮기세요.",
      ],
    },
    realityAnchor: {
      label: "배경·환경",
      description: "에이전트가 착각하면 안 되는 사실만",
      placeholder:
        "구현이 없어도 됩니다. '폴더는 비어 있음', 'Next만 설치해 둠'처럼 적어도 좋습니다.\n\n넣기 좋은 것:\n- 프레임워크·언어·패키지 버전, 브랜치 이름\n- 이미 있는 파일·경로 / 아직 없는 영역\n- 로컬에서 재현할 때 치는 명령\n\n'이렇게 되면 된다'는 완료 기준 칸, '먼저 이 파일, 그다음 서버 요청'은 작업 순서 칸입니다. 자동 구조화로 채워진 경로·이름은 작업 순서와 맞춰 주세요.",
      bad: "Next 쓰는 일반적인 웹앱이에요. 알아서 맞춰 주세요.",
      good:
        "- Next.js 14, App Router, 소스는 src/app 아래.\n- Supabase는 @supabase/ssr로 이미 연결됨(클라이언트만 사용 중).\n- 인증·미들웨어 코드는 아직 없음.\n- User 테이블 컬럼: id, email, created_at.\n- 로컬: pnpm dev 후 http://localhost:3000",
      tips: [
        "판단은 빼고 관찰만: '~이 있다/없다/버전은 ~다' 형태가 좋습니다. '해야 한다'는 이 칸이 아닙니다.",
        "버전·경로·파일명은 실제로 적힌 문자 그대로 적으면 추측이 줄어듭니다.",
        "'어디부터 읽으면 되나요?'에 대답하듯, 진입 파일 하나만 짚어 주면 좋습니다.",
      ],
    },
    constraintCage: {
      label: "필수·금지",
      description: "방식·스택·보안 — 양보 없는 규칙",
      placeholder:
        "어떻게 일할지에 대한 빨간선만 적습니다(새 패키지 금지, 특정 폴더만 수정 등).\n\n- 반드시 / 절대 금지 / 오직 ~만 같은 짧은 문장\n- 보안·라이선스·호환성 같이 지키지 않으면 안 되는 것\n\n'1번 파일 고치고 2번 서버 호출…' 같은 순서는 작업 순서 칸입니다.",
      bad: "깔끔하고 유지보수 잘 되게, 필요하면 라이브러리도 추가해 줘.",
      good:
        "- MUST: App Router만 사용. Pages Router 사용 금지.\n- MUST NOT: 새 npm 의존성 추가.\n- ONLY: 스타일은 Tailwind 유틸만(별도 .css 파일 추가 금지).\n- NEVER: prisma/schema.prisma 수정.\n- MUST NOT: 클래스 컴포넌트(함수 컴포넌트만).",
      tips: [
        "우선순위가 높은 금지는 '절대' '금지'처럼 단어를 단단히 박아 두세요.",
        "'답장은 마크다운으로' 같은 말은 코드를 어떻게 고칠지가 아니라 에이전트 답장 꾸밈이라 이 칸(필수·금지)에 넣지 마세요.",
        "코드 스타일 제약과 아키텍처 제약을 한 줄에 섞지 말고 나눠 적으면 나중에 수정하기 쉽습니다.",
      ],
    },
    actionSlice: {
      label: "이번 작업 범위",
      description: "이 요청 한 번으로 할 일과, 일부러 안 할 일",
      placeholder:
        "**작업 결과**이란 우편이 아니라, 이번에 AI나 동료에게 넘길 요청·산출물 묶음입니다.\n\n- 할 일: 이번에 반드시 나와야 하는 파일·기능·결과\n- 안 할 일: 이번에는 치우고 나중으로 미루는 것\n- 마지막 한 줄: '위에서 안 적은 건 이번 작업에 넣지 않는다'처럼 고정하면 범위가 덜 새요.",
      bad: "인증 관련된 거 다 해 줘.",
      good:
        "- 이번 작업에 포함: src/components/LoginForm.tsx — 필드, 유효성, 제출 버튼까지.\n- 기존 POST /api/login과 연결(API는 이미 머지됐다고 가정).\n- 이번 작업에 넣지 않음: 이메일 인증, 비밀번호 재설정, OAuth, 이메일 템플릿.\n- 위 '넣지 않음' 항목은 이번 요청에서 하지 않는다.",
      tips: [
        "'다 됐다'의 정의는 완료 기준, '이번에 실제로 손댈 테두리'는 이번 작업 범위입니다.",
        "나중으로 미루는 일을 구체적으로 이름 붙이면, 같은 질문을 돌려받는 일이 줄어듭니다.",
        "'이 범위 밖은 하지 않는다' 한 줄이 있으면 산출물이 불필요하게 커지는 걸 막기 좋습니다.",
      ],
    },
    responseContract: {
      label: "작업 순서",
      description: "1·2·3번째로 무엇을 할지, 어떻게 확인할지",
      placeholder:
        "이 문서만 보고도 무엇을 어떤 순서로 고치고, 끝나면 무엇으로 확인할지 적습니다.\n\n- 1·2·3 번호가 있는 실행 순서\n- 건드릴 경로·함수·서버 주소 이름\n- 마지막에 돌릴 테스트·검사·간단한 요청 등\n\n여기에는 넣지 마세요: '답은 JSON으로', '요약·다음 단계 포함'처럼 답장 꾸밈만 정하는 말 — 그건 코드 작업과 다른 종류의 지시입니다.",
      bad: "우선 스키마 만들고, 그다음 API 하고, 프론트는 알아서.",
      good:
        "- 1) SPEC의 모델에 맞춰 prisma/schema.prisma 수정 후 pnpm prisma migrate dev.\n- 2) POST /api/event/spin 구현: 행 잠금·당첨 수량 반영(SPEC의 시그니처 따름).\n- 3) src/app/event/page.tsx에서 위 API 호출, 성공/실패 메시지 표시.\n- 4) pnpm test && pnpm lint 통과 후, SPEC에 있는 curl 예시로 수동 확인.",
      tips: [
        "자동 구조화로 순서가 잡혀 있다면, 여기서 같은 순서로 짧게 다시 쓰면 실행이 어긋나지 않습니다.",
        "각 번호 단계가 끝났는지 스스로 점검할 수 있게 쓰면 좋습니다.",
        "에이전트에게 '어떤 형식으로 말해'가 아니라 '어떤 코드를 어디에'를 적는 칸입니다.",
      ],
    },
  },
  sectionLabels: {
    intentLock: "완료 기준",
    realityAnchor: "배경·환경",
    constraintCage: "필수·금지",
    actionSlice: "이번 작업 범위",
    responseContract: "작업 순서",
  },
  exportTitle: "에이전트 작업 패키지",
  previewHandoffCardDesc:
    "넘길 대상을 고른 뒤 ZIP을 받아 프로젝트 폴더 맨 위에서 풀고, 폴더 안내에서 경로를 맞추세요.",
  previewSectionsHeading: "합쳐진 텍스트에 들어가는 칸",
  previewOneLinerPreviewLabel: "첫으로 보낼 말, ZIP 안 첫 메시지와 같음",
  downloadZip: "패키지 ZIP 받기",
  exportHandoffTarget: "넘길 대상",
  exportHandoffArchetype: "작업 방식",
  exportHandoffArchetypeNone: "작업 방식 없음",
  exportHandoffArchetypeHint:
    "작업 방식에 따라 ZIP과 첫 메시지 문구의 톤이 달라집니다. 플레이북에서 추천 카드로 오면 여기가 맞춰질 수 있습니다.",
  exportHandoffZipHint:
    "다섯 칸이 채워져 있을 때 ZIP을 받을 수 있습니다. 자동으로 만든 설명서, 할 일 목록, 에이전트용 안내, 고른 대상에 맞는 규칙 파일, 첫 메시지 문구가 들어 있습니다.",
  handoffTargetCursor: "Cursor (.cursor/rules)",
  handoffTargetClaude: "Claude (CLAUDE.md)",
  handoffTargetGemini: "Gemini (GEMINI.md)",
  handoffTargetCopilot: "GitHub Copilot (.github/copilot-instructions.md)",
  handoffTargetWindsurf: "Windsurf (.windsurfrules)",
  handoffTargetGeneric: "범용 에이전트 (HANDOFF.md)",
  copyOneLiner: "첫 메시지 복사",
  copiedOneLiner: "복사됨",
  exportPathGuide: "옮길 위치 안내",
  exportPathGuideTitle: "폴더 구조 (대상별)",
  exportPathGuideIntro:
    "ZIP을 프로젝트 폴더 맨 위에서 풀어 아래 구조와 경로가 맞게 두세요:",
  exportPathGuideTargetHint: "위에서 고른 넘길 대상을 바꾸면 이 트리와 ZIP 안 구성이 함께 바뀝니다.",
  pathGuideExtraCursor:
    "Cursor는 프로젝트 안 `.cursor/rules/`에서 규칙을 읽습니다. ZIP을 푼 뒤 같은 폴더를 Cursor로 열면 `preprompt-handoff.mdc`가 적용됩니다.",
  pathGuideExtraClaude:
    "Claude Code 등은 보통 프로젝트 맨 위의 `CLAUDE.md`를 읽습니다. `SPEC.md`와 `preprompt.task.json`도 같은 맨 위 폴더에 두세요.",
  pathGuideExtraGemini:
    "Gemini나 에디터가 프로젝트 맨 위의 `GEMINI.md`를 읽도록 켜 두었다면 이 구조와 맞습니다.",
  pathGuideExtraCopilot:
    "GitHub Copilot은 `.github/copilot-instructions.md`를 워크스페이스 지침으로 읽습니다. `SPEC.md`와 `preprompt.task.json`은 프로젝트 맨 위에 두세요.",
  pathGuideExtraWindsurf:
    "Windsurf는 맨 위의 `.windsurfrules`를 규칙으로 읽는 경우가 많습니다. `SPEC.md`와 `preprompt.task.json`도 같은 맨 위 폴더에 두세요.",
  pathGuideExtraGeneric:
    "`HANDOFF.md`는 범용 안내입니다. 전용 규칙 폴더가 없는 에이전트에 두고, 세부 약속은 ZIP에 들어 있는 설명서와 할 일 목록을 따르면 됩니다.",
  exportPathGuideKeepNames:
    "파일·폴더 이름은 바꾸지 말고, 없는 폴더만 만든 뒤 그대로 넣으세요.",
  exportPathGuideZipTitle: "ZIP에 대해",
  exportPathGuideZipBody:
    "경로가 흐트러지지 않도록 ZIP으로만 드립니다. 항상 설명서·할 일 목록·에이전트 안내·첫 메시지가 들어가고, 고른 대상에 맞는 규칙 파일이 더 붙습니다.",
  intentLabel: "의도",
  about: {
    title: "PrePrompt 소개",
    description:
      "PrePrompt는 AI나 동료에게 일을 넘기기 전에, 막연한 말을 다섯 덩어로 나누어 적게 돕는 도구입니다. 끝났는지 확인하는 조건, 틀리면 안 되는 사실, 지켜야 할 금지선, 이번에 할 일과 일부러 안 할 일, 그리고 몇 번째로 무엇을 고치고 어떻게 확인할지를 나눕니다. 여기서 말하는 순서는 코드를 고치는 순서이지, 답장 형식을 정하는 일이 아닙니다.\n자동 구조화는 스택과 단계별 계획(경로·검증 등)을 채워 넣어, 처음 보는 사람도 덜 헤매게 합니다.\n같은 질문을 반복하는 대화와 범위가 커지는 일을 줄이고, 무엇을 부탁했는지 더 분명히 남기는 것이 목표입니다.",
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

export * from "./i18n.harness";
