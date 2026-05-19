"use client";

import { cn } from "@/lib/utils";
import { HANDOFF_ARCHETYPES, type HandoffArchetypeId } from "@/lib/handoffArchetypes";

const SELECT_CLASSES =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

type Props = {
  value: HandoffArchetypeId | null;
  onChange: (next: HandoffArchetypeId | null) => void;
  noneLabel: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export function HandoffArchetypeSelect({
  value,
  onChange,
  noneLabel,
  className,
  id,
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <select
      id={id}
      className={cn(SELECT_CLASSES, className)}
      value={value ?? ""}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : (v as HandoffArchetypeId));
      }}
    >
      <option value="">{noneLabel}</option>
      {HANDOFF_ARCHETYPES.map((a) => (
        <option key={a.id} value={a.id}>
          {a.title}
        </option>
      ))}
    </select>
  );
}
