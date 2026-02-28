"use client";

import { Button } from "@/components/ui/button";
import { CognitiveModel, compileToPrompt, estimateTokens } from "@/store/usePromptStore";
import { BarChart2Icon, CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

type Props = {
    model: CognitiveModel;
};

const SECTION_LABELS: { key: keyof CognitiveModel; label: string }[] = [
    { key: "intentLock", label: "Goal" },
    { key: "realityAnchor", label: "Current State" },
    { key: "constraintCage", label: "Constraints" },
    { key: "actionSlice", label: "Current Task" },
    { key: "responseContract", label: "Response Requirements" },
];

export function PromptPreview({ model }: Props) {
    const [copied, setCopied] = useState(false);
    const compiled = compileToPrompt(model);
    const isEmpty = compiled.trim() === "";

    const naturalTokens = estimateTokens(model.naturalPrompt);
    const compiledTokens = estimateTokens(compiled);
    const savedTokens = naturalTokens - compiledTokens;
    const isSaved = savedTokens > 0;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(compiled);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header action */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10">
                <span className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-wide">
                    compiled prompt
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    disabled={isEmpty}
                    onClick={handleCopy}
                >
                    {copied ? (
                        <>
                            <CheckIcon className="h-3 w-3" />
                            Copied
                        </>
                    ) : (
                        <>
                            <CopyIcon className="h-3 w-3" />
                            Copy
                        </>
                    )}
                </Button>
            </div>

            {/* Token Estimation Bar */}
            <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/40 border-b border-border text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <BarChart2Icon className="h-3.5 w-3.5" />
                    <span>Tokens</span>
                </div>
                <div className="flex gap-4 font-mono text-[11px]">
                    <div className="flex gap-1.5" title="Tokens consumed by your initial natural prompt">
                        <span className="text-muted-foreground">Draft:</span>
                        <span className="text-foreground font-semibold">{naturalTokens}</span>
                    </div>
                    <div className="flex gap-1.5" title="Tokens consumed by the structured prompt">
                        <span className="text-muted-foreground">Structured:</span>
                        <span className="text-foreground font-semibold">{isEmpty ? 0 : compiledTokens}</span>
                    </div>
                    {!isEmpty && isSaved && (
                        <div className="flex gap-1.5 text-green-600 font-semibold" title="Tokens saved by structuring">
                            Diff: -{savedTokens}
                        </div>
                    )}
                    {!isEmpty && !isSaved && savedTokens < 0 && (
                        <div className="flex gap-1.5 text-amber-600 font-semibold" title="Added explicit context">
                            Diff: +{Math.abs(savedTokens)}
                        </div>
                    )}
                </div>
            </div>

            {/* Sections preview */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isEmpty ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-muted-foreground text-center">
                            Fill in the stages to see<br />your compiled prompt here.
                        </p>
                    </div>
                ) : (
                    SECTION_LABELS.map(({ key, label }) => {
                        const val = model[key] as string;
                        if (!val || typeof val !== 'string' || !val.trim()) return null;
                        return (
                            <div key={key} className="space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    {label}
                                </p>
                                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                                    {val}
                                </pre>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
