import { sanitizeLlmOutputText } from "@/lib/sanitizeLlmOutput";

/** Prevent React/textarea from showing "[object Object]" when the model returns nested JSON for a string field. */
export function normalizeStructuredStringField(v: unknown): string {
    if (typeof v === "string") return v;
    if (v == null) return "";
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return "";
    }
}

export function sumNullableTokenParts(parts: (number | null)[]): number | null {
    let sum = 0;
    let any = false;
    for (const p of parts) {
        if (typeof p === "number") {
            sum += p;
            any = true;
        }
    }
    return any ? sum : null;
}

export function sanitizePlainStageOutput(s: string): string {
    let t = s.trim();
    if (t.startsWith("```")) {
        const nl = t.indexOf("\n");
        if (nl !== -1) t = t.slice(nl + 1);
        const close = t.lastIndexOf("```");
        if (close !== -1) t = t.slice(0, close);
    }
    return sanitizeLlmOutputText(t.trim());
}

/** Strip a lone first-line title models echo (UI already labels this slot). */
function stripMarkdownHeadingPrefix(line: string): string {
    return line.replace(/^#{1,6}\s+/, "").trim();
}

function isActionSliceMetaTitleLine(line: string): boolean {
    const x = stripMarkdownHeadingPrefix(line);
    if (x.length === 0 || x.length > 140) return false;
    // Avoid stripping real sentences (rough heuristic).
    if (/[.!?…]/.test(x) && x.length > 40) return false;

    const patterns: RegExp[] = [
        /^범위\s*[\(（]\s*이번\s*(?:핸드오프|전달)\s*[\)）]\s*$/i,
        /^[\(（]\s*이번\s*(?:핸드오프|전달)\s*[\)）]\s*범위\s*$/i,
        /^이번\s*(?:핸드오프|전달)\s*범위\s*$/i,
        /^핸드오프\s*범위\s*$/i,
        /^이번\s*작업\s*범위\s*$/i,
        /^handoff\s*scope\s*$/i,
        /^scope\s*\(\s*this\s*handoff\s*\)\s*$/i,
    ];
    return patterns.some((re) => re.test(x));
}

/** Models often prefix actionSlice with a redundant heading; remove one matching line at the top. */
export function stripActionSliceEchoHeading(s: string): string {
    const t = s.trim();
    if (!t) return t;
    const lines = t.split(/\r?\n/);
    let i = 0;
    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) return t;
    if (!isActionSliceMetaTitleLine(lines[i])) return t;
    return lines.slice(i + 1).join("\n").trim();
}
