# AX-Partner 원페이퍼용 답변 정리 (레포지토리 기준)

아래는 **현재 워크스페이스에 실제로 있는 코드·문서**를 기준으로 정리한 내용입니다. 질문에 나온 **「AX-Partner」라는 명칭·과제 관리(WBS)·아이디어 유사도·소스 메타데이터만 수집** 등은 이 레포 안에서 확인되지 않았습니다. 공식적으로 이 프로젝트는 **PrePrompt**(`package.json`의 `"name": "preprompt"`, `README.md`)입니다. 원페이퍼에 AX-Partner를 쓰려면 **제품/과제명 매핑**을 문서에 명시하는 편이 좋습니다.

---

## 1. 과제 개요 및 배경

### 공식 명칭·핵심 목적 (레포 기준)

- **명칭**: **PrePrompt** — README에 “Pre-AI Cognitive Layer”, “structured thinking protocol you pass through *before* sending a request to an AI system”으로 정의되어 있습니다.
- **핵심 목적**:
  - 토큰 사용을 줄이고(`README.md` “reduce token usage”)
  - AI의 과도한 생성·스코프 드리프트를 완화하며(`README.md` “prevent AI over-generation”, “scoping drift and repetition”)
  - **5단계 인지 슬롯**(성공 기준·사실/가정·하드 규칙·핸드오프 범위·출력 형식)으로 질문을 구조화한 뒤, **딥 플랜(JSON)**과 **컴파일된 프롬프트**를 만드는 것입니다.
- 코드상 필드명은 README대로 `intentLock`, `realityAnchor`, `constraintCage`, `actionSlice`, `responseContract`이며 `src/store/usePromptStore.ts`의 `CognitiveModel`에 정의되어 있습니다.

### 핵심 로직: 5단계 인지 슬롯(＋0단계 초안)

UI 내비게이션(`src/components/StageNav.tsx`의 `STAGES`)은 **0단계 초안**과 **구조화된 5슬롯**을 합쳐 총 6스텝으로 보이지만, 제품이 말하는 **「5단계」**는 초안을 제외한 아래 다섯 필드입니다. 사용자는 각 슬롯에 직접 입력하거나, **Auto-Structure**로 LLM이 한 번에 채우게 할 수 있습니다(`src/lib/agent/generateStructuredPrompt.ts`의 `generateStructuredPrompt`: Gemini는 `geminiOrchestration.ts`에서 먼저 **딥 플랜 JSON**, 이어서 동일 초안·딥 플랜을 넣어 **5필드 JSON**을 생성. Cursor Agent 경로는 `cursorAgentOrchestration.ts`에서 필드별 순차 호출).

| 단계(슬롯) | 저장소 필드 | 역할(오케스트레이션·UI와의 대응) |
|------------|-------------|----------------------------------|
| 1 | `intentLock` | **성공 기준**: 관측 가능한 완료·합격 조건만. 저장소 경로·버전 나열은 플랜 단계가 아니라 “합격/불합격에 직접 쓰일 때”에 한함(`orchestration.en.json`의 `fieldMeaningsBullets` / `agent.fieldSpec`). |
| 2 | `realityAnchor` | **사실·가정(그라운드)**: 현재 스택, 경로, 이미 있는 것 등 사실과 가정. 딥 플랜의 `technicalApproach` 등을 녹여도 되며, 권고형 “해야 한다” 서술은 피함. |
| 3 | `constraintCage` | **하드 규칙**: 아키텍처·의존성·보안·라이선스 등 **MUST / MUST NOT**. 채팅 답변 형식 지시는 여기에 두지 않음. |
| 4 | `actionSlice` | **이번 핸드오프 범위**: 이번 전달에서 **in scope**와 **명시적으로 미룬(out of deferred)** 것. 필요 시 한 줄 **스코프 고정(scope-freeze)** 으로 마무리. |
| 5 | `responseContract` | **구현 계약(코드상 필드명은 레거시와 동일)**: 실제 작업 수행자(사람·에이전트)를 위한 **번호 매긴 실행 체크리스트**, 파일·API 지시, 검증 방법. 채팅 응답 형태·JSON 답변 형·글자 수 제한 등 **대화 출력 규약**은 금지(`fiveFields` / `agent.fieldSpec`의 `responseContract` 설명과 동일 취지). |

