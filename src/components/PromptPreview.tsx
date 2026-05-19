"use client";

import { Button } from "@/components/ui/button";
import { Translation } from "@/lib/i18n";
import { CognitiveModel, compileToPrompt } from "@/store/usePromptStore";
import { CheckIcon, CopyIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

type Props = {
    model: CognitiveModel;
    t: Translation;
};

const SECTION_KEYS: (keyof Translation["sectionLabels"])[] = [
    "intentLock",
    "realityAnchor",
    "constraintCage",
    "actionSlice",
    "responseContract",
];

export function PromptPreview({ model, t }: Props) {
    const [copied, setCopied] = useState(false);

    const compiled = compileToPrompt(model);
    const isEmpty = compiled.trim() === "";
    const intent = model.deepPlan?.intentRouting;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(compiled);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-muted/30 to-background">
            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-4 p-4 pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 px-0.5">
                            <p className="min-w-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {t.previewSectionsHeading}
                            </p>
                            <Button
                                variant="default"
                                size="sm"
                                className="h-8 shrink-0 gap-1.5 px-3 text-xs shadow-sm"
                                disabled={isEmpty}
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon className="h-3.5 w-3.5" />
                                        {t.copied}
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon className="h-3.5 w-3.5" />
                                        {t.copy}
                                    </>
                                )}
                            </Button>
                        </div>
                        {intent && !isEmpty && (
                            <div className="flex flex-wrap items-center gap-2 px-0.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                                    <SparklesIcon className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
                                    <span className="text-foreground">{intent.category}</span>
                                    <span className="font-mono tabular-nums opacity-70">{(intent.confidence01 * 100).toFixed(0)}%</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground">{t.intentLabel}</span>
                            </div>
                        )}
                        {isEmpty ? (
                            <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-8">
                                <p className="max-w-[220px] text-center text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                    {t.fillStages}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {SECTION_KEYS.map((key) => {
                                    const val = model[key] as string;
                                    if (!val || typeof val !== "string" || !val.trim()) return null;
                                    return (
                                        <div key={key} className="rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-xs">
                                            <p className="mb-2 border-b border-border/50 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                                {t.sectionLabels[key]}
                                            </p>
                                            <pre className="max-h-48 overflow-y-auto text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap">
                                                {val}
                                            </pre>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
