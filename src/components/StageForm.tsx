"use client";

import { Stage } from "@/components/StageNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    readGuidancePanelOpenFromCookie,
    writeGuidancePanelOpenToCookie,
} from "@/lib/guidancePanelCookie";
import { Translation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, LightbulbIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
    stage: Stage;
    value: string;
    isGenerating?: boolean;
    onChange: (value: string) => void;
    onAutoStructure?: () => void;
    isFirst: boolean;
    t: Translation;
};

export function StageForm({
    stage,
    value,
    isGenerating,
    onChange,
    onAutoStructure,
    isFirst,
    t
}: Props) {
    const [guidancePanelOpen, setGuidancePanelOpen] = useState(true);
    useEffect(() => {
        queueMicrotask(() => {
            const saved = readGuidancePanelOpenFromCookie();
            if (saved !== null) setGuidancePanelOpen(saved);
        });
    }, []);
    const meta = t.stages[stage.key];
    const hasTips = Boolean(meta.tips?.length);
    const hasExamples = Boolean(meta.bad && meta.good);
    const hasGuidancePanel = hasTips || hasExamples;

    // Specificity indicator
    const count = value.length;
    let scoreText = t.specificityLow;
    let colorClass = "text-destructive bg-destructive/10";
    if (count >= 150) {
        scoreText = t.specificityHigh;
        colorClass = "text-emerald-600 bg-emerald-600/10";
    } else if (count >= 30) {
        scoreText = t.specificityMid;
        colorClass = "text-amber-600 bg-amber-600/10";
    }
    if (count === 0) {
        scoreText = "-";
        colorClass = "text-muted-foreground bg-muted";
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6">
            {/* Tips + bad/good examples (single collapsible) */}
            {hasGuidancePanel && (
                <div className="rounded-md border border-border bg-muted/20 overflow-hidden text-left">
                    <button
                        type="button"
                        onClick={() => {
                            const next = !guidancePanelOpen;
                            setGuidancePanelOpen(next);
                            writeGuidancePanelOpenToCookie(next);
                        }}
                        className="w-full flex items-center justify-between p-3 text-xs font-medium hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <LightbulbIcon className="w-3.5 h-3.5 text-amber-500" />
                            {t.tipsLabel}
                        </div>
                        <ChevronDownIcon
                            className={cn("w-4 h-4 text-muted-foreground transition-transform", guidancePanelOpen ? "rotate-180" : "")}
                        />
                    </button>
                    {guidancePanelOpen && (
                        <div className="p-3 pt-0 border-t border-border/50 bg-background/30 text-left">
                            {hasTips && (
                                <ul className="space-y-1.5 mt-2">
                                    {(meta.tips ?? []).map((tip, i) => (
                                        <li key={i} className="text-[11px] text-muted-foreground flex gap-2">
                                            <span className="text-muted-foreground/50 mt-[1px]">•</span>
                                            <span className="leading-relaxed">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {hasExamples && (
                                <div className={cn("grid grid-cols-2 gap-3", hasTips && "mt-4")}>
                                    <div className="rounded-md border border-border p-3 flex flex-col items-start text-left bg-background/40">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] text-destructive border-destructive/40 bg-destructive/5 rounded-sm px-1.5 py-0"
                                            >
                                                {t.bad}
                                            </Badge>
                                        </div>
                                        <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed max-w-full overflow-hidden">
                                            {meta.bad}
                                        </pre>
                                    </div>
                                    <div className="rounded-md border border-border p-3 flex flex-col items-start bg-emerald-500/5 text-left">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] text-emerald-600 border-emerald-600/40 bg-emerald-600/10 rounded-sm px-1.5 py-0"
                                            >
                                                {t.good}
                                            </Badge>
                                        </div>
                                        <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed max-w-full overflow-hidden">
                                            {meta.good}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Auto-Structure (first stage only) */}
            {isFirst && onAutoStructure && (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onAutoStructure}
                        disabled={isGenerating || !value.trim()}
                        className="gap-2 shrink-0 border border-border bg-background hover:bg-muted"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">{t.autoStructuring}</span>
                        ) : (
                            <span>{t.autoStructure}</span>
                        )}
                    </Button>
                </div>
            )}

            {/* Input */}
            <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="flex shrink-0 items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t.yourInput}
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase">{t.specificityLabel}:</span>
                        <div className={cn("text-[10px] font-medium px-2 py-0.5 rounded-sm transition-colors", colorClass)}>
                            {scoreText}
                        </div>
                    </div>
                </div>
                <Textarea
                    className="field-sizing-fixed min-h-[200px] flex-1 resize-y font-mono text-sm p-4 bg-background/50 focus-visible:bg-background transition-colors leading-relaxed"
                    placeholder={meta.placeholder}
                    value={value}
                    disabled={isGenerating}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
