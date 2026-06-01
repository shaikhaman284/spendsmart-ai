import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('id');

    if (!auditId) {
      return new NextResponse(
        `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invalid Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
    h1 { color: #ef4444; }
  </style>
</head>
<body>
  <h1>Invalid Request</h1>
  <p>No audit ID provided.</p>
</body>
</html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Update the audit to mark as unsubscribed
    const { error } = await supabaseAdmin
      .from('audits')
      .update({ unsubscribed: true })
      .eq('id', auditId);

    if (error) {
      console.error('Unsubscribe error:', error);
      return new NextResponse(
        `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Error</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
    h1 { color: #ef4444; }
  </style>
</head>
<body>
  <h1>Error</h1>
  <p>Failed to unsubscribe. Please try again later.</p>
</body>
</html>
        `,
        {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    return new NextResponse(
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 600px;
      margin: 100px auto;
      padding: 40px 20px;
      text-align: center;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 48px 32px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #10b981;
      font-size: 32px;
      margin: 0 0 16px 0;
    }
    p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 24px;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">✓</div>
    <h1>You've Been Unsubscribed</h1>
    <p>You won't receive any more re-audit notifications from SpendSmart AI.</p>
    <p>If you change your mind, you can always run a new audit at <a href="${process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://spendsmart.credex.rocks')}">SpendSmart AI</a>.</p>
  </div>
</body>
</html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return new NextResponse(
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Error</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 100px auto; padding: 20px; text-align: center; }
    h1 { color: #ef4444; }
  </style>
</head>
<body>
  <h1>Error</h1>
  <p>An unexpected error occurred. Please try again later.</p>
</body>
</html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
