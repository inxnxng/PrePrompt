"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  okLabel: string;
};

export function AppAlertDialog({
  open,
  onOpenChange,
  title,
  message,
  okLabel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-[min(100%,min(36rem,calc(100vw-2rem)))] shadow-xl"
      >
        <DialogHeader className="space-y-2 px-5 pt-5 pb-1 text-left sm:text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription
            className={cn(
              "text-left leading-relaxed text-muted-foreground whitespace-pre-wrap max-h-[min(60vh,24rem)] overflow-y-auto",
              message.trimStart().startsWith("{")
                ? "font-mono text-xs"
                : "text-sm"
            )}
          >
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-border bg-muted/40 px-3 py-3">
          <DialogClose asChild>
            <Button type="button" className="h-9 w-full font-medium" autoFocus>
              {okLabel}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
