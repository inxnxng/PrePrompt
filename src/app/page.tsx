"use client";

import { PromptPreview } from "@/components/PromptPreview";
import { SettingsModal } from "@/components/SettingsModal";
import { StageForm } from "@/components/StageForm";
import { StageNav, STAGES } from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { generateStructuredPrompt } from "@/lib/gemini";
import { translations } from "@/lib/i18n";
import { CognitiveModel, usePromptStore } from "@/store/usePromptStore";
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [currentStageId, setCurrentStageId] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  const store = usePromptStore();
  const model: CognitiveModel = {
    naturalPrompt: store.naturalPrompt,
    intentLock: store.intentLock,
    realityAnchor: store.realityAnchor,
    constraintCage: store.constraintCage,
    actionSlice: store.actionSlice,
    responseContract: store.responseContract,
    apiKey: store.apiKey,
    language: store.language,
    isGenerating: store.isGenerating,
    baselineTokens: store.baselineTokens,
  };

  const t = translations[model.language];

  const currentIndex = STAGES.findIndex((s) => s.id === currentStageId);
  const currentStage = STAGES[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STAGES.length - 1;

  const handleNext = () => {
    setCompletedStages((prev) => new Set(prev).add(currentStageId));
    if (!isLast) {
      setCurrentStageId(STAGES[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStageId(STAGES[currentIndex - 1].id);
    }
  };

  const handleReset = () => {
    store.reset();
    setCurrentStageId(0);
    setCompletedStages(new Set());
  };

  const handleAutoStructure = async () => {
    if (!model.apiKey) {
      alert(t.alertNoApiKey);
      return;
    }
    if (!model.naturalPrompt.trim()) return;

    try {
      store.setField("isGenerating", true);
      const structured = await generateStructuredPrompt(model.naturalPrompt, model.apiKey);

      // Update store with generated fields
      if (structured.intentLock) store.setField("intentLock", structured.intentLock);
      if (structured.realityAnchor) store.setField("realityAnchor", structured.realityAnchor);
      if (structured.constraintCage) store.setField("constraintCage", structured.constraintCage);
      if (structured.actionSlice) store.setField("actionSlice", structured.actionSlice);
      if (structured.responseContract) store.setField("responseContract", structured.responseContract);

      // Mark stages 1-5 as completed and navigate to step 1 to review
      setCompletedStages(new Set([0, 1, 2, 3, 4, 5]));
      setCurrentStageId(1);
    } catch (err: any) {
      console.error(err);
      alert(err.message || t.alertFailed);
    } finally {
      store.setField("isGenerating", false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Left — Progress Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-muted/40 flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <h1 className="text-sm font-semibold tracking-tight">PrePrompt</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t.appSubtitle}</p>
        </div>
        <StageNav
          currentStage={currentStageId}
          completedStages={completedStages}
          onSelect={setCurrentStageId}
          t={t}
        />
        <div className="p-3 border-t border-border flex flex-col gap-1">
          <SettingsModal />
          <Link href="/about" className="w-full">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowRightIcon className="h-4 w-4" />
              {t.about.link}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleReset}
          >
            <RotateCcwIcon className="h-4 w-4" />
            {t.resetAll}
          </Button>
        </div>
      </aside>

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize={65} minSize={30} className="flex flex-col">
          {/* Center — Input Form Area */}
          <main className="h-full flex flex-col overflow-hidden">
            <header className="border-b border-border px-8 py-4 shrink-0">
              <h2 className="text-base font-semibold">{t.stages[currentStage.key].label}</h2>
              <p className="text-xs text-muted-foreground">
                {t.stepOf(currentIndex + 1, STAGES.length)} — {t.stages[currentStage.key].description}
              </p>
            </header>
            <section className="flex-1 overflow-y-auto px-8 py-6">
              <StageForm
                stage={currentStage}
                value={model[currentStage.key as keyof CognitiveModel] as string}
                isGenerating={model.isGenerating}
                onChange={(val) =>
                  store.setField(currentStage.key as keyof CognitiveModel, val)
                }
                onNext={handleNext}
                onPrev={handlePrev}
                onAutoStructure={handleAutoStructure}
                isFirst={isFirst}
                isLast={isLast}
                t={t}
              />
            </section>
          </main>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col border-l border-border bg-background">
          {/* Right — Preview Panel */}
          <aside className="h-full flex flex-col">
            <div className="px-4 py-5 border-b border-border shrink-0">
              <h2 className="text-sm font-semibold">{t.promptPreview}</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <PromptPreview model={model} t={t} />
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
