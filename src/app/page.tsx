"use client";

import { AppAlertDialog } from "@/components/AppAlertDialog";
import { PromptPreview } from "@/components/PromptPreview";
import { SettingsModal } from "@/components/SettingsModal";
import { StageForm } from "@/components/StageForm";
import { StageKey, StageNav, STAGES } from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { generateStructuredPrompt } from "@/lib/agent/generateStructuredPrompt";
import { t } from "@/lib/i18n";
import { consumePlaybookHomeNavigation } from "@/lib/playbook/playbookHomeSession";
import { cn } from "@/lib/utils";
import { CognitiveModel, compileToPrompt, usePromptStore } from "@/store/usePromptStore";
import {
  CheckIcon,
  CompassIcon,
  HistoryIcon,
  PackageIcon,
  PanelLeftCloseIcon,
  PanelLeftIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  SaveIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePanelRef } from "react-resizable-panels";

const PREPROMPT_UI_SESSION_KEY = "preprompt-ui-session";

export default function HomePage() {
  const router = useRouter();
  const [currentStageId, setCurrentStageId] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewPanelCollapsed, setPreviewPanelCollapsed] = useState(false);
  const previewPanelRef = usePanelRef();

  const syncPreviewPanelCollapsed = () => {
    queueMicrotask(() => {
      setPreviewPanelCollapsed(previewPanelRef.current?.isCollapsed() ?? false);
    });
  };

  const [appAlertOpen, setAppAlertOpen] = useState(false);
  const [appAlertTitle, setAppAlertTitle] = useState("");
  const [appAlertMessage, setAppAlertMessage] = useState("");
  const [uiHydrated, setUiHydrated] = useState(false);
  const [draftFeedback, setDraftFeedback] = useState<string | null>(null);
  const draftFeedbackClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    isGenerating: store.isGenerating,
    deepPlan: store.deepPlan,
    orchestrationTokenTotal: store.orchestrationTokenTotal,
    cursorAgentModel: store.cursorAgentModel,
  };

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

  const allStagesFilled = useMemo(
    () => STAGES.every((s) => stagesWithContent.has(s.id)),
    [stagesWithContent]
  );

  const hasHandoffResult = useMemo(
    () =>
      compileToPrompt({
        intentLock,
        realityAnchor,
        constraintCage,
        actionSlice,
        responseContract,
      }).trim() !== "",
    [intentLock, realityAnchor, constraintCage, actionSlice, responseContract]
  );

  const sidebarFooterBtnClass = sidebarCollapsed
    ? "h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
    : "w-full justify-start gap-3 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground";

  const currentIndex = STAGES.findIndex((s) => s.id === currentStageId);
  const currentStage = STAGES[Math.max(0, currentIndex)];
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex === STAGES.length - 1;

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(PREPROMPT_UI_SESSION_KEY);
        if (raw) {
          const data = JSON.parse(raw) as {
            v?: number;
            currentStageId?: unknown;
            completedStageIds?: unknown;
          };
          if (data.v === 1 && typeof data.currentStageId === "number") {
            const maxId = STAGES[STAGES.length - 1].id;
            const sid = Math.min(Math.max(data.currentStageId, 0), maxId);
            setCurrentStageId(sid);
            const ids = Array.isArray(data.completedStageIds)
              ? data.completedStageIds.filter((x): x is number => typeof x === "number")
              : [];
            setCompletedStages(new Set(ids));
          }
        }
      } catch {
        /* ignore corrupt storage */
      }
      setUiHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!uiHydrated) return;
    if (!consumePlaybookHomeNavigation()) return;
    queueMicrotask(() => {
      setCurrentStageId(0);
      setCompletedStages(new Set([0]));
      const time = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
      setDraftFeedback(`${t.playbookDraftLoadedFeedback} · ${time}`);
      if (draftFeedbackClearRef.current) clearTimeout(draftFeedbackClearRef.current);
      draftFeedbackClearRef.current = setTimeout(() => setDraftFeedback(null), 6500);
    });
  }, [uiHydrated]);

  useEffect(() => {
    if (!uiHydrated) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(
          PREPROMPT_UI_SESSION_KEY,
          JSON.stringify({
            v: 1,
            currentStageId,
            completedStageIds: [...completedStages],
          })
        );
      } catch {
        /* quota / private mode */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [currentStageId, completedStages, uiHydrated]);

  const handleNext = () => {
    if (!isLast) {
      setCompletedStages((prev) => new Set(prev).add(currentStageId));
      setCurrentStageId(STAGES[currentIndex + 1].id);
      return;
    }
    setCompletedStages(new Set(STAGES.map((s) => s.id)));
    router.push("/result");
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        PREPROMPT_UI_SESSION_KEY,
        JSON.stringify({
          v: 1,
          currentStageId,
          completedStageIds: [...completedStages],
          savedAt: Date.now(),
        })
      );
    } catch {
      showAppAlert(t.alertDialogErrorTitle, t.draftSaveFailed);
      return;
    }
    const time = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    setDraftFeedback(`${t.draftSavedShort} · ${time}`);
    if (draftFeedbackClearRef.current) clearTimeout(draftFeedbackClearRef.current);
    draftFeedbackClearRef.current = setTimeout(() => setDraftFeedback(null), 4500);
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
    try {
      localStorage.removeItem(PREPROMPT_UI_SESSION_KEY);
    } catch {
      /* ignore */
    }
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
        provider: store.llmProvider,
        cursorAgentModel: store.cursorAgentModel,
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
          "shrink-0 border-r border-border bg-gradient-to-b from-muted/50 to-muted/30 flex flex-col min-h-0 transition-[width] duration-200 ease-out overflow-hidden",
          sidebarCollapsed ? "w-14" : "w-56"
        )}
      >
        <div
          className={cn(
            "border-b border-border/80 shrink-0",
            sidebarCollapsed
              ? "flex flex-col items-center gap-2.5 px-1.5 py-3"
              : "flex items-start gap-2 px-3 py-4"
          )}
        >
          {sidebarCollapsed ? (
            <>
              <span className="text-[10px] font-semibold tracking-tight text-muted-foreground select-none">
                PP
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarCollapsed(false)}
                aria-expanded={false}
                aria-label={t.expandSidebar}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PanelLeftIcon className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-semibold tracking-tight">PrePrompt</h1>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{t.appSubtitle1}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{t.appSubtitle2}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSidebarCollapsed(true)}
                aria-expanded
                aria-label={t.minimizeSidebar}
                className="h-8 w-8 shrink-0 -mr-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PanelLeftCloseIcon className="h-4 w-4" />
              </Button>
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
            "border-t border-border/80 flex flex-col gap-1 shrink-0 mt-auto",
            sidebarCollapsed ? "p-2 items-center" : "p-3 pt-2"
          )}
        >
          {!sidebarCollapsed ? (
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/90 px-3 mb-0.5">
              {t.sidebarLinksLabel}
            </p>
          ) : null}
          <Button variant="ghost" size={sidebarCollapsed ? "icon" : "sm"} className={sidebarFooterBtnClass} asChild>
            <Link href="/playbook" aria-label={t.navPlaybook}>
              <CompassIcon className="h-4 w-4" />
              {sidebarCollapsed ? null : <span className="truncate">{t.navPlaybook}</span>}
            </Link>
          </Button>
          <Button variant="ghost" size={sidebarCollapsed ? "icon" : "sm"} className={sidebarFooterBtnClass} asChild>
            <Link href="/history" aria-label={t.navHistory}>
              <HistoryIcon className="h-4 w-4" />
              {sidebarCollapsed ? null : <span className="truncate">{t.navHistory}</span>}
            </Link>
          </Button>
          {hasHandoffResult ? (
            <Button variant="ghost" size={sidebarCollapsed ? "icon" : "sm"} className={sidebarFooterBtnClass} asChild>
              <Link href="/result" aria-label={t.navResult}>
                <PackageIcon className="h-4 w-4" />
                {sidebarCollapsed ? null : <span className="truncate">{t.navResult}</span>}
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size={sidebarCollapsed ? "icon" : "sm"}
              className={sidebarFooterBtnClass}
              disabled
              title={t.fillStages}
              aria-label={t.navResult}
            >
              <PackageIcon className="h-4 w-4" />
              {sidebarCollapsed ? null : <span className="truncate">{t.navResult}</span>}
            </Button>
          )}
          <SettingsModal
            compact={sidebarCollapsed}
            triggerClassName={sidebarFooterBtnClass}
            onResetSession={handleReset}
          />
        </div>
      </aside>

      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1"
        onLayoutChanged={syncPreviewPanelCollapsed}
      >
        <ResizablePanel defaultSize="65%" minSize="30%" className="flex flex-col">
          {/* Center — Input Form Area */}
          <main className="relative flex h-full min-h-0 flex-col overflow-hidden">
            <div
              className={cn(
                "sticky top-0 z-30 shrink-0 border-b border-border",
                "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85"
              )}
            >
              <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-8 py-3.5 border-b border-border/60">
                <div className="min-w-0 flex-1 text-left">
                  <h2 className="text-base font-semibold">{t.stages[currentStage.key].label}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.stepOf(currentIndex + 1, STAGES.length)} — {t.stages[currentStage.key].description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={model.isGenerating}
                    onClick={handleSaveDraft}
                  >
                    <SaveIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {t.draftSave}
                  </Button>
                </div>
                {draftFeedback ? (
                  <span className="w-full basis-full text-left text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {draftFeedback}
                  </span>
                ) : null}
              </header>
            </div>
            <section className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-6 pb-4">
              <StageForm
                stage={currentStage}
                value={model[currentStage.key as keyof CognitiveModel] as string}
                isGenerating={model.isGenerating}
                onChange={(val) =>
                  store.setField(currentStage.key as keyof CognitiveModel, val)
                }
                onAutoStructure={handleAutoStructure}
                isFirst={isFirst}
                t={t}
              />
            </section>
            <footer
              className={cn(
                "shrink-0 border-t border-border px-8 py-3",
                "bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={isFirst || model.isGenerating}
                >
                  {t.previous}
                </Button>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {t.stepOf(currentIndex + 1, STAGES.length)}
                  </span>
                  {isLast ? (
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                        <SparklesIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                        {t.readyInSidebar}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleNext}
                        disabled={model.isGenerating || !allStagesFilled}
                        title={!allStagesFilled && !model.isGenerating ? t.fillStages : undefined}
                        className="shrink-0 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CheckIcon className="h-4 w-4 shrink-0" aria-hidden />
                        {t.doneOpenPreview}
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" size="sm" onClick={handleNext} disabled={model.isGenerating}>
                      {t.next}
                    </Button>
                  )}
                </div>
              </div>
            </footer>
          </main>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize="35%"
          minSize="18%"
          collapsedSize="3.5rem"
          collapsible
          panelRef={previewPanelRef}
          className="flex flex-col border-l border-border bg-background min-h-0 min-w-0"
        >
          {/* Right — Preview Panel */}
          <aside
            id="preprompt-preview-panel"
            className="flex flex-1 flex-col min-h-0 overflow-hidden transition-shadow duration-300 rounded-sm"
          >
            {previewPanelCollapsed ? (
              <div
                className={cn(
                  "border-b border-border/80 shrink-0 bg-muted/20",
                  "flex flex-col items-center gap-2.5 px-1.5 py-3"
                )}
              >
                <span className="text-[10px] font-semibold tracking-tight text-muted-foreground select-none">
                  미리
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => previewPanelRef.current?.expand()}
                  aria-expanded={false}
                  aria-label={t.expandPromptPreview}
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <PanelRightOpenIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold tracking-tight text-foreground">{t.promptPreview}</h2>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{t.promptPreviewSubtitle}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => previewPanelRef.current?.collapse()}
                      aria-expanded
                      aria-label={t.minimizePromptPreview}
                      className="h-8 w-8 shrink-0 -mr-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <PanelRightCloseIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <PromptPreview model={model} t={t} />
                </div>
              </>
            )}
          </aside>
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
