"use client";

import { Translation } from "@/lib/i18n";
import { sumNaiveAgentInputTokens, sumPlannedAgentInputTokens } from "@/lib/tokenModel";
import { CognitiveModel, compileToPrompt, estimateTokens } from "@/store/usePromptStore";
import { useMemo, useState } from "react";

type Props = {
    model: CognitiveModel;
    t: Translation;
};

/** PoC only: fixed “naive agent” shape; only round count is user-adjustable. */
const POC_BASE_CTX = 8000;
const POC_DELTA_PER_ROUND = 2500;
const POC_FOLLOW_UP_CTX = 10000;

export function TokenScenarioPoc({ model, t }: Props) {
    const [rounds, setRounds] = useState(6);

    const compiled = compileToPrompt(model);

    const naturalTokens = estimateTokens(model.naturalPrompt);
    const compiledTokens = estimateTokens(compiled);

    const specDigestTokens = useMemo(() => {
        if (model.deepPlan) return estimateTokens(JSON.stringify(model.deepPlan));
        return Math.ceil(compiledTokens * 0.35);
    }, [model.deepPlan, compiledTokens]);

    const orchestration = model.orchestrationTokenTotal;

    const naiveSum = useMemo(
        () => sumNaiveAgentInputTokens(rounds, POC_BASE_CTX, POC_DELTA_PER_ROUND),
        [rounds]
    );

    const plannedSum = useMemo(
        () =>
            sumPlannedAgentInputTokens(
                POC_BASE_CTX,
                compiledTokens,
                specDigestTokens,
                POC_FOLLOW_UP_CTX
            ),
        [compiledTokens, specDigestTokens]
    );

    const orch = orchestration ?? Math.round((naturalTokens + compiledTokens) * 0.15);

    const illustrativeSavings = Math.max(0, Math.round(naiveSum - plannedSum - orch));
    const savingsLocale = model.language === "ko" ? "ko-KR" : "en-US";

    return (
        <details className="shrink-0 mx-4 mb-2 mt-0 rounded border border-border/60 bg-background/40 px-2 py-1.5">
            <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground select-none">
                {t.tokenScenarioTitle}
            </summary>
            <div className="mt-2 space-y-2.5 pb-1">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {t.tokenPocLeadBefore}
                    <span className="text-foreground font-semibold tabular-nums"> {rounds} </span>
                    {t.tokenPocLeadAfter}
                </p>
                <SliderRow label={t.tokenRounds} min={2} max={12} step={1} value={rounds} onChange={setRounds} />
                <div className="rounded-md border border-border/60 bg-muted/20 px-2.5 py-2 space-y-1">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{t.tokenFixedNote}</p>
                    <div className="flex items-baseline justify-between gap-2 pt-0.5">
                        <span className="text-[10px] font-medium text-muted-foreground">{t.tokenIllustrativeLabel}</span>
                        <span className="text-sm font-semibold tabular-nums text-emerald-600">
                            ~{illustrativeSavings.toLocaleString(savingsLocale)}
                        </span>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{t.tokenPocDisclaimer}</p>
            </div>
        </details>
    );
}

function SliderRow(props: {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (n: number) => void;
}) {
    const { label, min, max, step, value, onChange } = props;
    return (
        <label className="flex items-center gap-2 text-[10px]">
            <span className="w-[140px] shrink-0 text-muted-foreground">{label}</span>
            <input
                type="range"
                className="flex-1 accent-foreground"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <span className="w-12 text-right font-mono text-foreground">{value}</span>
        </label>
    );
}
