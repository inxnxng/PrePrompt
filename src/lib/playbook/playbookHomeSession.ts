/** Session flag: home page shows one-shot hint after playbook → request draft handoff. */
export const PLAYBOOK_HOME_SESSION_KEY = "preprompt-playbook-to-home-v1";

export function markPlaybookHomeNavigation(): void {
  try {
    sessionStorage.setItem(PLAYBOOK_HOME_SESSION_KEY, "1");
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
