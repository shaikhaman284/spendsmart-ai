# Economics

## Unit Economics

### Converted Lead Value

**Average Credit Purchase:** $5,000  
**Credex Margin:** 12%  
**Revenue per Conversion:** $600

**Range:**
- Small purchase: $2,000 × 10% margin = $200
- Medium purchase: $5,000 × 12% margin = $600
- Large purchase: $10,000 × 15% margin = $1,500

**Weighted Average:** $600 per converted lead

### Customer Acquisition Cost (CAC) by Channel

#### Organic Channels (Free)

**Hacker News:**
- Cost: $0 (time investment only)
- Expected audits: 500
- Expected email captures: 50
- Expected conversions: 5
- CAC: $0

**Reddit:**
- Cost: $0
- Expected audits: 100
- Expected email captures: 10
- Expected conversions: 1
- CAC: $0

**Cold DMs:**
- Cost: $0 (time investment: ~10 hours)
- Expected audits: 50
- Expected email captures: 10
- Expected conversions: 2
- CAC: $0 (or ~$50 if valuing time at $100/hr)

**Credex Network:**
- Cost: $0 (leveraging existing relationships)
- Expected audits: 500
- Expected email captures: 100
- Expected conversions: 20
- CAC: $0

#### Paid Channels (Future)

**Google Ads (Search):**
- CPC: $5-10 (competitive keywords like "AI tool cost calculator")
- Conversion rate (visitor → audit): 30%
- Conversion rate (audit → email): 10%
- Conversion rate (email → purchase): 10%
- CAC: $5 / (0.30 × 0.10 × 0.10) = $1,667 per conversion
- **Verdict:** Too expensive. Not viable unless LTV increases significantly.

**LinkedIn Ads:**
- CPC: $8-12 (targeting engineering managers)
- Conversion rate (visitor → audit): 20%
- Conversion rate (audit → email): 8%
- Conversion rate (email → purchase): 15%
- CAC: $10 / (0.20 × 0.08 × 0.15) = $4,167 per conversion
- **Verdict:** Way too expensive. LinkedIn is not a good channel for this product.

**Twitter/X Ads:**
- CPC: $1-3
- Conversion rate (visitor → audit): 25%
- Conversion rate (audit → email): 10%
- Conversion rate (email → purchase): 10%
- CAC: $2 / (0.25 × 0.10 × 0.10) = $800 per conversion
- **Verdict:** Marginal. Could work if LTV > $1,200 (2:1 ratio).

**Content Marketing (SEO):**
- Cost: $2,000/mo (writer + SEO tools)
- Expected organic traffic: 5,000 visitors/mo (after 6 months)
- Conversion rate: 20% → audit, 10% → email, 10% → purchase
- Conversions: 5,000 × 0.20 × 0.10 × 0.10 = 10 per month
- CAC: $2,000 / 10 = $200 per conversion
- **Verdict:** Good long-term play. Payback period: 4 months.

## Conversion Funnel

```
1,000 visitors
    ↓ 30% complete audit
300 audits completed
    ↓ 30% capture email
90 email captures
    ↓ 10% book consultation
9 consultations booked
    ↓ 40% purchase credits
3.6 conversions
```

**Funnel Metrics:**
- Visitor → Audit: 30%
- Audit → Email: 30%
- Email → Consultation: 10%
- Consultation → Purchase: 40%
- **Overall Conversion:** 0.36% (visitor → purchase)

**Optimization Opportunities:**
- Increase audit completion rate (30% → 40%): Better UX, faster load times
- Increase email capture rate (30% → 40%): Better CTA copy, show value upfront
- Increase consultation booking rate (10% → 15%): Add calendar link directly in email
- Increase purchase rate (40% → 50%): Better sales process, clearer ROI

**Optimized Funnel:**
```
1,000 visitors → 400 audits → 160 emails → 24 consultations → 12 conversions
Overall Conversion: 1.2% (3.3x improvement)
```

## Path to $1M ARR

**Assumptions:**
- Average purchase: $5,000
- Margin: 12%
- Revenue per conversion: $600
- Repeat purchase rate: 50% annually (customers buy credits 2x per year)

**Required Conversions:**
- $1M ARR / $600 per conversion = 1,667 conversions per year
- 1,667 / 12 months = 139 conversions per month

