import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    // Fetch first 3 audits
    const { data: audits, error } = await supabaseAdmin
      .from('audits')
      .select('id, user_email, input_stack, output_result, pricing_snapshot, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      total: audits?.length || 0,
      audits: audits?.map(audit => ({
        id: audit.id,
        user_email: audit.user_email,
        created_at: audit.created_at,
        has_pricing_snapshot: !!audit.pricing_snapshot,
        pricing_snapshot_structure: audit.pricing_snapshot ? Object.keys(audit.pricing_snapshot) : [],
        pricing_snapshot_sample: audit.pricing_snapshot,
        has_output_result: !!audit.output_result,
        output_result_length: Array.isArray(audit.output_result) ? audit.output_result.length : 0,
        output_result_sample: audit.output_result,
        input_stack_tools: audit.input_stack?.tools || [],
      })),
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
