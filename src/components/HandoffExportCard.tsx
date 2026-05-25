"use client";

import { HandoffAgentTargetSelect } from "@/components/HandoffAgentTargetSelect";
import { HandoffArchetypeSelect } from "@/components/HandoffArchetypeSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    buildChatOneLiner,
    buildHandoffZipBlob,
    DEFAULT_HANDOFF_TARGET,
    downloadFile,
    handoffLayoutTree,
    handoffZipFilename,
    type HandoffAgentTarget,
} from "@/lib/exports";
import { Translation } from "@/lib/i18n";
import { consumePlaybookHandoffArchetypeHint } from "@/lib/playbook/playbookHomeSession";
import { CognitiveModel, compileToPrompt } from "@/store/usePromptStore";
import { CheckIcon, ClipboardPasteIcon, MapPinIcon, PackageIcon } from "lucide-react";
import { useState } from "react"; 

type Props = {
    model: CognitiveModel;
    t: Translation;
};

function pathGuideExtra(t: Translation, target: HandoffAgentTarget): string {
    switch (target) {
        case "cursor":
            return t.pathGuideExtraCursor;
        case "claude":
            return t.pathGuideExtraClaude;
        case "gemini":
            return t.pathGuideExtraGemini;
        case "copilot":
            return t.pathGuideExtraCopilot;
        case "windsurf":
            return t.pathGuideExtraWindsurf;
        default:
            return t.pathGuideExtraGeneric;
    }
}

export function HandoffExportCard({ model, t }: Props) {
    const [copiedOneLiner, setCopiedOneLiner] = useState(false);
    const [pathGuideOpen, setPathGuideOpen] = useState(false);
    const [handoffTarget, setHandoffTarget] = useState<HandoffAgentTarget>(DEFAULT_HANDOFF_TARGET);
    const [handoffArchetype, setHandoffArchetype] = useState(() => {
        const hinted = consumePlaybookHandoffArchetypeHint();
        return hinted ?? null; 
    });

    const compiled = compileToPrompt(model);
    const isEmpty = compiled.trim() === "";
    const canExportZip = !isEmpty;
    const oneLiner = buildChatOneLiner(model, handoffArchetype);

    const copyOneLiner = async () => {
        await navigator.clipboard.writeText(oneLiner);
        setCopiedOneLiner(true);
        setTimeout(() => setCopiedOneLiner(false), 1600);
    };

    const handleZip = () => {
        downloadFile(
            buildHandoffZipBlob(model, handoffTarget, { archetypeId: handoffArchetype }),
            handoffZipFilename(handoffTarget)
        );
    };

    return (
        <>
            <Card className="gap-0 overflow-hidden border-border/90 py-0 shadow-sm">
                <CardHeader className="border-b border-border/60 bg-muted/25 px-4 py-3.5 sm:px-5">
                    <CardTitle className="text-base font-semibold">{t.exportTitle}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed sm:text-sm">{t.previewHandoffCardDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4 py-4 sm:px-5">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">{t.exportHandoffTarget}</span>
                        <HandoffAgentTargetSelect value={handoffTarget} onChange={setHandoffTarget} t={t} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">{t.exportHandoffArchetype}</span>
                        <HandoffArchetypeSelect
                            value={handoffArchetype}
                            onChange={setHandoffArchetype}
                            noneLabel={t.exportHandoffArchetypeNone}
                            aria-label={t.exportHandoffArchetype}
                        />
                        <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{t.exportHandoffArchetypeHint}</p>
                    </label>
                    <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{t.exportHandoffZipHint}</p>
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-9 w-full justify-center gap-2 text-xs font-medium shadow-sm sm:h-10 sm:text-sm"
                        disabled={!canExportZip}
                        onClick={handleZip}
                    >
                        <PackageIcon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                        {t.downloadZip}
                    </Button>
                    <div
                        className="flex min-h-9 w-full items-stretch gap-0 overflow-hidden rounded-lg border border-input bg-background shadow-xs"
                        role="group"
                        aria-label={`${t.exportPathGuide} · ${t.copyOneLiner}`}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 flex-1 rounded-none px-2 text-[11px] font-normal text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:h-10 sm:text-xs"
                            onClick={() => setPathGuideOpen(true)}
                        >
                            <MapPinIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                            <span className="truncate">{t.exportPathGuide}</span>
                        </Button>
                        <span
                            className="flex h-9 shrink-0 items-center justify-center bg-muted/25 px-1 text-[12px] font-light leading-none text-muted-foreground/70 select-none sm:h-10"
                            aria-hidden
                        >
                            |
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 flex-1 rounded-none px-2 text-[11px] font-normal text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:h-10 sm:text-xs"
                            disabled={!canExportZip}
                            onClick={copyOneLiner}
                        >
                            {copiedOneLiner ? (
                                <CheckIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                            ) : (
                                <ClipboardPasteIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-80" />
                            )}
                            <span className="truncate">{copiedOneLiner ? t.copiedOneLiner : t.copyOneLiner}</span>
                        </Button>
                    </div>
                    {canExportZip && (
                        <p
                            className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs"
                            aria-label={t.previewOneLinerPreviewLabel}
                        >
                            {oneLiner}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={pathGuideOpen} onOpenChange={setPathGuideOpen}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                    <DialogHeader className="border-b border-border/80 px-6 py-4 text-left">
                        <DialogTitle className="text-base">{t.exportPathGuideTitle}</DialogTitle>
                        <DialogDescription className="text-left text-sm leading-relaxed">
                            {t.exportPathGuideIntro}
                            <span className="mt-2 block text-muted-foreground">{t.exportPathGuideTargetHint}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[min(60vh,28rem)] space-y-4 overflow-y-auto px-6 py-4">
                        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                            <pre
                                className="text-[11px] font-mono leading-relaxed text-foreground whitespace-pre select-all sm:text-xs"
                                aria-label="Handoff folder tree"
                            >
                                {handoffLayoutTree(handoffTarget)}
                            </pre>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">{pathGuideExtra(t, handoffTarget)}</p>
                        <p className="text-sm text-muted-foreground">{t.exportPathGuideKeepNames}</p>
                        <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-3">
                            <p className="text-xs font-semibold text-foreground">{t.exportPathGuideZipTitle}</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.exportPathGuideZipBody}</p>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border/80 bg-muted/20 px-6 py-3">
                        <Button type="button" variant="default" size="sm" className="w-full sm:w-auto" onClick={() => setPathGuideOpen(false)}>
                            {t.alertDialogOk}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
