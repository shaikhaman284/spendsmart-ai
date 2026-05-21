import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { compareAuditResults, groupAuditsByEmail } from '@/lib/pricingChangeDetector';
import { sendReauditNotification } from '@/lib/notificationEmail';
import { FormData, AuditResult } from '@/lib/types';
import { PRICING_DATA } from '@/lib/pricingData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Create a modified pricing object if simulating a change
    let modifiedPricing = PRICING_DATA;
    if (body.tool && body.new_price !== undefined) {
      console.log(`[Simulated pricing change] ${body.tool}: $${body.new_price}`);
      
      // Clone PRICING_DATA and update the specified tool
      modifiedPricing = JSON.parse(JSON.stringify(PRICING_DATA)) as typeof PRICING_DATA;
      const toolName = body.tool.toLowerCase();
      
      // Find matching tool (case-insensitive)
      for (const [key, plans] of Object.entries(modifiedPricing)) {
        if (key.toLowerCase() === toolName || key.toLowerCase().includes(toolName)) {
          // Update all plans for this tool with new price
          for (const planKey of Object.keys(plans)) {
            const typedKey = key as keyof typeof modifiedPricing;
            const typedPlanKey = planKey as keyof typeof plans;
            (modifiedPricing[typedKey][typedPlanKey] as { price: number }).price = body.new_price;
          }
          console.log(`Updated pricing for ${key}:`, modifiedPricing[key as keyof typeof modifiedPricing]);
          break;
        }
      }
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

    console.log('Total audits fetched:', audits.length);
    console.log('First audit pricing_snapshot:', JSON.stringify(audits[0]?.pricing_snapshot));
    console.log('First audit user_email:', audits[0]?.user_email);
    console.log('Comparing with modified pricing:', body.tool ? 'YES' : 'NO');

    // Compare each audit against current pricing (or modified pricing if simulating)
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
    }, modifiedPricing));

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
