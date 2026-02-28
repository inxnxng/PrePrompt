"use client";

import { PromptPreview } from "@/components/PromptPreview";
import { StageForm } from "@/components/StageForm";
import { StageNav, STAGES } from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import { CognitiveModel, usePromptStore } from "@/store/usePromptStore";
import { RotateCcwIcon } from "lucide-react";
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
  };

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
    setCurrentStageId(1);
    setCompletedStages(new Set());
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Left — Progress Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-muted/40 flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <h1 className="text-sm font-semibold tracking-tight">PrePrompt</h1>
          <p className="text-xs text-muted-foreground mt-0.5">ACP v1.0</p>
        </div>
        <StageNav
          currentStage={currentStageId}
          completedStages={completedStages}
          onSelect={setCurrentStageId}
        />
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-xs text-muted-foreground"
            onClick={handleReset}
          >
            <RotateCcwIcon className="h-3 w-3" />
            Reset All
          </Button>
        </div>
      </aside>

      {/* Center — Input Form Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border px-8 py-4 shrink-0">
          <h2 className="text-base font-semibold">{currentStage.label}</h2>
          <p className="text-xs text-muted-foreground">
            Step {currentIndex + 1} of {STAGES.length} — {currentStage.description}
          </p>
        </header>
        <section className="flex-1 overflow-y-auto px-8 py-6">
          <StageForm
            stage={currentStage}
            value={model[currentStage.key as keyof CognitiveModel]}
            onChange={(val) =>
              store.setField(currentStage.key as keyof CognitiveModel, val)
            }
            onNext={handleNext}
            onPrev={handlePrev}
            isFirst={isFirst}
            isLast={isLast}
          />
        </section>
      </main>

      {/* Right — Preview Panel */}
      <aside className="w-80 shrink-0 border-l border-border flex flex-col">
        <div className="px-4 py-5 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">Prompt Preview</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <PromptPreview model={model} />
        </div>
      </aside>
    </div>
  );
}
