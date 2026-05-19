/**
 * Server-side Q/A logging for agent proxies (Next.js API routes).
 * Writes to `log/agent.log` (project root) so agent traffic stays out of `log/server.log`.
 * Truncates by default to keep file size bounded; override with AGENT_QA_LOG_MAX_CHARS.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";

function maxChars(): number {
    const raw = process.env.AGENT_QA_LOG_MAX_CHARS?.trim();
    if (!raw) return 16_000;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 500_000) : 16_000;
}

function truncate(s: string, limit: number): string {
    if (s.length <= limit) return s;
    return `${s.slice(0, limit)}\n… [truncated ${s.length - limit} chars]`;
}

function appendAgentLogBlock(body: string): void {
    try {
        const logDir = path.join(process.cwd(), "log");
        mkdirSync(logDir, { recursive: true });
        const file = path.join(logDir, "agent.log");
        const stamp = new Date().toISOString();
        appendFileSync(file, `\n======== ${stamp} ========\n${body}`, "utf8");
    } catch (err) {
        console.error("[agent-qa] log/agent.log 쓰기 실패:", err);
    }
}

function geminiRequestSummary(googleBody: Record<string, unknown>): string {
    const blocks: string[] = [];
    const si = googleBody.systemInstruction as { parts?: { text?: string }[] } | undefined;
    const sysTexts = si?.parts?.map((p) => p.text).filter((t): t is string => typeof t === "string" && t.length > 0);
    if (sysTexts?.length) blocks.push(`[system]\n${sysTexts.join("\n")}`);
    const contents = googleBody.contents as { parts?: { text?: string }[] }[] | undefined;
    for (const c of contents ?? []) {
        const userTexts = c?.parts?.map((p) => p.text).filter((t): t is string => typeof t === "string" && t.length > 0);
        if (userTexts?.length) blocks.push(`[user]\n${userTexts.join("\n")}`);
    }
    return blocks.length ? blocks.join("\n\n") : JSON.stringify(googleBody, null, 2);
}

function geminiResponseAnswer(data: unknown): string {
    const c = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0];
    const text = c?.content?.parts?.map((p) => p.text).find((t) => typeof t === "string" && t.length > 0);
    if (typeof text === "string") return text;
    try {
        return JSON.stringify(data, null, 2);
    } catch {
        return String(data);
    }
}

export function logCursorAgentQa(params: {
    model?: string;
    question: string;
    answer: string;
    stderr?: string | null;
}): void {
    const limit = maxChars();
    const meta = params.model?.trim() ? ` model=${params.model.trim()}` : "";
    const stderr =
        typeof params.stderr === "string" && params.stderr.trim()
            ? `\n--- stderr ---\n${truncate(params.stderr.trim(), Math.min(4000, limit))}`
            : "";
    appendAgentLogBlock(
        `[agent-qa] agent=cursor-agent${meta}\n--- question ---\n${truncate(params.question, limit)}\n--- answer ---\n${truncate(params.answer, limit)}${stderr}\n`
    );
}

export function logGeminiAgentQa(params: {
    model: string;
    googleBody: Record<string, unknown>;
    responseJson: unknown;
}): void {
    const limit = maxChars();
    const q = truncate(geminiRequestSummary(params.googleBody), limit);
    const a = truncate(geminiResponseAnswer(params.responseJson), limit);
    appendAgentLogBlock(`[agent-qa] agent=gemini model=${params.model}\n--- question ---\n${q}\n--- answer ---\n${a}\n`);
}
