import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { compareAuditResults } from '@/lib/pricingChangeDetector';
import RerunDiffView from './RerunDiffView';

interface Props {
  params: { id: string };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Updated Audit Recommendations - SpendSmart AI',
    description: 'See how pricing changes affect your AI spend recommendations',
  };
}

export default async function RerunPage({ params }: Props) {
  const supabase = getSupabaseClient();
  
  // Load the original audit
  const { data: audit, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !audit) {
    notFound();
  }

  // Check if audit has required Round 2 data
  if (!audit.input_stack || !audit.output_result || !audit.pricing_snapshot) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Audit Not Available for Re-run
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This audit was created before the re-audit feature was available.
          </p>
          <a
            href="/"
            className="inline-block btn-primary text-white font-bold py-3 px-8 rounded-xl"
          >
            Run a New Audit
          </a>
        </div>
      </main>
    );
  }

  // Compare old vs new
  const comparison = compareAuditResults({
    id: audit.id,
    user_email: audit.user_email,
    input_stack: audit.input_stack,
    output_result: audit.output_result,
    pricing_snapshot: audit.pricing_snapshot,
  });

  return <RerunDiffView comparison={comparison} />;
}
