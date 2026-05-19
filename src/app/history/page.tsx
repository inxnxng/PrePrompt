"use client";

import { HandoffAgentTargetSelect } from "@/components/HandoffAgentTargetSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    buildHandoffZipBlob,
    DEFAULT_HANDOFF_TARGET,
    downloadFile,
    handoffZipFilename,
    type HandoffAgentTarget,
} from "@/lib/exports";
import { readHandoffDisplayName, writeHandoffDisplayName } from "@/lib/handoffDisplayName";
import type { HandoffHistoryListItem } from "@/lib/handoffHistoryTypes";
import { t } from "@/lib/i18n";
import { usePromptStore, type HandoffHistorySnapshot } from "@/store/usePromptStore";
import { ArrowLeftIcon, DownloadIcon, HistoryIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type FilterMode = "all" | "mine";

function formatWhen(ms: number): string {
    try {
        return new Date(ms).toLocaleString("ko-KR", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return "—";
    }
}

function formatWhenShort(ms: number): string {
    try {
        return new Date(ms).toLocaleString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

export default function HistoryPage() {
    const router = useRouter();
    const applyHistorySnapshot = usePromptStore((s) => s.applyHistorySnapshot);
    const [items, setItems] = useState<HandoffHistoryListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterMode>("all");
    const [displayName, setDisplayName] = useState("");
    const [zipTarget, setZipTarget] = useState<HandoffAgentTarget>(DEFAULT_HANDOFF_TARGET);
    const [rowBusy, setRowBusy] = useState<string | null>(null);
    const [selected, setSelected] = useState<HandoffHistoryListItem | null>(null);
    const [previewSnippet, setPreviewSnippet] = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);

    const loadList = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const res = await fetch("/api/handoff-history", { method: "GET" });
            const data = (await res.json()) as { items?: HandoffHistoryListItem[]; error?: string };
            if (!res.ok) {
                setFetchError(data.error ?? t.historyLoadError);
                setItems([]);
                return;
            }
            setItems(Array.isArray(data.items) ? data.items : []);
        } catch {
            setFetchError(t.historyLoadError);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setDisplayName(readHandoffDisplayName());
        void loadList();
    }, [loadList]);

    useEffect(() => {
        if (!selected) {
            setPreviewSnippet("");
            setPreviewLoading(false);
            return;
        }
        const ac = new AbortController();
        setPreviewLoading(true);
        setPreviewSnippet("");
        void fetch(`/api/handoff-history/${encodeURIComponent(selected.id)}`, { signal: ac.signal })
            .then((r) => r.json() as Promise<{ snapshot?: { naturalPrompt?: string } }>)
            .then((d) => {
                const np = typeof d.snapshot?.naturalPrompt === "string" ? d.snapshot.naturalPrompt.trim() : "";
                if (!np) setPreviewSnippet("");
                else setPreviewSnippet(np.length > 520 ? `${np.slice(0, 517)}…` : np);
            })
            .catch(() => {
                if (!ac.signal.aborted) setPreviewSnippet("");
            })
            .finally(() => {
                if (!ac.signal.aborted) setPreviewLoading(false);
            });
        return () => ac.abort();
    }, [selected]);

    const visible = useMemo(() => {
        if (filter !== "mine") return items;
        const mine = displayName.trim();
        if (!mine) return items;
        return items.filter((i) => i.authorName.trim() === mine);
    }, [items, filter, displayName]);

    const handleMineNameBlur = () => {
        writeHandoffDisplayName(displayName);
    };

    const handleLoad = async (id: string) => {
        setRowBusy(id);
        try {
            const res = await fetch(`/api/handoff-history/${encodeURIComponent(id)}`, { method: "GET" });
            const data = (await res.json()) as { snapshot?: unknown; error?: string };
            if (!res.ok || !data.snapshot || typeof data.snapshot !== "object") {
                setFetchError(data.error ?? t.historyLoadError);
                return;
            }
            setSelected(null);
            applyHistorySnapshot(data.snapshot as HandoffHistorySnapshot);
            router.push("/result");
        } catch {
            setFetchError(t.historyLoadError);
        } finally {
            setRowBusy(null);
        }
    };

    const handleZip = async (id: string) => {
        setRowBusy(id);
        try {
            const inc = await fetch(`/api/handoff-history/${encodeURIComponent(id)}/download`, {
                method: "POST",
            });
            const incJson = (await inc.json()) as { downloadCount?: number; error?: string };
            if (!inc.ok) {
                setFetchError(incJson.error ?? t.historyLoadError);
                return;
            }
            const nextCount = incJson.downloadCount;
            if (typeof nextCount === "number") {
                setItems((prev) => prev.map((i) => (i.id === id ? { ...i, downloadCount: nextCount } : i)));
                setSelected((s) => (s?.id === id ? { ...s, downloadCount: nextCount } : s));
            }
            const res = await fetch(`/api/handoff-history/${encodeURIComponent(id)}`, { method: "GET" });
            const data = (await res.json()) as { snapshot?: HandoffHistorySnapshot };
            if (!res.ok || !data.snapshot) {
                setFetchError(t.historyLoadError);
                return;
            }
            const model = { ...data.snapshot, apiKey: "", isGenerating: false };
            downloadFile(buildHandoffZipBlob(model, zipTarget, { archetypeId: null }), handoffZipFilename(zipTarget));
        } catch {
            setFetchError(t.historyLoadError);
        } finally {
            setRowBusy(null);
        }
    };

    const detailOpen = selected !== null;
    const busyThis = selected && rowBusy === selected.id;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-3 sm:px-6">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t.historyBackHome}
                    </Link>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/result">{t.historyBackResult}</Link>
                </Button>
            </header>

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <HistoryIcon className="h-7 w-7 shrink-0 opacity-90" aria-hidden />
                            {t.historyPageTitle}
                        </h1>
                        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.historyPageSubtitle}</p>
                        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground/90">{t.historyServerNote}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 shrink-0"
                        onClick={() => void loadList()}
                        disabled={loading}
                    >
                        <RefreshCwIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
                        {t.historyRefresh}
                    </Button>
                </div>

                <Card className="border-border/90 shadow-sm">
                    <CardHeader className="space-y-1 border-b border-border/60 bg-muted/20 px-4 py-3.5 sm:px-5">
                        <CardTitle className="text-base">{t.historyPanelTitle}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{t.historyPanelDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 py-4 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={filter === "all" ? "default" : "outline"}
                                onClick={() => setFilter("all")}
                            >
                                {t.historyFilterAll}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={filter === "mine" ? "default" : "outline"}
                                onClick={() => setFilter("mine")}
                            >
                                {t.historyFilterMine}
                            </Button>
                        </div>
                        {filter === "mine" ? (
                            <label className="flex max-w-md flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">{t.historyDisplayNameBanner}</span>
                                <input
                                    type="text"
                                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    onBlur={handleMineNameBlur}
                                    maxLength={80}
                                    spellCheck={false}
                                />
                                <span className="text-[11px] text-muted-foreground">{t.historySetNameHint}</span>
                            </label>
                        ) : null}
                        <label className="flex max-w-md flex-col gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">{t.exportHandoffTarget}</span>
                            <HandoffAgentTargetSelect value={zipTarget} onChange={setZipTarget} t={t} />
                            <span className="text-[11px] text-muted-foreground">{t.exportHandoffZipHint}</span>
                        </label>
                        <p className="text-[11px] text-muted-foreground">{t.historyBoardHint}</p>
                    </CardContent>
                </Card>

                {fetchError ? (
                    <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {fetchError}
                    </p>
                ) : null}

                <section aria-label={t.historyPageTitle}>
                    {loading ? (
                        <p className="py-16 text-center text-sm text-muted-foreground">…</p>
                    ) : visible.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-border bg-muted/10 py-16 text-center text-sm text-muted-foreground">
                            {t.historyEmpty}
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {visible.map((row) => (
                                <li key={row.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(row)}
                                        className="group flex h-full w-full flex-col rounded-xl border border-border/90 bg-card p-4 text-left shadow-xs transition-colors hover:border-primary/35 hover:bg-muted/25 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                    >
                                        <span className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground group-hover:text-foreground">
                                            {row.title}
                                        </span>
                                        <span className="mt-2 text-xs text-muted-foreground">{row.authorName}</span>
                                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                                            <span className="text-[11px] tabular-nums text-muted-foreground">
                                                {formatWhenShort(row.createdAt)}
                                            </span>
                                            <Badge variant="secondary" className="shrink-0 gap-1 font-normal tabular-nums">
                                                <DownloadIcon className="h-3 w-3 opacity-80" aria-hidden />
                                                {row.downloadCount}
                                            </Badge>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            <Dialog open={detailOpen} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent
                    showCloseButton
                    className="gap-0 overflow-hidden p-0 sm:max-w-[min(26rem,calc(100vw-1.5rem)))]"
                >
                    {selected ? (
                        <>
                            <DialogHeader className="border-b border-border/80 px-5 py-4 pr-12 text-left">
                                <DialogTitle className="text-base leading-snug">{t.historyDetailTitle}</DialogTitle>
                                <p className="line-clamp-3 pt-1 text-sm font-medium text-foreground">{selected.title}</p>
                            </DialogHeader>
                            <div className="max-h-[min(55vh,22rem)] space-y-3 overflow-y-auto px-5 py-4">
                                <dl className="grid grid-cols-[5.5rem_1fr] gap-x-2 gap-y-2 text-xs sm:text-sm">
                                    <dt className="text-muted-foreground">{t.historyTableAuthor}</dt>
                                    <dd className="font-medium">{selected.authorName}</dd>
                                    <dt className="text-muted-foreground">{t.historyTableWhen}</dt>
                                    <dd className="tabular-nums text-muted-foreground">{formatWhen(selected.createdAt)}</dd>
                                    <dt className="text-muted-foreground">{t.historyTableDownloads}</dt>
                                    <dd className="tabular-nums font-medium">{selected.downloadCount}</dd>
                                </dl>
                                <Separator />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{t.historyDraftPreviewLabel}</p>
                                    <div className="mt-1.5 rounded-md border border-border/80 bg-muted/20 px-3 py-2.5">
                                        {previewLoading ? (
                                            <p className="text-xs text-muted-foreground">…</p>
                                        ) : (
                                            <p className="max-h-28 overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
                                                {previewSnippet || t.historyDraftPreviewEmpty}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="flex-col gap-2 border-t border-border/80 bg-muted/15 px-5 py-3 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    disabled={!!busyThis}
                                    onClick={() => void handleZip(selected.id)}
                                >
                                    {t.historyZipButton}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    disabled={!!busyThis}
                                    onClick={() => void handleLoad(selected.id)}
                                >
                                    {t.historyLoadButton}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
