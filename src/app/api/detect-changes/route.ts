import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { buildAuditDiff, PricingSnapshot } from '@/lib/pricingChangeDetector';
import { sendReauditNotifications } from '@/lib/notificationEmail';
import { FormData, AuditResult } from '@/lib/types';

/**
 * POST /api/detect-changes
 *
 * Scans all stored audits and detects which ones are affected by pricing changes.
 * Can accept an optional body to simulate a price change:
 *   { tool: string, new_price: number }
 *
 * For each affected user (grouped by email), sends one notification email.
 *
 * Returns: { checked: number, affected: number, emailsSent: number }
 */
export async function POST(request: NextRequest) {
  try {
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
    if (isPlaceholder) {
      return NextResponse.json({
        error: 'Supabase not configured. Set real NEXT_PUBLIC_SUPABASE_URL to use this endpoint.',
      }, { status: 503 });
    }

    // Parse optional price override from body
    let priceOverrides: Record<string, Record<string, { price: number }>> | undefined;
    try {
      const body = await request.json().catch(() => null);
      if (body?.tool && typeof body.new_price === 'number') {
        // Body format: { tool: "cursor", new_price: 25 }
        // This simulates the cursor pro price dropping to $25
        // We override all plans for simplicity — callers should pass plan too.
        // If no plan specified, default to 'pro'.
        const toolKey = (body.tool as string).toLowerCase().replace(/\s+/g, '_');
        const planKey = (body.plan as string | undefined)?.toLowerCase().replace(/\s+/g, '_') ?? 'pro';
        priceOverrides = {
          [toolKey]: {
            [planKey]: { price: body.new_price },
          },
        };
      }
    } catch {
      // No body or invalid JSON — treat as "no overrides"
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Fetch all audits that have an email, full input/output, and haven't unsubscribed
    const { data: audits, error } = await supabaseAdmin
      .from('audits')
      .select('id, user_email, input_stack, output_result, pricing_snapshot, unsubscribed')
      .not('user_email', 'is', null)
      .not('input_stack', 'is', null)
      .not('output_result', 'is', null)
      .not('pricing_snapshot', 'is', null)
      .eq('unsubscribed', false);

    if (error) {
      console.error('Error fetching audits:', error);
      return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
    }

    if (!audits || audits.length === 0) {
      return NextResponse.json({ checked: 0, affected: 0, emailsSent: 0 });
    }

    // Group affected audits by email (one email per user, not per audit)
    const affectedByEmail = new Map<string, { auditId: string; diff: ReturnType<typeof buildAuditDiff> }[]>();
    const affectedAuditIds: string[] = [];

    for (const audit of audits) {
      const inputStack = audit.input_stack as FormData;
      const outputResult = audit.output_result as AuditResult[];
      const pricingSnapshot = audit.pricing_snapshot as PricingSnapshot;
      const email = audit.user_email as string;

      const diff = buildAuditDiff(inputStack, outputResult, pricingSnapshot, priceOverrides);

      if (diff.hasChanges) {
        affectedAuditIds.push(audit.id);

        const existing = affectedByEmail.get(email) ?? [];
        existing.push({ auditId: audit.id, diff });
        affectedByEmail.set(email, existing);
      }
    }

    // Send notifications (consolidated per user)
    let emailsSent = 0;
    if (affectedByEmail.size > 0) {
      const resendConfigured =
        process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder-key';

      if (resendConfigured) {
        const notificationResults = await sendReauditNotifications(affectedByEmail);
        emailsSent = notificationResults.filter((r) => r.success).length;

        // Update notified_at on each affected audit
        if (affectedAuditIds.length > 0) {
          await supabaseAdmin
            .from('audits')
            .update({ notified_at: new Date().toISOString() })
            .in('id', affectedAuditIds);
        }
      } else {
        console.log('Resend not configured — skipping email send. Affected users:', [...affectedByEmail.keys()]);
      }
    }

    return NextResponse.json({
      checked: audits.length,
      affected: affectedAuditIds.length,
      emailsSent,
      affectedEmails: [...affectedByEmail.keys()],
    });
  } catch (error) {
    console.error('detect-changes error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
