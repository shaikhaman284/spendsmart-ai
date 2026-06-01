export const PRICING_DATA = {
  cursor: {
    hobby: { name: 'Hobby', price: 0 },
    pro: { name: 'Pro', price: 20 },
    business: { name: 'Business', price: 40, isPerSeat: true },
    enterprise: { name: 'Enterprise', price: 0 }, // custom pricing
  },
  github_copilot: {
    individual: { name: 'Individual', price: 10 },
    business: { name: 'Business', price: 19, isPerSeat: true },
    enterprise: { name: 'Enterprise', price: 39, isPerSeat: true },
  },
  claude: {
    free: { name: 'Free', price: 0 },
    pro: { name: 'Pro', price: 20 },
    max: { name: 'Max', price: 100 },
    team: { name: 'Team', price: 30, isPerSeat: true },
    enterprise: { name: 'Enterprise', price: 0 }, // custom pricing
    api: { name: 'API Direct', price: 0 }, // usage-based
  },
  chatgpt: {
    free: { name: 'Free', price: 0 },
    plus: { name: 'Plus', price: 20 },
    team: { name: 'Team', price: 30, isPerSeat: true },
    enterprise: { name: 'Enterprise', price: 0 }, // custom pricing
    api: { name: 'API Direct', price: 0 }, // usage-based
  },
  anthropic_api: {
    api: { name: 'API Direct', price: 0 }, // usage-based
  },
  openai_api: {
    api: { name: 'API Direct', price: 0 }, // usage-based
  },
  gemini: {
    free: { name: 'Free', price: 0 },
    pro: { name: 'Pro', price: 20 },
    ultra: { name: 'Ultra', price: 300 },
    api: { name: 'API Direct', price: 0 }, // usage-based
  },
  windsurf: {
    free: { name: 'Free', price: 0 },
    pro: { name: 'Pro', price: 15 },
    teams: { name: 'Teams', price: 35, isPerSeat: true },
  },
} as const;

export type ToolName = keyof typeof PRICING_DATA;

/**
 * Pricing data version — increment whenever PRICING_DATA changes.
 * Used for snapshot comparison in re-audit feature.
 */
export const PRICING_VERSION = '1.0.0';

/**
 * ISO timestamp of the last pricing update.
 * Stored in every audit's pricing_snapshot for audit trail purposes.
 */
export const PRICING_LAST_UPDATED = '2026-05-20T10:00:00Z';

/**
 * Get a snapshot of current pricing data for storage
 */
export function getPricingSnapshot() {
  return {
    version: PRICING_VERSION,
    lastUpdated: PRICING_LAST_UPDATED,
    data: JSON.parse(JSON.stringify(PRICING_DATA)),
  };
}
