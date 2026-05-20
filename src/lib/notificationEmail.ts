import { Resend } from 'resend';
import { PricingDiff } from './pricingChangeDetector';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface AffectedAudit {
  auditId: string;
  diff: PricingDiff;
}

/**
 * Formats a tool/plan name for display in emails.
 */
function formatToolName(tool: string): string {
  return tool.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\.00$/, '')}`;
}

/**
 * Builds the HTML body for a re-audit notification email.
 * Consolidates multiple affected audits for the same user into one email.
 */
function buildNotificationHTML(email: string, affectedAudits: AffectedAudit[]): string {
  // Aggregate all price changes across audits for the summary section
  const allPriceChanges = affectedAudits.flatMap((a) => a.diff.priceChanges);
  const allPlansAdded = affectedAudits.flatMap((a) => a.diff.plansAdded);
  const allPlansRemoved = affectedAudits.flatMap((a) => a.diff.plansRemoved);
  const allRecoChanges = affectedAudits.flatMap((a) => a.diff.recommendationChanges);

  const primaryAuditId = affectedAudits[0].auditId;
  const primaryDiff = affectedAudits[0].diff;

  const savingsDelta = primaryDiff.newTotalSavings - primaryDiff.oldTotalSavings;
  const savingsDirection = savingsDelta > 0 ? '↑ increased' : savingsDelta < 0 ? '↓ decreased' : 'unchanged';
  const savingsDeltaColor = savingsDelta > 0 ? '#34d399' : savingsDelta < 0 ? '#f87171' : '#9ca3af';

  const priceChangesHTML = allPriceChanges.length > 0
    ? `
      <tr>
        <td style="padding: 24px 0;">
          <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #ffffff;">
            📊 What Changed
          </h2>
          ${allPriceChanges.map((change) => `
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 10px; border: 1px solid #334155; margin-bottom: 12px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #ffffff; font-size: 16px;">${formatToolName(change.tool)} — ${formatToolName(change.plan)}</strong>
                  </div>
                  <div style="margin-top: 10px; font-size: 14px; color: #d1d5db;">
                    <span style="background: #374151; padding: 4px 10px; border-radius: 6px; text-decoration: line-through; color: #9ca3af;">${formatCurrency(change.oldPrice)}/mo</span>
                    &nbsp;→&nbsp;
                    <span style="background: ${change.newPrice < change.oldPrice ? '#065f46' : '#7f1d1d'}; padding: 4px 10px; border-radius: 6px; color: ${change.newPrice < change.oldPrice ? '#34d399' : '#f87171'}; font-weight: bold;">${formatCurrency(change.newPrice)}/mo</span>
                    <span style="margin-left: 8px; color: #9ca3af;">(${change.newPrice < change.oldPrice ? 'cheaper' : 'pricier'} by ${formatCurrency(Math.abs(change.newPrice - change.oldPrice))})</span>
                  </div>
                </td>
              </tr>
            </table>
          `).join('')}
        </td>
      </tr>`
    : '';

  const recoChangesHTML = allRecoChanges.length > 0
    ? `
      <tr>
        <td style="padding: 0 0 24px 0;">
          <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #ffffff;">
            💡 How It Affects Your Recommendations
          </h2>
          ${allRecoChanges.map((change) => `
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 10px; border: 1px solid #334155; margin-bottom: 12px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <strong style="color: #ffffff; font-size: 15px;">${formatToolName(change.tool)}</strong>
                  <div style="margin-top: 10px; font-size: 14px; color: #d1d5db;">
                    <div style="margin-bottom: 6px;">
                      <span style="color: #9ca3af;">Previous audit recommended: </span>
                      <span style="background: #374151; padding: 3px 8px; border-radius: 5px; color: #d1d5db;">${change.oldRecommendation}</span>
                      <span style="margin-left: 6px; color: #9ca3af; font-size: 12px;">(saved ${formatCurrency(change.oldSavings)}/mo)</span>
                    </div>
                    <div>
                      <span style="color: #9ca3af;">New recommendation: </span>
                      <span style="background: #1d4ed8; padding: 3px 8px; border-radius: 5px; color: #93c5fd; font-weight: bold;">${change.newRecommendation}</span>
                      <span style="margin-left: 6px; color: #34d399; font-size: 12px;">(saves ${formatCurrency(change.newSavings)}/mo)</span>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          `).join('')}
        </td>
      </tr>`
    : '';

  const plansAddedRemovedHTML = (allPlansAdded.length > 0 || allPlansRemoved.length > 0)
    ? `
      <tr>
        <td style="padding: 0 0 24px 0;">
          ${allPlansAdded.map((p) => `
            <div style="background: #064e3b; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 14px; color: #d1fae5;">
              ✨ New plan available: <strong>${formatToolName(p.tool)} — ${formatToolName(p.plan)}</strong> at ${formatCurrency(p.newPrice)}/mo
            </div>`).join('')}
          ${allPlansRemoved.map((p) => `
            <div style="background: #7f1d1d; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 14px; color: #fee2e2;">
              ⚠️ Plan discontinued: <strong>${formatToolName(p.tool)} — ${formatToolName(p.plan)}</strong> (was ${formatCurrency(p.oldPrice)}/mo)
            </div>`).join('')}
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Spend Audit Has New Recommendations</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #db2777 100%); border-radius: 16px; padding: 36px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; letter-spacing: 2px; color: rgba(255,255,255,0.7); text-transform: uppercase;">SpendSmart AI • Re-Audit Alert</p>
              <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: bold; color: #ffffff; line-height: 1.2;">
                Pricing changed.<br>Your audit is outdated.
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.85);">
                AI tool pricing shifted since your last audit. Here's what that means for your spend.
              </p>
            </td>
          </tr>

          <!-- Savings Delta -->
          <tr>
            <td style="padding: 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; border: 1px solid #334155;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #9ca3af;">Your potential savings</p>
                    <div style="display: inline-block; text-align: left;">
                      <span style="font-size: 28px; font-weight: bold; color: #9ca3af; text-decoration: line-through;">${formatCurrency(primaryDiff.oldTotalSavings)}/mo</span>
                      <span style="font-size: 28px; font-weight: bold; color: ${savingsDeltaColor}; margin-left: 12px;">${formatCurrency(primaryDiff.newTotalSavings)}/mo</span>
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: ${savingsDeltaColor}; font-weight: 600;">
                      ${savingsDirection} by ${formatCurrency(Math.abs(savingsDelta))}/mo
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${priceChangesHTML}
          ${plansAddedRemovedHTML}
          ${recoChangesHTML}

          <!-- CTA -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: bold; color: #ffffff;">
                      See Your Updated Recommendations
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: rgba(255,255,255,0.85);">
                      Click below to see a side-by-side diff of your old vs new audit results.
                    </p>
                    <a href="${APP_URL}/audit/${primaryAuditId}/rerun"
                       style="display: inline-block; background-color: #ffffff; color: #1d4ed8; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                      View Re-Audit Diff →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary CTAs for multiple audits -->
          ${affectedAudits.length > 1 ? `
          <tr>
            <td style="padding: 0 0 24px 0;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #9ca3af;">You have ${affectedAudits.length} affected audits:</p>
              ${affectedAudits.slice(1).map((a) => `
                <a href="${APP_URL}/audit/${a.auditId}/rerun"
                   style="display: block; background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; text-decoration: none; color: #60a5fa; font-size: 14px;">
                  View diff for audit ${a.auditId.slice(0, 8)}… →
                </a>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                Generated by <a href="https://credex.rocks" style="color: #60a5fa; text-decoration: none;">SpendSmart AI</a> · Built by Credex
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                You're receiving this because you submitted an audit at SpendSmart AI.
                <br>
                <a href="${APP_URL}/api/unsubscribe?id=${primaryAuditId}"
                   style="color: #6b7280; text-decoration: underline;">
                  Unsubscribe from re-audit alerts
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface NotificationResult {
  email: string;
  auditIds: string[];
  success: boolean;
  error?: string;
}

/**
 * Sends re-audit notification emails to affected users.
 * Consolidates: one user with multiple affected audits gets ONE email.
 *
 * @param groupedAudits  - Map of email → list of affected audits with diffs
 * @returns Array of notification results (one per email address)
 */
export async function sendReauditNotifications(
  groupedAudits: Map<string, AffectedAudit[]>
): Promise<NotificationResult[]> {
  const resend = getResendClient();
  const results: NotificationResult[] = [];

  for (const [email, affectedAudits] of groupedAudits.entries()) {
    try {
      const html = buildNotificationHTML(email, affectedAudits);
      const auditIds = affectedAudits.map((a) => a.auditId);

      await resend.emails.send({
        from: 'SpendSmart AI <onboarding@resend.dev>',
        to: email,
        subject: 'Your AI spend audit has new recommendations',
        html,
      });

      results.push({ email, auditIds, success: true });
    } catch (error) {
      console.error(`Failed to send notification to ${email}:`, error);
      results.push({
        email,
        auditIds: affectedAudits.map((a) => a.auditId),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
