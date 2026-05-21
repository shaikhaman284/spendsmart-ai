import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { compareAuditResults, groupAuditsByEmail } from '@/lib/pricingChangeDetector';
import { sendReauditNotification } from '@/lib/notificationEmail';
import { FormData, AuditResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Optional: simulate a pricing change for testing
    if (body.tool && body.new_price !== undefined) {
      console.log(`[Simulated pricing change] ${body.tool}: $${body.new_price}`);
      // In a real implementation, you'd update PRICING_DATA here
      // For now, we'll just log it and proceed with actual pricing
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Load all audits from Supabase
    const { data: audits, error } = await supabaseAdmin
      .from('audits')
      .select('id, user_email, input_stack, output_result, pricing_snapshot, unsubscribed')
      .eq('unsubscribed', false)
      .not('user_email', 'is', null)
      .not('input_stack', 'is', null)
      .not('output_result', 'is', null)
      .not('pricing_snapshot', 'is', null);

    if (error) {
      console.error('Failed to load audits:', error);
      return NextResponse.json(
        { error: 'Failed to load audits from database' },
        { status: 500 }
      );
    }

    if (!audits || audits.length === 0) {
      return NextResponse.json({
        checked: 0,
        affected: 0,
        emailsSent: 0,
        message: 'No audits found with required data',
      });
    }

    // Compare each audit against current pricing
    const comparisons = audits.map(audit => compareAuditResults({
      id: audit.id,
      user_email: audit.user_email,
      input_stack: audit.input_stack as FormData,
      output_result: audit.output_result as AuditResult[],
      pricing_snapshot: audit.pricing_snapshot as { 
        version?: string; 
        lastUpdated?: string; 
        data?: Record<string, Record<string, { name: string; price: number; isPerSeat?: boolean }>> 
      },
    }));

    // Filter to only affected audits
    const affectedComparisons = comparisons.filter(c => c.hasChanges);

    // Group by user email
    const groupedByEmail = groupAuditsByEmail(affectedComparisons);

    // Send notification emails
    let emailsSent = 0;
    const emailResults: { email: string; success: boolean; auditCount: number }[] = [];

    for (const [email, userAudits] of Array.from(groupedByEmail.entries())) {
      const success = await sendReauditNotification(email, userAudits);
      emailResults.push({
        email,
        success,
        auditCount: userAudits.length,
      });

      if (success) {
        emailsSent++;

        // Update notified_at timestamp for all affected audits
        const auditIds = userAudits.map(a => a.auditId);
        await supabaseAdmin
          .from('audits')
          .update({ notified_at: new Date().toISOString() })
          .in('id', auditIds);
      }
    }

    return NextResponse.json({
      checked: audits.length,
      affected: affectedComparisons.length,
      emailsSent,
      uniqueUsers: groupedByEmail.size,
      details: emailResults,
    });
  } catch (error) {
    console.error('Detect changes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
