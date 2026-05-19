/** Default TTL for cursor-agent model list (server memory + client sessionStorage). */
export const CURSOR_AGENT_MODELS_CATALOG_TTL_MS = 15 * 60 * 1000;

export function resolveCursorAgentModelsCatalogTtlMs(): number {
    const n = Number(process.env.CURSOR_AGENT_MODELS_CACHE_MS);
    return Number.isFinite(n) && n > 0 ? n : CURSOR_AGENT_MODELS_CATALOG_TTL_MS;
}
