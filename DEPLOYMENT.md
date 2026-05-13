# Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Supabase Account** - Sign up at https://supabase.com
3. **Groq API Key** - Get from https://console.groq.com (free)
4. **Resend API Key** - Get from https://resend.com

## Step 1: Set Up Supabase

1. Create a new Supabase project
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project credentials:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → anon/public key
   - Service Key: Settings → API → service_role key (keep this secret!)

## Step 2: Set Up Groq API

1. Go to https://console.groq.com
2. Sign up for a free account (no credit card required)
3. Create an API key
4. Copy the key

## Step 3: Set Up Resend

1. Go to https://resend.com
2. Create an API key
3. Verify your domain (optional for production, not needed for testing)

## Step 4: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/spendsmart-ai.git
git push -u origin main
```

2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables via Vercel dashboard

## Step 5: Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
GROQ_API_KEY=gsk_your-key
RESEND_API_KEY=re_your-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:** Mark `SUPABASE_SERVICE_KEY` as sensitive!

## Step 6: Test in Production

1. Visit your deployed URL
2. Complete a test audit
3. Verify email is sent (check spam folder)
4. Test shareable URL
5. Check Supabase dashboard for data

## Step 7: Set Up Custom Domain (Optional)

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain (e.g., spendsmart.credex.rocks)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## Monitoring

### Vercel Analytics
- Automatically enabled for all deployments
- View at: Vercel dashboard → Analytics

### Supabase Logs
- View at: Supabase dashboard → Logs
- Monitor API usage, errors, and performance

### Error Tracking (Optional)
Consider adding Sentry for production error tracking:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## Cost Estimates

**Free Tier (Development):**
- Vercel: Free (Hobby plan)
- Supabase: Free (500MB database, 2GB bandwidth)
- Groq: Free (generous rate limits)
- Resend: Free (100 emails/day)

**Production (1,000 audits/month):**
- Vercel: $20/mo (Pro plan)
- Supabase: $25/mo (Pro plan)
- Groq: $0/mo (free)
- Resend: $20/mo (3,000 emails/month)
- **Total: ~$65/mo**

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify TypeScript has no errors: `npm run build` locally
- Check Vercel build logs for specific errors

### API Routes Return 500
- Check Vercel function logs
- Verify Supabase credentials are correct
- Ensure RLS policies are set up correctly

### Emails Not Sending
- Verify Resend API key is correct
- Check Resend dashboard for delivery status
- Verify sender email is allowed (use resend.dev domain for testing)

### Groq API Errors
- Check API key is valid
- Verify you're within rate limits (generous but exist)
- Check Groq status page for outages

## Security Checklist

- [ ] All API keys are stored as environment variables
- [ ] `SUPABASE_SERVICE_KEY` is never exposed to client
- [ ] RLS policies are enabled on all Supabase tables
- [ ] Rate limiting is implemented for lead submissions
- [ ] Honeypot field is in place for spam protection
- [ ] CORS is properly configured (Next.js handles this by default)

## Performance Optimization

### Enable Caching
Add to `next.config.mjs`:
```javascript
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/audit/:id',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Enable Compression
Vercel automatically enables gzip/brotli compression.

### Image Optimization
Use Next.js Image component for any images you add:
```tsx
import Image from 'next/image';
```

## Rollback

If something goes wrong:
1. Go to Vercel dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

## Continuous Deployment

Every push to `main` branch automatically deploys to production.

To set up staging:
1. Create a `staging` branch
2. Vercel will automatically create a preview deployment
3. Test on preview URL before merging to `main`

## Support

For issues:
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support
- Groq: https://console.groq.com/docs
- Resend: https://resend.com/support
