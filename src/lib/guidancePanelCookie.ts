const COOKIE_NAME = "preprompt_guidance_panel";

/** true = 패널 펼침, false = 접힘. 쿠키 없으면 null */
export function readGuidancePanelOpenFromCookie(): boolean | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`)
    );
    if (!match) return null;
    const raw = decodeURIComponent(match[1].trim());
    if (raw === "0") return true;
    if (raw === "1") return false;
    return null;
}

export function writeGuidancePanelOpenToCookie(open: boolean): void {
    if (typeof document === "undefined") return;
    const maxAgeSeconds = 365 * 24 * 60 * 60;
    const value = open ? "0" : "1";
    const secure = typeof location !== "undefined" && location.protocol === "https:";
    document.cookie = [
        `${COOKIE_NAME}=${encodeURIComponent(value)}`,
        `Max-Age=${maxAgeSeconds}`,
        "Path=/",
        "SameSite=Lax",
        ...(secure ? ["Secure"] : []),
    ].join("; ");
}
