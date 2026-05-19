"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CURSOR_AGENT_MODELS_CATALOG_TTL_MS } from "@/lib/cursorAgentModelsCatalog";
import { Translation } from "@/lib/i18n";
import type { CatalogModel } from "@/lib/modelRecommendationsFromCatalog";
import {
    analyzeImplementationProfile,
    buildPerformanceRationaleKo,
    buildValueRationaleKo,
    recommendModelsForImplementation,
} from "@/lib/modelRecommendationsFromCatalog";
import { CpuIcon, RefreshCwIcon, WalletIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const CLIENT_CURSOR_MODELS_CACHE_KEY = "preprompt-cursor-models-catalog-v1";

function readClientCursorModelsCache(): CatalogModel[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(CLIENT_CURSOR_MODELS_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { exp?: unknown; models?: unknown };
        const exp = typeof parsed.exp === "number" ? parsed.exp : 0;
        if (exp <= Date.now() || !Array.isArray(parsed.models)) return null;
        const models = parsed.models.filter((x): x is CatalogModel => {
            if (x === null || typeof x !== "object") return false;
            const o = x as { id?: unknown; label?: unknown };
            return typeof o.id === "string" && typeof o.label === "string";
        });
        return models.length ? models : null;
    } catch {
        return null;
    }
}

function writeClientCursorModelsCache(models: CatalogModel[]): void {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(
            CLIENT_CURSOR_MODELS_CACHE_KEY,
            JSON.stringify({ exp: Date.now() + CURSOR_AGENT_MODELS_CATALOG_TTL_MS, models })
        );
    } catch {
        /* ignore */
    }
}

type Props = {
    compiledPrompt: string;
    t: Translation;
};

export function ModelRecommendationsPanel({ compiledPrompt, t }: Props) {
    const profile = useMemo(() => analyzeImplementationProfile(compiledPrompt), [compiledPrompt]);

    const [models, setModels] = useState<CatalogModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const approxTokens = profile?.approxTokens ?? 0;

    const fetchModels = useCallback(async (forceRefresh: boolean) => {
        if (!forceRefresh) {
            const cached = readClientCursorModelsCache();
            if (cached?.length) {
                setError(null);
                setModels(cached);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        setError(null);
        try {
            const url = forceRefresh ? "/api/cursor-agent/models?refresh=1" : "/api/cursor-agent/models";
            const res = await fetch(url);
            const raw = await res.text();
            let data: unknown;
            try {
                data = JSON.parse(raw);
            } catch {
                throw new Error(raw.slice(0, 200));
            }
            if (!res.ok) {
                const e = data as { error?: string };
                throw new Error(typeof e.error === "string" && e.error.trim() ? e.error.trim() : `HTTP ${res.status}`);
            }
            const d = data as { models?: unknown };
            const arr = Array.isArray(d.models) ? d.models : [];
            const next = arr.filter((x): x is CatalogModel => {
                if (x === null || typeof x !== "object") return false;
                const o = x as { id?: unknown; label?: unknown };
                return typeof o.id === "string" && typeof o.label === "string";
            });
            setModels(next);
            if (next.length) writeClientCursorModelsCache(next);
        } catch (e) {
            setModels([]);
            setError(e instanceof Error ? e.message : t.cursorAgentModelsError);
        } finally {
            setLoading(false);
        }
    }, [t.cursorAgentModelsError]);

    useEffect(() => {
        if (!profile) {
            setLoading(false);
            return;
        }
        void fetchModels(false);
    }, [fetchModels, profile]);

    const picks = useMemo(() => {
        if (!profile || !models.length) return null;
        return recommendModelsForImplementation(models, profile);
    }, [models, profile]);

    if (!profile) {
        return null;
    }
    return (
        <Card className="border-border/90 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/20 px-4 py-3.5 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="text-base font-semibold">{t.resultModelRecommendationsTitle}</CardTitle>
                        <CardDescription className="text-xs leading-relaxed sm:text-sm">{t.resultModelRecommendationsDesc}</CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        disabled={loading}
                        onClick={() => void fetchModels(true)}
                    >
                        <RefreshCwIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
                        {t.resultModelsRefresh}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4 sm:px-5">
                {loading ? (
                    <p className="text-sm text-muted-foreground">{t.cursorAgentModelsLoading}</p>
                ) : error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : !picks ? (
                    <p className="text-sm text-muted-foreground">{t.resultModelsEmpty}</p>
                ) : (
                    <>
                        {approxTokens > 0 ? (
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                                <span className="font-medium text-foreground/85">{t.resultModelHarnessTokensApprox}</span>{" "}
                                <span className="tabular-nums text-foreground/90">~{approxTokens.toLocaleString("ko-KR")}</span>
                                {" "}
                                <span className="text-muted-foreground">{t.resultModelHarnessTokensHint}</span>
                            </p>
                        ) : null}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-border/80 bg-card/80 p-4 shadow-xs">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                    <CpuIcon className="h-4 w-4 text-primary" aria-hidden />
                                    {t.resultModelPerfTitle}
                                </div>
                                <p className="font-mono text-xs text-foreground/90">{picks.performance.id}</p>
                                <p className="mt-1 text-sm text-foreground">{picks.performance.label}</p>
                                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                                    {buildPerformanceRationaleKo(picks.performance, profile)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border/80 bg-card/80 p-4 shadow-xs">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                    <WalletIcon className="h-4 w-4 text-primary" aria-hidden />
                                    {t.resultModelValueTitle}
                                </div>
                                <p className="font-mono text-xs text-foreground/90">{picks.value.id}</p>
                                <p className="mt-1 text-sm text-foreground">{picks.value.label}</p>
                                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                                    {buildValueRationaleKo(picks.value, profile)}
                                </p>
                            </div>
                        </div>
                    </>
                )}
                {!loading && picks ? (
                    <p className="text-[11px] leading-relaxed text-muted-foreground border-t border-border/60 pt-3">
                        {t.resultModelsHeuristicNote}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
