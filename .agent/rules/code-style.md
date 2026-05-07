---
trigger: always_on
---

# Code Style Rules — GOfinancial

## Core Principle

Readable code > clever code. Consistency > personal preference.

---

## Language

- TypeScript strict mode
- No `any` unless absolutely unavoidable
- No `as any` type assertions
- Use `unknown` instead of `any` for uncertain types

---

## Naming

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `AddTransaction` |
| Functions | camelCase | `handleSave` |
| Variables | camelCase | `selectedDate` |
| Constants | UPPER_SNAKE_CASE | `DB_NAME` |
| Types/Interfaces | PascalCase | `Transaction` |
| CSS Classes | camelCase | `.dateGroup` |
| Files | PascalCase (components) | `AddTransaction.tsx` |
| Files | camelCase (utils/hooks) | `useCurrency.ts` |
| Folders | kebab-case | `add-transaction/` |

---

## Components

- One responsibility per component
- Max 150–200 lines
- Export as default
- Props interface named `{ComponentName}Props`

```typescript
interface AddTransactionProps {
  categories: Category[];
  currency: CurrencyOption;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

export default function AddTransaction({ categories, currency, onSave, onCancel }: AddTransactionProps) {
  // ...
}
```

---

## Functions

- Small and pure when possible
- Max 30–40 lines
- Descriptive names that explain intent
- Single return point when practical

### Naming patterns:
- `handleX` — Event handlers
- `useX` — Custom hooks
- `getX` — Pure getter functions
- `isX` — Boolean checks
- `formatX` — Formatting functions
- `sanitizeX` — Sanitization functions

---

## Imports

Order and group imports:

1. React and React hooks
2. TypeScript types
3. External libraries
4. Local data/constants
5. Local hooks
6. Local services/utils
7. CSS modules

```typescript
import { useState, useCallback } from 'react';
import type { Transaction, Category } from '../../types';
import type { CurrencyOption } from '../../data/currencies';
import { MdClose, MdEdit } from 'react-icons/md';
import { getCurrencyISOCode } from '../../data/currencies';
import { convertCurrency } from '../../utils/currency';
import styles from './AddTransaction.module.css';
```

---

## Comments

- Only when necessary
- Explain WHY, not WHAT
- Remove commented-out code immediately
- Use JSDoc for complex functions

### WRONG
```typescript
// Set the amount to the parsed value
setAmount(numAmount); // ❌ obvious
```

### CORRECT
```typescript
// Rollback optimistic update if storage fails
setTransactions(prev => { /* ... */ }); // ✅ explains intent
```

---

## Error Handling

- Always handle errors explicitly
- No silent failures
- Never leave `.catch()` empty
- Provide user feedback for failures

### WRONG
```typescript
.catch(() => {}); // ❌ silent failure
```

### CORRECT
```typescript
.catch(err => {
  console.error('Failed to delete:', err);
  // Show user error state
});
```

---

## Accessibility

- Always include `aria-label` on icon-only buttons
- Use semantic HTML (`<button>`, `<nav>`, `<section>`, `<article>`)
- Every form input must have a `<label>`
- Use `role` attributes for custom interactive elements
- Include `aria-describedby` for error messages
- Use `aria-live` for dynamic content

---

## CSS Rules

- CSS Modules only
- No inline styles
- Use CSS variables from design tokens
- No hardcoded colors, sizes, or spacing
- Import shared animations from `src/styles/animations.css`

### WRONG
```css
.button {
  color: #0055ff; /* ❌ hardcoded */
  padding: 16px;  /* ❌ hardcoded */
}
```

### CORRECT
```css
.button {
  color: var(--color-primary);
  padding: var(--spacing-md, 16px);
}
```

---

## JSX Rules

- Use self-closing tags for empty elements
- Use fragments (`<>`) instead of wrapper divs when possible
- Keep JSX expressions simple (extract complex logic)
- Use conditional rendering with `{condition && <Component />}`
- Use ternary for if/else rendering

### WRONG
```typescript
<div>
  {data.length > 0 ? (
    <List items={data} />
  ) : (
    <Empty />
  )}
</div>
```

### CORRECT
```typescript
<>
  {data.length > 0 ? <List items={data} /> : <Empty />}
</>
```

---

## File Organization

Within each file:

1. Imports
2. Types/interfaces
3. Constants
4. Component function
5. Helper functions
6. Export

---

## Final Rule

If another developer can't understand your code in 30 seconds, simplify it.
