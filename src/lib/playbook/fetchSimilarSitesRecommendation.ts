import { HARNESS_GUIDE_STEPS, collectUserTags } from "@/lib/harnessGuideContent";
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
    "당신은 소프트웨어 엔지니어가 실제로 브라우저에서 열 수 있는 공개 HTTPS 사이트를 찾도록 돕는 조력자입니다.",
    "주제: 구조화된 LLM 전달(handoff), 프롬프트·토큰 예산, 에이전트 하네스, Cursor/IDE 규칙, SPEC·문서화 등.",
    "사용자가 고른 채널·주제(예: IDE, 팀 채팅, 티켓, 고객 대면, 위키, 실시간 회의)에 맞춰, 그 맥락에서 실무에 통하는 공식 문서·가이드를 우선 추천하세요.",
    "",
    "규칙:",
    "- 한국어로만 답합니다.",
    "- **확실하거나 공식 루트에 가까운 URL만** 제안합니다. 존재를 장담할 수 없는 깊은 경로는 넣지 마세요.",
    "- 5~8개 항목. 각 항목: 제목 한 줄, 다음 줄에 전체 URL(https://…), 다음 줄에 이 독자 프로필에 맞는 이유 한 문장.",
    "- URL을 지어내지 마세요. 웹 검색 도구가 없다면 학습 데이터에 있는 유명 공식 문서·가이드 위주로 제한하세요.",
    "- 로그인 필수만 있는 서비스를 유일한 추천으로 두지 마세요.",
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
    "아래는 사용자가 플레이북에서 고른 값입니다. 첫 줄 근처의 채널·주제를 특히 반영해, 그 맥락에 맞는 참고 사이트를 제안하세요.";

  return [
    head,
    "",
    lines.join("\n"),
    "",
    "내부 태그 (참고):",
    tags.length ? tags.join(", ") : "(없음)",
  ].join("\n");
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
