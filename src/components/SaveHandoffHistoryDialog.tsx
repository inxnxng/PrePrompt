"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toHandoffHistorySnapshot } from "@/lib/handoffClientSnapshot";
import { readHandoffDisplayName, writeHandoffDisplayName } from "@/lib/handoffDisplayName";
import type { Translation } from "@/lib/i18n";
import type { CognitiveModel } from "@/store/usePromptStore";
import { useState } from "react";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    model: CognitiveModel;
    t: Translation;
};

const inputClass =
    "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50";

export function SaveHandoffHistoryDialog({ open, onOpenChange, model, t }: Props) {
    const [authorName, setAuthorName] = useState(() => readHandoffDisplayName());
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setError(null);
        const author = authorName.trim();
        if (!author) {
            setError(t.historySaveAuthorRequired);
            return;
        }
        writeHandoffDisplayName(author);
        setSaving(true);
        try {
            const res = await fetch("/api/handoff-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    authorName: author,
                    title: title.trim() || undefined,
                    snapshot: toHandoffHistorySnapshot(model),
                }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string; id?: string };
            if (!res.ok) {
                setError(data.error ?? t.historySaveError);
                return;
            }
            onOpenChange(false);
        } catch {
            setError(t.historySaveError);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.historySaveDialogTitle}</DialogTitle>
                    <DialogDescription className="text-left">{t.historySaveDialogDesc}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-1">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">{t.historyAuthorLabel}</span>
                        <input
                            type="text"
                            className={inputClass}
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder={t.historyAuthorPlaceholder}
                            maxLength={80}
                            autoComplete="nickname"
                            spellCheck={false}
                        />
                        <span className="text-[11px] text-muted-foreground">{t.historyAuthorHint}</span>
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">{t.historyTitleLabel}</span>
                        <input
                            type="text"
                            className={inputClass}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t.historyTitlePlaceholder}
                            maxLength={200}
                            spellCheck={false}
                        />
                    </label>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        {t.cancel}
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={saving}>
                        {saving ? t.historySaving : t.historySaveSubmit}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
