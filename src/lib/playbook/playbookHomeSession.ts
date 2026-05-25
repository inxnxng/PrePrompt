import type { HandoffArchetypeId } from "@/lib/handoffArchetypes";
import { HANDOFF_ARCHETYPE_IDS } from "@/lib/handoffArchetypes";

/** Session flag: work page shows one-shot hint after playbook → request draft handoff. */
export const PLAYBOOK_HOME_SESSION_KEY = "preprompt-playbook-to-home-v1";

const PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY = "preprompt-playbook-handoff-archetype-v1";

function isHandoffArchetypeId(s: string): s is HandoffArchetypeId {
  return (HANDOFF_ARCHETYPE_IDS as readonly string[]).includes(s);
}

/**
 * Marks navigation from playbook → /work. Optionally stores a handoff archetype so
 * the result page ZIP / chat one-liner can match the template the user picked.
 */
export function markPlaybookHomeNavigation(handoffArchetypeId?: HandoffArchetypeId | null): void {
  try {
    sessionStorage.setItem(PLAYBOOK_HOME_SESSION_KEY, "1");
    if (handoffArchetypeId != null) {
      sessionStorage.setItem(PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY, handoffArchetypeId);
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

/** Call when the handoff export UI mounts; returns playbook hint once and clears it. */
export function consumePlaybookHandoffArchetypeHint(): HandoffArchetypeId | null {
  try {
    const v = sessionStorage.getItem(PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY);
    if (!v) return null;
    sessionStorage.removeItem(PLAYBOOK_HANDOFF_ARCHETYPE_SESSION_KEY);
    return isHandoffArchetypeId(v) ? v : null;
  } catch {
    return null;
  }
}
