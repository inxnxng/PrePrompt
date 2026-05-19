"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CURSOR_AGENT_MODELS_CATALOG_TTL_MS } from "@/lib/cursorAgentModelsCatalog";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { LlmProvider } from "@/store/usePromptStore";
import { usePromptStore } from "@/store/usePromptStore";
import { Eye, EyeOff, RotateCcwIcon, SettingsIcon } from "lucide-react";
import { useCallback, useState } from "react";

type SettingsModalProps = {
    /** Narrow sidebar: icon-only trigger */
    compact?: boolean;
    /** Left sidebar footer row: align with adjacent ghost buttons */
    triggerClassName?: string;
    /** Clear prompt fields + step progress (API key kept) */
    onResetSession?: () => void;
};

const CLIENT_CURSOR_MODELS_CACHE_KEY = "preprompt-cursor-models-catalog-v1";

type CursorCatalogModel = { id: string; label: string };

function readClientCursorModelsCache(): CursorCatalogModel[] | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(CLIENT_CURSOR_MODELS_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { exp?: unknown; models?: unknown };
        const exp = typeof parsed.exp === "number" ? parsed.exp : 0;
        if (exp <= Date.now() || !Array.isArray(parsed.models)) return null;
        const models = parsed.models.filter((x): x is CursorCatalogModel => {
            if (x === null || typeof x !== "object") return false;
            const o = x as { id?: unknown; label?: unknown };
            return typeof o.id === "string" && typeof o.label === "string";
        });
        return models.length ? models : null;
    } catch {
        return null;
    }
}

function writeClientCursorModelsCache(models: CursorCatalogModel[]): void {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(
            CLIENT_CURSOR_MODELS_CACHE_KEY,
            JSON.stringify({ exp: Date.now() + CURSOR_AGENT_MODELS_CATALOG_TTL_MS, models })
        );
    } catch {
        /* ignore quota / private mode */
    }
}

