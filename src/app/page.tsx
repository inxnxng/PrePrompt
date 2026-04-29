"use client";

import { PromptPreview } from "@/components/PromptPreview";
import { TokenScenarioPoc } from "@/components/TokenScenarioPoc";
import { SettingsModal } from "@/components/SettingsModal";
import { AppAlertDialog } from "@/components/AppAlertDialog";
import { StageForm } from "@/components/StageForm";
import { StageKey, StageNav, STAGES } from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { generateStructuredPrompt } from "@/lib/agent/generateStructuredPrompt";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CognitiveModel, usePromptStore } from "@/store/usePromptStore";
import { CompassIcon, PanelLeftCloseIcon, PanelLeftIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function HomePage() {
  const [currentStageId, setCurrentStageId] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appAlertOpen, setAppAlertOpen] = useState(false);
  const [appAlertTitle, setAppAlertTitle] = useState("");
  const [appAlertMessage, setAppAlertMessage] = useState("");

  const showAppAlert = (title: string, message: string) => {
    setAppAlertTitle(title);
    setAppAlertMessage(message);
    setAppAlertOpen(true);
  };

  const store = usePromptStore();
  const model: CognitiveModel = {
    naturalPrompt: store.naturalPrompt,
    intentLock: store.intentLock,
    realityAnchor: store.realityAnchor,
    constraintCage: store.constraintCage,
    actionSlice: store.actionSlice,
    responseContract: store.responseContract,
    apiKey: store.apiKey,
    llmProvider: store.llmProvider,
    language: store.language,
    isGenerating: store.isGenerating,
    baselineTokens: store.baselineTokens,
    deepPlan: store.deepPlan,
    orchestrationTokenTotal: store.orchestrationTokenTotal,
    compactPlanning: store.compactPlanning,
  };

  const t = translations[model.language];

  const {
    naturalPrompt,
    intentLock,
    realityAnchor,
    constraintCage,
    actionSlice,
    responseContract,
  } = model;

  const stagesWithContent = useMemo(() => {
    const byKey: Record<StageKey, string> = {
      naturalPrompt,
      intentLock,
      realityAnchor,
      constraintCage,
      actionSlice,
      responseContract,
    };
    const ids = new Set<number>();
    for (const s of STAGES) {
      const v = byKey[s.key];
      if (typeof v === "string" && v.trim().length > 0) {
        ids.add(s.id);
      }
    }
    return ids;
  }, [
    naturalPrompt,
    intentLock,
    realityAnchor,
    constraintCage,
    actionSlice,
    responseContract,
  ]);

  const sidebarFooterBtnClass = sidebarCollapsed
    ? "h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
    : "w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground";

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
    if (store.llmProvider === "gemini" && !model.apiKey.trim()) {
      showAppAlert(t.alertDialogNoticeTitle, t.alertNoApiKey);
      return;
    }
    if (!model.naturalPrompt.trim()) return;

    try {
      store.setField("isGenerating", true);
      const structured = await generateStructuredPrompt(model.naturalPrompt, model.apiKey, {
        compactPlanning: store.compactPlanning,
        language: model.language,
        provider: store.llmProvider,
      });

      // Update store with generated fields
      if (structured.intentLock) store.setField("intentLock", structured.intentLock);
      if (structured.realityAnchor) store.setField("realityAnchor", structured.realityAnchor);
      if (structured.constraintCage) store.setField("constraintCage", structured.constraintCage);
      if (structured.actionSlice) store.setField("actionSlice", structured.actionSlice);
      if (structured.responseContract) store.setField("responseContract", structured.responseContract);
      store.setField("deepPlan", structured.deepPlan);
      store.setField("orchestrationTokenTotal", structured.orchestrationTokenTotal);

      // Mark stages 1-5 as completed and navigate to step 1 to review
      setCompletedStages(new Set([0, 1, 2, 3, 4, 5]));
      setCurrentStageId(1);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : t.alertFailed;
      showAppAlert(t.alertDialogErrorTitle, message || t.alertFailed);
    } finally {
      store.setField("isGenerating", false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Left — Progress Sidebar */}
      <aside
        className={cn(
          "shrink-0 border-r border-border bg-muted/40 flex flex-col transition-[width] duration-200 ease-out overflow-hidden",
          sidebarCollapsed ? "w-14" : "w-56"
        )}
      >
        <div
          className={cn(
            "border-b border-border shrink-0",
            sidebarCollapsed ? "px-1 py-2 flex justify-center" : "px-4 py-5"
          )}
        >
          {sidebarCollapsed ? (
            <span className="text-[10px] font-semibold tracking-tight text-muted-foreground select-none">
              PP
            </span>
          ) : (
            <>
              <h1 className="text-sm font-semibold tracking-tight">PrePrompt</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{t.appSubtitle}</p>
            </>
          )}
        </div>
        <StageNav
          currentStage={currentStageId}
          completedStages={completedStages}
          stagesWithContent={stagesWithContent}
          onSelect={setCurrentStageId}
          t={t}
          collapsed={sidebarCollapsed}
        />
        <div
          className={cn(
            "border-t border-border flex flex-col gap-1 shrink-0",
            sidebarCollapsed ? "p-2 items-center" : "p-3"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size={sidebarCollapsed ? "icon" : "sm"}
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? t.expandSidebar : t.minimizeSidebar}
            className={sidebarFooterBtnClass}
          >
            {sidebarCollapsed ? (
              <PanelLeftIcon className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftCloseIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t.minimizeSidebar}</span>
              </>
            )}
          </Button>
          <Button variant="ghost" size={sidebarCollapsed ? "icon" : "sm"} className={sidebarFooterBtnClass} asChild>
            <Link href="/playbook" aria-label={t.navPlaybook}>
              <CompassIcon className="h-4 w-4" />
              {sidebarCollapsed ? null : <span className="truncate">{t.navPlaybook}</span>}
            </Link>
          </Button>
          <SettingsModal compact={sidebarCollapsed} triggerClassName={sidebarFooterBtnClass} />
          <Button
            variant="ghost"
            size={sidebarCollapsed ? "icon" : "sm"}
            aria-label={sidebarCollapsed ? t.resetAll : undefined}
            className={sidebarFooterBtnClass}
            onClick={handleReset}
          >
            <RotateCcwIcon className="h-4 w-4" />
            {sidebarCollapsed ? null : t.resetAll}
          </Button>
        </div>
      </aside>

      <ResizablePanelGroup orientation="horizontal" className="flex-1">
        <ResizablePanel defaultSize="65%" minSize="30%" className="flex flex-col">
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

        <ResizablePanel defaultSize="35%" minSize="35%" className="flex flex-col border-l border-border bg-background">
          {/* Right — Preview Panel */}
          <aside className="flex flex-1 flex-col min-h-0">
            <div className="px-4 py-5 border-b border-border shrink-0">
              <h2 className="text-sm font-semibold">{t.promptPreview}</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <PromptPreview model={model} t={t} />
            </div>
          </aside>
          <TokenScenarioPoc model={model} t={t} />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AppAlertDialog
        open={appAlertOpen}
        onOpenChange={setAppAlertOpen}
        title={appAlertTitle}
        message={appAlertMessage}
        okLabel={t.alertDialogOk}
      />
    </div>
  );
}
