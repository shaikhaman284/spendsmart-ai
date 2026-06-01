import { detectPricingChanges, compareAuditResults } from '../lib/pricingChangeDetector';
import { PRICING_DATA } from '../lib/pricingData';
import { FormData, AuditResult } from '../lib/types';

describe('Pricing Change Detector', () => {
  describe('detectPricingChanges', () => {
    it('should detect price increase', () => {
      const oldSnapshot = {
        version: '1.0.0',
        lastUpdated: '2026-05-01',
        data: {
          cursor: {
            pro: { name: 'Pro', price: 20 },
          },
        },
      };

      const newPricing = {
        cursor: {
          pro: { name: 'Pro', price: 25 },
        },
      };

      const changes = detectPricingChanges(oldSnapshot, newPricing as typeof PRICING_DATA);

      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        tool: 'cursor',
        plan: 'pro',
        oldPrice: 20,
        newPrice: 25,
        changeType: 'price_increase',
      });
    });

    it('should detect price decrease', () => {
      const oldSnapshot = {
        version: '1.0.0',
        lastUpdated: '2026-05-01',
        data: {
          cursor: {
            pro: { name: 'Pro', price: 20 },
          },
        },
      };

      const newPricing = {
        cursor: {
          pro: { name: 'Pro', price: 15 },
        },
      };

      const changes = detectPricingChanges(oldSnapshot, newPricing as typeof PRICING_DATA);

      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        tool: 'cursor',
        plan: 'pro',
        oldPrice: 20,
        newPrice: 15,
        changeType: 'price_decrease',
      });
    });

    it('should detect plan removed', () => {
      const oldSnapshot = {
        version: '1.0.0',
        lastUpdated: '2026-05-01',
        data: {
          cursor: {
            pro: { name: 'Pro', price: 20 },
            business: { name: 'Business', price: 40 },
          },
        },
      };

      const newPricing = {
        cursor: {
          pro: { name: 'Pro', price: 20 },
        },
      };

      const changes = detectPricingChanges(oldSnapshot, newPricing as typeof PRICING_DATA);

      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({
        tool: 'cursor',
        plan: 'business',
        oldPrice: 40,
        newPrice: 0,
        changeType: 'plan_removed',
      });
    });

    it('should return empty array when no changes', () => {
      const oldSnapshot = {
        version: '1.0.0',
        lastUpdated: '2026-05-01',
        data: {
          cursor: {
            pro: { name: 'Pro', price: 20 },
          },
        },
      };

      const newPricing = {
        cursor: {
          pro: { name: 'Pro', price: 20 },
        },
      };

      const changes = detectPricingChanges(oldSnapshot, newPricing as typeof PRICING_DATA);

      expect(changes).toHaveLength(0);
    });
  });

  describe('compareAuditResults', () => {
    it('should detect when recommendations change', () => {
      const mockAudit = {
        id: 'test-123',
        user_email: 'test@example.com',
        input_stack: {
          tools: [{ tool: 'cursor', plan: 'business', seats: 2 }],
          teamSize: 2,
          primaryUseCase: 'coding',
        } as FormData,
        output_result: [
          {
            tool: 'cursor',
            currentSpend: 80,
            recommendedAction: 'Downgrade to Pro',
            savings: 40,
            reason: 'Business plan is overkill for 2 users',
          },
        ] as AuditResult[],
        pricing_snapshot: {
          version: '1.0.0',
          lastUpdated: '2026-05-01',
          data: PRICING_DATA,
        },
      };

      const comparison = compareAuditResults(mockAudit);

      expect(comparison.auditId).toBe('test-123');
      expect(comparison.userEmail).toBe('test@example.com');
      expect(comparison.oldRecommendations).toHaveLength(1);
      expect(comparison.newRecommendations).toHaveLength(1);
    });
  });
});
