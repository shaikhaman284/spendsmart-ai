# Reflection

## 1. What was the hardest bug you faced, and how did you solve it?

The hardest bug was dealing with Supabase Row Level Security (RLS) policies for the audits table. Initially, I set up the table with RLS enabled but forgot to create explicit policies for public read access. This caused the `/audit/[id]` page to fail silently—the query would return null, but there were no error messages in the logs. The issue was particularly tricky because it worked fine in development when I was using the service role key, but failed in production when using the anon key.

I spent about 2 hours debugging this, checking everything from the API route logic to the Supabase client initialization. The breakthrough came when I tested the query directly in the Supabase SQL editor and saw the RLS policy violation error. The fix was simple: add a policy that allows public SELECT access to the audits table. But the lesson was valuable—RLS policies need to be explicitly defined for every operation, even seemingly obvious ones like public reads.

The second part of this bug involved the Anthropic API returning 429 rate limit errors during testing. I was making too many requests too quickly while debugging the audit engine. The solution was twofold: first, implement a graceful fallback to template-based summaries when the API fails; second, add exponential backoff retry logic for production. The fallback was critical—users should never see a broken audit just because an external API is down. This taught me to always design for failure, especially with third-party services.

## 2. Tell me about a decision you made and then reversed. What changed your mind?

I initially chose Firebase as the backend because I'm familiar with it and it has great documentation. I set up Firestore collections for audits and leads, implemented the security rules, and got basic CRUD operations working. But about two days in, I hit a wall with complex queries. Specifically, I wanted to implement rate limiting based on IP address with time-window queries (e.g., "count submissions from this IP in the last hour"). Firestore's query limitations made this painful—I'd need to fetch all records and filter client-side, or use Cloud Functions with additional complexity.

I switched to Supabase (PostgreSQL) and immediately felt the difference. SQL queries for rate limiting were trivial: `SELECT COUNT(*) WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 hour'`. Plus, Supabase's RLS policies are more powerful than Firestore security rules for this use case. The migration took about 3 hours (rewriting the schema, updating API routes, testing), but it was worth it. PostgreSQL's relational model is a better fit for this app's data structure.

The decision to switch was driven by pragmatism—I could feel myself fighting against Firestore's constraints. The lesson: don't be afraid to reverse a decision early if it's not working. The sunk cost fallacy is real, but 2 days of work is better to throw away than 2 weeks.

## 3. If you had another week, what would you build next?

**PDF Export:** Users should be able to download their audit as a professional PDF report. I'd use a library like `react-pdf` or `puppeteer` to generate PDFs server-side. The report would include the full breakdown, AI summary, and Credex branding. This is a high-value feature for users who want to share results with their team or finance department.

**Embeddable Widget:** A JavaScript snippet that other websites can embed to offer SpendSmart audits to their audience. Think "Calculate Your Savings" widget for SaaS blogs or AI tool directories. This would be a growth lever—every embed is a distribution channel. Technically, it's an iframe with postMessage communication for data passing.

**Benchmark Mode:** Show users how their spend compares to similar companies (by team size, industry, use case). This requires collecting aggregate data from audits and presenting percentile rankings. "You're spending 30% more than similar teams" is a powerful motivator. Privacy is key—all data would be anonymized and aggregated.

**Slack Integration:** A Slack bot that lets teams run audits directly in Slack. `/spendsmart audit` triggers a form, and results are posted in the channel. This lowers friction for team-based decision-making. Slack apps have great distribution potential through the app directory.

**Savings Tracker:** For users who implement recommendations, a follow-up feature to track actual savings over time. "You've saved $X since your audit" with a dashboard. This builds engagement and creates a reason to return to the app.

Priority order: PDF export (quick win, high value) → Benchmark mode (differentiation) → Embeddable widget (growth) → Slack integration (distribution) → Savings tracker (retention).

## 4. How did you use AI tools while building this? What did you trust them with, and what did you not?

I used Claude (via Cursor) heavily for boilerplate code, TypeScript types, and Tailwind styling. For example, I'd write a comment like "// Create a form with tool, plan, and seats inputs" and let Cursor generate the JSX. This saved hours on repetitive UI code. I also used Claude to generate test cases—I'd describe the scenario ("Cursor Business for 2 users should recommend Pro") and it would write the Jest test. Probably 40% of the codebase was AI-assisted.

What I trusted AI with:
- Boilerplate React components
- TypeScript type definitions
- Tailwind CSS classes and responsive layouts
- Test case scaffolding
- SQL schema generation
- Documentation structure (e.g., README template)

What I didn't trust AI with:
- Business logic (audit engine rules)
- API route security (rate limiting, validation)
- Supabase RLS policies (too critical to get wrong)
- Architecture decisions (Next.js vs. Remix, Supabase vs. Firebase)
- Pricing data (needed to verify manually from source)
- User interview content (needed to feel authentic, not generated)

The key insight: AI is great for "how" but not "what" or "why." I made all the strategic decisions (what to build, why this approach, which trade-offs to make), and AI helped with implementation details. I also never blindly accepted AI suggestions—every piece of generated code was reviewed and often modified. For example, AI-generated form validation was too permissive, so I tightened it.

One mistake: I initially let AI write the Anthropic API integration, and it used an outdated SDK version. I caught this during testing, but it cost me 30 minutes. Lesson: always verify AI-generated code that touches external APIs or libraries.

## 5. Rate yourself 1-10 on these dimensions and explain why:

**Discipline: 8/10**
I stuck to the plan and shipped all required features without scope creep. I resisted the temptation to add "nice-to-have" features like user accounts or dashboard analytics. The 7-day timeline kept me focused. I lose 2 points for occasionally going down rabbit holes (e.g., spending too much time on the perfect gradient for the hero section when a simple solid color would've worked).

**Code Quality: 7/10**
The code is clean, well-typed, and tested. I used TypeScript strict mode, wrote comprehensive tests for the audit engine, and followed Next.js best practices. However, there are areas for improvement: some components are too large (e.g., `SpendInputForm` could be split into smaller pieces), error handling could be more robust (especially for external API failures), and I didn't implement logging or monitoring. The code works and is maintainable, but it's not production-grade for a high-scale app.

**Design Sense: 6/10**
The UI is functional and looks decent, but it's not exceptional. I relied heavily on Tailwind's defaults and didn't push the design boundaries. The dark mode theme is safe but not distinctive. The audit results page is screenshot-worthy, but the form page is pretty generic. I'm a developer first, designer second—I can make things look "good enough" but not "wow." If I had a designer on the team, we could 2x the visual impact.

**Problem-Solving: 9/10**
I'm proud of how I approached the technical challenges. Switching from Firebase to Supabase when I hit query limitations was the right call. Implementing a fallback for the Anthropic API ensured reliability. The rule-based audit engine instead of AI-based was a smart trade-off (predictable, testable, no API costs). I debugged the RLS policy issue systematically. I lose 1 point for not anticipating the Anthropic rate limiting issue earlier—I should've implemented retry logic from the start.

**Entrepreneurial Thinking: 8/10**
I built this with a clear business model in mind: lead generation for Credex. Every feature decision was driven by "will this convert leads?" The conditional CTAs (Credex for high savings, "notify me" for low savings) show understanding of different user segments. The shareable URL with OG tags is a growth feature. The rate limiting protects against abuse without hurting legitimate users. I thought about distribution (Show HN, cold DMs, Slack communities) and economics (conversion funnel, CAC, LTV). I lose 2 points for not implementing analytics from day one—I should be tracking every user action to optimize conversion.
