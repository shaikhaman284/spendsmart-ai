import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AuditSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

// Lazy-load Resend client
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

export async function POST(request: NextRequest) {
  try {
    const { email, audit }: { email: string; audit: AuditSummary } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder-key') {
      console.log('Resend not configured - skipping email send');
      return NextResponse.json({ 
        success: true,
        message: 'Email functionality not configured. Please set RESEND_API_KEY.' 
      });
    }

    const { results, totalMonthlySavings, totalAnnualSavings, aiSummary } = audit;

    // Generate HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Spend Audit Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%); border-radius: 16px; padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 42px; font-weight: bold; color: #ffffff;">
                ${totalMonthlySavings > 0 ? `💰 Save ${formatCurrency(totalMonthlySavings)}/month` : '✨ You\'re Spending Well!'}
              </h1>
              ${totalMonthlySavings > 0 ? `
                <p style="margin: 16px 0 0 0; font-size: 28px; font-weight: bold; color: #ffffff; opacity: 0.9;">
                  ${formatCurrency(totalAnnualSavings)} annually
                </p>
              ` : ''}
            </td>
          </tr>

          <!-- AI Summary -->
          ${aiSummary ? `
          <tr>
            <td style="padding: 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; border: 1px solid #334155;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #60a5fa;">
                      🤖 AI Analysis
                    </h2>
                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                      ${aiSummary}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Tool Breakdown -->
          <tr>
            <td style="padding: 24px 0;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: #ffffff;">
                📊 Tool-by-Tool Breakdown
              </h2>
              ${results.map(result => `
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; margin-bottom: 16px;">
                  <tr>
                    <td style="padding: 24px;">
                      <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: bold; color: #ffffff; text-transform: capitalize;">
                        ${result.tool.replace(/_/g, ' ')}
                      </h3>
                      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.5; color: #d1d5db;">
                        ${result.reason}
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 12px; background-color: #0f172a; border-radius: 8px; font-size: 14px;">
                            <span style="color: #9ca3af;">Current:</span>
                            <strong style="color: #ffffff;">${formatCurrency(result.currentSpend)}/mo</strong>
                          </td>
                          <td width="16"></td>
                          <td style="padding: 8px 12px; background-color: #0f172a; border-radius: 8px; font-size: 14px;">
                            <span style="color: #9ca3af;">Action:</span>
                            <strong style="color: #60a5fa;">${result.recommendedAction}</strong>
                          </td>
                          <td width="16"></td>
                          <td align="right" style="padding: 8px 12px; background-color: ${result.savings > 0 ? '#065f46' : '#374151'}; border-radius: 8px;">
                            ${result.savings > 0 ? `
                              <div style="font-size: 24px; font-weight: bold; color: #34d399;">
                                ${formatCurrency(result.savings)}
                              </div>
                              <div style="font-size: 12px; color: #9ca3af;">saved/mo</div>
                            ` : `
                              <div style="font-size: 16px; font-weight: 600; color: #9ca3af;">
                                Optimized
                              </div>
                            `}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              `).join('')}
            </td>
          </tr>

          <!-- CTA -->
          ${totalMonthlySavings >= 500 ? `
          <tr>
            <td style="padding: 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 32px; text-align: center;">
                    <h2 style="margin: 0 0 12px 0; font-size: 28px; font-weight: bold; color: #ffffff;">
                      🎯 Get These Savings via Credex Credits
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #ffffff; opacity: 0.9;">
                      Credex helps startups optimize AI spend with flexible credits and expert guidance.
                    </p>
                    <a href="https://credex.rocks" style="display: inline-block; background-color: #ffffff; color: #059669; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                      Learn More About Credex →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #9ca3af;">
                Generated by <a href="https://credex.rocks" style="color: #60a5fa; text-decoration: none;">SpendSmart AI</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
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

    // Send email using Resend
    const resend = getResendClient();
    await resend.emails.send({
      from: 'SpendSmart AI <noreply@credex.rocks>',
      to: email,
      subject: `Your AI Spend Audit: ${totalMonthlySavings > 0 ? `Save ${formatCurrency(totalMonthlySavings)}/month` : 'You\'re Optimized!'}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send audit email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
