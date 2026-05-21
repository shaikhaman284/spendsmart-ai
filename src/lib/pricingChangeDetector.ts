import { auditEngine, calculateTotalSavings } from './auditEngine';
import { FormData, AuditResult } from './types';
import { PRICING_DATA } from './pricingData';

export interface PricingChange {
  tool: string;
  plan: string;
  oldPrice: number;
  newPrice: number;
  changeType: 'price_increase' | 'price_decrease' | 'plan_added' | 'plan_removed';
}

export interface AuditComparison {
  auditId: string;
  userEmail: string | null;
  hasChanges: boolean;
  pricingChanges: PricingChange[];
  oldRecommendations: AuditResult[];
  newRecommendations: AuditResult[];
  oldTotalSavings: number;
  newTotalSavings: number;
  savingsDelta: number;
}

/**
 * Compare a stored pricing snapshot against current pricing data
 */
export function detectPricingChanges(
  storedSnapshot: { version?: string; lastUpdated?: string; data?: Record<string, Record<string, { name: string; price: number; isPerSeat?: boolean }>> },
  currentPricing: typeof PRICING_DATA = PRICING_DATA
): PricingChange[] {
  const changes: PricingChange[] = [];

  if (!storedSnapshot || !storedSnapshot.data) {
    return changes;
  }

  const oldData = storedSnapshot.data;

  // Check each tool in current pricing
  for (const [toolName, toolPlans] of Object.entries(currentPricing)) {
    const oldToolPlans = oldData[toolName];

    if (!oldToolPlans) {
      // Tool was added (not relevant for existing audits)
      continue;
    }

    // Check each plan
    for (const [planName, planData] of Object.entries(toolPlans)) {
      const oldPlanData = oldToolPlans[planName];

      if (!oldPlanData) {
        // Plan was added
        changes.push({
          tool: toolName,
          plan: planName,
          oldPrice: 0,
          newPrice: planData.price,
          changeType: 'plan_added',
        });
      } else if (planData.price !== oldPlanData.price) {
        // Price changed
        changes.push({
          tool: toolName,
          plan: planName,
          oldPrice: oldPlanData.price,
          newPrice: planData.price,
          changeType:
            planData.price > oldPlanData.price ? 'price_increase' : 'price_decrease',
        });
      }
    }

    // Check for removed plans
    for (const [planName, planData] of Object.entries(oldToolPlans)) {
      if (!toolPlans[planName as keyof typeof toolPlans]) {
        changes.push({
          tool: toolName,
          plan: planName,
          oldPrice: planData.price,
          newPrice: 0,
          changeType: 'plan_removed',
        });
      }
    }
  }

  return changes;
}

/**
 * Compare an audit's stored results against what the engine would produce now
 */
export function compareAuditResults(
  storedAudit: {
    id: string;
    user_email: string | null;
    input_stack: FormData;
    output_result: AuditResult[];
    pricing_snapshot: { version?: string; lastUpdated?: string; data?: Record<string, Record<string, { name: string; price: number; isPerSeat?: boolean }>> };
  },
  currentPricing: typeof PRICING_DATA = PRICING_DATA
): AuditComparison {
  const { id, user_email, input_stack, output_result, pricing_snapshot } = storedAudit;

  // Detect pricing changes
  const pricingChanges = detectPricingChanges(pricing_snapshot, currentPricing);

  // Re-run audit with current pricing
  const newResults = auditEngine(input_stack);
  const oldTotalSavings = calculateTotalSavings(output_result).monthly;
  const newTotalSavings = calculateTotalSavings(newResults).monthly;

  // Check if recommendations changed
  const hasChanges = checkRecommendationsChanged(output_result, newResults);

  return {
    auditId: id,
    userEmail: user_email,
    hasChanges: hasChanges || pricingChanges.length > 0,
    pricingChanges,
    oldRecommendations: output_result,
    newRecommendations: newResults,
    oldTotalSavings,
    newTotalSavings,
    savingsDelta: newTotalSavings - oldTotalSavings,
  };
}

/**
 * Check if recommendations changed between two audit results
 */
function checkRecommendationsChanged(
  oldResults: AuditResult[],
  newResults: AuditResult[]
): boolean {
  if (oldResults.length !== newResults.length) {
    return true;
  }

  // Create maps for easier comparison
  const oldMap = new Map(oldResults.map(r => [r.tool, r]));
  const newMap = new Map(newResults.map(r => [r.tool, r]));

  for (const [tool, oldResult] of Array.from(oldMap.entries())) {
    const newResult = newMap.get(tool);
    if (!newResult) {
      return true;
    }

    // Check if key fields changed
    if (
      oldResult.recommendedAction !== newResult.recommendedAction ||
      oldResult.savings !== newResult.savings ||
      oldResult.currentSpend !== newResult.currentSpend
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Group affected audits by user email
 */
export function groupAuditsByEmail(
  comparisons: AuditComparison[]
): Map<string, AuditComparison[]> {
  const grouped = new Map<string, AuditComparison[]>();

  for (const comparison of comparisons) {
    if (!comparison.userEmail || !comparison.hasChanges) {
      continue;
    }

    const existing = grouped.get(comparison.userEmail) || [];
    existing.push(comparison);
    grouped.set(comparison.userEmail, existing);
  }

  return grouped;
}
