"use client";

import { Translation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CognitiveModel } from "@/store/usePromptStore";
import { CheckIcon } from "lucide-react";

export type StageKey = Exclude<
    keyof CognitiveModel,
    | "apiKey"
    | "llmProvider"
    | "language"
    | "isGenerating"
    | "baselineTokens"
    | "deepPlan"
    | "orchestrationTokenTotal"
    | "compactPlanning"
>;

export type Stage = {
    id: number;
    key: StageKey;
};

// Internal stable array
export const STAGES: Stage[] = [
    { id: 0, key: "naturalPrompt" },
    { id: 1, key: "intentLock" },
    { id: 2, key: "realityAnchor" },
    { id: 3, key: "constraintCage" },
    { id: 4, key: "actionSlice" },
    { id: 5, key: "responseContract" },
];

type Props = {
    currentStage: number;
    completedStages: Set<number>;
    /** Stage ids whose text field has non-whitespace input (for visual cue). */
    stagesWithContent: Set<number>;
    onSelect: (id: number) => void;
    t: Translation;
    collapsed?: boolean;
};

export function StageNav({
    currentStage,
    completedStages,
    stagesWithContent,
    onSelect,
    t,
    collapsed = false,
}: Props) {
    return (
        <nav
            className={cn(
                "flex flex-col gap-1 flex-1",
                collapsed ? "items-center p-2" : "p-3"
            )}
        >
            {STAGES.map((stage) => {
                const isActive = stage.id === currentStage;
                const isCompleted = completedStages.has(stage.id);
                const hasContent = stagesWithContent.has(stage.id);
                // Get translatable label and description
                const { label } = t.stages[stage.key];

                return (
                    <button
                        key={stage.id}
                        type="button"
                        title={collapsed ? label : undefined}
                        onClick={() => onSelect(stage.id)}
                        className={cn(
                            "relative flex items-center rounded-md text-sm transition-colors",
                            collapsed
                                ? cn(
                                      "h-9 w-9 shrink-0 justify-center p-0",
                                      isActive
                                          ? "bg-foreground text-background"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  )
                                : cn(
                                      "w-full gap-3 px-3 py-2.5 text-left",
                                      isActive
                                          ? "bg-foreground text-background"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  )
                        )}
                    >
                        {!collapsed &&
                        hasContent &&
                        !(isCompleted && !isActive) ? (
                            <span
                                className={cn(
                                    "absolute left-1 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full",
                                    isActive ? "bg-background/50" : "bg-primary/70"
                                )}
                                aria-hidden
                            />
                        ) : null}
                        <span
                            className={cn(
                                "relative flex shrink-0 items-center justify-center rounded-full border text-[10px] font-mono transition-colors",
                                collapsed ? "h-6 w-6" : "h-5 w-5",
                                isActive
                                    ? "border-background/40 text-background"
                                    : isCompleted
                                        ? "border-foreground bg-foreground text-background"
                                        : hasContent
                                          ? "border-primary/55 bg-primary/10 text-primary"
                                          : "border-border"
                            )}
                        >
                            {isCompleted && !isActive ? (
                                <CheckIcon className="h-3 w-3" />
                            ) : (
                                stage.id
                            )}
                            {collapsed && hasContent && !(isCompleted && !isActive) ? (
                                <span
                                    className={cn(
                                        "absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border-2",
                                        isActive
                                            ? "border-foreground bg-background"
                                            : "border-muted/40 bg-primary"
                                    )}
                                    aria-hidden
                                />
                            ) : null}
                        </span>
                        {collapsed ? null : <span className="truncate">{label}</span>}
                    </button>
                );
            })}
        </nav>
    );
}
