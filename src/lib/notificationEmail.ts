import { Resend } from 'resend';
import { AuditComparison, PricingChange } from './pricingChangeDetector';
import { formatCurrency } from './utils';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

/**
 * Send re-audit notification email to a user with multiple affected audits
 */
export async function sendReauditNotification(
  email: string,
  audits: AuditComparison[]
): Promise<boolean> {
  try {
    const resend = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Get unique pricing changes across all audits, filtered by user's actual tools
    const allChanges = new Map<string, PricingChange>();
    for (const audit of audits) {
      // Get the tools the user actually has from their input_stack
      const userTools = new Set(
        audit.inputStack.tools.map(t => `${t.tool.toLowerCase()}-${t.plan.toLowerCase()}`)
      );

      // Only include pricing changes for tools the user actually has
      for (const change of audit.pricingChanges) {
        const key = `${change.tool}-${change.plan}`;
        const normalizedKey = `${change.tool.toLowerCase()}-${change.plan.toLowerCase()}`;
        
        if (userTools.has(normalizedKey) && !allChanges.has(key)) {
          allChanges.set(key, change);
        }
      }
    }

    const htmlContent = generateEmailHTML(email, audits, Array.from(allChanges.values()), appUrl);

    await resend.emails.send({
      from: 'SpendSmart AI By Shaikh Aman <noreply@awm27.shop>',
      to: email,
      subject: 'Your AI spend audit has new recommendations',
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Failed to send re-audit notification:', error);
    return false;
  }
}

function generateEmailHTML(
  email: string,
  audits: AuditComparison[],
  pricingChanges: PricingChange[],
  appUrl: string
): string {
  const changesHTML = pricingChanges
    .map(
      change => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong style="text-transform: capitalize;">${change.tool.replace(/_/g, ' ')}</strong> - ${change.plan}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${formatCurrency(change.oldPrice)}/mo
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <strong style="color: ${change.changeType === 'price_decrease' ? '#10b981' : '#ef4444'};">
          ${formatCurrency(change.newPrice)}/mo
        </strong>
      </td>
    </tr>
  `
    )
    .join('');

  const auditsHTML = audits
    .map(
      audit => {
        let deltaMessage = '';
        if (audit.savingsDelta > 0) {
          deltaMessage = `You could save <strong style="color: #10b981;">${formatCurrency(audit.savingsDelta)} MORE</strong> per month with updated recommendations.`;
        } else if (audit.savingsDelta < 0) {
          deltaMessage = `Your savings opportunity decreased by <strong style="color: #ef4444;">${formatCurrency(Math.abs(audit.savingsDelta))}/mo</strong> due to pricing changes.`;
        } else {
          deltaMessage = `Total savings unchanged but some recommendations differ.`;
        }

        return `
    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <strong>Previous savings:</strong> ${formatCurrency(audit.oldTotalSavings)}/mo
        </div>
        <div>
          <strong>New savings:</strong> 
          <span style="color: ${audit.savingsDelta >= 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">
            ${formatCurrency(audit.newTotalSavings)}/mo
          </span>
        </div>
      </div>
      <div style="margin-bottom: 12px;">
        <strong>Impact:</strong> 
        <span style="color: #374151;">
          ${deltaMessage}
        </span>
      </div>
      <a href="${appUrl}/audit/${audit.auditId}/rerun" 
         style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        View Updated Recommendations →
      </a>
    </div>
  `;
      }
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Spend Audit Has New Recommendations</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; color: #111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">
                🔔 Your AI Spend Audit Has New Recommendations
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Hi there,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                AI tool pricing has changed since your last audit. We've re-analyzed your spend and found new optimization opportunities.
              </p>

              <!-- Pricing Changes -->
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #111827;">
                What Changed
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Tool & Plan</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Old Price</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">New Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${changesHTML}
                </tbody>
              </table>

              <!-- Affected Audits -->
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #111827;">
                How It Affects You
              </h2>
              ${auditsHTML}

              <!-- Unsubscribe -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  Don't want these updates? 
                  <a href="${appUrl}/api/unsubscribe?id=${audits[0].auditId}" style="color: #3b82f6; text-decoration: none;">
                    Unsubscribe
                  </a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                Sent by <a href="https://credex.rocks" style="color: #3b82f6; text-decoration: none; font-weight: 600;">SpendSmart AI</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Built by Credex for startups serious about efficiency
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
