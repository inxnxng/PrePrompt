import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CompassIcon, HistoryIcon, PenLineIcon } from "lucide-react";
import Link from "next/link";

const hubCardClass =
  "group flex h-full flex-col transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";

const secondaryMinH = "min-h-[9.5rem]";
/** Main entry — ~2× secondary card footprint (height + visual scale). */
const workMinH = "min-h-[19rem]";

export default function AppHubPage() {
  const secondary = [
    {
      href: "/playbook",
      title: t.navPlaybook,
      description: t.hubPlaybookDesc,
      Icon: CompassIcon,
    },
    {
      href: "/history",
      title: t.navHistory,
      description: t.hubHistoryDesc,
      Icon: HistoryIcon,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-muted/20 px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t.hubTitle}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.hubSubtitle}</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-4">
          <Link href="/work" className={cn("block h-full", workMinH)}>
            <Card className={cn("h-full min-h-[inherit] border-border/80 shadow-sm", hubCardClass)}>
              <CardHeader className="flex h-full flex-col justify-center gap-5 px-8 py-10 sm:px-10 sm:py-12">
                <div className="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 sm:h-24 sm:w-24">
                  <PenLineIcon className="h-10 w-10 text-primary sm:h-12 sm:w-12" aria-hidden />
                </div>
                <div className="space-y-2.5">
                  <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl group-hover:text-primary transition-colors">
                    {t.hubWorkTitle}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed sm:text-lg">
                    {t.hubWorkDesc}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {secondary.map(({ href, title, description, Icon }) => (
              <Link key={href} href={href} className={cn("block h-full", secondaryMinH)}>
                <Card className={cn("h-full min-h-[inherit] border-border/80 shadow-sm", hubCardClass)}>
                  <CardHeader className="space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <CardTitle className="text-lg leading-snug group-hover:text-primary transition-colors">
                      {title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
