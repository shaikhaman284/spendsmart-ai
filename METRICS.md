# Metrics

## North Star Metric

**Weekly Audits Completed**

### Why This Metric?

The north star metric should represent core product value. For SpendSmart AI, value is delivered when a user completes an audit and sees their savings opportunities. Everything else (email captures, consultations, purchases) flows from this.

**Why not "email captures"?** Email capture is a lagging indicator. If audits are valuable, emails will follow. If audits aren't valuable, forcing email capture won't help.

**Why not "revenue"?** Revenue is too far downstream. We need a metric that measures product-market fit, not just sales execution.

**Why weekly, not monthly?** Weekly cadence allows faster iteration. Monthly metrics are too slow for early-stage product development.

---

## Input Metrics (Leading Indicators)

### 1. Unique Visitors
**Definition:** Number of unique visitors to the homepage per week  
**Target:** 1,000/week (Month 1) → 5,000/week (Month 6)  
**Why it matters:** More visitors = more potential audits. This measures top-of-funnel health.

### 2. Audit Start Rate
**Definition:** % of visitors who start filling out the form  
**Target:** 50%  
**Why it matters:** Measures homepage effectiveness. If visitors don't start the form, the value prop isn't clear.

### 3. Audit Completion Rate
**Definition:** % of users who start the form and complete it  
**Target:** 60%  
**Why it matters:** Measures form UX. If users abandon mid-form, it's too long or confusing.

---

## Output Metrics (Lagging Indicators)

### 1. Email Capture Rate
**Definition:** % of completed audits that result in email capture  
**Target:** 30%  
**Why it matters:** Measures perceived value. If users won't share their email, the audit isn't valuable enough.

### 2. Consultation Booking Rate
**Definition:** % of email captures that book a consultation  
**Target:** 10%  
**Why it matters:** Measures sales-qualified lead quality. High booking rate = good lead quality.

### 3. Purchase Conversion Rate
**Definition:** % of consultations that result in a credit purchase  
**Target:** 40%  
**Why it matters:** Measures sales effectiveness and product-market fit for Credex's core offering.

---

## Instrumentation Plan

### Phase 1: Basic Analytics (Week 1)

**Tool:** Vercel Analytics (built-in, free)

**Events to Track:**
- Page views (homepage, audit results page)
- Form submissions (audit completed)
- Button clicks (CTA buttons, share buttons)

**Implementation:**
```typescript
// In components
import { track } from '@vercel/analytics';

track('audit_completed', {
  totalSavings: totalMonthlySavings,
  toolCount: tools.length,
});
```

### Phase 2: Conversion Funnel (Week 2)

**Tool:** PostHog (self-hosted or cloud, free tier)

**Events to Track:**
- `homepage_viewed`
- `form_started`
- `tool_added`
- `audit_submitted`
- `audit_completed`
- `email_form_viewed`
- `email_submitted`
- `share_button_clicked`
- `audit_url_copied`

**Funnel:**
```
homepage_viewed → form_started → audit_submitted → audit_completed
                                                  ↓
                                          email_form_viewed → email_submitted
```

### Phase 3: Advanced Analytics (Month 2)

**Tool:** Mixpanel or Amplitude

**Additional Events:**
- `tool_selected` (which tools are most common?)
- `plan_selected` (which plans are most common?)
- `savings_tier` (bucketed: $0, $1-100, $100-500, $500+)
- `use_case_selected` (coding, writing, data, research, mixed)
- `ai_summary_generated` (success vs. fallback)
- `consultation_booked` (via Calendly webhook)

**Cohort Analysis:**
- Retention: Do users return to check their audit?
- Referral: Do shared audits drive new users?
- Conversion: Which traffic sources convert best?

---

## Dashboard (Week 1)

### Key Metrics (Daily)
- Unique visitors
- Audits completed
- Email captures
- Avg. savings per audit

### Funnel (Weekly)
```
1,000 visitors
  ↓ 50% start form
500 form starts
  ↓ 60% complete
300 audits completed (North Star)
  ↓ 30% capture email
90 email captures
  ↓ 10% book consultation
9 consultations
  ↓ 40% purchase
3.6 conversions
```

### Top Tools (Weekly)
- Which tools are most commonly audited?
- Which tools generate the most savings?
- Which tools have the highest "keep current plan" rate?

---

## Pivot Triggers

### Trigger 1: Low Audit Completion Rate (<30%)
**Signal:** Users start the form but don't finish  
**Diagnosis:** Form is too long or confusing  
**Action:** Simplify form, reduce required fields, add progress indicator

### Trigger 2: Low Email Capture Rate (<15%)
**Signal:** Users complete audits but don't share email  
**Diagnosis:** Audit isn't valuable enough, or CTA isn't compelling  
**Action:** Improve audit quality, A/B test CTA copy, add more value to email report

