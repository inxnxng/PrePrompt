export type { HandoffArchetypeId, HandoffArchetypeDefinition } from "./i18n.harness";
export { HANDOFF_ARCHETYPE_IDS, HANDOFF_ARCHETYPES } from "./i18n.harness";

import type { HandoffArchetypeId, HandoffArchetypeDefinition } from "./i18n.harness";
import { HANDOFF_ARCHETYPES } from "./i18n.harness";

const ARCHETYPE_BY_ID: Record<HandoffArchetypeId, HandoffArchetypeDefinition> = Object.fromEntries(
  HANDOFF_ARCHETYPES.map((a) => [a.id, a])
) as Record<HandoffArchetypeId, HandoffArchetypeDefinition>;

export function getHandoffArchetype(id: HandoffArchetypeId): HandoffArchetypeDefinition {
  return ARCHETYPE_BY_ID[id];
}

export function archetypeSpecAddendum(id: HandoffArchetypeId): string {
  return getHandoffArchetype(id).specAddendum;
}

export function archetypeAgentsAddendum(id: HandoffArchetypeId): string {
  return getHandoffArchetype(id).agentsAddendum;
}

export function archetypeHarnessAddendum(id: HandoffArchetypeId): string {
  return getHandoffArchetype(id).harnessAddendum;
}

export function archetypeChatKickoff(id: HandoffArchetypeId): string {
  return getHandoffArchetype(id).chatKickoff;
}