**컴파일된 한 덩어 프롬프트**는 `usePromptStore.ts`의 `compileToPrompt`가 위 다섯 줄을 다음 헤더로 이어 붙입니다: `Success criteria`, `Ground (facts)`, `Hard rules`, `Handoff scope`, `Implementation contract`. 비어 있는 슬롯은 해당 섹션이 필터링되어 최종 문자열에서 빠질 수 있습니다.

정리하면, **0단계 `naturalPrompt`**가 원시 의도이고, **1~5단계**가 그것을 **판정 기준·전제·제약·범위·실행 계약**으로 쪼개 AI(또는 구현자)에게 넘기는 **인지 프로토콜**입니다. 딥 플랜은 그 사이에서 구현 청사진·DoD·보안 등을 JSON 스키마로 고정하는 중간 산출물입니다.

### 페인 포인트와의 대응 (코드·문서에 실제로 있는 내용만)

| 질문에서 가정한 페인 | 이 레포에서의 대응 |
|----------------------|-------------------|
| **중복 구현** | 저장소 전체를 스캔해 중복 코드를 찾는 기능은 **없음**. 대신 `README.md`·`BENCHMARK.md`는 **범위 이탈·반복 대화**를 줄이기 위해 구조화된 프롬프트·SPEC 핸드오프를 쓰자는 쪽에 가깝습니다. `DeepPlan`의 `taskSpec.inScope` / `outOfScope`, `implementationBlueprint.workSequence` 등(`src/lib/deepPlan.ts`)이 **구현 순서·범위**를 텍스트로 고정하는 역할입니다. |
| **보안 준수** | **데이터 모델**에 `securityAndCompliance` 조건부 불릿 섹션이 있고(`DeepPlan`, `src/prompts/deepPlan.schema.json`), 딥 플랜 생성 시 스키마에 포함됩니다. **앱이 API 키·프롬프트를 서버 DB에 저장하지 않는다**는 설명은 `README.md` “Privacy & Token Security”에 있습니다. 다만 Gemini 경로는 `/api/gemini`가 Google API로 중계하므로, 키는 **요청 처리 동안 서버 메모리를 통과**한다고 README에 명시되어 있습니다. |
| **보고서 작성** | **주간 보고서·Word 연동** 같은 기능은 **코드에 없음**. 대신 `src/lib/exports.ts`가 **Markdown SPEC**(`buildSpecMarkdown` → `SPEC.md`), `preprompt.task.json`, Cursor 규칙 스니펫(`preprompt-handoff.mdc`), `AGENTS.md`, 채팅 한 줄(`CHAT_MESSAGE.txt`)을 **ZIP으로 묶어** 에이전트에게 넘기는 **핸드오프 패키지**를 생성합니다. 이는 “경영 주간 보고”가 아니라 **구현/에이전트 작업 명세**에 가깝습니다. |

---

## 2. 기술 스택 및 아키텍처

### VS Code/Cursor 확장 vs API vs 시각화

레포에는 **VS Code/Cursor 확장(extension) 패키지가 없습니다**. 구성은 다음과 같습니다.

1. **브라우저 UI (Next.js App Router)**  
   - `README.md`: Next.js, Tailwind, shadcn/ui, Zustand.  
   - 사용자가 단계별 필드를 채우고, 미리보기 등으로 결과를 보는 **웹앱**이 시각화·편집의 중심입니다.

