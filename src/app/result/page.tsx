"use client";

import { HandoffExportCard } from "@/components/HandoffExportCard";
import { ModelRecommendationsPanel } from "@/components/ModelRecommendationsPanel";
import { SaveHandoffHistoryDialog } from "@/components/SaveHandoffHistoryDialog";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { compileToPrompt, usePromptStore } from "@/store/usePromptStore";
import { ArrowLeftIcon, HistoryIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ResultPage() {
    const store = usePromptStore();
    const [saveOpen, setSaveOpen] = useState(false);
    const [saveDialogKey, setSaveDialogKey] = useState(0);
    const model = useMemo(
        () => ({
            naturalPrompt: store.naturalPrompt,
            intentLock: store.intentLock,
            realityAnchor: store.realityAnchor,
            constraintCage: store.constraintCage,
            actionSlice: store.actionSlice,
            responseContract: store.responseContract,
            apiKey: store.apiKey,
            llmProvider: store.llmProvider,
            isGenerating: store.isGenerating,
            deepPlan: store.deepPlan,
            orchestrationTokenTotal: store.orchestrationTokenTotal,
            cursorAgentModel: store.cursorAgentModel,
        }),
        [
            store.naturalPrompt,
            store.intentLock,
            store.realityAnchor,
            store.constraintCage,
            store.actionSlice,
            store.responseContract,
            store.apiKey,
            store.llmProvider,
            store.isGenerating,
            store.deepPlan,
            store.orchestrationTokenTotal,
            store.cursorAgentModel,
        ]
    );

    const compiled = useMemo(() => compileToPrompt(model), [model]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-3 sm:px-6">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t.resultBackHome}
                    </Link>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/playbook">{t.navPlaybook}</Link>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/history">
                        <HistoryIcon className="h-4 w-4" />
                        {t.navHistory}
                    </Link>
                </Button>
            </header>

            <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">{t.resultPageTitle}</h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">{t.resultPageSubtitle}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={compiled.trim() === ""}
                        onClick={() => {
                            setSaveDialogKey((k) => k + 1);
                            setSaveOpen(true);
                        }}
                    >
                        {t.historySaveToServer}
                    </Button>
                </div>

                <HandoffExportCard model={model} t={t} />

                <ModelRecommendationsPanel compiledPrompt={compiled} naturalPrompt={store.naturalPrompt} t={t} />
            </main>

            <SaveHandoffHistoryDialog
                key={saveDialogKey}
                open={saveOpen}
                onOpenChange={setSaveOpen}
                model={model}
                t={t}
            />
        </div>
    );
}
