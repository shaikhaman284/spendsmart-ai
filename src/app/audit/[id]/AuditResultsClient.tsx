'use client';

import { useState, useEffect } from 'react';
import AuditResults from '@/components/AuditResults';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import { AuditSummary, AuditResult } from '@/lib/types';

interface Props {
  auditData: {
    results: AuditResult[];
    aiSummary?: string;
  };
  auditId: string;
  totalSavings: number;
}

export default function AuditResultsClient({ auditData, auditId, totalSavings }: Props) {
  const [showLeadForm, setShowLeadForm] = useState(true);
  const [leadCaptured, setLeadCaptured] = useState(false);

  useEffect(() => {
    // Check if lead already captured for this audit
    const captured = localStorage.getItem(`lead_captured_${auditId}`);
    if (captured) {
      setShowLeadForm(false);
      setLeadCaptured(true);
    }
  }, [auditId]);

  const handleLeadSuccess = () => {
    localStorage.setItem(`lead_captured_${auditId}`, 'true');
    setShowLeadForm(false);
    setLeadCaptured(true);
  };

  const audit: AuditSummary = {
    results: auditData.results,
    totalMonthlySavings: auditData.results.reduce((sum: number, r: AuditResult) => sum + r.savings, 0),
    totalAnnualSavings: auditData.results.reduce((sum: number, r: AuditResult) => sum + r.savings, 0) * 12,
    aiSummary: auditData.aiSummary,
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <a href="/" className="hover:text-blue-400 transition-colors">
              SpendSmart AI
            </a>
          </h1>
          <p className="text-gray-400">Your AI Spend Audit Results</p>
        </div>

        {/* Results */}
        <AuditResults audit={audit} auditId={auditId} />

        {/* Round 2: Re-run banner — check for pricing updates */}
        <div className="mt-6 rounded-xl border border-blue-500/30 bg-blue-950/30 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-blue-200 text-sm">🔄 Pricing changes since this audit?</p>
            <p className="text-xs text-slate-400 mt-0.5">See a side-by-side diff of what's changed in your recommendations.</p>
          </div>
          <a
            href={`/audit/${auditId}/rerun`}
            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Check for Updates →
          </a>
        </div>

        {/* Lead Capture Form */}
        {showLeadForm && !leadCaptured && (
          <div className="mt-8">
            <LeadCaptureForm
              auditId={auditId}
              totalSavings={totalSavings}
              onSuccess={handleLeadSuccess}
            />
          </div>
        )}

        {leadCaptured && (
          <div className="mt-8 bg-green-900/20 border border-green-700 rounded-xl p-6 text-center">
            <p className="text-green-400 font-semibold">
              ✓ Report sent! Check your email for the full breakdown.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Built by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Credex</a>
          </p>
        </div>
      </div>
    </main>
  );
}