2. **API 서버 (Next Route Handlers)**  
   - **`src/app/api/gemini/route.ts`**: 클라이언트가 보낸 본문과 `x-goog-api-key`를 받아 `generativelanguage.googleapis.com`의 `generateContent`로 **프록시**합니다. IP당 레이트 리밋, 본문 크기 제한, 재시도 로직이 있습니다.  
   - **`src/app/api/cursor-agent/route.ts`**: 로컬 **`cursor-agent` 바이너리**를 `spawn`으로 실행하는 **CLI 프록시**입니다. 타임아웃(180s), stdout/stderr 상한, 본문 크기 제한, IP 레이트 리밋이 있습니다. 주석에 “typically local dev” 환경을 전제로 합니다.

3. **상호작용**  
   - `src/lib/agent/generateStructuredPrompt.ts`의 `generateStructuredPrompt`:  
     - `provider === "cursorAgent"`이면 브라우저 → **`/api/cursor-agent`** → 서버에서 `cursor-agent` 실행 → stdout에서 JSON 추출(`cursorAgentOrchestration.ts`의 `extractJsonFromAgentOutput`).  
     - 기본은 **`/api/gemini`**로 Gemini 두 번 호출(딥 플랜 JSON → 5필드 JSON, `geminiOrchestration.ts`).  
   - 즉 “확장 프로그램”이 아니라 **웹앱 + (선택) 로컬 Cursor Agent CLI + (선택) Gemini 프록시** 구조입니다.

### “소스 전체 없이 메타데이터만” 수집?

이 레포에는 **Git/파일 트리를 읽어 메타데이터만 업로드하는 모듈이 없습니다**.  
자동 구조화에 들어가는 것은 사용자가 입력한 **`naturalPrompt` 문자열**(및 오케스트레이션용 시스템 지시·스키마 텍스트)입니다(`generateStructuredPrompt` in `src/lib/agent/generateStructuredPrompt.ts`).  
따라서 질문에 적힌 **“메타데이터만 모아 진행 상황 파악” 방식과 그 보안 이점**은 **이 코드베이스의 구현 설명으로는 맞지 않습니다**.  
보안 이점으로 README에 가깝게 말할 수 있는 것은: **초안·구조 필드·딥 플랜은 브라우저 localStorage**, 서버가 이를 영구 저장하지 않는다는 점(다만 Gemini/호스팅 사용 시 중계·키 통과는 README 경고대로입니다).

---

## 3. 핵심 기능 세부 (질문 항목별)

### 아이디어 유사도 분석

**구현 없음.** 의미 검색·임베딩·유사 과제 매칭 API/라이브러리 호출은 코드·의존성(`package.json`)에서 확인되지 않습니다.

### WBS 연동 주간 보고(Markdown/Word) 자동 생성

**WBS·주간·Word(docx) 생성 로직 없음.**  
있는 것은 `src/lib/exports.ts`의 **SPEC Markdown**, **JSON task**, **ZIP 핸드오프**이며, `src/lib/deepPlan.ts`의 `deepPlanToSpecMarkdown` 계열이 **기술 스택·구현 청사진·DoD·보안/신뢰성 불릿** 등을 Markdown 섹션으로 펼칩니다. 이는 **에이전트/구현 계약서**에 해당합니다.

### 로컬 LLM(Ollama) / Gemini 요약 시 프롬프트에 쓰는 데이터

- **Gemini** (`src/lib/agent/geminiOrchestration.ts`):  
  - 1차: `buildDeepPlanSystemInstruction` + 사용자 메시지 `User draft:\n${JSON.stringify(naturalPrompt)}`.  
  - 2차: `buildFiveFieldsSystemInstruction` + `Deep plan JSON` + `Original draft` (같은 모듈 내 `fiveFieldsUser`).  
  - 모델은 코드상 `gemini-2.5-flash` 상수.  
- **Cursor Agent** 경로: 딥 플랜용 `combinedAgentPrompt`, 이후 필드별 `buildAgentStageUserContent`(초안, 딥 플랜 JSON, 이미 채운 이전 슬롯) + `buildAgentSingleFieldSystem`.  
- **Ollama**: `src/store/usePromptStore.ts` persist `merge`에 “Legacy persisted values include `"ollama"` (removed); coerce to `cursorAgent`”라고 되어 있어, 과거에 UI에 있었을 수 있으나 **현재 타입은 `gemini` \| `cursorAgent`만**이고 Ollama 전용 호출 경로는 없습니다.

