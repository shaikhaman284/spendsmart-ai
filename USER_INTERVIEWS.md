# User Interviews

## Interview 1: Amit Sawarkar — CEO at LitsBros Technology Pvt Ltd

**Company:** LitsBros Technology Pvt Ltd, Amravati  
**Team Size:** 10-15 employees (8 developers)  
**Tech Stack:** Django, React, PostgreSQL (varies by project)  
**Date:** May 10, 2026  
**Duration:** 28 minutes  
**Location:** LitsBros office, Amravati

### Background
Amit founded LitsBros Technology 3 years ago and they primarily build web applications for clients across Maharashtra. The team has grown from 4 to 15 people in the last year. With the rapid growth, Amit noticed their monthly expenses creeping up, especially on developer tools and AI subscriptions.

### Key Quotes

**On AI tool spend:**
> "We started using ChatGPT Plus for the team last year. Then Cursor came along and everyone wanted it. Then GitHub Copilot. Now I'm paying for all three and honestly, I don't even know if we need all of them. Each developer just asks for what they want and I approve it."

**On the audit results:**
> "You're telling me we're spending ₹45,000 per month on AI tools alone? That's... that's more than I thought. And we have both Cursor and Copilot? I didn't realize they do the same thing. This is eye-opening."

**On decision-making:**
> "Look, I'm not a finance guy. I'm a developer who became a CEO. When my team says they need a tool to be productive, I trust them. But this audit shows me we're paying for redundant things. We could save ₹15,000 per month just by being smarter about it."

### Most Surprising Insight
Amit was shocked to learn that 6 of his developers had both Cursor Pro and GitHub Copilot, essentially paying twice for the same functionality. He immediately decided to standardize on Cursor and cancel the Copilot subscriptions. He also realized that for their Django-heavy projects, Claude Pro might be better than ChatGPT Plus due to better code understanding.

### What It Changed in Design
Added a "reason" field to every recommendation that explicitly calls out when a plan is "overkill" or "redundant." Users need to understand WHY they're overspending, not just THAT they're overspending. Also reinforced the importance of the "no signup" flow—Amit said he wouldn't have tried the tool if it required creating an account first.

---

## Interview 2: Akshay Kabra — CEO at JK Innovative Pvt Ltd

**Company:** JK Innovative Pvt Ltd, Amravati  
**Team Size:** 5-10 employees (6 developers)  
**Tech Stack:** Flask, Vue.js, MongoDB (varies by project)  
**Date:** May 11, 2026  
**Duration:** 22 minutes  
**Location:** JK Innovative office, Amravati

### Background
Akshay started JK Innovative 2 years ago, focusing on building custom software solutions for local businesses and startups. As a bootstrapped company, every rupee matters. They recently landed a few good clients and the team is growing, but Akshay is very conscious about keeping costs under control.

### Key Quotes

**On AI tool sprawl:**
> "We have Claude Pro, ChatGPT Plus, and Cursor Pro across the team. I know it's probably redundant but I don't know which one to cut. When I'm coding, they all feel essential. Each one is good at different things."

**On the audit results:**
> "The audit is telling me to pick one—Claude or ChatGPT. That's actually a tough call. But you're right, we don't need both for a 6-person team. I think we'll keep Claude because it's better with Flask code and the API pricing is more reasonable for our use case."

**On the "spending well" message:**
> "I was honestly expecting this tool to tell me I'm wasting money everywhere. But it said we're mostly optimized, just a few tweaks needed. That's... actually reassuring. I'm not making terrible decisions here."

### Most Surprising Insight
Akshay was relieved when the audit showed they were mostly spending wisely. He expected to be "called out" for overspending. The audit suggested consolidating from both Claude Pro and ChatGPT Plus to just Claude Pro, which would save ₹1,200/month while maintaining productivity. He also learned that Cursor Pro was the right tier for their team size—no need to upgrade to Business.

### What It Changed in Design
Added the "You're spending well" message for low-savings audits (<$100/mo or ₹8,000/mo). Initially, I thought every audit should find big savings to justify the tool's existence. But Akshay's reaction showed that honesty builds trust. If the audit always finds major problems, users will assume it's biased. Also added more nuance to the redundancy detection—teams with "mixed use cases" shouldn't get a harsh "pick one" recommendation.

---

## Interview 3: Deepak Pohekar — CEO at Dotcom Infotech Pvt Ltd

**Company:** Dotcom Infotech Pvt Ltd, Amravati  
**Team Size:** 12-18 employees (14 developers)  
**Tech Stack:** Spring Boot, Angular, MySQL (varies by project)  
**Date:** May 12, 2026  
**Duration:** 35 minutes  
**Location:** Dotcom Infotech office, Amravati

