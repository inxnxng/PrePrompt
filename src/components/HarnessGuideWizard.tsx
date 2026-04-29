"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HARNESS_GUIDE_STEPS,
  HARNESS_GUIDE_UI,
  collectUserTags,
  rankTemplates,
  resolveProgressShort,
  type HarnessGuideOption,
} from "@/lib/harnessGuideContent";
import {
  fetchSimilarSitesRecommendation,
  MISSING_GEMINI_KEY,
} from "@/lib/playbook/fetchSimilarSitesRecommendation";
import type { Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePromptStore } from "@/store/usePromptStore";
import { ArrowLeftIcon, CompassIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Phase = "wizard" | "results";

export function HarnessGuideWizard() {
  const language = usePromptStore((s) => s.language) as Language;
  const apiKey = usePromptStore((s) => s.apiKey);
  const llmProvider = usePromptStore((s) => s.llmProvider);
  const ui = HARNESS_GUIDE_UI[language];
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
        language,
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
              const short = resolveProgressShort(language, i, picked);
              const isFilled = short != null;
              const isCurrent = phase === "wizard" && i === stepIndex;
              const canJump = phase === "results" || i <= stepIndex;
              const stepTitle = step.question[language];
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
                <h2 className="text-lg font-semibold tracking-tight">{currentStep.question[language]}</h2>
                <OptionGrid lang={language} options={currentStep.options} onPick={handlePick} />
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
                <div className="space-y-4">
                  {topTemplates.map(({ template, score }) => (
                    <Card key={template.id} className="border-border/80 shadow-sm overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <CardTitle className="text-base leading-snug">{template.title[language]}</CardTitle>
                          <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                            {ui.matchScore(score)}
                          </span>
                        </div>
                        <CardDescription className="text-sm leading-relaxed">
                          {template.description[language]}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {ui.reasonsTitle}
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                          {template.reasons.map((r, idx) => (
                            <li key={idx}>{r[language]}</li>
                          ))}
                        </ul>
                        {template.bundleHint ? (
                          <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                            {template.bundleHint[language]}
                          </p>
                        ) : null}
                        <p className="text-[11px] font-mono text-muted-foreground/90">template_id: {template.id}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold tracking-tight">{ui.similarSitesTitle}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ui.similarSitesIntro}</p>
                <p className="text-[11px] text-muted-foreground">{similarBackendLabel}</p>
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
                  <p className="text-sm text-destructive whitespace-pre-wrap break-words">{similarError}</p>
                ) : null}
                <p className="text-[11px] text-muted-foreground leading-relaxed">{ui.similarSitesDisclaimer}</p>
                {similarText ? (
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {similarText}
                  </div>
                ) : !similarLoading && !similarError ? (
                  <p className="text-sm text-muted-foreground">{ui.similarSitesEmptyHint}</p>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleStartOver}>
                  {ui.startOver}
                </Button>
                <Link href="/" className="sm:ml-auto">
                  <Button type="button" className="w-full sm:w-auto">
                    {ui.openEditor}
                  </Button>
                </Link>
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
  lang,
  options,
  onPick,
}: {
  lang: Language;
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
          <div className="font-medium text-foreground">{opt.label[lang]}</div>
          {opt.hint ? <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{opt.hint[lang]}</div> : null}
        </button>
      ))}
    </div>
  );
}
