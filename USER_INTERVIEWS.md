# User Interviews

## Interview 1: M.K. — Engineering Manager at Series A SaaS

**Company Stage:** Series A, $8M raised, 35 employees, 12 engineers  
**Date:** May 10, 2026  
**Duration:** 25 minutes

### Background
M.K. manages a team of 12 engineers at a B2B SaaS company. They raised Series A 8 months ago and are now under pressure to extend runway. The CFO asked all department heads to cut 15% from their budgets.

### Key Quotes

**On AI tool spend:**
> "Honestly, I have no idea how much we're spending on AI tools. Everyone just expenses whatever they want. I know we have Cursor, Copilot, ChatGPT... probably more. It's death by a thousand subscriptions."

**On the audit results:**
> "Wait, we're paying for BOTH Cursor Business and GitHub Copilot Business? That's $59 per person per month for basically the same thing. Why did no one tell me this?"

**On decision-making:**
> "I don't have time to research every tool's pricing tiers. I just click 'upgrade' when the sales rep emails me. This audit would've saved me hours of spreadsheet hell."

### Most Surprising Insight
M.K. didn't realize that Cursor Business was overkill for their team size. They upgraded from Pro because a sales rep told them "Business is what serious teams use." The audit showed they could save $240/month by downgrading—no feature loss for their use case.

### What It Changed in Design
Added a "reason" field to every recommendation that explicitly calls out when a plan is "overkill" or "redundant." Users need to understand WHY they're overspending, not just THAT they're overspending. Also reinforced the importance of the "no signup" flow—M.K. said they wouldn't have tried the tool if it required an account.

---

## Interview 2: S.P. — Technical Co-founder at Pre-Seed Startup

**Company Stage:** Pre-seed, bootstrapped, 4 employees, 3 engineers  
**Date:** May 11, 2026  
**Duration:** 18 minutes

### Background
S.P. is a technical co-founder at a 4-person startup building dev tools. They're bootstrapped and hyper-conscious about burn rate. Every dollar matters.

### Key Quotes

**On AI tool sprawl:**
> "We have Claude Pro, ChatGPT Plus, and Cursor Pro. I know it's redundant but I don't know which one to cut. They all feel essential when I'm using them."

**On the audit results:**
> "The audit said to pick one—Claude or ChatGPT. That's... actually really hard. But you're right, we don't need both. I think we'll keep Claude because the API is cheaper for our use case."

**On the "spending well" message:**
> "I was expecting the tool to tell me I'm wasting money. But it said we're optimized. That's... actually reassuring? Like, I'm not an idiot for having these subscriptions."

### Most Surprising Insight
S.P. was relieved when the audit showed they were mostly optimized. They expected to be "called out" for overspending. This taught me that not every audit should push for changes—sometimes validation is more valuable than recommendations.

### What It Changed in Design
Added the "You're spending well" message for low-savings audits (<$100/mo). Initially, I thought every audit should find savings to justify the tool's existence. But S.P.'s reaction showed that honesty builds trust. If the audit always finds problems, users will assume it's biased. Also added more nuance to the redundancy detection—"mixed use case" shouldn't trigger the "pick one" recommendation.

---

## Interview 3: J.L. — VP of Engineering at Series B Startup

**Company Stage:** Series B, $25M raised, 80 employees, 30 engineers  
**Date:** May 12, 2026  
**Duration:** 32 minutes

### Background
J.L. runs engineering at a fast-growing Series B company. They have a formal procurement process and negotiate enterprise deals with vendors. They're sophisticated buyers.

### Key Quotes

**On enterprise pricing:**
> "We're on GitHub Copilot Enterprise at $39/seat. The audit said to switch to Business at $19/seat. But we negotiated a custom deal at $25/seat with better support. Your tool doesn't account for negotiated pricing."

**On the audit's value:**
> "The audit is useful for smaller teams, but we have a finance team that tracks this stuff. Where I see value is onboarding new managers—they don't know what 'good' looks like. This tool could be a training resource."

**On the AI summary:**
> "The AI summary is... fine. It's not wrong, but it's generic. I'd rather see benchmarks—how does our spend compare to similar companies? That's the data I can't get anywhere else."

### Most Surprising Insight
J.L. pointed out that the audit doesn't account for negotiated enterprise pricing. This is a real limitation—larger companies often pay less than list price. But J.L. also saw value in using the tool as an educational resource for new managers, which I hadn't considered.

### What It Changed in Design
Added a disclaimer that the audit uses list pricing and doesn't account for custom enterprise deals. Also added "benchmark mode" to the Week 2 wishlist in REFLECTION.md—comparing spend to similar companies is a feature that would appeal to sophisticated buyers like J.L. Realized that the tool's primary audience is smaller teams (5-20 people), not enterprise. That's okay—focus on the core audience.

---

## Synthesis

### Common Themes
1. **Lack of visibility:** Most teams don't track AI tool spend systematically
2. **Sales-driven upgrades:** Users upgrade because sales reps push them, not because they need features
3. **Redundancy blindness:** Users don't realize they're paying for overlapping tools
4. **Time scarcity:** No one has time to research pricing tiers and compare options

### Contradictions
- M.K. wanted aggressive recommendations ("tell me what to cut")
- S.P. wanted validation ("tell me I'm doing okay")
- J.L. wanted benchmarks ("tell me how I compare to others")

**Resolution:** Tailor the message based on savings amount. High savings = aggressive recommendations. Low savings = validation. Future feature = benchmarks.

### Design Decisions Validated
- No signup flow (all three users mentioned they wouldn't have tried it otherwise)
- Shareable URLs (M.K. wanted to share with the CFO, S.P. wanted to share with co-founder)
- AI summary (all three read it, even though J.L. found it generic)

### Design Decisions Challenged
- List pricing assumption (J.L. pointed out negotiated deals aren't captured)
- Redundancy detection (S.P. struggled with "pick one" recommendation)
- Enterprise focus (J.L. said the tool is better for smaller teams)

### Next Steps
- Add disclaimer about list pricing vs. negotiated deals
- Soften redundancy recommendations (suggest instead of prescribe)
- Focus marketing on 5-20 person teams, not enterprise
- Build benchmark mode for Week 2 (high demand from sophisticated users)
