---
trigger: always_on
---

# Testing & Production Readiness Rules — GOfinancial

## Core Principle

Ship with confidence. Every change must be verified before it reaches users.

---

## 1. MANDATORY TEST SCRIPTS

`package.json` must include:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

---

## 2. TEST COVERAGE REQUIREMENTS

### Must test:
- **All utility functions** (currency conversion, formatting, sanitization)
- **All custom hooks** (state logic, side effects)
- **All data layer functions** (storage operations, API calls)
- **Critical user flows** (add transaction, delete transaction)

### Minimum coverage targets:
- Utility functions: **100%**
- Hooks: **80%**
- Data layer: **90%**

---

## 3. TEST FILE LOCATION

Tests must be placed in `src/__tests__/` directory.

Naming convention: `<module-name>.test.ts`

Example:
- `src/__tests__/currency.test.ts`
- `src/__tests__/useTransactions.test.ts`
- `src/__tests__/storage.test.ts`

---

## 4. TEST STRUCTURE

Every test file must follow this structure:

```typescript
import { describe, it, expect } from 'vitest';

describe('Module Name', () => {
  it('should do the happy path', () => {
    // Arrange
    // Act
    // Assert
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    // ...
  });

  it('should handle error case', () => {
    // ...
  });
});
```

---

## 5. TEST ALL CURRENCY SCENARIOS

When testing currency-related code:

```typescript
describe('Currency Conversion', () => {
  it('returns same amount for same currency');
  it('converts between different currencies');
  it('returns original amount if currency not found');
  it('converts using CurrencyOption objects');
});
```

---

## 6. CI/CD PIPELINE

Must have `.github/workflows/ci.yml` that runs on push and PR:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
```

---

## 7. PRE-COMMIT CHECKLIST

Before committing:

1. ✅ `npm run lint` — 0 errors, 0 warnings
2. ✅ `npx tsc --noEmit` — 0 errors
3. ✅ `npm run test:run` — all tests pass
4. ✅ `npm run build` — successful build
5. ✅ No dead code left behind
6. ✅ No console.log statements
7. ✅ No commented-out code blocks
8. ✅ All imports are used
9. ✅ All new files have proper types
10. ✅ Accessibility attributes present on interactive elements

---

## 8. ERROR BOUNDARY

Every React app must have an ErrorBoundary:

```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
```

ErrorBoundary must:
- Catch render errors
- Display user-friendly message
- Provide a recovery action (e.g., refresh button)
- Log error for debugging (in development)

---

## 9. ENVIRONMENT CONFIGURATION

Must have `.env.example` with all variables documented:

```env
# Application
VITE_APP_NAME=GOfinancial
VITE_APP_VERSION=0.0.0

# Default Settings
VITE_DEFAULT_CURRENCY=NGN
VITE_DEFAULT_LOCALE=en-NG

# Analytics (disabled by default)
VITE_ENABLE_ANALYTICS=false
```

---

## 10. CONTENT SECURITY POLICY

Must include CSP meta tag in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://flagcdn.com;
  connect-src 'self';
" />
```

---

## 11. THEME INITIALIZATION

Theme must be set before React renders:

```typescript
function initTheme() {
  try {
    const saved = localStorage.getItem('gofinancial_theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
      return;
    }
  } catch {}

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

initTheme(); // Must run BEFORE createRoot
```

---

## 12. BUILD OPTIMIZATION

Configure code splitting in vite.config.ts:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('react-icons')) return 'icons';
          if (id.includes('react')) return 'vendor';
        }
      },
    },
  },
},
```

---

## 13. ACCESSIBILITY CHECKLIST

Before shipping any UI:

- [ ] All interactive elements have `aria-label` or visible text
- [ ] All buttons are actual `<button>` elements
- [ ] All links are actual `<a>` elements
- [ ] Touch targets are at least 44x44px
- [ ] Focus states are visible
- [ ] Keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Screen readers can announce all content
- [ ] Color is not the only indicator of meaning
- [ ] Reduced motion is respected
- [ ] Text scales to 200% without breaking layout

---

## 14. PERFORMANCE BUDGET

| Metric | Target |
|---|---|
| JS Bundle (gzipped) | < 100 KB |
| CSS Bundle (gzipped) | < 20 KB |
| Time to Interactive | < 2 seconds |
| Add Transaction | < 5 seconds |
| Lighthouse Performance | > 90 |

---

## 15. MONITORING (FUTURE)

When app goes to production:

- Add Sentry for error tracking
- Add analytics for usage metrics
- Add performance monitoring
- Set up log aggregation
- Configure alerts for critical errors

---

## Final Rule

**If it's not tested, it's broken. If it's not monitored, it's invisible.**
