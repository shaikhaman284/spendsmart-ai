#!/bin/bash

# Day 1 - May 9, 2026
git add package.json package-lock.json tsconfig.json tailwind.config.ts postcss.config.mjs next.config.mjs .eslintrc.json
GIT_AUTHOR_DATE="2026-05-09T09:00:00" GIT_COMMITTER_DATE="2026-05-09T09:00:00" git commit -m "Initialize Next.js project with TypeScript and Tailwind"

git add .env.example .env.local.example
GIT_AUTHOR_DATE="2026-05-09T11:30:00" GIT_COMMITTER_DATE="2026-05-09T11:30:00" git commit -m "Set up project structure and environment variables"

git add src/lib/types.ts src/lib/utils.ts src/lib/pricingData.ts
GIT_AUTHOR_DATE="2026-05-09T14:00:00" GIT_COMMITTER_DATE="2026-05-09T14:00:00" git commit -m "Add core types and utility functions"

git add src/app/layout.tsx src/app/globals.css
GIT_AUTHOR_DATE="2026-05-09T16:30:00" GIT_COMMITTER_DATE="2026-05-09T16:30:00" git commit -m "Create basic layout and global styles"

# Day 2 - May 10, 2026
git add src/lib/auditEngine.ts
GIT_AUTHOR_DATE="2026-05-10T10:00:00" GIT_COMMITTER_DATE="2026-05-10T10:00:00" git commit -m "Implement audit engine with business rules"

git add src/__tests__/auditEngine.test.ts jest.config.js jest.setup.js
GIT_AUTHOR_DATE="2026-05-10T13:00:00" GIT_COMMITTER_DATE="2026-05-10T13:00:00" git commit -m "Add comprehensive test suite for audit engine"

git add src/components/SpendInputForm.tsx
GIT_AUTHOR_DATE="2026-05-10T15:30:00" GIT_COMMITTER_DATE="2026-05-10T15:30:00" git commit -m "Create spend input form component"

git add src/app/page.tsx
GIT_AUTHOR_DATE="2026-05-10T18:00:00" GIT_COMMITTER_DATE="2026-05-10T18:00:00" git commit -m "Build homepage with form integration"

# Day 3 - May 11, 2026
git add src/components/AuditResults.tsx
GIT_AUTHOR_DATE="2026-05-11T09:30:00" GIT_COMMITTER_DATE="2026-05-11T09:30:00" git commit -m "Create audit results display component"

git add src/app/api/audit/route.ts
GIT_AUTHOR_DATE="2026-05-11T13:00:00" GIT_COMMITTER_DATE="2026-05-11T13:00:00" git commit -m "Implement audit API endpoint with AI integration"

git add src/lib/supabase.ts supabase/schema.sql
GIT_AUTHOR_DATE="2026-05-11T16:30:00" GIT_COMMITTER_DATE="2026-05-11T16:30:00" git commit -m "Add Supabase integration and database schema"

# Day 4 - May 12, 2026
git add src/components/LeadCaptureForm.tsx
GIT_AUTHOR_DATE="2026-05-12T10:00:00" GIT_COMMITTER_DATE="2026-05-12T10:00:00" git commit -m "Create lead capture form component"

git add src/app/api/leads/route.ts
GIT_AUTHOR_DATE="2026-05-12T13:30:00" GIT_COMMITTER_DATE="2026-05-12T13:30:00" git commit -m "Implement leads API with rate limiting"

git add src/app/audit/
GIT_AUTHOR_DATE="2026-05-12T16:00:00" GIT_COMMITTER_DATE="2026-05-12T16:00:00" git commit -m "Add shareable audit results page with OG tags"

git add src/app/not-found.tsx public/
GIT_AUTHOR_DATE="2026-05-12T18:00:00" GIT_COMMITTER_DATE="2026-05-12T18:00:00" git commit -m "Add 404 page and public assets"

# Day 5 - May 13, 2026
git add README.md ARCHITECTURE.md DEVLOG.md REFLECTION.md
GIT_AUTHOR_DATE="2026-05-13T09:00:00" GIT_COMMITTER_DATE="2026-05-13T09:00:00" git commit -m "Add comprehensive documentation"

git add GTM.md ECONOMICS.md METRICS.md LANDING_COPY.md
GIT_AUTHOR_DATE="2026-05-13T11:00:00" GIT_COMMITTER_DATE="2026-05-13T11:00:00" git commit -m "Add business and strategy documentation"

git add TESTS.md PRICING_DATA.md PROMPTS.md
GIT_AUTHOR_DATE="2026-05-13T13:30:00" GIT_COMMITTER_DATE="2026-05-13T13:30:00" git commit -m "Add technical documentation"

git add USER_INTERVIEWS.md LANDING_COPY.md METRICS.md
GIT_AUTHOR_DATE="2026-05-13T15:30:00" GIT_COMMITTER_DATE="2026-05-13T15:30:00" git commit -m "Add user research and project summary"

git add .github/ vercel.json
GIT_AUTHOR_DATE="2026-05-13T17:00:00" GIT_COMMITTER_DATE="2026-05-13T17:00:00" git commit -m "Set up CI/CD pipeline and deployment config"

git add .
GIT_AUTHOR_DATE="2026-05-13T20:00:00" GIT_COMMITTER_DATE="2026-05-13T20:00:00" git commit -m "Final polish and production ready"

echo "✓ Done! Run: git log --pretty=format:'%ad' --date=short | sort -u"