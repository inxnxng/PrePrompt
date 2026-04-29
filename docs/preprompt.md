# 0. Meta Directive for AI

Section 1~11은 이 프로젝트의 철학과 배경을 이해하기 위한 컨텍스트입니다. 너의 실제 실행(Execution) 타겟은 오직 "Section 12. Implementation Constraints"에 명시된 3개의 Step뿐입니다. 1~11번에 대한 요약이나 분석, 부연 설명은 절대 출력하지 말고 바로 12번의 코딩 작업만 수행하세요.

# 1. Introduction

Modern LLM-based development tools (e.g., Cursor, Claude, ChatGPT) provide powerful generation capabilities.
However, users frequently experience:

- Excessive token usage
- Over-generation
- Scope drift
- Repeated refinement cycles
- Loss of control over output

This project proposes a **Pre-AI Cognitive Layer** — a structured thinking protocol that users must pass through _before_ sending a request to an AI system.

---

# 2. Core Research Question

Can structured pre-thinking reduce:

- Token usage?
- AI over-expansion?
- Iteration count?
- Cognitive uncertainty?

---

# 3. The AI Collaboration Protocol

The protocol consists of 5 mandatory thinking stages.

---

## 1. Success criteria (field: `intentLock`)

**Definition:** Checkable completion signals—how you know you are done.

**Purpose:** Anchor evaluation without mixing in repo facts, hard rules, handoff turf, or reply layout.

**Bad Example**

```
Make a login system.
```

**Good Example**

```
- Email/password login works end-to-end.
- JWT issued on success, stored in httpOnly cookie.
- Successful login lands on /dashboard without a 401 on that path.
```

---

## 2. Ground truth (field: `realityAnchor`)

**Definition:** Facts and assumptions about the system and environment _today_.

**Purpose:** Prevent the model from hallucinating context; keep “is / has / was” separate from goals and rules.

**Bad Example**

```
Add login to my project.
```

**Good Example**

```
- Next.js 14 App Router.
- Supabase connected.
- No existing authentication system.
```

---

## 3. Hard rules (field: `constraintCage`)

**Definition:** Non-negotiables for the solution—MUST / MUST NOT (architecture, deps, security).

**Purpose:** Limit invalid approaches; do not put “how the answer should look” here (that is Output format).

**Examples**

```
- TypeScript only
- Modify one file only
- MUST NOT add new npm packages
```

---

## 4. Handoff scope (field: `actionSlice`)

**Definition:** Boundaries of _this single structured handoff_—in scope vs explicitly deferred or excluded.

**Purpose:** One user-facing package of intent; downstream harness or agents may plan subdivisions internally without re-asking the user the same scope questions.

**Bad Example**

```
Implement full authentication system.
```

**Good Example**

```
In scope: login form UI in src/components/LoginForm.tsx (fields + submit only).

Out of scope (later handoff / harness): email templates, password reset, OAuth.

Nothing outside this scope.
```

---

## 5. Output format (field: `responseContract`)

**Definition:** How the target model should shape its _reply_ (sections, fences, length, banned fluff).

**Purpose:** Predictable, copy-friendly answers; separate from product rules in Hard rules.

**Examples**

```
- Unified diff only
- No prose before or after the diff
- Omit unchanged files
```

---

# 4. System Scope (POC)

## Included

- 5-stage structured UI
- Explanation per stage
  - Bad vs Good examples
  - User input fields
- Real-time prompt preview
- Final prompt generation

## Excluded

- AI API calls
- Token estimation
- Authentication
- Persistence
- VSCode extension
- Git integration

This POC focuses strictly on validating the thinking protocol.

---

# 5. Data Model

```tsx
type CognitiveModel = {
  intentLock: string;
  realityAnchor: string;
  constraintCage: string;
  actionSlice: string;
  responseContract: string;
}

// 위 필드를 `Success criteria` / `Ground (facts)` / … 헤더로 이어 붙여 타깃 LLM용 텍스트로 변환
function compileToPrompt(model: CognitiveModel): string { ... }
```

---

# 6. Prompt Assembly Logic

The final prompt is composed as (see `compileToPrompt` in `store/usePromptStore.ts`):

```
Success criteria:
{intentLock}

Ground (facts):
{realityAnchor}

Hard rules:
{constraintCage}

Handoff scope:
{actionSlice}

Output format:
{responseContract}
```

---

# 7. Experimental Design

For each task:

1. Send natural prompt
2. Send ACP-structured prompt
3. Compare:

- Token usage
- Number of refinement iterations
- Over-generation severity
- Output satisfaction

Results will be documented.

---

# 8. Success Criteria

The POC is successful if:

- Structured prompts reduce iteration count
- AI expansion is measurably reduced
- User reports increased control
- Token usage decreases or stabilizes

---

# 9. Limitations

- Model behavior may evolve
- Token improvements may vary
- Cognitive overhead may discourage usage

---

# 10. Future Extensions

- Token prediction model
- Prompt quality scoring
- VSCode extension
- .cursorrules auto-generation
- Multi-agent orchestration

---

# 11. Conclusion

PrePrompt is not a prompt generator.

It is a research experiment into:

- Human-AI interface design
- Structured cognition before LLM interaction
- Token-efficient collaboration models

---

# 12. Implementation Constraints

### [Success criteria]

- Target: 'PrePrompt' 프로젝트의 초기 보일러플레이트 세팅 및 메인 페이지 3단 레이아웃 뼈대 구현.
- Core Goal: 사용자가 AI에게 프롬프트를 입력하기 전, 사고를 구조화하는 5단계 UI의 시각적 틀(Shell) 구축.

### [Ground truth]

- Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS
- UI Library: shadcn/ui (필요한 컴포넌트만 설치)
- State Management: Zustand
- Current State: 빈 프로젝트 (아직 초기화 전)

### [Hard rules]

- 절대 백엔드 API나 DB 연동을 시도하지 말 것. 오직 클라이언트 사이드 로직과 전역 상태(Zustand)만 사용.
- Vercel 배포 시 빌드 에러가 나지 않도록 TypeScript 타입 정의를 엄격하게 할 것.
- 화려한 커스텀 CSS 작성 금지. Tailwind와 shadcn/ui의 기본 유틸리티를 활용하여 건조하고(dry) 프로페셔널한 대시보드 형태로 구성할 것.

### [Handoff scope]

1. Next.js 프로젝트 생성, Tailwind, shadcn/ui, Zustand 초기 세팅을 위한 CLI 명령어 출력.
2. Zustand를 활용한 `CognitiveModel` 전역 상태 스토어(`store/usePromptStore.ts`) 인터페이스 및 초기 상태 코드 작성. (`intentLock`, `realityAnchor`, `constraintCage`, `actionSlice`, `responseContract` 필드 포함)
3. 메인 페이지(`app/page.tsx`)에 Left(진행도 사이드바), Center(입력 폼 영역), Right(결과 미리보기 패널) 구역을 명확히 나누는 반응형 3단 레이아웃 코드 작성. (세부 폼 요소는 아직 구현하지 말고 영역 레이아웃만 잡을 것)

### [Output format]

- 불필요한 부연 설명, 설명적 문장, 인사말 절대 금지.
- 각 Step별로 복사-붙여넣기(Copy & Paste)가 즉시 가능한 CLI 명령어와 마크다운 코드 블록만 출력할 것.
