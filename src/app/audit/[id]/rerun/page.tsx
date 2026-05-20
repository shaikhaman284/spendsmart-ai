import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { auditEngine } from '@/lib/auditEngine';
import { buildAuditDiff, PricingSnapshot } from '@/lib/pricingChangeDetector';
import { FormData, AuditResult } from '@/lib/types';
import RerunDiffView from './RerunDiffView';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Re-Audit Diff — SpendSmart AI`,
    description: 'See how pricing changes affect your AI spend recommendations.',
    robots: { index: false },
  };
}

/** 
 * Safe fallback for pre-migration audits:
 * Try selecting new columns; if PGRST204 (column not found), return null so
 * the page can show a friendly "migration needed" message instead of 404.
 */
async function fetchAuditForRerun(id: string) {
  const supabase = getSupabaseClient();

  // First try the full Round 2 select
  const { data, error } = await supabase
    .from('audits')
    .select('id, input_stack, output_result, pricing_snapshot, user_email')
    .eq('id', id)
    .single();

  if (error) {
    // PGRST116 = row not found → hard 404
    if (error.code === 'PGRST116') return { data: null, notFound: true };
    // PGRST204 = column not found (migration not applied) → soft fallback
    if (error.code === 'PGRST204') return { data: null, notFound: false, migrationNeeded: true };
    // Any other error → hard 404
    console.error('Rerun page fetch error:', error);
    return { data: null, notFound: true };
  }

  return { data, notFound: false, migrationNeeded: false };
}

export default async function RerunPage({ params }: Props) {
  const result = await fetchAuditForRerun(params.id);

  if (result.notFound) {
    notFound();
  }

  // Migration not applied yet — show a friendly message
  if (result.migrationNeeded || !result.data) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-3">Re-run Not Available Yet</h1>
          <p className="text-gray-400 mb-2">
            The re-audit feature requires a database migration that hasn&apos;t been applied yet.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Run <code className="bg-gray-800 px-2 py-0.5 rounded text-blue-400">supabase/round2-migration.sql</code> in
            your Supabase SQL Editor, then submit a new audit to use the re-run feature.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Start New Audit →
          </a>
        </div>
      </main>
    );
  }

  const { data } = result;

  // Audit exists but was created before Round 2 columns were populated
  if (!data.input_stack || !data.output_result || !data.pricing_snapshot) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold mb-3">Re-run Not Available for This Audit</h1>
          <p className="text-gray-400 mb-6">
            This audit was created before re-run support was added. Submit a new audit to get
            full re-run and diff capabilities.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Start New Audit →
          </a>
        </div>
      </main>
    );
  }

  const inputStack = data.input_stack as FormData;
  const oldResults = data.output_result as AuditResult[];
  const pricingSnapshot = data.pricing_snapshot as PricingSnapshot;

  // Re-run the audit engine with current pricing
  const newResults = auditEngine(inputStack);

  // Build the diff
  const diff = buildAuditDiff(inputStack, oldResults, pricingSnapshot);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Navigation */}
        <div className="mb-8 flex items-center gap-3">
          <a href="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">
            SpendSmart AI
          </a>
          <span className="text-gray-600">/</span>
          <a href={`/audit/${params.id}`} className="text-gray-400 hover:text-white transition-colors text-sm">
            Audit #{params.id.slice(0, 8)}
          </a>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300 text-sm">Re-run Diff</span>
        </div>

        {/* Diff view */}
        <RerunDiffView
          auditId={params.id}
          oldResults={oldResults}
          newResults={newResults}
          diff={diff}
          email={data.user_email ?? undefined}
        />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Built by{' '}
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Credex
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
