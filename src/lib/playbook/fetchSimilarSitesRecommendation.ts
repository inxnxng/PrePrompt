import { HARNESS_GUIDE_STEPS, collectUserTags } from "@/lib/harnessGuideContent";
import { stripMarkdownBoldMarkers } from "@/lib/stripMarkdownBoldMarkers";
import type { LlmProvider } from "@/store/usePromptStore";

const GEMINI_MODEL = "gemini-2.5-flash";

function extractGeminiText(data: unknown): string {
  const c = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0];
  const reason = (c as { finishReason?: string } | undefined)?.finishReason;
  if (reason && reason !== "STOP" && reason !== "MAX_TOKENS") {
    throw new Error(`Generation blocked or empty (finishReason: ${reason})`);
  }
  const text = c?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new Error("No candidate text in model response");
  }
  return text;
}

function geminiUpstreamMessage(upstream: unknown): string | null {
  if (upstream === null || upstream === undefined) return null;
  if (typeof upstream === "string") {
    try {
      const o = JSON.parse(upstream) as { error?: { message?: unknown } };
      if (typeof o?.error?.message === "string" && o.error.message.trim()) return o.error.message.trim();
    } catch {
      const t = upstream.trim();
      return t.length ? t.slice(0, 2000) : null;
    }
    return null;
  }
  if (typeof upstream === "object") {
    const msg = (upstream as { error?: { message?: unknown } }).error?.message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  return null;
}

function cursorAgentUpstreamMessage(upstream: unknown): string | null {
  if (upstream === null || upstream === undefined) return null;
  if (typeof upstream === "string") {
    const t = upstream.trim();
    return t.length ? t.slice(0, 2000) : null;
  }
  if (typeof upstream === "object") {
    const o = upstream as { stderr?: unknown; stdout?: unknown };
    if (typeof o.stderr === "string" && o.stderr.trim()) return o.stderr.trim().slice(0, 2000);
    if (typeof o.stdout === "string" && o.stdout.trim()) return o.stdout.trim().slice(0, 2000);
  }
  return null;
}

function buildSystemInstruction(): string {
  return [
    "플레이북에서 고른 전달 방식과 비슷한 ‘실제 세계’ 서비스·기관의 공개 페이지를 5~8개 제안하는 조력자입니다.",
    "",
    "추천 범위(이 중에서 상황에 맞게 골라 다양하게):",
    "- 국내외 대형 쇼핑·마켓플레이스·가격비교(상품 설명·배송·교환·FAQ·고객센터 안내 문구·정책 페이지가 레퍼런스가 됨).",
    "- 공공·소비자·표준·백과(실제 이용자가 찾는 안내·용어·분쟁·품질 정보).",
    "- 일반 사용자 규모의 커뮤니티·Q&A·위키(주제가 맞을 때만).",
    "- 사용자 선택에 특정 제품·채널(예: Slack, GitHub, Notion)이 분명히 드러나면 그 서비스의 공식 도움말·정책·개발자 문서는 허용.",
    "",
    "금지·회피:",
    "- 생성형 AI·LLM 챗봇·AI 코딩 에이전트·프롬프트 마켓 등 ‘AI 제품 홈/랜딩’ 위주로 채우지 말 것. (사용자가 그 도구를 직접 고른 경우에만 예외적으로 0~1개.)",
    "- 지어낸 URL, 존재 불명확한 깊은 경로, 짧은 추천 링크·리다이렉터만 있는 주소.",
    "",
    "이유 작성:",
    "- 각 이유 문장은 반드시 아래에 주어진 ‘질문—선택 라벨’ 또는 태그 중 구체 표현을 인용·요약해 연결할 것. (막연한 ‘도움이 됩니다’ 금지.)",
    "",
    "형식:",
    "- 한국어만.",
    "- 항목마다: 제목 한 줄, URL 한 줄(https://, 공개 접근 가능한 루트 또는 잘 알려진 상위 경로), 위 연결 규칙을 지킨 이유 한 문장.",
    "- 로그인 없이 대부분 열람 가능한 페이지 위주.",
  ].join("\n");
}

function buildUserContent(picked: (string | null)[]): string {
  const lines: string[] = [];
  for (let i = 0; i < HARNESS_GUIDE_STEPS.length; i += 1) {
    const step = HARNESS_GUIDE_STEPS[i];
    const id = picked[i];
    const opt = step.options.find((o) => o.id === id);
    if (opt) {
      lines.push(`${i + 1}. ${step.question} — ${opt.label}`);
    }
  }
  const ids = picked.filter((x): x is string => typeof x === "string" && x.length > 0);
  const tags = collectUserTags(ids);
  const head =
    "아래는 사용자가 플레이북에서 고른 질문별 답입니다. 이 선택들과 같은 ‘전달·안내·정책·협업 방식’을 실제로 쓰는 대중적 서비스·기관 사이트를 제안하세요.";

  return stripMarkdownBoldMarkers(
    [
      head,
      "",
      lines.join("\n"),
      "",
      "태그:",
      tags.length ? tags.join(", ") : "(없음)",
      "",
      "요구: 추천 목록의 과반은 쇼핑·거래·공공·백과·일반 웹 서비스 중에서 고르고, 각 사이트의 이유는 위 질문/답 라벨 중 최소 한 가지를 직접 언급해 연결할 것.",
    ].join("\n")
  );
}

async function postGeminiPlain(systemInstruction: string, userText: string, apiKey: string): Promise<string> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey.trim(),
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.25 },
    }),
  });
  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Gemini proxy returned non-JSON (${res.status}): ${raw.slice(0, 300)}`);
  }
  if (!res.ok) {
    const envelope = data as { error?: string; upstream?: unknown };
    const upstream = envelope.upstream;
    if (upstream !== undefined && upstream !== null) {
      const msg = geminiUpstreamMessage(upstream);
      if (msg) throw new Error(msg);
    }
    const head =
      typeof envelope.error === "string" && envelope.error.trim()
        ? envelope.error.trim()
        : `HTTP ${res.status}`;
    throw new Error(head);
  }
  return extractGeminiText(data);
}

async function postCursorAgentPlain(prompt: string): Promise<string> {
  const res = await fetch("/api/cursor-agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Cursor-Agent proxy returned non-JSON (${res.status}): ${raw.slice(0, 300)}`);
  }
  if (!res.ok) {
    const envelope = data as { error?: string; upstream?: unknown };
    const upstream = envelope.upstream;
    if (upstream !== undefined && upstream !== null) {
      const msg = cursorAgentUpstreamMessage(upstream);
      if (msg) throw new Error(msg);
    }
    const head =
      typeof envelope.error === "string" && envelope.error.trim() ? envelope.error.trim() : `HTTP ${res.status}`;
    throw new Error(head);
  }
  const r = data as { output?: unknown };
  if (typeof r.output !== "string") {
    throw new Error("Cursor-Agent proxy: missing output field");
  }
  return r.output;
}

export const MISSING_GEMINI_KEY = "MISSING_GEMINI_KEY";

/**
 * One-shot call to the same backends as Auto-Structure: Gemini (API key) or local cursor-agent.
 */
export async function fetchSimilarSitesRecommendation(params: {
  provider: LlmProvider;
  apiKey: string;
  picked: (string | null)[];
}): Promise<string> {
  const system = buildSystemInstruction();
  const user = buildUserContent(params.picked);

  if (params.provider === "cursorAgent") {
    const prompt = `${system}\n\n---\n\n${user}`;
    const out = await postCursorAgentPlain(prompt);
    return out.trim();
  }

  if (!params.apiKey.trim()) {
    throw new Error(MISSING_GEMINI_KEY);
  }

  const out = await postGeminiPlain(system, user, params.apiKey);
  return out.trim();
}
