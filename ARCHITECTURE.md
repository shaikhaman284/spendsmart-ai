# Architecture

## System Overview

```mermaid
graph TD
    A[User] -->|Fills form| B[Next.js Frontend]
    B -->|localStorage| B
    B -->|POST /api/audit| C[Audit API Route]
    C -->|Run rules| D[Audit Engine]
    C -->|Generate summary| E[Groq API]
    C -->|Save audit| F[Supabase]
    F -->|Return audit ID| C
    C -->|Return results| B
    B -->|Navigate to| G[/audit/id]
    G -->|Fetch audit| F
    G -->|Show results| A
    A -->|Submit email| H[Leads API Route]
    H -->|Check rate limit| F
    H -->|Save lead| F
    H -->|Send email| I[Resend]
    I -->|Confirmation| A
```

## Why Next.js App Router?

The App Router provides several advantages for this application:

1. **Server Components by default** - Audit results page can fetch data server-side, improving SEO and initial load time
2. **API Routes co-located** - Backend logic lives alongside frontend code
3. **Streaming & Suspense** - Can stream audit results as they're generated (future optimization)
4. **Built-in metadata API** - Dynamic OG tags for shareable audit URLs
5. **Edge-ready** - Easy to deploy to Vercel Edge for global low-latency

## Data Flow

### 1. Form Submission → Audit Generation

```
User fills form → localStorage saves state → Submit → POST /api/audit
  ↓
Audit Engine runs pure TypeScript rules
  ↓
Groq API generates personalized summary (with fallback)
  ↓
Save to Supabase audits table
  ↓
Return audit ID + results → Navigate to /audit/[id]
```

### 2. Shareable URL

```
User visits /audit/[id] → Server Component fetches from Supabase
  ↓
Generate dynamic OG tags with savings amount
  ↓
Render results (no email/company data shown)
  ↓
Client component handles lead capture form
```

### 3. Lead Capture

```
User submits email → POST /api/leads
  ↓
Check IP-based rate limit (3 per hour)
  ↓
Save to Supabase leads table
  ↓
Send confirmation email via Resend
  ↓
Return success → Show confirmation message
```

## Scaling to 10k Audits/Day

### Current Architecture (MVP)

- **Compute:** Vercel serverless functions (10s timeout)
- **Database:** Supabase free tier (500MB, 2GB bandwidth)
- **API:** Anthropic Claude Haiku (~$0.0003 per audit)
- **Email:** Resend free tier (100 emails/day)

**Bottlenecks:**
- Resend free tier maxes at 100 emails/day
- Supabase bandwidth could hit limits
- Anthropic API rate limits (tier-dependent)

### Scaling Strategy

#### Phase 1: 1k audits/day
- Upgrade Resend to paid ($20/mo for 50k emails)
- Supabase Pro ($25/mo for 8GB database, 50GB bandwidth)
- Add Redis for rate limiting (Upstash free tier)

#### Phase 2: 10k audits/day
- **Edge Functions:** Move audit engine to Vercel Edge for <50ms response times globally
- **CDN Caching:** Cache audit results at CDN layer (Vercel automatically does this for static pages)
  - Set `Cache-Control: public, s-maxage=31536000, immutable` for /audit/[id] pages
  - Audits never change, so cache forever
- **Database Read Replicas:** Supabase read replicas for audit fetching
- **Batch Email Processing:** Queue emails in Supabase, process in batches via cron
- **API Cost Optimization:** 
  - Groq is free, so no optimization needed
  - Monitor rate limits and implement caching if needed
  - Fallback to template summaries if rate limited

#### Phase 3: 100k audits/day
- **Separate audit engine service:** Dedicated compute for audit logic
- **PostgreSQL connection pooling:** PgBouncer for database connections
- **Multi-region deployment:** Edge functions + regional databases
- **Async audit generation:** Return audit ID immediately, generate results in background

### Cost Projections

**10k audits/day:**
- Vercel Pro: $20/mo
- Supabase Pro: $25/mo
- Groq API: $0/mo (free)
- Resend: $20/mo
- **Total: ~$65/mo**

**100k audits/day:**
- Vercel Enterprise: $500/mo
- Supabase Team: $599/mo
- Groq API: $0/mo (free, with rate limits)
- Resend: $80/mo
- Redis (Upstash): $40/mo
- **Total: ~$1,219/mo**

## Security Considerations

1. **RLS Policies:** Supabase Row Level Security prevents unauthorized data access
2. **Rate Limiting:** IP-based rate limiting prevents abuse (3 submissions/hour)
3. **Honeypot Field:** Catches basic bots in lead capture form
4. **Service Key Protection:** Supabase service key only used server-side
5. **Input Validation:** All API routes validate input before processing

## Future Optimizations

- [ ] Add Redis for distributed rate limiting
- [ ] Implement audit result caching
- [ ] Add background job queue for email sending
- [ ] Pre-generate common AI summaries
- [ ] Add analytics tracking (PostHog or Plausible)
- [ ] Implement A/B testing for CTA copy