### Trigger 3: Low Consultation Booking Rate (<5%)
**Signal:** Email captures don't convert to consultations  
**Diagnosis:** Leads are low quality, or sales process is broken  
**Action:** Add qualification questions, improve email nurture sequence, simplify booking process

### Trigger 4: High Bounce Rate (>60%)
**Signal:** Visitors leave without engaging  
**Diagnosis:** Value prop isn't clear, or traffic is low quality  
**Action:** Rewrite homepage copy, improve targeting, add social proof

### Trigger 5: Flat Growth (<10% MoM)
**Signal:** North star metric isn't growing  
**Diagnosis:** Distribution channels aren't working, or product isn't sticky  
**Action:** Double down on working channels, experiment with new channels, add viral features

---

## Success Criteria (Month 1)

**Minimum Viable Success:**
- 500 audits completed
- 30% email capture rate
- 5 consultation bookings
- 1 credit purchase

**Strong Success:**
- 1,000 audits completed
- 40% email capture rate
- 10 consultation bookings
- 3 credit purchases

**Exceptional Success:**
- 2,000+ audits completed
- 50% email capture rate
- 20+ consultation bookings
- 5+ credit purchases

---

## Metric Definitions (Detailed)

### Unique Visitors
**Calculation:** Count of unique IP addresses or browser fingerprints per week  
**Exclusions:** Bots, internal traffic (Credex team), repeat visits within 24 hours  
**Tool:** Vercel Analytics or PostHog

### Audit Start Rate
**Calculation:** (Users who add at least 1 tool) / (Homepage visitors) × 100  
**Exclusions:** Users who bounce in <5 seconds  
**Tool:** PostHog event tracking

### Audit Completion Rate
**Calculation:** (Users who submit the form) / (Users who start the form) × 100  
**Exclusions:** Users who abandon due to errors (track separately)  
**Tool:** PostHog funnel analysis

### Email Capture Rate
**Calculation:** (Email submissions) / (Audits completed) × 100  
**Exclusions:** Spam submissions (caught by honeypot)  
**Tool:** PostHog + Supabase query

### Consultation Booking Rate
**Calculation:** (Calendly bookings) / (Email captures) × 100  
**Exclusions:** No-shows (track separately)  
**Tool:** Calendly webhook + Supabase

### Purchase Conversion Rate
**Calculation:** (Credit purchases) / (Consultations held) × 100  
**Exclusions:** Consultations that are still in progress  
**Tool:** Credex CRM + Supabase

---

## Reporting Cadence

**Daily (Internal):**
- North star metric (audits completed)
- Unique visitors
- Email captures

**Weekly (Team):**
- Full funnel metrics
- Top tools audited
- Avg. savings per audit
- Channel breakdown (HN, Reddit, Twitter, etc.)

**Monthly (Leadership):**
- MoM growth in north star
- CAC by channel
- LTV:CAC ratio
- Revenue and margin

---

## A/B Testing Framework

### Test 1: Homepage Headline
**Variants:**
- A (Control): "Stop Guessing. See Exactly Where Your AI Budget Leaks."
- B: "Find $500/mo in AI Overspend in 60 Seconds."

**Metric:** Audit start rate  
**Sample Size:** 1,000 visitors per variant  
**Duration:** 1 week  
**Success Criteria:** >10% improvement in audit start rate

### Test 2: Email CTA Copy
**Variants:**
- A (Control): "Get My Report"
- B: "Send Me the Full Breakdown"

**Metric:** Email capture rate  
**Sample Size:** 500 audits per variant  
**Duration:** 1 week  
**Success Criteria:** >5% improvement in email capture rate

### Test 3: AI Summary Placement
**Variants:**
- A (Control): AI summary at top of results
- B: AI summary after tool breakdown

**Metric:** Email capture rate  
**Sample Size:** 500 audits per variant  
**Duration:** 1 week  
**Success Criteria:** >5% improvement in email capture rate

---

## Long-Term Metrics (Month 6+)

### Viral Coefficient
**Definition:** (Shared audits that drive new users) / (Total audits)  
**Target:** 0.3 (30% of audits drive at least 1 new user)

### Retention Rate
**Definition:** % of users who return to the site within 30 days  
**Target:** 20% (users check their audit again or run a new one)

### Net Promoter Score (NPS)
**Definition:** "How likely are you to recommend SpendSmart to a colleague?" (0-10 scale)  
**Target:** 50+ (excellent for B2B tools)

### Time to Value
**Definition:** Median time from homepage visit to audit completion  
**Target:** <3 minutes (fast = good UX)
