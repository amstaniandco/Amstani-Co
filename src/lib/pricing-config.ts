import { normalizeStateName } from "./us-states";

export type StatePricingRule = { markupPercent: number; discountCap: number };

// Resolves the markup/discount limits that apply to a store, based on its
// owner's state. Falls back to the platform-wide default when the state has
// no specific rule (or the owner's state text doesn't match a known state).
export function resolveEffectivePricingRule(
  config: { markupPercent: number; discountCap: number; stateRules?: Record<string, StatePricingRule> },
  ownerState: string | null | undefined
): StatePricingRule {
  const normalized = normalizeStateName(ownerState);
  if (normalized && config.stateRules?.[normalized]) {
    return config.stateRules[normalized];
  }
  return { markupPercent: config.markupPercent, discountCap: config.discountCap };
}
