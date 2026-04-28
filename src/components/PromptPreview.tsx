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
import {
    BarChart2Icon,
    BookmarkIcon,
    CheckIcon,
    ClipboardPasteIcon,
    CopyIcon,
    FileJsonIcon,
    FileTextIcon,
    PackageIcon,
} from "lucide-react";
import { useState } from "react";

type Props = {
    model: CognitiveModel;
    t: Translation;
};

/** Fixed layout: filenames must match downloads and ZIP contents. */
const HANDOFF_LAYOUT_TREE = `./
├── SPEC.md
├── preprompt.task.json
├── AGENTS.md
└── .cursor/
    └── rules/
        └── preprompt-handoff.mdc`;

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
    const [copiedOneLiner, setCopiedOneLiner] = useState(false);
    const [pathGuideOpen, setPathGuideOpen] = useState(false);

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

    const copyOneLiner = async () => {
        await navigator.clipboard.writeText(
            buildChatOneLiner(model, model.language === "ko" ? "ko" : "en")
        );
        setCopiedOneLiner(true);
        setTimeout(() => setCopiedOneLiner(false), 1600);
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
            <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t.exportTitle}</p>
                <div className="mt-2.5 rounded-lg border border-border/80 bg-background/70 p-2.5 shadow-sm space-y-3">
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-medium text-muted-foreground">{t.exportGroupFiles}</p>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="h-8 w-full justify-start gap-2 text-xs shadow-none"
                            disabled={isEmpty}
                            onClick={handleZip}
                        >
                            <PackageIcon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                            <span className="truncate">{t.downloadZip}</span>
                        </Button>
                        <div className="grid grid-cols-2 gap-1.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 justify-start gap-1.5 px-2 text-[11px] font-normal"
                                disabled={isEmpty}
                                onClick={() =>
                                    downloadTextFile(buildSpecMarkdown(model), "SPEC.md", "text/markdown;charset=utf-8")
                                }
                            >
                                <FileTextIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{t.downloadSpec}</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 justify-start gap-1.5 px-2 text-[11px] font-normal"
                                disabled={isEmpty}
                                onClick={() =>
                                    downloadTextFile(
                                        JSON.stringify(buildTaskPayload(model), null, 2),
                                        "preprompt.task.json",
                                        "application/json;charset=utf-8"
                                    )
                                }
                            >
                                <FileJsonIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{t.downloadTaskJson}</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 justify-start gap-1.5 px-2 text-[11px] font-normal"
                                disabled={isEmpty}
                                onClick={() =>
                                    downloadTextFile(
                                        buildCursorRulesMarkdown(model),
                                        "preprompt-handoff.mdc",
                                        "text/markdown;charset=utf-8"
                                    )
                                }
                            >
                                <FileTextIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{t.downloadCursorRules}</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 justify-start gap-1.5 px-2 text-[11px] font-normal"
                                disabled={isEmpty}
                                onClick={() =>
                                    downloadTextFile(
                                        buildAgentsMarkdownSnippet(model),
                                        "AGENTS.md",
                                        "text/markdown;charset=utf-8"
                                    )
                                }
                            >
                                <FileTextIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <span className="truncate">{t.downloadAgentsMd}</span>
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-full px-2 text-[11px] font-normal text-muted-foreground hover:text-foreground"
                            onClick={() => setPathGuideOpen(true)}
                        >
                            {t.exportPathGuide}
                        </Button>
                    </div>
                    <div className="h-px bg-border/70" role="separator" />
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-medium text-muted-foreground">{t.exportGroupChat}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-full justify-start gap-2 px-2 text-[11px] font-normal"
                            disabled={isEmpty}
                            onClick={copyOneLiner}
                        >
                            {copiedOneLiner ? (
                                <CheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
                            ) : (
                                <ClipboardPasteIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className="min-w-0 flex-1 truncate text-left">
                                {copiedOneLiner ? t.copiedOneLiner : t.copyOneLiner}
                            </span>
                        </Button>
                    </div>
                </div>
                <Dialog open={pathGuideOpen} onOpenChange={setPathGuideOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t.exportPathGuideTitle}</DialogTitle>
                            <DialogDescription className="text-left">{t.exportPathGuideIntro}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 overflow-x-auto">
                                <pre
                                    className="text-[11px] sm:text-xs font-mono leading-relaxed text-foreground whitespace-pre select-all"
                                    aria-label="Handoff folder tree"
                                >
                                    {HANDOFF_LAYOUT_TREE}
                                </pre>
                            </div>
                            <p className="text-sm text-muted-foreground">{t.exportPathGuideKeepNames}</p>
                            <div className="space-y-1.5 rounded-md border border-border/80 bg-background/80 px-3 py-2.5">
                                <p className="text-xs font-semibold text-foreground">{t.exportPathGuideZipTitle}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{t.exportPathGuideZipBody}</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="default" size="sm" onClick={() => setPathGuideOpen(false)}>
                                {t.alertDialogOk}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
