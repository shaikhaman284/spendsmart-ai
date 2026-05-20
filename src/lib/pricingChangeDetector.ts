import { PRICING_DATA, PRICING_VERSION } from './pricingData';
import { auditEngine, calculateTotalSavings } from './auditEngine';
import { FormData, AuditResult } from './types';

export interface PricingSnapshot {
  data: Record<string, Record<string, { name: string; price: number; isPerSeat?: boolean }>>;
  version: string;
  lastUpdated: string;
  snapshotAt: string;
}

export interface PricePlanChange {
  tool: string;
  plan: string;
  oldPrice: number;
  newPrice: number;
}

export interface PricePlanAdded {
  tool: string;
  plan: string;
  newPrice: number;
}

export interface PricePlanRemoved {
  tool: string;
  plan: string;
  oldPrice: number;
}

export interface RecommendationChange {
  tool: string;
  oldRecommendation: string;
  newRecommendation: string;
  oldSavings: number;
  newSavings: number;
}

export interface PricingDiff {
  hasChanges: boolean;
  priceChanges: PricePlanChange[];
  plansAdded: PricePlanAdded[];
  plansRemoved: PricePlanRemoved[];
  recommendationChanges: RecommendationChange[];
  oldTotalSavings: number;
  newTotalSavings: number;
}

/**
 * Compares a stored pricing snapshot against the current PRICING_DATA.
 * Uses JSON.stringify for value-based deep comparison (not reference comparison).
 *
 * @param snapshot - The pricing snapshot stored at the time of the original audit
 * @param overrides - Optional price overrides to simulate a price change
 * @returns A PricingDiff describing what changed
 */
export function comparePricingSnapshots(
  snapshot: PricingSnapshot,
  overrides?: Record<string, Record<string, { price: number }>>
): {
  hasChanges: boolean;
  priceChanges: PricePlanChange[];
  plansAdded: PricePlanAdded[];
  plansRemoved: PricePlanRemoved[];
} {
  // Short-circuit: if versions match and no overrides, nothing changed
  if (snapshot.version === PRICING_VERSION && !overrides) {
    return {
      hasChanges: false,
      priceChanges: [],
      plansAdded: [],
      plansRemoved: [],
    };
  }

  const priceChanges: PricePlanChange[] = [];
  const plansAdded: PricePlanAdded[] = [];
  const plansRemoved: PricePlanRemoved[] = [];

  const snapshotData = snapshot.data;
  // Apply any override values on top of live pricing
  const currentData: typeof snapshotData = JSON.parse(JSON.stringify(PRICING_DATA));
  if (overrides) {
    for (const [toolKey, plans] of Object.entries(overrides)) {
      if (currentData[toolKey]) {
        for (const [planKey, override] of Object.entries(plans)) {
          if (currentData[toolKey][planKey]) {
            currentData[toolKey][planKey].price = override.price;
          }
        }
      }
    }
  }

  // Check all tools present in snapshot
  for (const [toolKey, snapshotPlans] of Object.entries(snapshotData)) {
    const currentPlans = currentData[toolKey];
    if (!currentPlans) {
      // Entire tool removed — treat each plan as removed
      for (const [planKey, plan] of Object.entries(snapshotPlans)) {
        plansRemoved.push({ tool: toolKey, plan: planKey, oldPrice: plan.price });
      }
      continue;
    }
    for (const [planKey, snapshotPlan] of Object.entries(snapshotPlans)) {
      const currentPlan = currentPlans[planKey];
      if (!currentPlan) {
        plansRemoved.push({ tool: toolKey, plan: planKey, oldPrice: snapshotPlan.price });
      } else if (currentPlan.price !== snapshotPlan.price) {
        priceChanges.push({
          tool: toolKey,
          plan: planKey,
          oldPrice: snapshotPlan.price,
          newPrice: currentPlan.price,
        });
      }
    }
  }

  // Check for new tools / plans added since snapshot
  for (const [toolKey, currentPlans] of Object.entries(currentData)) {
    const snapshotPlans = snapshotData[toolKey] || {};
    for (const [planKey, currentPlan] of Object.entries(currentPlans)) {
      if (!snapshotPlans[planKey]) {
        plansAdded.push({ tool: toolKey, plan: planKey, newPrice: currentPlan.price });
      }
    }
  }

  return {
    hasChanges: priceChanges.length > 0 || plansAdded.length > 0 || plansRemoved.length > 0,
    priceChanges,
    plansAdded,
    plansRemoved,
  };
}

/**
 * Determines whether re-running the audit engine with current pricing
 * would produce different recommendations compared to the stored output.
 *
 * @param inputStack  - The original FormData used to produce the audit
 * @param oldResults  - The stored AuditResult[] from the original audit
 * @returns Array of changed recommendations (empty if nothing changed)
 */
export function detectRecommendationChanges(
  inputStack: FormData,
  oldResults: AuditResult[]
): RecommendationChange[] {
  const newResults = auditEngine(inputStack);
  const changes: RecommendationChange[] = [];

  for (const newResult of newResults) {
    const oldResult = oldResults.find((r) => r.tool === newResult.tool);
    if (!oldResult) continue;

    // Use JSON.stringify for value-based comparison to avoid reference pitfalls
    const oldRecoStr = JSON.stringify({
      action: oldResult.recommendedAction,
      savings: oldResult.savings,
    });
    const newRecoStr = JSON.stringify({
      action: newResult.recommendedAction,
      savings: newResult.savings,
    });

    if (oldRecoStr !== newRecoStr) {
      changes.push({
        tool: newResult.tool,
        oldRecommendation: oldResult.recommendedAction,
        newRecommendation: newResult.recommendedAction,
        oldSavings: oldResult.savings,
        newSavings: newResult.savings,
      });
    }
  }

  return changes;
}

/**
 * Full diff for an audit: compares snapshot pricing AND re-runs the engine.
 * Returns everything needed to construct the notification email and diff view.
 */
export function buildAuditDiff(
  inputStack: FormData,
  oldResults: AuditResult[],
  pricingSnapshot: PricingSnapshot,
  overrides?: Record<string, Record<string, { price: number }>>
): PricingDiff {
  const { hasChanges, priceChanges, plansAdded, plansRemoved } = comparePricingSnapshots(
    pricingSnapshot,
    overrides
  );

  const recommendationChanges = detectRecommendationChanges(inputStack, oldResults);

  const oldTotal = calculateTotalSavings(oldResults).monthly;
  const newResults = auditEngine(inputStack);
  const newTotal = calculateTotalSavings(newResults).monthly;

  return {
    hasChanges: hasChanges || recommendationChanges.length > 0,
    priceChanges,
    plansAdded,
    plansRemoved,
    recommendationChanges,
    oldTotalSavings: oldTotal,
    newTotalSavings: newTotal,
  };
}