**Required Traffic (Current Funnel):**
- 139 conversions / 0.36% conversion rate = 38,611 visitors per month

**Required Traffic (Optimized Funnel):**
- 139 conversions / 1.2% conversion rate = 11,583 visitors per month

**How to Get 11,583 Visitors/Month:**

1. **SEO (5,000 visitors/mo):** Rank for "AI tool cost calculator," "Cursor vs Copilot pricing," "reduce AI spend"
2. **Hacker News (2,000 visitors/mo):** Post monthly updates, new features, case studies
3. **Credex Network (2,000 visitors/mo):** Integrate into Credex's sales process
4. **Twitter/X Organic (1,000 visitors/mo):** Share audit results, savings tips, industry insights
5. **Partnerships (1,000 visitors/mo):** Affiliate deals with AI tool review sites
6. **Paid Ads (583 visitors/mo):** Twitter ads at $2 CPC = $1,166/mo ad spend

**Total Marketing Spend:** ~$3,000/mo (SEO content + ads)  
**Total Revenue:** $83,400/mo ($1M ARR)  
**Total Margin:** $10,008/mo  
**Marketing ROI:** 3.3x

## Sensitivity Analysis

### Scenario 1: Low Conversion (0.2%)
- Required traffic: 69,500 visitors/mo
- **Verdict:** Not achievable with organic channels alone. Need paid ads or viral growth.

### Scenario 2: Medium Conversion (0.6%)
- Required traffic: 23,167 visitors/mo
- **Verdict:** Achievable with strong SEO + partnerships + Credex network.

### Scenario 3: High Conversion (1.5%)
- Required traffic: 9,267 visitors/mo
- **Verdict:** Easily achievable. Focus on conversion optimization over traffic growth.

## Break-Even Analysis

**Fixed Costs:**
- Hosting (Vercel): $20/mo
- Database (Supabase): $25/mo
- Email (Resend): $20/mo
- APIs (Anthropic): $90/mo (at 10k audits/mo)
- **Total:** $155/mo

**Break-Even:**
- $155 / $600 per conversion = 0.26 conversions per month
- 0.26 / 0.36% conversion rate = 72 visitors per month

**Verdict:** Break-even is trivial. Any meaningful traffic will be profitable.

## Lifetime Value (LTV)

**Assumptions:**
- Average purchase: $5,000
- Margin: 12% = $600
- Repeat purchase rate: 50% annually
- Customer lifespan: 3 years

**LTV Calculation:**
- Year 1: $600 (initial purchase)
- Year 2: $600 × 0.5 = $300 (50% repeat)
- Year 3: $600 × 0.5 × 0.5 = $150 (25% repeat)
- **Total LTV:** $1,050

**LTV:CAC Ratio:**
- Organic channels: $1,050 / $0 = ∞ (infinite ROI)
- Content marketing: $1,050 / $200 = 5.25x (excellent)
- Twitter ads: $1,050 / $800 = 1.3x (marginal)
- Google ads: $1,050 / $1,667 = 0.63x (unprofitable)

**Conclusion:** Focus on organic channels and content marketing. Paid ads are not viable at current conversion rates.

## Revenue Projections

### Month 1-3 (Launch Phase)
- Traffic: 2,000 visitors/mo
- Conversions: 7/mo
- Revenue: $4,200/mo
- Margin: $504/mo

### Month 4-6 (Growth Phase)
- Traffic: 5,000 visitors/mo
- Conversions: 18/mo
- Revenue: $10,800/mo
- Margin: $1,296/mo

### Month 7-12 (Scale Phase)
- Traffic: 10,000 visitors/mo
- Conversions: 36/mo
- Revenue: $21,600/mo
- Margin: $2,592/mo

### Year 1 Total
- Revenue: $150,000
- Margin: $18,000
- Marketing spend: $12,000 (content + ads)
- **Net profit:** $6,000

### Year 2 (Optimized)
- Traffic: 15,000 visitors/mo (improved SEO + partnerships)
- Conversion rate: 1.2% (optimized funnel)
- Conversions: 180/mo
- Revenue: $1.08M
- Margin: $129,600
- Marketing spend: $36,000
- **Net profit:** $93,600

**Conclusion:** Path to $1M ARR is achievable in Year 2 with strong execution on SEO, conversion optimization, and leveraging Credex's network.
