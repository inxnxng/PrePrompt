"use client";

import { SimilarSitesMarkdown } from "@/components/SimilarSitesMarkdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  collectUserTags,
  HARNESS_GUIDE_STEPS,
  HARNESS_GUIDE_UI,
  rankTemplates,
  resolveProgressShort,
  type HarnessGuideOption,
  type HarnessGuideTemplate,
} from "@/lib/harnessGuideContent";
import { buildPlaybookNaturalPromptDraft } from "@/lib/playbook/buildPlaybookNaturalPromptDraft";
import {
  fetchSimilarSitesRecommendation,
  MISSING_GEMINI_KEY,
} from "@/lib/playbook/fetchSimilarSitesRecommendation";
import { markPlaybookHomeNavigation } from "@/lib/playbook/playbookHomeSession";
import { cn } from "@/lib/utils";
import { usePromptStore } from "@/store/usePromptStore";
import { ArrowLeftIcon, CompassIcon, Loader2Icon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Phase = "wizard" | "results";

export function HarnessGuideWizard() {
  const router = useRouter();
  const apiKey = usePromptStore((s) => s.apiKey);
  const llmProvider = usePromptStore((s) => s.llmProvider);
  const ui = HARNESS_GUIDE_UI;
  const n = HARNESS_GUIDE_STEPS.length;

  const [phase, setPhase] = useState<Phase>("wizard");
  const [stepIndex, setStepIndex] = useState(0);
  const [picked, setPicked] = useState<(string | null)[]>(() => HARNESS_GUIDE_STEPS.map(() => null));
  const [similarText, setSimilarText] = useState<string | null>(null);
  const [similarError, setSimilarError] = useState<string | null>(null);
  const [similarLoading, setSimilarLoading] = useState(false);

  const currentStep = HARNESS_GUIDE_STEPS[stepIndex];

  const handlePick = (optionId: string) => {
    const next = [...picked];
    next[stepIndex] = optionId;
    setPicked(next);
    if (stepIndex < n - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setSimilarText(null);
      setSimilarError(null);
      setSimilarLoading(false);
      setPhase("results");
    }
  };

  const handleBack = () => {
    if (phase === "results") {
      setSimilarText(null);
      setSimilarError(null);
      setSimilarLoading(false);
      setPhase("wizard");
      setStepIndex(n - 1);
      return;
    }
    if (stepIndex === 0) return;
    // Keep all prior selections; only move the cursor back (user may re-pick this step).
    setStepIndex(stepIndex - 1);
  };

  const handleStartOver = () => {
    setSimilarText(null);
    setSimilarError(null);
    setSimilarLoading(false);
    setPicked(HARNESS_GUIDE_STEPS.map(() => null));
    setStepIndex(0);
    setPhase("wizard");
  };

  const handleJumpToStep = (targetIndex: number) => {
    if (phase === "wizard" && targetIndex === stepIndex) return;
    const next = [...picked];
    for (let j = targetIndex; j < n; j += 1) {
      next[j] = null;
    }
    setPicked(next);
    setSimilarText(null);
    setSimilarError(null);
    setSimilarLoading(false);
    setStepIndex(targetIndex);
    setPhase("wizard");
  };

  const handleSimilarSitesClick = async () => {
    setSimilarError(null);
    if (llmProvider === "gemini" && !apiKey.trim()) {
      setSimilarError(ui.similarSitesNeedApiKey);
      return;
    }
    setSimilarLoading(true);
    try {
      const text = await fetchSimilarSitesRecommendation({
        provider: llmProvider,
        apiKey,
        picked,
      });
      setSimilarText(text);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSimilarError(msg === MISSING_GEMINI_KEY ? ui.similarSitesNeedApiKey : msg);
      setSimilarText(null);
    } finally {
      setSimilarLoading(false);
    }
  };

  const selectedIds = useMemo(
    () => picked.filter((v): v is string => typeof v === "string" && v.length > 0),
    [picked]
  );

  const userTagSet = useMemo(() => new Set(collectUserTags(selectedIds)), [selectedIds]);

  const rankedTemplates = useMemo(() => rankTemplates(userTagSet), [userTagSet]);

  const topTemplates = rankedTemplates.slice(0, 3);
  const similarBackendLabel =
    llmProvider === "gemini" ? ui.similarSitesBackendGemini : ui.similarSitesBackendCursor;

  const canGoBack = phase === "results" || stepIndex > 0;

  const sendDraftToHomeWithTemplate = (template: HarnessGuideTemplate | null) => {
    const draft = buildPlaybookNaturalPromptDraft({ picked, chosenTemplate: template });
    const z = usePromptStore.getState();
    z.setField("intentLock", "");
    z.setField("realityAnchor", "");
    z.setField("constraintCage", "");
    z.setField("actionSlice", "");
    z.setField("responseContract", "");
    z.setField("deepPlan", null);
    z.setField("orchestrationTokenTotal", null);
    z.setField("naturalPrompt", draft);
    markPlaybookHomeNavigation(template?.archetypeId ?? null);
    router.push("/");
  };

  const handleSendDraftToHome = () => {
    sendDraftToHomeWithTemplate(rankedTemplates[0]?.template ?? null);
  };

  const remainingSteps = picked.filter((p) => p == null).length;
  const filledSteps = n - remainingSteps;
  const progressRatio = phase === "results" ? 1 : filledSteps / n;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between gap-4 bg-muted/20 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeftIcon className="h-4 w-4" />
              {ui.backHome}
            </Button>
          </Link>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleStartOver}
        >
          <RotateCcwIcon className="h-4 w-4" />
          {ui.startOver}
        </Button>
      </header>

      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wider">{ui.progressTrackLabel}</span>
            <span className="tabular-nums shrink-0 text-right">
              {phase === "results" ? ui.progressComplete : ui.stepsRemaining(remainingSteps)}
            </span>
          </div>
          <div className="flex gap-1 sm:gap-1.5">
            {HARNESS_GUIDE_STEPS.map((step, i) => {
              const short = resolveProgressShort(i, picked);
              const isFilled = short != null;
              const isCurrent = phase === "wizard" && i === stepIndex;
              const canJump = phase === "results" || i <= stepIndex;
              const stepTitle = step.question;
              const jumpHint = ui.progressJumpToEdit;
              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!canJump}
                  onClick={() => canJump && handleJumpToStep(i)}
                  title={canJump ? `${stepTitle}\n${jumpHint}` : stepTitle}
                  aria-label={
                    canJump
                      ? `${ui.stepLabel(i + 1, n)}. ${stepTitle}. ${jumpHint}`
                      : `${ui.stepLabel(i + 1, n)}. ${stepTitle}`
                  }
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex-1 min-w-0 rounded-md border px-1 py-1.5 sm:px-1.5 text-center transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                    isFilled ? "border-border bg-muted/50" : "border-dashed border-border/70 bg-muted/20",
                    isCurrent && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                    canJump && "cursor-pointer hover:bg-muted/70 active:bg-muted/90",
                    !canJump && "cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="text-[10px] leading-none text-muted-foreground tabular-nums mb-0.5">{i + 1}</div>
                  <div
                    className={cn(
                      "text-[11px] sm:text-xs font-medium leading-tight truncate",
                      isFilled ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {isFilled ? short : ui.progressPending}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden" aria-hidden>
            <div
              className="h-full rounded-full bg-primary/70 transition-[width] duration-300 ease-out"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
          <section className="space-y-3 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-1 border border-primary/20">
              <CompassIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{ui.pageTitle}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">{ui.pageSubtitle}</p>
          </section>

          {phase === "wizard" && (
            <section className="space-y-6 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {ui.stepLabel(stepIndex + 1, n)}
                </p>
                {canGoBack ? (
                  <Button type="button" variant="outline" size="sm" onClick={handleBack}>
                    {ui.backStep}
                  </Button>
                ) : null}
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">{currentStep.question}</h2>
                <OptionGrid options={currentStep.options} onPick={handlePick} />
              </div>
            </section>
          )}

          {phase === "results" && (
            <section className="space-y-10 pt-2 border-t border-border/50">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">{ui.resultsTitle}</h2>
                <Button type="button" variant="outline" size="sm" onClick={handleBack}>
                  {ui.backStep}
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight">{ui.recommendedTitle}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ui.recommendedCardsHint}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {topTemplates.map(({ template, score }) => (
                    <Card key={template.id} className="border-border/80 shadow-sm overflow-hidden h-full">
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <CardTitle className="text-base leading-snug">{template.title}</CardTitle>
                          <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                            {ui.matchScore(score)}
                          </span>
                        </div>
                        <CardDescription className="text-sm leading-relaxed">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {ui.reasonsTitle}
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                          {template.reasons.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                        <Button
                          type="button"
                          className="w-full sm:w-auto"
                          onClick={() => sendDraftToHomeWithTemplate(template)}
                        >
                          {ui.applyThisTemplateHome}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="border-border/80 shadow-sm overflow-hidden">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5 min-w-0">
                      <CardTitle className="text-lg font-semibold tracking-tight">{ui.similarSitesTitle}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{ui.similarSitesIntro}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit shrink-0 font-normal text-[11px] px-2.5 py-1 whitespace-normal text-left sm:max-w-[min(100%,14rem)] sm:text-right leading-snug"
                    >
                      {similarBackendLabel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto gap-2"
                    disabled={similarLoading || (llmProvider === "gemini" && !apiKey.trim())}
                    onClick={handleSimilarSitesClick}
                  >
                    {similarLoading ? <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
                    {similarLoading ? ui.similarSitesLoading : ui.similarSitesButton}
                  </Button>
                  {similarError ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                      <p className="text-sm text-destructive whitespace-pre-wrap break-words">{similarError}</p>
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground leading-relaxed pl-3 border-l-2 border-muted-foreground/25">
                      {ui.similarSitesDisclaimer}
                    </p>
                    <div
                      className={cn(
                        "rounded-xl border min-h-[8.5rem] transition-colors",
                        similarText
                          ? "border-border bg-muted/25"
                          : "border-dashed border-border/70 bg-muted/20",
                        similarLoading && "border-primary/25 bg-muted/30"
                      )}
                    >
                      {similarText ? (
                        <div className="px-4 py-3.5 text-foreground text-sm leading-relaxed [&_a]:break-all [&_a]:text-primary [&_a]:underline-offset-2">
                          <SimilarSitesMarkdown text={similarText} />
                        </div>
                      ) : similarLoading ? (
                        <div className="flex flex-col items-center justify-center gap-2.5 py-12 px-4 text-sm text-muted-foreground">
                          <Loader2Icon className="h-6 w-6 animate-spin text-primary/80" aria-hidden />
                          <span className="text-center">{ui.similarSitesLoading}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted border border-border/80">
                            <SparklesIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                            {ui.similarSitesEmptyHint}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">{ui.sendToHomeDraftHint}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStartOver}
                    className="w-full sm:w-auto sm:shrink-0 order-3 sm:order-1"
                  >
                    {ui.startOver}
                  </Button>
                  <div className="flex min-w-0 flex-col gap-2 sm:order-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:flex-1 order-1">
                    <Button type="button" className="w-full sm:w-auto" onClick={handleSendDraftToHome}>
                      {ui.sendToHomeDraft}
                    </Button>
                    <Button asChild variant="secondary" className="w-full sm:w-auto">
                      <Link href="/">{ui.openEditorBare}</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">{ui.editorHint}</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function OptionGrid({
  options,
  onPick,
}: {
  options: HarnessGuideOption[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onPick(opt.id)}
          className={cn(
            "h-full min-h-0 flex flex-col items-stretch justify-start rounded-xl border border-border bg-card px-4 py-4 text-left shadow-sm transition-colors",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          )}
        >
          <div className="font-medium text-foreground">{opt.label}</div>
          {opt.hint ? <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{opt.hint}</div> : null}
        </button>
      ))}
    </div>
  );
}
