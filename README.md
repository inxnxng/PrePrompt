# PrePrompt

[**라이브 데모: pre-prompt.vercel.app**](https://pre-prompt.vercel.app/)

**PrePrompt**는 LLM에 요청을 보내기 **전**에 거치는 사전 인지 레이어(Pre-AI Cognitive Layer)입니다. **요청 초안**과 그다음 **구조화 다섯 칸**으로 생각을 고정해 토큰 낭비와 과생성을 줄이고, 넘길 패키지(ZIP)와 작업 순서까지 한 흐름으로 잡는 것을 목표로 합니다.

## 주요 기능

- **시작 화면 (`/`)**: 작업하기, 플레이북, 히스토리로 바로 갈 수 있는 허브입니다.
- **작업 화면 (`/work`)**: 요청 초안 → 완료 기준 → 배경·환경 → 필수·금지 → 이번 작업 범위 → 작업 순서까지 단계별로 채우고, 오른쪽에서 컴파일된 프롬프트를 미리 봅니다. 리사이즈 가능한 패널 레이아웃을 지원합니다.
- **Auto-Structure(자동 구조화)**: 설정에서 백엔드를 고를 수 있습니다.
  - **Gemini**: 브라우저에 저장한 API 키가 배포 환경의 `/api/gemini`로 전송되어 Google Generative Language API를 호출합니다.
  - **Cursor Agent**: 같은 머신에서 `cursor-agent` CLI를 서버가 실행합니다. 로컬 개발 등 CLI가 설치·인증된 환경을 전제로 합니다. (`/api/cursor-agent`, 모델 목록은 `/api/cursor-agent/models`)
- **작업 결과 (`/result`)**: 에이전트에 넘길 ZIP, 하네스·딥 플랜 기반 내용, Cursor Agent 모델 추천 패널(다섯 구조 칸을 채운 뒤), 서버에 저장할 때 쓰는 다이얼로그가 있습니다.
- **히스토리 (`/history`)**: 작업 결과 화면에서 “서버에 저장” 시 API 키를 제외한 스냅샷이 서버 측 파일 저장소에 기록됩니다. (자세한 제약은 아래 개인정보·보안 절 참고)
- **플레이북 (`/playbook`)**: 작업 방식(아키타입)에 맞춘 하네스 가이드 마법사와 유사 사이트 추천 등 보조 흐름이 있습니다.
- **소개 (`/about`)**: 각 칸의 의미·가이드라인·팁을 한눈에 볼 수 있습니다.

UI 카피는 한국어 중심이며, **영구 저장 필드명**은 기존 데이터와의 호환을 위해 `naturalPrompt`, `intentLock`, `realityAnchor`, `constraintCage`, `actionSlice`, `responseContract`로 유지됩니다.

## 개인정보·토큰·보안

- **로컬 우선**: 초안, 구조화 필드, Auto-Structure로 생성된 **딥 플랜**은 기본적으로 이 브라우저(로컬 스토리지)에만 남습니다. **Gemini API 키는 이 코드베이스가 서버 디스크에 영구 저장하지 않습니다.**
- **Gemini 경로**: 키와 프롬프트 텍스트는 요청 동안만 **배포된** Next.js 서버 프로세스 메모리를 통과합니다. 호스팅 환경을 제3자 릴레이처럼 취급하고, 제한된 키 사용·비신뢰 환경에서는 프로덕션 시크릿을 넣지 않는 것이 좋습니다.
- **Cursor Agent 경로**: 서버가 로컬 `cursor-agent`를 실행합니다. 키 대신 **로컬 CLI 인증·실행 정책**이 안전 경계가 되며, 원격 서버리스만으로는 동작하기 어렵습니다.
- **공유 핸드오프 히스토리** (`/history`, `/api/handoff-history`): “서버에 저장” 시 API 키를 제외한 JSON 스냅샷이 Next.js를 실행하는 머신의 `.data/handoff-history.json` 등 파일 저장소에 씁니다. 장기 실행 Node 호스트(`next dev` / `next start`)에서는 동작하기 쉽고, **지역별 쓰기 가능 디스크가 없는 서버리스**에서는 503 등으로 실패할 수 있습니다. 그 경우 자체 호스팅·VM으로 옮기거나 DB 백엔드로 교체해야 합니다.

사이트 데이터를 지우거나 브라우저를 바꾸면 **API 키를 다시 입력**해야 할 수 있습니다.

## 구조화 다섯 칸(요청 초안 다음)

**요청 초안**(`naturalPrompt`)은 정리 전 메모 칸이고, 그 아래 다섯 칸은 서로 겹치지 않는 정보 종류를 나눕니다. UI 라벨과의 대응은 다음과 같습니다.

1. **완료 기준** (`intentLock`): 끝났는지 눈으로·테스트로 확인할 조건 (배경 사실·금지·순서 지시와 구분).
2. **배경·환경** (`realityAnchor`): 에이전트가 착각하면 안 되는 사실·버전·경로 등 (목표·규칙·실행 순서와 구분).
3. **필수·금지** (`constraintCage`): MUST / MUST NOT 등 작업 방식·스택·보안 쪽 비협상 조건 (답장 형식만 정하는 말과 구분).
4. **이번 작업 범위** (`actionSlice`): 이번 요청에 포함할 것과 **명시적으로 미루는** 것 (다음 채팅 턴 계획이 아님).
5. **작업 순서** (`responseContract`): 무엇을 어떤 순서로 할지, 어떻게 확인할지 (에이전트 답장 꾸밈만 정하는 지시는 이 칸이 아님).

## 기술 스택

- **프레임워크**: Next.js 16 (App Router), 소스는 `src/app` 등 `src/` 아래
- **UI**: React 19, Tailwind CSS 4, Radix 기반 컴포넌트(shadcn 스타일), `lucide-react`
- **상태**: Zustand(`persist` 미들웨어)
- **언어**: TypeScript 6

## 시작하기

1. 저장소를 클론합니다.
2. 의존성 설치:

   ```bash
   npm install
   ```

3. 개발 서버 실행:

   ```bash
   npm run dev
   ```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다. (`next dev` 기본 포트)

**백그라운드로 띄우려면**(로그는 `log/server.log`, PID는 `log/server.pid`):

```bash
./start.sh        # 기본 포트 3001 → http://localhost:3001
./start.sh 3000   # 포트 지정
./stop.sh         # 위 방식으로 띄운 서버 종료
```

**Cursor Agent로 Auto-Structure를 쓰려면** Next를 실행하는 환경에 [Cursor CLI](https://docs.cursor.com/cli)의 `cursor-agent`가 있어야 하며, 필요 시 `CURSOR_AGENT_BIN`, `CURSOR_AGENT_FLAGS` 등으로 바이너리와 플래그를 조정할 수 있습니다. (코드 주석·`src/app/api/cursor-agent/route.ts` 참고)

## 동기

LLM 도구는 강력하지만 범위 표류와 반복이 잦습니다. PrePrompt는 다음을 실험하는 프로토타입입니다.

- 사람–AI 인터페이스 설계
- LLM 호출 전 구조화된 사고
- 토큰 효율적인 협업 모델
