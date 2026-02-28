"use client";

import { Stage, STAGES } from "@/components/StageNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CognitiveModel } from "@/store/usePromptStore";
import { CheckIcon, SparklesIcon } from "lucide-react";

const STAGE_META: Record<
    Exclude<keyof CognitiveModel, "apiKey" | "isGenerating">,
    { placeholder: string; bad?: string; good?: string }
> = {
    naturalPrompt: {
        placeholder: "Write your initial, unstructured prompt here as you normally would...",
    },
    intentLock: {
        placeholder: "Define the desired end-state clearly and specifically...",
        bad: "Make a login system.",
        good: "- Email/password login.\n- JWT issuance.\n- No session storage.",
    },
    realityAnchor: {
        placeholder: "Describe your current system state explicitly...",
        bad: "Add login to my project.",
        good: "- Next.js 14 App Router.\n- Supabase connected.\n- No existing authentication system.",
    },
    constraintCage: {
        placeholder: "List non-negotiable boundaries and restrictions...",
        bad: "Make the code clean and fast.\nUse whatever library you think is best.",
        good: "- Must use Next.js App Router.\n- Pure Tailwind CSS, no custom CSS files.\n- Strictly avoid class components.\n- Do NOT modify the database schema.",
    },
    actionSlice: {
        placeholder: "Define the smallest meaningful execution unit for this task...",
        bad: "Implement full authentication system.",
        good: "Step 1: Create login form UI only.\n\nNo API wiring.",
    },
    responseContract: {
        placeholder: "Specify expected output format...",
        bad: "Just give me the code.",
        good: "- Provide the final code block only.\n- Output strictly as a unified diff.\n- No introductory or concluding remarks.\n- Include inline comments for regex.",
    },
};

type Props = {
    stage: Stage;
    value: string;
    isGenerating?: boolean;
    onChange: (value: string) => void;
    onNext: () => void;
    onPrev: () => void;
    onAutoStructure?: () => void;
    isFirst: boolean;
    isLast: boolean;
};

export function StageForm({
    stage,
    value,
    isGenerating,
    onChange,
    onNext,
    onPrev,
    onAutoStructure,
    isFirst,
    isLast,
}: Props) {
    const key = stage.key as Exclude<keyof CognitiveModel, "apiKey" | "isGenerating">;
    const meta = STAGE_META[key];

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Stage description & Actions */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stage.description}</p>
                {isFirst && onAutoStructure && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={onAutoStructure}
                        disabled={isGenerating || !value.trim()}
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse">✨ Structuring...</span>
                        ) : (
                            <span>✨ Auto-Structure</span>
                        )}
                    </Button>
                )}
            </div>

            {/* Bad vs Good examples */}
            {meta.bad && meta.good && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-border p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/40">
                                Bad
                            </Badge>
                        </div>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                            {meta.bad}
                        </pre>
                    </div>
                    <div className="rounded-md border border-border p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Badge variant="outline" className="text-[10px] text-green-600 border-green-600/40">
                                Good
                            </Badge>
                        </div>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                            {meta.good}
                        </pre>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Your Input
                </label>
                <Textarea
                    className="flex-1 resize-none font-mono text-sm min-h-[160px]"
                    placeholder={meta.placeholder}
                    value={value}
                    disabled={isGenerating}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrev}
                    disabled={isFirst || isGenerating}
                >
                    Previous
                </Button>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground flex items-center">
                        Step {STAGES.findIndex((s) => s.id === stage.id) + 1} of {STAGES.length}
                    </span>
                    {isLast ? (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                                <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                                Ready in sidebar
                            </span>
                            <Button size="sm" onClick={onNext} disabled={isGenerating} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <CheckIcon className="w-4 h-4" />
                                Done
                            </Button>
                        </div>
                    ) : (
                        <Button size="sm" onClick={onNext} disabled={isGenerating}>
                            Next
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
