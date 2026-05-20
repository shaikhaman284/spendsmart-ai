import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

/**
 * GET /api/unsubscribe?id=[auditId]
 *
 * Sets unsubscribed = true for the audit with the given ID.
 * Returns an HTML confirmation page — no external redirect needed.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auditId = searchParams.get('id');

  if (!auditId) {
    return new NextResponse(unsubscribeHTML('error', 'No audit ID provided.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

  if (!isPlaceholder) {
    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from('audits')
      .update({ unsubscribed: true })
      .eq('id', auditId);

    if (error) {
      console.error('Unsubscribe error:', error);
      return new NextResponse(
        unsubscribeHTML('error', 'Something went wrong. Please try again later.'),
        { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
  }

  return new NextResponse(unsubscribeHTML('success'), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function unsubscribeHTML(status: 'success' | 'error', message?: string): string {
  const isSuccess = status === 'success';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? "Unsubscribed" : "Error"} — SpendSmart AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .icon {
      font-size: 56px;
      margin-bottom: 20px;
      display: block;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      color: ${isSuccess ? '#34d399' : '#f87171'};
    }
    p {
      font-size: 16px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    a.btn {
      display: inline-block;
      background: linear-gradient(135deg, #1d4ed8, #7c3aed);
      color: #ffffff;
      font-weight: 600;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 8px;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    a.btn:hover { opacity: 0.85; }
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="icon">${isSuccess ? '✅' : '❌'}</span>
    <h1>${isSuccess ? "You've been unsubscribed" : "Something went wrong"}</h1>
    <p>
      ${isSuccess
        ? "You won't receive any more re-audit notifications from SpendSmart AI. You can still access your audit results at any time."
        : (message || "We couldn't process your unsubscribe request. Please try again later.")}
    </p>
    <a href="${APP_URL}" class="btn">← Back to SpendSmart AI</a>
    <p class="footer">Built by <a href="https://credex.rocks" style="color: #60a5fa; text-decoration: none;">Credex</a></p>
  </div>
</body>
</html>`;
}
