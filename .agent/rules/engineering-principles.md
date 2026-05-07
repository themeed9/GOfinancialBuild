---
trigger: always_on
---

# Engineering Principles — GOfinancial

## Core Principle

Simplicity wins. Build what is needed, not what could be needed.

---

## 1. GALL'S LAW

> A complex system that works is invariably found to have evolved from a simple system that worked.

### Application:
- Start with the simplest working solution
- Add complexity only when proven necessary
- Never architect for hypothetical scale
- A working MVP beats a perfect architecture

### Decision:
- Need a feature? Build the minimum version first.
- Need an abstraction? Wait until you see the pattern 3 times.

---

## 2. YAGNI (You Ain't Gonna Need It)

Do not build features, abstractions, or infrastructure "just in case."

### Violations seen in codebase:
- ❌ 57-entry translation map for a single-language app
- ❌ 50-country hardcoded list when only currency matters
- ❌ Legal text embedded in components instead of separate files
- ❌ Exchange rate system designed for real-time updates when it's static

### Rule:
If you can't point to a specific user need or business requirement, **DO NOT BUILD IT**.

---

## 3. KISS PRINCIPLE

Keep It Simple, Stupid.

### Simple means:
- Fewer files, not more
- Direct imports, not indirection
- Plain functions, not classes
- Single responsibility, not multi-purpose

### Example:
```typescript
// COMPLEX (bad)
class CurrencyManager {
  private instance: CurrencyManager;
  static getInstance() { ... }
  convert(amount, from, to) { ... }
}

// SIMPLE (good)
function convertCurrency(amount, from, to) {
  return amount * from.rate / to.rate;
}
```

---

## 4. BOY SCOUT RULE

Leave the code cleaner than you found it.

### When editing a file:
- Fix any lint warnings you see
- Remove any dead code nearby
- Improve any variable names that confuse you
- Extract any duplicated logic you notice

### Not:
- Refactoring the entire file
- Rewriting working code
- Adding features while fixing bugs

---

## 5. LAW OF LEAKY ABSTRACTIONS

All non-trivial abstractions leak. Do not over-abstract.

### Leak signs:
- The abstraction needs a "escape hatch" parameter
- Consumers need to know implementation details anyway
- The abstraction is harder to use than the raw API

### Rule:
If the abstraction doesn't save more time than it costs to understand, remove it.

---

## 6. TESTING PYRAMID

```
        /  \
       / E2E \      ← Few (slow, expensive)
      /-------\
     /  Integ  \    ← Some (moderate)
    /-----------\
   /   Unit      \  ← Many (fast, cheap)
  /---------------\
```

### Distribution:
- 70% Unit tests (utilities, hooks, data layer)
- 20% Integration tests (component interactions)
- 10% E2E tests (critical user flows)

---

## 7. TECHNICAL DEBT PRINCIPLES

### Types of debt:

| Type | Risk | Fix Priority |
|---|---|---|
| Stale closures | Data loss | IMMEDIATE |
| Duplicated data | Sync bugs | HIGH |
| Missing error handling | User-facing errors | HIGH |
| Hardcoded values | Maintenance burden | MEDIUM |
| Missing tests | Regression risk | MEDIUM |
| Dead code | Confusion, bundle size | LOW |

### Rule:
Fix HIGH risk debt before adding new features.
Track MEDIUM and LOW risk debt in a backlog.
Never ignore HIGH risk debt.

---

## 8. MURPHY'S LAW

> Anything that can go wrong will go wrong.

### Application:
- Always handle the error case, not just the happy path
- Assume localStorage can be full, disabled, or corrupted
- Assume network can fail at any moment
- Assume users will enter invalid data

### Pattern:
```typescript
// WRONG
const data = JSON.parse(localStorage.getItem('key'));

// CORRECT
try {
  const raw = localStorage.getItem('key');
  const data = raw ? JSON.parse(raw) : defaultValue;
} catch {
  // localStorage might contain corrupted data
  return defaultValue;
}
```

---

## 9. CONWAY'S LAW

> Organizations design systems that mirror their communication structure.

### Application for solo/small team:
- Keep the codebase simple enough for one person to understand
- Avoid microservices, distributed systems, or complex architectures
- Feature-based organization matches how a single developer thinks

### Future team scaling:
- When team grows, split by feature domains
- Each domain should be independently developable
- Communication boundaries should map to code boundaries

---

## 10. LEHMAN'S LAWS

> Software systems evolve continuously or they become obsolete.

### Application:
- Build for change, not permanence
- Keep abstractions shallow (easy to modify)
- Document decisions, not just code
- Version your data schema (DB_VERSION)
- Plan migration paths for breaking changes

### Rule:
Every data schema change must include a migration from the previous version.

---

## 11. SINGLE RESPONSIBILITY PRINCIPLE

Every module, class, or function should have one reason to change.

### Violations:
- `Dashboard.module.css` (773 lines) containing styles for 3 components
- `App.tsx` managing currency, transactions, routing, and modals
- `storage.ts` opening new DB connection for every operation

### Fix:
- Split CSS into one file per component
- Extract currency management into `useCurrency` hook
- Implement connection pooling in storage

---

## 12. DRY (Don't Repeat Yourself)

Every piece of knowledge must have a single, unambiguous representation.

### Duplicated patterns found:
- Currency default logic in 4 files
- `fadeIn`/`slideUp` keyframes in 3 CSS files
- localStorage access patterns repeated across components
- Date formatting logic in multiple places

### Fix:
- One function per unique logic
- One CSS file for shared styles
- One hook for shared state

---

## 13. PRINCIPLE OF LEAST ASTONISHMENT

Code should behave the way a reader expects.

### Violations:
- `getCurrencyCodeFromSymbol('$')` returns `USD` but `$` is used by 7 currencies
- Delete operation silently fails if item doesn't exist
- Currency conversion returns original amount on error (silent failure)

### Fix:
- Warn or throw when behavior is ambiguous
- Always provide user feedback on failures
- Document non-obvious behavior with comments

---

## 14. FAIL FAST

Detect errors as early as possible.

### Application:
- Type check at compile time (TypeScript strict mode)
- Lint at edit time (ESLint)
- Test at commit time (pre-commit hooks)
- Validate at runtime (input sanitization)

### Rule:
Never let an error propagate silently. Fail loudly and early.

---

## 15. PREMATURITY OPTIMIZATION

> Premature optimization is the root of all evil. — Donald Knuth

### Application:
- Do NOT optimize before measuring
- Do NOT add caching before profiling
- Do NOT code-split before analyzing bundle
- Do NOT add service workers before confirming offline need

### Exception:
- Always memoize array operations in React (cheap insurance)
- Always pool database connections (prevents resource exhaustion)
- Always lazy-load external images (prevents layout shift)

---

## Final Rule

**The best code is the code you didn't write. The second best is the code that's simple enough to delete.**
