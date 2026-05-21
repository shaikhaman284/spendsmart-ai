'use client';

import { AuditComparison } from '@/lib/pricingChangeDetector';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';

interface Props {
  comparison: AuditComparison;
}

export default function RerunDiffView({ comparison }: Props) {
  const {
    oldRecommendations,
    newRecommendations,
    oldTotalSavings,
    newTotalSavings,
    savingsDelta,
    pricingChanges,
  } = comparison;

  // Create a map for easier comparison
  const oldMap = new Map(oldRecommendations.map(r => [r.tool, r]));
  const newMap = new Map(newRecommendations.map(r => [r.tool, r]));

  // Get all unique tools
  const allTools = new Set([...Array.from(oldMap.keys()), ...Array.from(newMap.keys())]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-semibold">Updated Recommendations</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
            {savingsDelta > 0 ? (
              <span className="text-green-600">↑ Savings Increased</span>
            ) : savingsDelta < 0 ? (
              <span className="text-red-600">↓ Savings Decreased</span>
            ) : (
              <span className="text-gray-500">No Change in Savings</span>
            )}
          </h1>

          <div className="flex items-center justify-center gap-8 mb-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Previous</div>
              <div className="text-3xl font-bold text-gray-700">
                {formatCurrency(oldTotalSavings)}/mo
              </div>
            </div>

            <div className="text-4xl text-gray-400">→</div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Current</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(newTotalSavings)}/mo
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {savingsDelta > 0 ? (
              <>
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-xl font-semibold text-green-600">
                  +{formatCurrency(savingsDelta)}/mo more savings
                </span>
              </>
            ) : savingsDelta < 0 ? (
              <>
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-xl font-semibold text-red-600">
                  {formatCurrency(Math.abs(savingsDelta))}/mo less savings
                </span>
              </>
            ) : (
              <>
                <Minus className="w-5 h-5 text-gray-500" />
                <span className="text-xl font-semibold text-gray-500">No change in savings</span>
              </>
            )}
          </div>
        </div>

        {/* Pricing Changes Summary */}
        {pricingChanges.length > 0 && (
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What Changed in Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricingChanges.map((change, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="font-semibold text-gray-900 capitalize mb-2">
                    {change.tool.replace(/_/g, ' ')} - {change.plan}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{formatCurrency(change.oldPrice)}</span>
                    <span className="text-gray-400">→</span>
                    <span
                      className={`font-bold ${
                        change.changeType === 'price_decrease' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(change.newPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diff View */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tool-by-Tool Comparison
          </h2>

          {Array.from(allTools).map(tool => {
            const oldResult = oldMap.get(tool);
            const newResult = newMap.get(tool);

            if (!oldResult || !newResult) {
              return null; // Skip if tool not in both
            }

            const hasChanged =
              oldResult.recommendedAction !== newResult.recommendedAction ||
              oldResult.savings !== newResult.savings;

            return (
              <div
                key={tool}
                className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                  hasChanged
                    ? 'border-yellow-400 bg-yellow-50/30'
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <h3 className="text-xl font-bold capitalize mb-4 text-gray-900 flex items-center gap-3">
                  {tool.replace(/_/g, ' ')}
                  {hasChanged ? (
                    <span className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                      CHANGED
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      ✓ NO CHANGE
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Old Recommendation */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-500 uppercase">
                      Previous Recommendation
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Current Spend: </span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(oldResult.currentSpend)}/mo
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Action: </span>
                        <span className="font-semibold text-gray-900">
                          {oldResult.recommendedAction}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Savings: </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(oldResult.savings)}/mo
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                        {oldResult.reason}
                      </p>
                    </div>
                  </div>

                  {/* New Recommendation */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-blue-600 uppercase">
                      Current Recommendation
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Current Spend: </span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(newResult.currentSpend)}/mo
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm text-gray-600">Action: </span>
                        <span className="font-semibold text-blue-700">
                          {newResult.recommendedAction}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Savings: </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(newResult.savings)}/mo
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                        {newResult.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block btn-primary text-white font-bold py-4 px-10 rounded-xl text-lg"
          >
            Run a Fresh Audit
          </a>
        </div>
      </div>
    </main>
  );
}
