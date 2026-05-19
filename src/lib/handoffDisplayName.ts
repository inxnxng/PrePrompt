export const HANDOFF_DISPLAY_NAME_KEY = "preprompt-handoff-display-name";

export function readHandoffDisplayName(): string {
    if (typeof window === "undefined") return "";
    try {
        return localStorage.getItem(HANDOFF_DISPLAY_NAME_KEY)?.trim() ?? "";
    } catch {
        return "";
    }
}

export function writeHandoffDisplayName(name: string): void {
    if (typeof window === "undefined") return;
    try {
        const t = name.trim();
        if (t) localStorage.setItem(HANDOFF_DISPLAY_NAME_KEY, t);
        else localStorage.removeItem(HANDOFF_DISPLAY_NAME_KEY);
    } catch {
        /* ignore */
    }
}
