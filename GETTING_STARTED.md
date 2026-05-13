# Getting Started with SpendSmart AI

This guide will help you get SpendSmart AI running locally in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional, for cloning)

## Step 1: Install Dependencies

```bash
cd spendsmart-ai
npm install
```

This will install all required packages including Next.js, React, TypeScript, Tailwind CSS, and more.

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

For local development, you can use placeholder values to test the UI:

```env
# Supabase (optional for UI testing)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
SUPABASE_SERVICE_KEY=placeholder_service_key

# Groq API (optional for UI testing)
GROQ_API_KEY=gsk-placeholder

# Resend (optional for UI testing)
RESEND_API_KEY=re_placeholder

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** The app will work without real API keys for UI testing, but you'll need real keys for full functionality.

## Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the SpendSmart AI homepage with the spend input form.

## Step 4: Test the Audit Engine

1. Fill out the form with sample data:
   - Tool: Cursor
   - Plan: Business
   - Seats: 2
   - Team Size: 2
   - Primary Use Case: Coding

2. Click "Audit My Spend"

3. You'll see the audit results showing a recommendation to downgrade to Pro and save $40/month.

**Note:** Without real API keys, the AI summary will use the fallback template, and you won't be able to save audits or send emails.

## Step 5: Run Tests

```bash
npm test
```

All 8 tests should pass:
- ✅ Cursor Business for 2 users recommends Pro
- ✅ Claude Team for 2 users recommends Pro
- ✅ Redundant Copilot + Cursor detection
- ✅ Zero savings case returns spending well
- ✅ Annual savings equals monthly times 12
- ✅ GitHub Copilot Business for 4 users recommends Individual
- ✅ ChatGPT Team for 2 users recommends Plus
- ✅ Gemini Ultra for writing recommends Pro

## Step 6: Run Linter

```bash
npm run lint
```

Should output: `✔ No ESLint warnings or errors`

## Step 7: Build for Production

```bash
npm run build
```

This will create an optimized production build. If successful, you'll see:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Full Setup (With Real API Keys)

To test the complete functionality, you'll need to set up:

### 1. Supabase

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to SQL Editor and run the schema from `supabase/schema.sql`
4. Get your credentials from Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`

### 2. Groq API

1. Go to https://console.groq.com
2. Sign up for a free account
3. Create an API key (no credit card required)
4. Copy the key → `GROQ_API_KEY`

### 3. Resend

1. Go to https://resend.com
2. Create an API key
3. Copy the key → `RESEND_API_KEY`

### 4. Update .env.local

Replace the placeholder values with your real API keys.

### 5. Restart Dev Server

```bash
npm run dev
```

Now you can test the full flow:
1. Complete an audit
2. See the AI-generated summary
3. Submit your email
4. Receive a confirmation email
5. Share the audit URL

## Project Structure

```
spendsmart-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── audit/          # POST /api/audit
│   │   │   └── leads/          # POST /api/leads
│   │   ├── audit/[id]/         # GET /audit/[id]
│   │   ├── page.tsx            # Homepage
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── SpendInputForm.tsx
│   │   ├── AuditResults.tsx
│   │   └── LeadCaptureForm.tsx
│   ├── lib/                    # Core logic
│   │   ├── auditEngine.ts      # Audit rules
│   │   ├── pricingData.ts      # Tool pricing
│   │   ├── supabase.ts         # DB client
│   │   ├── types.ts            # TypeScript types
│   │   └── utils.ts            # Utilities
│   └── __tests__/              # Tests
│       └── auditEngine.test.ts
├── supabase/
│   └── schema.sql              # Database schema
└── Documentation/              # All docs
```

## Common Issues

### Issue: "Module not found" errors

**Solution:** Run `npm install` again to ensure all dependencies are installed.

### Issue: Build fails with TypeScript errors

**Solution:** Make sure you're using Node.js 18+ and TypeScript 5+. Run `npm run build` to see specific errors.

### Issue: Tests fail

**Solution:** Make sure you're in the project root directory. Run `npm test` to see which tests are failing.

### Issue: Port 3000 already in use

**Solution:** Either stop the process using port 3000, or run on a different port:
```bash
PORT=3001 npm run dev
```

### Issue: API routes return 500 errors

**Solution:** Check that your environment variables are set correctly. Without real API keys, some features won't work.

## Next Steps

1. **Read the documentation** - Start with [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Explore the code** - Check out the audit engine in `src/lib/auditEngine.ts`
3. **Run tests** - See how the audit logic is tested in `src/__tests__/auditEngine.test.ts`
4. **Deploy** - Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Vercel

## Development Workflow

1. **Make changes** - Edit files in `src/`
2. **See changes live** - Hot reload is enabled by default
3. **Run tests** - `npm test` to verify logic
4. **Run linter** - `npm run lint` to check code quality
5. **Build** - `npm run build` to verify production build
6. **Commit** - Git commit your changes
7. **Deploy** - Push to GitHub, Vercel auto-deploys

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint

# Database
# Run SQL from supabase/schema.sql in Supabase SQL Editor
```

## Getting Help

- **Documentation:** See all `.md` files in the project root
- **Issues:** Check [CHECKLIST.md](./CHECKLIST.md) for known issues
- **Deployment:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- **Architecture:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

## Contributing

This is a production project for Credex. For questions:
- Email: support@credex.rocks
- Website: https://credex.rocks

---

**Happy coding! 🚀**
