/**
 * Post-process LLM handoff strings: no markdown bold markers, no decorative emoji.
 * Used on deep-plan JSON strings, five-field values, and plain per-slot agent output.
 */
export function sanitizeLlmOutputText(s: string): string {
    if (!s) return s;
    let t = s.replace(/\*\*/g, "");
    t = t.replace(/\p{Extended_Pictographic}/gu, "");
    return t.trim();
}
