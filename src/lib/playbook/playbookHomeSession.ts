import type { HandoffArchetypeId } from "@/lib/handoffArchetypes";
import { HANDOFF_ARCHETYPE_IDS } from "@/lib/handoffArchetypes";

/** Session flag: home page shows one-shot hint after playbook → request draft handoff. */
export const PLAYBOOK_HOME_SESSION_KEY = "preprompt-playbook-to-home-v1";

/** One-shot: playbook → home chose a template archetype for the result handoff card. */
export const PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY = "preprompt-playbook-handoff-archetype-v1";

function isHandoffArchetypeId(value: string): value is HandoffArchetypeId {
  return (HANDOFF_ARCHETYPE_IDS as readonly string[]).includes(value);
}

/**
 * Marks navigation from playbook to home (draft handoff).
 * Optionally stores a handoff archetype for `HandoffExportCard` on `/result` (consumed once).
 */
export function markPlaybookHomeNavigation(optionalArchetypeId?: HandoffArchetypeId | null): void {
  try {
    sessionStorage.setItem(PLAYBOOK_HOME_SESSION_KEY, "1");
    if (optionalArchetypeId != null) {
      sessionStorage.setItem(PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY, optionalArchetypeId);
    } else {
      sessionStorage.removeItem(PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY);
    }
  } catch {
    /* private mode / quota */
  }
}

export function consumePlaybookHomeNavigation(): boolean {
  try {
    const v = sessionStorage.getItem(PLAYBOOK_HOME_SESSION_KEY);
    if (v) {
      sessionStorage.removeItem(PLAYBOOK_HOME_SESSION_KEY);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/** Reads and clears the playbook-suggested archetype (tab-scoped). Invalid values are dropped. */
export function consumePlaybookHandoffArchetypeHint(): HandoffArchetypeId | null {
  try {
    const v = sessionStorage.getItem(PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY);
    sessionStorage.removeItem(PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY);
    if (v && isHandoffArchetypeId(v)) return v;
  } catch {
    /* ignore */
  }
  return null;
}