export function SettingsModal({ compact = false, triggerClassName, onResetSession }: SettingsModalProps) {
    const { apiKey, llmProvider, cursorAgentModel, setField } = usePromptStore();
    const [open, setOpen] = useState(false);
    const [resetStep, setResetStep] = useState<"idle" | "confirm">("idle");
    const [tempKey, setTempKey] = useState(apiKey);
    const [tempProvider, setTempProvider] = useState<LlmProvider>(llmProvider);
    const [tempCursorAgentModel, setTempCursorAgentModel] = useState(cursorAgentModel);
    const [cursorModels, setCursorModels] = useState<{ id: string; label: string }[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsLoadError, setModelsLoadError] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);

    const handleSave = () => {
        setField("apiKey", tempKey);
        setField("llmProvider", tempProvider);
        setField("cursorAgentModel", tempCursorAgentModel);
        setOpen(false);
    };

    const fetchCursorModels = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh) {
            const cached = readClientCursorModelsCache();
            if (cached?.length) {
                setModelsLoadError(null);
                setCursorModels(cached);
                return;
            }
        }

        setModelsLoading(true);
        setModelsLoadError(null);
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
            const models = arr.filter((x): x is { id: string; label: string } => {
                if (x === null || typeof x !== "object") return false;
                const o = x as { id?: unknown; label?: unknown };
                return typeof o.id === "string" && typeof o.label === "string";
            });
            setCursorModels(models);
            if (models.length) writeClientCursorModelsCache(models);
        } catch (e) {
            if (!forceRefresh) {
                setCursorModels([]);
            }
            setModelsLoadError(e instanceof Error ? e.message : t.cursorAgentModelsError);
        } finally {
            setModelsLoading(false);
        }
    }, []);

    const handleOpen = (val: boolean) => {
        if (val) {
            setTempKey(apiKey);
            setTempProvider(llmProvider);
            setTempCursorAgentModel(cursorAgentModel);
            setShowApiKey(false);
            setResetStep("idle");
            setModelsLoadError(null);
            if (llmProvider === "cursorAgent") {
                void fetchCursorModels();
            }
        } else {
            setShowApiKey(false);
            setResetStep("idle");
        }
        setOpen(val);
    };

    const handleConfirmReset = () => {
        onResetSession?.();
        setOpen(false);
        setResetStep("idle");
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={compact ? "icon" : "sm"}
                    aria-label={compact ? t.settings : undefined}
                    className={cn(
                        triggerClassName ??
                        (compact
                            ? "h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                            : "w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground")
                    )}
                >
                    <SettingsIcon className="h-4 w-4" />
                    {compact ? null : t.settings}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {resetStep === "confirm" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t.resetConfirmTitle}</DialogTitle>
                            <DialogDescription>{t.resetConfirmBody}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button type="button" variant="outline" onClick={() => setResetStep("idle")}>
                                {t.cancel}
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleConfirmReset}>
                                {t.resetAll}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>{t.settingsTitle}</DialogTitle>
                            <DialogDescription>
                                {tempProvider === "cursorAgent" ? (
                                    t.settingsDescCursorAgent
                                ) : (
                                    <>
                                        {t.settingsDesc}
                                        <br /><br />
                                        <strong className="text-foreground">Security Note:</strong>{" "}
                                        {t.settingsSecurity}
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            {/* LLM provider */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">{t.llmProvider}</label>
                                <div className="flex bg-muted/50 p-1 rounded-md">
                                    <button
                                        type="button"
                                        onClick={() => setTempProvider("gemini")}
                                        className={`flex-1 text-sm py-1.5 rounded-sm transition-all ${tempProvider === "gemini" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {t.llmProviderGemini}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTempProvider("cursorAgent");
                                            void fetchCursorModels();
                                        }}
                                        className={`flex-1 text-sm py-1.5 rounded-sm transition-all ${tempProvider === "cursorAgent" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {t.llmProviderCursorAgent}
                                    </button>
                                </div>
                            </div>

                            {/* API Key — Gemini only */}
                            {tempProvider === "gemini" ? (
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="gemini-api-key" className="text-sm font-medium">
                                        {t.geminiApiKey}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="gemini-api-key"
                                            type={showApiKey ? "text" : "password"}
                                            placeholder={t.geminiApiKeyPlaceholder}
                                            value={tempKey}
                                            onChange={(e) => setTempKey(e.target.value)}
                                            autoComplete="off"
                                            className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-3 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0.5 top-1/2 h-9 w-9 -translate-y-1/2 shrink-0 text-muted-foreground hover:text-foreground"
                                            aria-label={showApiKey ? t.geminiApiKeyHide : t.geminiApiKeyShow}
                                            aria-pressed={showApiKey}
                                            onClick={() => setShowApiKey((v) => !v)}
                                        >
                                            {showApiKey ? (
                                                <EyeOff className="h-4 w-4" aria-hidden />
                                            ) : (
                                                <Eye className="h-4 w-4" aria-hidden />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {t.geminiApiKeyHintBefore}
                                        <a
                                            href="https://aistudio.google.com/api-keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline underline-offset-2 hover:opacity-90"
                                        >
                                            https://aistudio.google.com/api-keys
                                        </a>
                                        {t.geminiApiKeyHintAfter}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <label htmlFor="cursor-agent-model" className="text-sm font-medium">
                                            {t.cursorAgentModel}
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 shrink-0 text-xs"
                                            disabled={modelsLoading}
                                            onClick={() => void fetchCursorModels(true)}
                                        >
                                            {modelsLoading ? t.cursorAgentModelsLoading : t.cursorAgentModelRefresh}
                                        </Button>
                                    </div>
                                    <select
                                        id="cursor-agent-model"
                                        value={tempCursorAgentModel}
                                        onChange={(e) => setTempCursorAgentModel(e.target.value)}
                                        disabled={modelsLoading && cursorModels.length === 0}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">{t.cursorAgentModelDefault}</option>
                                        {tempCursorAgentModel &&
                                            !cursorModels.some((m) => m.id === tempCursorAgentModel) ? (
                                            <option value={tempCursorAgentModel}>{tempCursorAgentModel}</option>
                                        ) : null}
                                        {cursorModels.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                    {modelsLoadError ? (
                                        <p className="text-[11px] text-destructive leading-relaxed">{modelsLoadError}</p>
                                    ) : null}
                                </div>
                            )}

                            {onResetSession ? (
                                <div className="flex flex-col gap-3 border-t border-border pt-4">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{t.settingsResetSection}</p>
                                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                            {t.settingsResetHint}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setResetStep("confirm")}
                                    >
                                        <RotateCcwIcon className="h-4 w-4" aria-hidden />
                                        {t.resetAll}
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button onClick={handleSave}>{t.saveChanges}</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
