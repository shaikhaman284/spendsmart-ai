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

export default async function RerunPage({ params }: Props) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('audits')
    .select('id, input_stack, output_result, pricing_snapshot, user_email')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  // If the audit was created before Round 2 (no input_stack), fall back gracefully
  if (!data.input_stack || !data.output_result || !data.pricing_snapshot) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-3">Re-run Not Available</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            This audit was created before re-run support was added. Submit a new audit to get the latest recommendations.
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
