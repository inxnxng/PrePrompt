"use client";

import { STAGES } from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import { translations } from "@/lib/i18n";
import { usePromptStore } from "@/store/usePromptStore";
import { ArrowLeftIcon, GithubIcon, GlobeIcon, InfoIcon, MailIcon } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    const language = usePromptStore((state) => state.language);
    const t = translations[language];

    // We only want to show the 5 structural stages in the guidelines,
    // skipping 'naturalPrompt' (index 0) as it's just the initial unstructured draft.
    const structuredStages = STAGES.slice(1);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="border-b border-border px-6 py-4 flex items-center gap-4 bg-muted/20">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t.about.backToHome}
                    </Button>
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">

                    <section className="space-y-4 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-2 border border-primary/20">
                            <InfoIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{t.about.title}</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            {t.about.description}
                        </p>
                    </section>

                    <section className="space-y-8 pt-8 border-t border-border/50">
                        <h2 className="text-2xl font-semibold tracking-tight">{t.about.howToUseTitle}</h2>

                        <div className="space-y-8">
                            {structuredStages.map((stage, index) => {
                                const stageData = t.stages[stage.key as keyof typeof t.stages];
                                if (!stageData) return null;

                                return (
                                    <div key={stage.id} className="group relative pl-8 pb-2">
                                        {/* Timeline Line */}
                                        {index < structuredStages.length - 1 && (
                                            <div className="absolute left-[11px] top-8 bottom-[-24px] w-px bg-border group-hover:bg-primary/30 transition-colors" />
                                        )}

                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm text-xs font-medium text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                            {index + 1}
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-lg font-medium">{stageData.label}</h3>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                                {stageData.description}
                                            </p>
                                            <div className="bg-muted/40 rounded-lg p-4 border border-border/50 space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.rulesLabel || "Guidelines"}</p>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                        {stageData.placeholder.split('\n\n')[0]}
                                                    </p>
                                                </div>
                                                {stageData.tips && stageData.tips.length > 0 && (
                                                    <div className="space-y-2 pt-2 border-t border-border/50">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.tipsLabel}</p>
                                                        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                                                            {stageData.tips.map((tip, i) => (
                                                                <li key={i}>{tip}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="space-y-6 pt-8 border-t border-border/50">
                        <h2 className="text-xl font-semibold tracking-tight">{t.about.developerInfo.title}</h2>
                        <div className="flex flex-col gap-3">
                            <a
                                href="mailto:inkyung.huh.ink@gmail.com"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
                            >
                                <MailIcon className="h-4 w-4" />
                                <span>{t.about.developerInfo.email}: inkyung.huh.ink@gmail.com</span>
                            </a>
                            <a
                                href="https://github.com/inxnxng/PrePrompt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
                            >
                                <GithubIcon className="h-4 w-4" />
                                <span>{t.about.developerInfo.github}: https://github.com/inxnxng/PrePrompt</span>
                            </a>
                            <a
                                href="https://jadelog.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
                            >
                                <GlobeIcon className="h-4 w-4" />
                                <span>{t.about.developerInfo.blog}: https://jadelog.vercel.app/</span>
                            </a>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
