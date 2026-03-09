"use client";

import { Translation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CognitiveModel } from "@/store/usePromptStore";
import { CheckIcon } from "lucide-react";

export type StageKey = Exclude<keyof CognitiveModel, "apiKey" | "language" | "isGenerating" | "baselineTokens">;

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
    onSelect: (id: number) => void;
    t: Translation;
};

export function StageNav({ currentStage, completedStages, onSelect, t }: Props) {
    return (
        <nav className="flex flex-col gap-1 p-3 flex-1">
            {STAGES.map((stage) => {
                const isActive = stage.id === currentStage;
                const isCompleted = completedStages.has(stage.id);
                // Get translatable label and description
                const { label } = t.stages[stage.key];

                return (
                    <button
                        key={stage.id}
                        onClick={() => onSelect(stage.id)}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors w-full",
                            isActive
                                ? "bg-foreground text-background"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <span
                            className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono transition-colors",
                                isActive
                                    ? "border-background/40 text-background"
                                    : isCompleted
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border"
                            )}
                        >
                            {isCompleted && !isActive ? (
                                <CheckIcon className="h-3 w-3" />
                            ) : (
                                stage.id
                            )}
                        </span>
                        <span className="truncate">{label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
