"use client";

import { cn } from "@/lib/utils";
import {
  HANDOFF_AGENT_TARGETS,
  handoffTargetOptionLabel,
  type HandoffAgentTarget,
} from "@/lib/handoffAgentTargets";
import type { Translation } from "@/lib/i18n";

const SELECT_CLASSES =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

type Props = {
  value: HandoffAgentTarget;
  onChange: (next: HandoffAgentTarget) => void;
  t: Translation;
  className?: string;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export function HandoffAgentTargetSelect({
  value,
  onChange,
  t,
  className,
  id,
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <select
      id={id}
      className={cn(SELECT_CLASSES, className)}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel ?? t.exportHandoffTarget}
      onChange={(e) => onChange(e.target.value as HandoffAgentTarget)}
    >
      {HANDOFF_AGENT_TARGETS.map((agentId) => (
        <option key={agentId} value={agentId}>
          {handoffTargetOptionLabel(t, agentId)}
        </option>
      ))}
    </select>
  );
}
