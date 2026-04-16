"use client";

import { Button } from "@/components/ui/button";
import {
    buildAgentsMarkdownSnippet,
    buildChatOneLiner,
    buildCursorRulesMarkdown,
    buildHandoffZipBlob,
    buildSpecMarkdown,
    buildTaskPayload,
    downloadFile,
    downloadTextFile,
} from "@/lib/exports";
import { Translation } from "@/lib/i18n";
import { CognitiveModel, compileToPrompt, estimateTokens, usePromptStore } from "@/store/usePromptStore";
import { BarChart2Icon, BookmarkIcon, CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
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
    const store = usePromptStore();
    const [copied, setCopied] = useState(false);
    const [copiedKind, setCopiedKind] = useState<string | null>(null);

    const compiled = compileToPrompt(model);
    const isEmpty = compiled.trim() === "";

    const naturalTokens = estimateTokens(model.naturalPrompt);
    const compiledTokens = estimateTokens(compiled);
    const referenceTokens = model.baselineTokens ?? naturalTokens;
    const savedTokens = referenceTokens - compiledTokens;
    const isSaved = savedTokens > 0;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(compiled);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveBaseline = () => {
        store.setField("baselineTokens", compiledTokens);
    };

    const flashCopied = (kind: string) => {
        setCopiedKind(kind);
        setTimeout(() => setCopiedKind(null), 1600);
    };

    const copyText = async (label: string, text: string) => {
        await navigator.clipboard.writeText(text);
        flashCopied(label);
    };

    const handleZip = () => {
        downloadFile(buildHandoffZipBlob(model), "preprompt-handoff.zip");
    };

    const intent = model.deepPlan?.intentRouting;

    return (
        <div className="flex flex-col h-full">
            {/* Header action */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10">
                <span className="flex items-center gap-2 text-xs text-muted-foreground font-mono uppercase tracking-wide">
                    {t.compiledPrompt}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs bg-background/50 hover:bg-muted"
                        disabled={isEmpty}
                        onClick={handleSaveBaseline}
                        title={t.saveBaseline}
                    >
                        <BookmarkIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline-block">{t.saveBaseline}</span>
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="h-7 gap-1.5 text-xs shadow-none"
                        disabled={isEmpty}
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="h-3 w-3" />
                                {t.copied}
                            </>
                        ) : (
                            <>
                                <CopyIcon className="h-3 w-3" />
                                {t.copy}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Token Estimation Bar */}
            <div className="flex flex-col gap-2 px-4 py-2.5 bg-muted/40 border-b border-border text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <BarChart2Icon className="h-3.5 w-3.5" />
                        <span>{t.tokens}</span>
                    </div>
                    <div className="flex gap-4 font-mono text-[11px] flex-wrap">
                        <div className="flex gap-1.5">
                            <span className="text-muted-foreground">
                                {model.baselineTokens !== null ? t.baseline : t.draft}:
                            </span>
                            <span className="text-foreground font-semibold">{referenceTokens}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <span className="text-muted-foreground">{t.structured}:</span>
                            <span className="text-foreground font-semibold">{isEmpty ? 0 : compiledTokens}</span>
                        </div>
                        {!isEmpty && isSaved && (
                            <div className="flex gap-1.5 text-green-600 font-semibold">Diff: -{savedTokens}</div>
                        )}
                        {!isEmpty && !isSaved && savedTokens < 0 && (
                            <div className="flex gap-1.5 text-amber-600 font-semibold">Diff: +{Math.abs(savedTokens)}</div>
                        )}
                    </div>
                    {intent && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                            {t.intentLabel}:{" "}
                            <span className="text-foreground font-semibold">{intent.category}</span> (
                            {intent.confidence01.toFixed(2)})
                        </div>
                    )}
                </div>
            </div>

            {/* Handoff export */}
            <div className="px-4 py-2 border-b border-border bg-muted/20 space-y-2 shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t.exportTitle}</p>
                <div className="flex flex-wrap gap-1.5">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-7 text-[11px] gap-1"
                        disabled={isEmpty}
                        onClick={handleZip}
                    >
                        <DownloadIcon className="h-3 w-3" />
                        {t.downloadZip}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px]"
                        disabled={isEmpty}
                        onClick={() =>
                            downloadTextFile(buildSpecMarkdown(model), "SPEC.md", "text/markdown;charset=utf-8")
                        }
                    >
                        {t.downloadSpec}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px]"
                        disabled={isEmpty}
                        onClick={() =>
                            downloadTextFile(
                                JSON.stringify(buildTaskPayload(model), null, 2),
                                "preprompt.task.json",
                                "application/json;charset=utf-8"
                            )
                        }
                    >
                        {t.downloadTaskJson}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        disabled={isEmpty}
                        onClick={() => copyText("cursor", buildCursorRulesMarkdown(model))}
                    >
                        {copiedKind === "cursor" ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                        <span className="ml-1">{t.copyCursorRules}</span>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        disabled={isEmpty}
                        onClick={() => copyText("agents", buildAgentsMarkdownSnippet(model))}
                    >
                        {copiedKind === "agents" ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                        <span className="ml-1">{t.copyAgents}</span>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px]"
                        disabled={isEmpty}
                        onClick={() =>
                            copyText("one", buildChatOneLiner(model, model.language === "ko" ? "ko" : "en"))
                        }
                    >
                        {copiedKind === "one" ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                        <span className="ml-1">{copiedKind === "one" ? t.copiedOneLiner : t.copyOneLiner}</span>
                    </Button>
                </div>
            </div>

            {/* Sections preview */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isEmpty ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-muted-foreground text-center whitespace-pre-wrap leading-relaxed">
                            {t.fillStages}
                        </p>
                    </div>
                ) : (
                    SECTION_KEYS.map((key) => {
                        const val = model[key] as string;
                        if (!val || typeof val !== "string" || !val.trim()) return null;
                        return (
                            <div key={key} className="space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    {t.sectionLabels[key]}
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
