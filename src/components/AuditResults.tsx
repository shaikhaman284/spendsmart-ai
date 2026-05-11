'use client';

import { AuditSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

interface AuditResultsProps {
  audit: AuditSummary;
  auditId?: string;
}

export default function AuditResults({ audit, auditId }: AuditResultsProps) {
  const { results, totalMonthlySavings, totalAnnualSavings, aiSummary } = audit;
  const hasSignificantSavings = totalMonthlySavings >= 500;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {totalMonthlySavings > 0 ? (
            <>Save {formatCurrency(totalMonthlySavings)}/month</>
          ) : (
            <>You&apos;re Spending Well!</>
          )}
        </h1>
        {totalMonthlySavings > 0 && (
          <p className="text-2xl md:text-3xl opacity-90">
            {formatCurrency(totalAnnualSavings)} annually
          </p>
        )}
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="text-blue-400" size={24} />
            AI Analysis
          </h2>
          <p className="text-gray-300 leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* Per-Tool Results */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Tool-by-Tool Breakdown</h2>
        <div className="grid gap-4">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold capitalize mb-2">
                    {result.tool.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-gray-400 mb-3">{result.reason}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Current: </span>
                      <span className="font-semibold">{formatCurrency(result.currentSpend)}/mo</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Action: </span>
                      <span className="font-semibold">{result.recommendedAction}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {result.savings > 0 ? (
                    <>
                      <TrendingDown className="text-green-400" size={32} />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(result.savings)}
                        </div>
                        <div className="text-sm text-gray-500">saved/mo</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="text-gray-500" size={32} />
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-500">
                          Optimized
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {hasSignificantSavings ? (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Get These Savings via Credex Credits</h2>
          <p className="text-lg mb-6 opacity-90">
            Credex helps startups optimize AI spend with flexible credits and expert guidance.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-green-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Learn More About Credex
          </a>
        </div>
      ) : totalMonthlySavings < 100 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <CheckCircle className="mx-auto mb-4 text-green-400" size={48} />
          <h2 className="text-2xl font-bold mb-3">You&apos;re Spending Well!</h2>
          <p className="text-gray-400 mb-6">
            Your AI tool stack is already optimized. We&apos;ll notify you if better options become available.
          </p>
        </div>
      ) : null}

      {/* Share Section */}
      {auditId && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-3">Share Your Audit</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={`${window.location.origin}/audit/${auditId}`}
              readOnly
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/audit/${auditId}`);
                alert('Link copied to clipboard!');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