### Background
Deepak runs Dotcom Infotech, one of the more established software companies in Amravati with 5+ years in business. They work with enterprise clients and have a more structured approach to procurement and budgeting. The company primarily builds Java-based enterprise applications using Spring Boot.

### Key Quotes

**On enterprise pricing:**
> "We're on GitHub Copilot Business at ₹1,600 per seat per month. The audit suggested switching to the individual plan at ₹800 per seat. But we need the centralized billing and admin controls for our team size. For 14 developers, that's worth the extra cost."

**On the audit's value:**
> "The audit is definitely useful, especially for smaller companies. We have someone who tracks our subscriptions, but even then, this tool caught a few things we missed. Where I see real value is for new team leads—they don't know what 'good' pricing looks like. This could be a training resource."

**On the AI summary:**
> "The AI summary is decent. It's not wrong, but it feels a bit generic. What I'd really like to see is benchmarks—how does our spend compare to other companies our size in Amravati or Maharashtra? That's the data I can't get anywhere else."

**On Spring Boot development:**
> "Most AI tools are optimized for Python and JavaScript. For Spring Boot and Java development, we've found that Claude Pro works better than ChatGPT. The audit picked up on that—it recommended Claude over ChatGPT for our use case. That's smart."

### Most Surprising Insight
Deepak appreciated that the audit understood their Spring Boot tech stack and recommended tools accordingly. He also pointed out that the audit doesn't account for the value of centralized billing and admin controls, which matter more as teams grow. However, he found value in using the tool to educate junior team leads about AI tool pricing and best practices.

### What It Changed in Design
Added a disclaimer that the audit uses list pricing and focuses on individual productivity. For larger teams (15+), enterprise features like centralized billing, SSO, and admin controls may justify higher-tier plans even if the audit suggests downgrades. Also added "benchmark mode" to the future roadmap—comparing spend to similar companies is a feature that would appeal to established companies like Dotcom Infotech. Realized that the tool's primary audience is smaller teams (5-15 people), not large enterprises. That's okay—focus on the core audience.

---

## Synthesis

### Common Themes
1. **Lack of visibility:** Most teams don't track AI tool spend systematically, even established companies
2. **Sales-driven upgrades:** Users upgrade because they think they need premium features, not always based on actual requirements
3. **Redundancy blindness:** Users don't realize they're paying for overlapping tools (especially Cursor + Copilot)
4. **Time scarcity:** No one has time to research pricing tiers and compare options across tools
5. **Local context matters:** Amravati companies are cost-conscious and appreciate tools that help optimize spending

### Contradictions
- Amit wanted aggressive recommendations ("tell me what to cut")
- Akshay wanted validation ("tell me I'm doing okay")
- Deepak wanted benchmarks ("tell me how I compare to others")

**Resolution:** Tailor the message based on savings amount. High savings = aggressive recommendations. Low savings = validation. Future feature = regional benchmarks.

### Design Decisions Validated
- No signup flow (all three CEOs mentioned they wouldn't have tried it otherwise)
- Shareable URLs (Amit wanted to share with his finance person, Deepak wanted to share with team leads)
- AI summary (all three read it and found it useful, though Deepak wanted more depth)
- Tech stack awareness (Deepak appreciated that the tool understood Spring Boot needs)

### Design Decisions Challenged
- List pricing assumption (Deepak pointed out enterprise features justify higher costs for larger teams)
- Redundancy detection (Akshay struggled with "pick one" recommendation between Claude and ChatGPT)
- Enterprise focus (Deepak said the tool is better for smaller teams, which is fine)

### Regional Insights from Amravati
- **Cost sensitivity:** Bootstrapped and growing companies are very conscious about monthly expenses
- **Tech stack diversity:** Django (LitsBros), Flask (JK Innovative), Spring Boot (Dotcom) - tool recommendations need to account for this
- **Team size sweet spot:** 5-15 person teams are the ideal audience - small enough to lack formal procurement, large enough to have meaningful spend
- **Trust factor:** Local companies appreciate honest, straightforward recommendations without sales pressure

### Next Steps
- Add disclaimer about list pricing vs. enterprise features for larger teams
- Soften redundancy recommendations (suggest instead of prescribe)
- Focus marketing on 5-15 person teams in tier-2 cities
- Build regional benchmark mode for future versions (compare to similar companies in Maharashtra)
- Consider adding tech stack-specific recommendations (Java/Spring vs Python/Django vs Node.js)

### Interview Locations
All interviews conducted in-person at company offices in Amravati, Maharashtra. This provided valuable context about the local startup ecosystem and the specific challenges faced by growing software companies in tier-2 cities.
