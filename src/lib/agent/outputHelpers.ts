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
