"use client";

import type { HandoffArchetypeId } from "@/lib/handoffArchetypes";
import { getHandoffArchetype, HANDOFF_ARCHETYPE_IDS } from "@/lib/handoffArchetypes";
import type { Translation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SELECT_CLASSES =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

const NONE_VALUE = "__none__";

type Props = {
  value: HandoffArchetypeId | null;
  onChange: (next: HandoffArchetypeId | null) => void;
  t: Translation;
  className?: string;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export function HandoffArchetypeSelect({
  value,
  onChange,
  t,
  className,
  id,
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  const selectValue = value ?? NONE_VALUE;
  return (
    <select
      id={id}
      className={cn(SELECT_CLASSES, className)}
      value={selectValue}
      disabled={disabled}
      aria-label={ariaLabel ?? t.exportHandoffArchetype}
      onChange={(e) => {
        const v = e.target.value;
        if (v === NONE_VALUE) onChange(null);
        else onChange(v as HandoffArchetypeId);
      }}
    >
      <option value={NONE_VALUE}>{t.exportHandoffArchetypeNone}</option>
      {HANDOFF_ARCHETYPE_IDS.map((archetypeId) => (
        <option key={archetypeId} value={archetypeId}>
          {getHandoffArchetype(archetypeId).title}
        </option>
      ))}
    </select>
  );
}
