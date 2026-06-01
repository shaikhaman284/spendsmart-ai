import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { auditEngine, calculateTotalSavings } from '@/lib/auditEngine';
import { FormData, AuditResult } from '@/lib/types';
import Groq from 'groq-sdk';

// Lazy-load Groq client to avoid build-time initialization
function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
  });
}

async function generateAISummary(formData: FormData, results: AuditResult[]): Promise<string> {
  try {
    const totalSavings = calculateTotalSavings(results);
    
    const systemPrompt = `You are a financial advisor specializing in AI tool costs for startups. Given this audit data, write a 100-word personalized summary highlighting the biggest savings opportunity and one specific action the user should take today. Be direct, specific, and use numbers. Tone: sharp, startup-friendly.`;
    
    const sortedResults = [...results].sort((a, b) => b.savings - a.savings);
    const biggestSaving = sortedResults[0];
    
    const userPrompt = `Team size: ${formData.teamSize}
Primary use case: ${formData.primaryUseCase}
Tools: ${formData.tools.map(t => `${t.tool} (${t.plan})`).join(', ')}
Total monthly savings: $${totalSavings.monthly}
Biggest saving: ${biggestSaving?.tool || 'N/A'} - $${biggestSaving?.savings || 0}/mo

Write a personalized 100-word summary.`;

    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || getFallbackSummary(totalSavings.monthly);
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return getFallbackSummary(calculateTotalSavings(results).monthly);
  }
}

function getFallbackSummary(monthlySavings: number): string {
  if (monthlySavings >= 500) {
    return `You're overspending by $${monthlySavings}/month on AI tools. The biggest opportunity is consolidating redundant subscriptions and right-sizing your plans for your team size. Take action today: audit which tools your team actually uses daily and cancel the rest. That's $${monthlySavings * 12}/year back in your budget.`;
  } else if (monthlySavings > 0) {
    return `You have $${monthlySavings}/month in potential savings by optimizing your AI tool plans. Your current setup is mostly efficient, but small adjustments to plan tiers based on your team size could add up. Review your per-seat plans first—that's usually where the quick wins are.`;
  } else {
    return `Your AI tool spend is already optimized. You're using the right plans for your team size and use case. Keep monitoring as your team grows, and consider consolidating if you add more tools. Well done on keeping costs lean.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();
    
    // Run audit engine
    const results = auditEngine(formData);
    const totalSavings = calculateTotalSavings(results);
    
    // Generate AI summary
    const aiSummary = await generateAISummary(formData, results);
    
    // Build pricing snapshot at the time of audit creation
    const { PRICING_DATA, PRICING_VERSION, PRICING_LAST_UPDATED } = await import('@/lib/pricingData');
    const pricingSnapshot = {
      data: PRICING_DATA,
      version: PRICING_VERSION,
      lastUpdated: PRICING_LAST_UPDATED,
      snapshotAt: new Date().toISOString(),
    };

    // Save to Supabase (skip if using placeholder credentials)
    const auditId = uuidv4();
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
    
    if (!isPlaceholder) {
      const supabaseAdmin = getSupabaseAdminClient();

      // Attempt Round 2 insert (with new columns).
      // Falls back to Round 1 insert if migration hasn't been applied yet
      // (Supabase returns PGRST204 when a column doesn't exist in the schema cache).
      const { error: r2Error } = await supabaseAdmin
        .from('audits')
        .insert({
          id: auditId,
          // Round 1 fields (preserved)
          audit_data: {
            formData,
            results,
            aiSummary,
          },
          total_savings: totalSavings.monthly,
          // Round 2 fields (new — requires round2-migration.sql to be run)
          input_stack: formData,
          output_result: results,
          pricing_snapshot: pricingSnapshot,
        });

      if (r2Error) {
        if (r2Error.code === 'PGRST204') {
          // Migration not applied yet — fall back to Round 1 insert so audits keep working
          console.warn(
            '[Round 2] New columns not in schema — run supabase/round2-migration.sql to enable re-audit features. Using Round 1 fallback insert.'
          );
          const { error: r1Error } = await supabaseAdmin
            .from('audits')
            .insert({
              id: auditId,
              audit_data: {
                formData,
                results,
                aiSummary,
              },
              total_savings: totalSavings.monthly,
            });

          if (r1Error) {
            console.error('Supabase Round 1 fallback error:', r1Error);
            throw new Error('Failed to save audit');
          }
        } else {
          console.error('Supabase error:', r2Error);
          throw new Error('Failed to save audit');
        }
      }
    } else {
      console.log('Using placeholder Supabase - skipping database save');
    }
    
    return NextResponse.json({
      auditId,
      results,
      totalMonthlySavings: totalSavings.monthly,
      totalAnnualSavings: totalSavings.annual,
      aiSummary,
    });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
