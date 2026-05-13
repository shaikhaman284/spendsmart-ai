# Tests

## Audit Engine Tests

All tests are located in `src/__tests__/auditEngine.test.ts` and can be run with `npm test`.

### 1. Cursor Business for 2 users recommends Pro
**Test:** When a user has Cursor Business plan with 2 seats, the audit engine should recommend downgrading to Pro.
**Rationale:** Business plan costs $40/user, Pro costs $20/user. For small teams (<3 users), the Business plan's features don't justify the 2x cost.
**Expected Savings:** $40 (2 × $40 - 2 × $20)

### 2. Claude Team for 2 users recommends Pro
**Test:** When a user has Claude Team plan with 2 seats, the audit engine should recommend downgrading to Pro.
**Rationale:** Team plan costs $30/seat, Pro costs $20 flat. For teams under 3 users, individual Pro plans are more cost-effective.
**Expected Savings:** $40 (2 × $30 - $20)

### 3. Redundant Copilot + Cursor detection
**Test:** When a user has both Cursor Pro and GitHub Copilot Individual, the audit engine should recommend dropping Copilot.
**Rationale:** Cursor Pro includes AI coding assistance that overlaps with Copilot's functionality. For coding use cases, one tool is sufficient.
**Expected Savings:** $10 (GitHub Copilot Individual cost)

### 4. Zero savings case returns "spending well"
**Test:** When a user has an optimal setup (e.g., Cursor Pro for 1 user, coding use case), the audit should return zero savings and "Keep current plan" recommendation.
**Rationale:** Not every audit should recommend changes. Users with optimized setups should be told they're doing well.
**Expected Savings:** $0

### 5. Annual savings equals monthly times 12
**Test:** The `calculateTotalSavings` function should correctly multiply monthly savings by 12 for annual savings.
**Rationale:** Basic math validation to ensure the calculation is correct.
**Expected Result:** `annual === monthly * 12`

### 6. GitHub Copilot Business for 4 users recommends Individual
**Test:** When a user has GitHub Copilot Business with 4 seats, the audit should recommend switching to Individual plans.
**Rationale:** Business costs $19/seat, Individual costs $10/seat. For teams under 5 users, Individual plans are cheaper.
**Expected Savings:** $36 (4 × ($19 - $10))

### 7. ChatGPT Team for 2 users recommends Plus
**Test:** When a user has ChatGPT Team with 2 seats, the audit should recommend downgrading to Plus.
**Rationale:** Team costs $30/seat, Plus costs $20 flat. For small teams, Plus is more cost-effective.
**Expected Savings:** $40 (2 × $30 - $20)

### 8. Gemini Ultra for writing recommends Pro
**Test:** When a user has Gemini Ultra for writing use case, the audit should recommend downgrading to Pro.
**Rationale:** Ultra costs $300/mo and is overkill for writing/research. Pro at $20/mo offers sufficient capabilities.
**Expected Savings:** $280 ($300 - $20)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Coverage Goals

- **Audit Engine:** 100% coverage (all rules tested)
- **API Routes:** 80% coverage (happy path + error cases)
- **Components:** 60% coverage (critical user flows)

## Future Tests to Add

- [ ] API route integration tests (using MSW for mocking)
- [ ] Rate limiting edge cases (exactly 3 submissions, 4th blocked)
- [ ] Anthropic API failure fallback
- [ ] Lead capture form validation (invalid email, honeypot)
- [ ] Supabase RLS policy tests
- [ ] OG tag generation for shareable URLs
- [ ] localStorage persistence across page reloads
- [ ] Mobile responsive layout tests (using Testing Library)

## Test Philosophy

Tests should be:
1. **Fast:** Unit tests run in <1s total
2. **Deterministic:** No flaky tests, no external dependencies
3. **Readable:** Test names describe the scenario clearly
4. **Maintainable:** Tests break when behavior changes, not implementation

We prioritize testing business logic (audit engine) over UI components. The audit engine is the core value proposition—if it's wrong, the entire app is useless. UI tests are lower priority because visual bugs are easier to catch manually.
