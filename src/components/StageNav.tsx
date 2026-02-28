"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

export type Stage = {
    id: number;
    key: string;
    label: string;
    description: string;
};

export const STAGES: Stage[] = [
    { id: 0, key: "naturalPrompt", label: "Initial Draft", description: "Your original, natural language prompt" },
    { id: 1, key: "intentLock", label: "Intent Lock", description: "Define the desired end-state" },
    { id: 2, key: "realityAnchor", label: "Reality Anchor", description: "Describe current system state" },
    { id: 3, key: "constraintCage", label: "Constraint Cage", description: "Define non-negotiable boundaries" },
    { id: 4, key: "actionSlice", label: "Action Slice", description: "Smallest meaningful execution unit" },
    { id: 5, key: "responseContract", label: "Response Contract", description: "Specify output format requirements" },
];

type Props = {
    currentStage: number;
    completedStages: Set<number>;
    onSelect: (id: number) => void;
};

export function StageNav({ currentStage, completedStages, onSelect }: Props) {
    return (
        <nav className="flex flex-col gap-1 p-3 flex-1">
            {STAGES.map((stage) => {
                const isActive = stage.id === currentStage;
                const isCompleted = completedStages.has(stage.id);

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
                        <span className="truncate">{stage.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
