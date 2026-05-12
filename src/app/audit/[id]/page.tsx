import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AuditResultsClient from './AuditResultsClient';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { AuditResult } from '@/lib/types';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('audits')
    .select('total_savings')
    .eq('id', params.id)
    .single();

  if (!data) {
    return {
      title: 'Audit Not Found - SpendSmart AI',
    };
  }

  const savings = formatCurrency(data.total_savings);

  return {
    title: `I found ${savings}/mo in AI overspend - SpendSmart AI`,
    description: 'See your personalized AI spend audit and discover where your budget is leaking.',
    openGraph: {
      title: `I found ${savings}/mo in AI overspend`,
      description: 'Get your own AI spend audit in 60 seconds',
      type: 'website',
      url: `https://spendsmart.credex.rocks/audit/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `I found ${savings}/mo in AI overspend`,
      description: 'Get your own AI spend audit in 60 seconds',
    },
  };
}

export default async function AuditPage({ params }: Props) {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const auditData = data.audit_data as {
    results: AuditResult[];
    aiSummary?: string;
  };

  return <AuditResultsClient auditData={auditData} auditId={params.id} totalSavings={data.total_savings} />;
}
