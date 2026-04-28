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
import { Language, translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { LlmProvider } from "@/store/usePromptStore";
import { usePromptStore } from "@/store/usePromptStore";
import { Eye, EyeOff, SettingsIcon } from "lucide-react";
import { useState } from "react";

type SettingsModalProps = {
    /** Narrow sidebar: icon-only trigger */
    compact?: boolean;
    /** Left sidebar footer row: align with adjacent ghost buttons */
    triggerClassName?: string;
};

export function SettingsModal({ compact = false, triggerClassName }: SettingsModalProps) {
    const { apiKey, language, compactPlanning, llmProvider, setField } = usePromptStore();
    const [open, setOpen] = useState(false);
    const [tempKey, setTempKey] = useState(apiKey);
    const [tempLang, setTempLang] = useState<Language>(language);
    const [tempCompact, setTempCompact] = useState(compactPlanning);
    const [tempProvider, setTempProvider] = useState<LlmProvider>(llmProvider);
    const [showApiKey, setShowApiKey] = useState(false);

    const handleSave = () => {
        setField("apiKey", tempKey);
        setField("language", tempLang);
        setField("compactPlanning", tempCompact);
        setField("llmProvider", tempProvider);
        setOpen(false);
    };

    const handleOpen = (val: boolean) => {
        if (val) {
            setTempKey(apiKey);
            setTempLang(language);
            setTempCompact(compactPlanning);
            setTempProvider(llmProvider);
            setShowApiKey(false);
        } else {
            setShowApiKey(false);
        }
        setOpen(val);
    };

    const tShell = translations[language];
    const t = translations[tempLang];

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={compact ? "icon" : "sm"}
                    aria-label={compact ? tShell.settings : undefined}
                    className={cn(
                        triggerClassName ??
                            (compact
                                ? "h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                                : "w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground")
                    )}
                >
                    <SettingsIcon className="h-4 w-4" />
                    {compact ? null : tShell.settings}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t.settingsTitle}</DialogTitle>
                    <DialogDescription>
                        {t.settingsDesc}
                        <br /><br />
                        <strong className="text-foreground">Security Note:</strong> {t.settingsSecurity}
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
                                onClick={() => setTempProvider("cursorAgent")}
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
                        <div className="rounded-md border border-border bg-muted/20 px-3 py-2.5">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{t.cursorAgentHint}</p>
                        </div>
                    )}

                    {/* Compact planning */}
                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={tempCompact}
                                onChange={(e) => setTempCompact(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-input"
                            />
                            <span>
                                <span className="text-sm font-medium block">{t.compactPlanning}</span>
                                <span className="text-[11px] text-muted-foreground leading-snug">{t.compactPlanningHint}</span>
                            </span>
                        </label>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                        <label className="text-sm font-medium">
                            {t.language}
                        </label>
                        <div className="flex bg-muted/50 p-1 rounded-md">
                            <button
                                onClick={() => setTempLang("en")}
                                className={`flex-1 text-sm py-1.5 rounded-sm transition-all ${tempLang === "en" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setTempLang("ko")}
                                className={`flex-1 text-sm py-1.5 rounded-sm transition-all ${tempLang === "ko" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                한국어
                            </button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        {t.cancel}
                    </Button>
                    <Button onClick={handleSave}>{t.saveChanges}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