출력 정리는 `src/lib/sanitizeLlmOutput.ts`의 `sanitizeLlmOutputText`(굵게/이모지 제거 등)가 일부 문자열에 적용됩니다.

---

## 4. 차별화·기대 효과 (레포가 말할 수 있는 범위)

### 로컬/내부망 중심 운영의 강점 (이 코드로 주장 가능한 부분)

- **`cursor-agent` 프록시**: 서버가 **로컬에 설치된 CLI**만 실행하므로, Next를 **내부망·개발 머신**에서 돌리면 해당 구조화 호출은 **외부 SaaS 없이**(단, Cursor 제품 정책·인증은 별도) 돌릴 수 있는 형태입니다.  
- **상태 영속**: Zustand `persist`로 **`preprompt-storage`** 키에 브라우저 로컬 저장(`usePromptStore.ts`).  
- **Gemini 경로**는 여전히 Google 클라우드 API이므로, “완전 폐쇄망만”을 주장하려면 배포·키·네트워크 정책을 문서에 따로 적어야 하며, 코드만으로는 **폐쇄망 전용 LLM**을 제공하지 않습니다.

### 보고서·보안 검토 시간 단축 “얼마나”

레포의 **`BENCHMARK.md`**는 Cursor 토큰·턴·안전 체크리스트를 **수동으로 비교 측정하는 방법**을 안내할 뿐, **보고서 작성 시간·보안 검토 시간의 % 단축 예측치는 없습니다.**  
원페이퍼에 수치를 넣으려면 별도 파일럿 측정이 필요하고, 현재 저장소만으로는 **근거 있는 숫자를 인용할 수 없습니다.**

---

## 원페이퍼 작성 시 권장 정리

1. **제품명**: 레포 기준 표기는 **PrePrompt**; AX-Partner는 내부 과제명이라면 “본 레포 구현체(PrePrompt)를 AX-Partner로 명명”처럼 **한 줄로 관계를 밝히기**.  
2. **아키텍처 다이어그램**: **브라우저 ↔ Next API(`/api/gemini`, `/api/cursor-agent`) ↔ (Google \| 로컬 cursor-agent)** 로 그리는 것이 정확합니다. **확장·메타데이터 수집기·WBS**는 이 레포에 없으므로 넣지 않거나 “로드맵”으로 분리하세요.  
3. **차별 스토리**: “프롬프트 전 구조화 + 딥 플랜 스키마 + ZIP/SPEC 핸드오프 + (선택) 로컬 에이전트 CLI”는 코드로 뒷받침 가능합니다.

---

## 주요 참조 파일

| 경로 | 역할 |
|------|------|
| `README.md` | 제품 정의, 프라이버시, 기술 스택 |
| `BENCHMARK.md` | 비교 측정 방법론 |
| `package.json` | 패키지명 `preprompt` |
| `src/store/usePromptStore.ts` | 상태, `LlmProvider`, localStorage 키 |
| `src/lib/agent/generateStructuredPrompt.ts` | Auto-Structure 진입점 `generateStructuredPrompt` |
| `src/lib/agent/geminiOrchestration.ts` | Gemini 두 단계 호출·병합 |
| `src/lib/agent/cursorAgentOrchestration.ts` | `/api/cursor-agent` 순차 오케스트레이션 |
| `src/lib/deepPlan.ts` | `DeepPlan` 타입, SPEC Markdown 생성 |
| `src/lib/exports.ts` | ZIP 핸드오프, `SPEC.md`, `preprompt.task.json` |
| `src/lib/llmOrchestrationPrompts.ts` | 시스템 지시 조립 |
| `src/prompts/deepPlan.schema.json` | 딥 플랜 JSON 스키마 문자열 |
| `src/app/api/gemini/route.ts` | Google Generative Language API 프록시 |
| `src/app/api/cursor-agent/route.ts` | `cursor-agent` CLI 스폰 프록시 |
