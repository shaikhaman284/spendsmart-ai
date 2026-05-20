import { comparePricingSnapshots, detectRecommendationChanges, buildAuditDiff } from '../lib/pricingChangeDetector';
import { PRICING_DATA, PRICING_VERSION, PRICING_LAST_UPDATED } from '../lib/pricingData';
import { FormData, AuditResult } from '../lib/types';

// Helper: build a valid pricing snapshot from current PRICING_DATA
function buildCurrentSnapshot() {
  return {
    data: JSON.parse(JSON.stringify(PRICING_DATA)),
    version: PRICING_VERSION,
    lastUpdated: PRICING_LAST_UPDATED,
    snapshotAt: new Date().toISOString(),
  };
}

// Helper: build a stale snapshot with modified prices
function buildStaleSnapshot(overridePrices: Record<string, Record<string, number>> = {}) {
  const data: Record<string, Record<string, { name: string; price: number; isPerSeat?: boolean }>> =
    JSON.parse(JSON.stringify(PRICING_DATA));

  for (const [tool, plans] of Object.entries(overridePrices)) {
    if (data[tool]) {
      for (const [plan, price] of Object.entries(plans)) {
        if (data[tool][plan]) {
          data[tool][plan].price = price;
        }
      }
    }
  }

  return {
    data,
    version: 'old-version',
    lastUpdated: '2025-01-01T00:00:00.000Z',
    snapshotAt: '2025-01-01T00:00:00.000Z',
  };
}

describe('pricingChangeDetector', () => {
  // ─── comparePricingSnapshots ──────────────────────────────────────────────

  describe('comparePricingSnapshots', () => {
    test('no change: same version returns hasChanges=false without comparing data', () => {
      const snapshot = buildCurrentSnapshot();
      const result = comparePricingSnapshots(snapshot);
      expect(result.hasChanges).toBe(false);
      expect(result.priceChanges).toHaveLength(0);
    });

    test('price moved: detects when cursor pro price changed', () => {
      // Snapshot says cursor.pro was $10 (old, cheap price)
      const snapshot = buildStaleSnapshot({ cursor: { pro: 10 } });
      // Current pricing has cursor.pro at $20
      const result = comparePricingSnapshots(snapshot);

      expect(result.hasChanges).toBe(true);
      const change = result.priceChanges.find(
        (c) => c.tool === 'cursor' && c.plan === 'pro'
      );
      expect(change).toBeDefined();
      expect(change?.oldPrice).toBe(10);
      expect(change?.newPrice).toBe(20); // current PRICING_DATA value
    });

    test('plan removed: detects when a plan in snapshot no longer exists in current data', () => {
      // Snapshot includes a plan that does NOT exist in current PRICING_DATA
      const snapshot = buildStaleSnapshot();
      // Inject a fake plan that doesn't exist live
      (snapshot.data as any)['cursor']['ultra'] = { name: 'Ultra', price: 999 };

      const result = comparePricingSnapshots(snapshot);
      expect(result.hasChanges).toBe(true);
      const removed = result.plansRemoved.find(
        (p) => p.tool === 'cursor' && p.plan === 'ultra'
      );
      expect(removed).toBeDefined();
      expect(removed?.oldPrice).toBe(999);
    });

    test('no change: snapshot identical to current data but different version', () => {
      // Stale version string but prices match
      const snapshot = buildStaleSnapshot(); // only version is old, prices are same
      const result = comparePricingSnapshots(snapshot);
      // Prices all match, nothing added or removed
      expect(result.priceChanges).toHaveLength(0);
      expect(result.plansAdded).toHaveLength(0);
      expect(result.plansRemoved).toHaveLength(0);
      expect(result.hasChanges).toBe(false);
    });

    test('override: simulated price change via overrides param', () => {
      const snapshot = buildCurrentSnapshot(); // same version — would short-circuit
      // Force a price change via override
      const result = comparePricingSnapshots(snapshot, { cursor: { pro: { price: 35 } } });
      // With override, current cursor.pro becomes $35 vs snapshot's $20
      expect(result.hasChanges).toBe(true);
      const change = result.priceChanges.find((c) => c.tool === 'cursor' && c.plan === 'pro');
      expect(change?.oldPrice).toBe(20);
      expect(change?.newPrice).toBe(35);
    });
  });

  // ─── detectRecommendationChanges ─────────────────────────────────────────

  describe('detectRecommendationChanges', () => {
    test('no change: same inputs produce same recommendations', () => {
      const formData: FormData = {
        tools: [{ tool: 'cursor', plan: 'business', seats: 2 }],
        teamSize: 2,
        primaryUseCase: 'coding',
      };
      // Old results = run the engine once
      const { auditEngine } = require('../lib/auditEngine');
      const oldResults: AuditResult[] = auditEngine(formData);

      const changes = detectRecommendationChanges(formData, oldResults);
      expect(changes).toHaveLength(0);
    });

    test('detects when old results differ from engine re-run (stale old results)', () => {
      const formData: FormData = {
        tools: [{ tool: 'cursor', plan: 'business', seats: 2 }],
        teamSize: 2,
        primaryUseCase: 'coding',
      };

      // Simulate a stale result that said "Keep current plan"
      const staleResults: AuditResult[] = [
        {
          tool: 'cursor',
          currentSpend: 80,
          recommendedAction: 'Keep current plan',
          savings: 0,
          reason: 'Old reason that is now wrong.',
        },
      ];

      const changes = detectRecommendationChanges(formData, staleResults);
      // Engine would now say "Downgrade to Pro" for business plan with 2 seats
      expect(changes).toHaveLength(1);
      expect(changes[0].tool).toBe('cursor');
      expect(changes[0].oldRecommendation).toBe('Keep current plan');
      expect(changes[0].newRecommendation).toBe('Downgrade to Pro');
    });
  });

  // ─── buildAuditDiff ──────────────────────────────────────────────────────

  describe('buildAuditDiff', () => {
    test('no changes when snapshot matches current pricing and engine output is identical', () => {
      const formData: FormData = {
        tools: [{ tool: 'cursor', plan: 'pro', seats: 1 }],
        teamSize: 1,
        primaryUseCase: 'coding',
      };
      const { auditEngine } = require('../lib/auditEngine');
      const currentResults: AuditResult[] = auditEngine(formData);
      const snapshot = buildCurrentSnapshot();

      const diff = buildAuditDiff(formData, currentResults, snapshot);
      expect(diff.hasChanges).toBe(false);
      expect(diff.recommendationChanges).toHaveLength(0);
      expect(diff.priceChanges).toHaveLength(0);
    });

    test('reports changes when price override applied', () => {
      const formData: FormData = {
        tools: [{ tool: 'cursor', plan: 'pro', seats: 1 }],
        teamSize: 1,
        primaryUseCase: 'coding',
      };
      const { auditEngine } = require('../lib/auditEngine');
      const currentResults: AuditResult[] = auditEngine(formData);
      const snapshot = buildCurrentSnapshot();

      const diff = buildAuditDiff(formData, currentResults, snapshot, {
        cursor: { pro: { price: 5 } },
      });
      // Price changed: $20 → $5
      expect(diff.hasChanges).toBe(true);
      expect(diff.priceChanges.length).toBeGreaterThan(0);
    });
  });
});
