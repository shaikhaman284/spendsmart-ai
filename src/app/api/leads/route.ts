import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { Lead } from '@/lib/types';
import { Resend } from 'resend';

// Lazy-load Resend client
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

async function checkRateLimit(ipAddress: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabaseAdmin
    .from('rate_limits')
    .select('submission_count, window_start')
    .eq('ip_address', ipAddress)
    .gte('window_start', oneHourAgo)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
  
  if (!data) {
    // First submission in this window
    await supabaseAdmin.from('rate_limits').insert({
      ip_address: ipAddress,
      submission_count: 1,
      window_start: new Date().toISOString(),
    });
    return true;
  }
  
  if (data.submission_count >= 3) {
    return false; // Rate limit exceeded
  }
  
  // Increment count
  await supabaseAdmin
    .from('rate_limits')
    .update({ submission_count: data.submission_count + 1 })
    .eq('ip_address', ipAddress)
    .gte('window_start', oneHourAgo);
  
  return true;
}

async function sendConfirmationEmail(email: string, auditId: string) {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: 'SpendSmart AI <noreply@credex.rocks>',
      to: email,
      subject: 'Your AI Spend Audit is Ready',
      html: `
        <h1>Your AI Spend Audit Results</h1>
        <p>Thank you for using SpendSmart AI! Your personalized audit is ready.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/audit/${auditId}">View Your Audit</a></p>
        <p>Want to learn more about optimizing your AI spend? Visit <a href="https://credex.rocks">Credex</a>.</p>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - email failure shouldn't block lead capture
  }
}

export async function POST(request: NextRequest) {
  try {
    const lead: Lead = await request.json();
    
    // Get IP address for rate limiting
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    const allowed = await checkRateLimit(ipAddress);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Validate email
    if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Save lead to Supabase
    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from('leads')
      .insert({
        email: lead.email,
        company: lead.company,
        role: lead.role,
        audit_id: lead.auditId,
        total_savings: lead.totalSavings,
      });
    
    if (error) {
      console.error('Supabase lead insert error:', error);
      throw new Error('Failed to save lead');
    }

    // Round 2: Backfill user_email on the audit row so detect-changes
    // can group notifications by email address.
    if (lead.auditId) {
      const { error: updateError } = await supabaseAdmin
        .from('audits')
        .update({ user_email: lead.email })
        .eq('id', lead.auditId)
        .is('user_email', null); // Only set if not already set
      if (updateError) {
        // Non-fatal: log but don't block the response
        console.error('Failed to backfill user_email on audit:', updateError);
      }
    }
    
    // Send confirmation email
    await sendConfirmationEmail(lead.email, lead.auditId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
