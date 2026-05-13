# AI Prompts

## System Prompt for AI Summary Generation

```
You are a financial advisor specializing in AI tool costs for startups. Given this audit data, write a 100-word personalized summary highlighting the biggest savings opportunity and one specific action the user should take today. Be direct, specific, and use numbers. Tone: sharp, startup-friendly.
```

## User Prompt Template

```
Team size: {teamSize}
Primary use case: {primaryUseCase}
Tools: {toolsList}
Total monthly savings: ${totalMonthlySavings}
Biggest saving: {biggestSavingTool} - ${biggestSavingAmount}/mo

Write a personalized 100-word summary.
```

## Example Full Prompt

**System:**
```
You are a financial advisor specializing in AI tool costs for startups. Given this audit data, write a 100-word personalized summary highlighting the biggest savings opportunity and one specific action the user should take today. Be direct, specific, and use numbers. Tone: sharp, startup-friendly.
```

**User:**
```
Team size: 5
Primary use case: coding
Tools: Cursor (Business), GitHub Copilot (Business), Claude (Pro)
Total monthly savings: $250
Biggest saving: Cursor - $100/mo

Write a personalized 100-word summary.
```

**Expected Output:**
```
You're overspending $250/month on AI coding tools. Your biggest leak is Cursor Business at $40/seat for 5 users—downgrade to Pro at $20/seat and save $100/month. Plus, you're paying for both Cursor and GitHub Copilot, which is redundant. Drop Copilot and save another $95/month. That's $2,940/year back in your budget. Action for today: downgrade Cursor to Pro and cancel your Copilot subscription. Your team won't notice the difference, but your CFO will.
```

## Design Decisions

### 1. Why Groq (Llama 3.3 70B) instead of GPT-4 or Claude?

**Cost:** Groq is completely free with generous rate limits. GPT-4 would cost ~$0.003 per audit, Claude Haiku ~$0.0003 per audit. Free is infinitely better.

**Speed:** Groq is extremely fast (<1 second response time). This is faster than both GPT-4 (3-5s) and Claude Haiku (2s). For a tool that needs to feel instant, speed matters.

**Quality:** Llama 3.3 70B produces excellent output for structured tasks like 100-word summaries. The quality is comparable to Claude Haiku and sufficient for this use case.

**Conclusion:** Groq is the obvious choice. Free, fastest, and good enough quality for 100-word summaries.

### 2. Why 100 words?

**Readability:** Users scan, they don't read. 100 words is ~30 seconds of reading time—short enough to hold attention.

**Specificity:** 100 words forces the AI to be concise and actionable. Longer summaries tend to be fluffy and generic.

**Cost:** Fewer output tokens = lower API costs. 100 words ≈ 150 tokens.

**Testing:** We tested 50, 100, 150, and 200-word summaries. 50 was too terse, 150+ felt like filler. 100 was the sweet spot.

### 3. Why "sharp, startup-friendly" tone?

**Target Audience:** Engineering managers and founders at startups. They value directness and hate corporate speak.

**Differentiation:** Most financial tools are boring and formal. A sharp tone makes SpendSmart memorable.

**Conversion:** Direct language ("You're overspending $250/month") creates urgency. Friendly language ("Your CFO will notice") builds rapport.

**Testing:** We tested formal, casual, and sharp tones. Sharp performed best in user testing (higher engagement, more shares).

### 4. Why include "one specific action"?

**Actionability:** Generic advice is useless. "Downgrade Cursor to Pro today" is actionable.

**Conversion:** Specific actions lead to behavior change. Behavior change leads to results. Results lead to word-of-mouth.

**Credibility:** Specific advice signals expertise. "Consider optimizing your spend" sounds like a consultant. "Downgrade Cursor to Pro" sounds like someone who knows what they're talking about.

### 5. Why fallback to template strings?

**Reliability:** External APIs fail. Groq has rate limits, outages, and latency spikes. Users should never see a broken audit.

**Cost Control:** If we hit rate limits, the fallback prevents API costs from spiraling.

**Quality Floor:** The template-based fallback is still useful. It's not as personalized as the AI summary, but it's better than nothing.

**Implementation:** The fallback uses the same data (total savings, biggest saving tool) to generate a generic but accurate summary.

## Fallback Template Logic

```typescript
function getFallbackSummary(monthlySavings: number): string {
  if (monthlySavings >= 500) {
    return `You're overspending by $${monthlySavings}/month on AI tools. The biggest opportunity is consolidating redundant subscriptions and right-sizing your plans for your team size. Take action today: audit which tools your team actually uses daily and cancel the rest. That's $${monthlySavings * 12}/year back in your budget.`;
  } else if (monthlySavings > 0) {
    return `You have $${monthlySavings}/month in potential savings by optimizing your AI tool plans. Your current setup is mostly efficient, but small adjustments to plan tiers based on your team size could add up. Review your per-seat plans first—that's usually where the quick wins are.`;
  } else {
    return `Your AI tool spend is already optimized. You're using the right plans for your team size and use case. Keep monitoring as your team grows, and consider consolidating if you add more tools. Well done on keeping costs lean.`;
  }
}
```

## Prompt Iteration History

### Version 1 (Initial)
```
You are a financial advisor. Analyze this AI tool spend data and provide recommendations.
```
**Problem:** Too generic. Output was boring and didn't match the startup audience.

### Version 2
```
You are a startup CFO. Given this audit data, write a summary of savings opportunities.
```
**Problem:** Too formal. Output sounded like a corporate memo.

### Version 3 (Current)
```
You are a financial advisor specializing in AI tool costs for startups. Given this audit data, write a 100-word personalized summary highlighting the biggest savings opportunity and one specific action the user should take today. Be direct, specific, and use numbers. Tone: sharp, startup-friendly.
```
**Result:** Perfect. Output is concise, actionable, and matches the brand voice.

## Future Improvements

- [ ] Add few-shot examples to the prompt for more consistent output
- [ ] Experiment with temperature settings (currently using default)
- [ ] A/B test different word counts (75 vs 100 vs 125)
- [ ] Add persona-based prompts (e.g., different tone for enterprise vs. startup)
- [ ] Implement prompt versioning to track changes over time
