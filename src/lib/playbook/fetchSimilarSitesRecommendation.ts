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
    "공개 HTTPS 참고 사이트를 5~8개 제안하는 조력자입니다.",
    "주제: LLM 전달·프롬프트·토큰·에이전트 하네스·IDE 규칙·SPEC 등.",
    "사용자가 고른 채널·맥락에 맞춰 공식 문서·가이드를 우선합니다.",
    "",
    "규칙:",
    "- 한국어만.",
    "- 공식에 가까운 URL만. 깊은 경로·지어낸 URL 금지.",
    "- 항목마다: 제목 한 줄, URL 한 줄(https://), 이 독자에게 맞는 이유 한 문장.",
    "- 로그인 전용만 추천하지 않음.",
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
  const head = "플레이북 선택값입니다. 채널·맥락을 반영해 참고 사이트를 제안하세요.";

  return stripMarkdownBoldMarkers(
    [
      head,
      "",
      lines.join("\n"),
      "",
      "태그:",
      tags.length ? tags.join(", ") : "(없음)",
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
