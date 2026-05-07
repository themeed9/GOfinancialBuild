---
trigger: always_on
---

# Code Quality Rules — GOfinancial

## Core Principle

Write code that survives the audit. Every file should pass lint, typecheck, and build without warnings.

---

## 1. ZERO WARNINGS RULE

Before committing any code:

- `npm run lint` must pass with **0 errors, 0 warnings**
- `npx tsc --noEmit` must pass with **0 errors**
- `npm run build` must pass with **0 errors, 0 warnings**

If any check fails, **DO NOT** consider the task complete.

---

## 2. NO STALE CLOSURES

Never capture state variables from outer scope inside callbacks that depend on stale values.

### WRONG
```typescript
const deleteTransaction = useCallback(async (id: string) => {
  setTransactions(prev => prev.filter(t => t.id !== id));
  try {
    await storage.deleteTransaction(id);
  } catch {
    setTransactions(prev => {
      const original = transactions.find(t => t.id === id); // ❌ stale closure
      return original ? [...prev, original] : prev;
    });
  }
}, [transactions]); // causes unnecessary re-renders
```

### CORRECT
```typescript
const deleteTransaction = useCallback(async (id: string) => {
  setTransactions(prev => prev.filter(t => t.id !== id));
  try {
    await storage.deleteTransaction(id);
  } catch {
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id); // ✅ uses prev from functional updater
      return tx ? [...prev, tx] : prev;
    });
  }
}, []); // no dependencies needed
```

---

## 3. NO setState IN EFFECT (React 19 Rule)

Effects must NOT call `setState` synchronously. Effects are for syncing with external systems.

### WRONG
```typescript
useEffect(() => {
  const saved = localStorage.getItem('key');
  if (saved) {
    setCurrencySymbol(JSON.parse(saved).symbol); // ❌ setState in effect
  }
}, []);
```

### CORRECT
```typescript
const [value] = useState(() => {
  const saved = localStorage.getItem('key');
  return saved ? JSON.parse(saved).symbol : 'default'; // ✅ lazy initializer
});
```

---

## 4. NO UNUSED IMPORTS OR VARIABLES

Every import, variable, and parameter must be used. Remove dead code immediately.

- Do not leave unused `_` parameters
- Do not import components that aren't rendered
- Do not declare variables that aren't referenced

### WRONG
```typescript
Object.entries(data).find(([_, v]) => v === target); // ❌ unused _
```

### CORRECT
```typescript
Object.entries(data).find(([, v]) => v === target); // ✅ comma syntax to skip
```

---

## 5. SINGLE SOURCE OF TRUTH

Never duplicate data across multiple files. When the same data exists in 2+ places:

1. Create a single source file (e.g., `src/data/currencies.ts`)
2. Export functions to access the data
3. All consumers import from the single source

### WRONG
- `COUNTRIES` array in Dashboard.tsx
- `EXCHANGE_RATES` object in exchangeRates.ts
- Currency defaults in App.tsx, AddTransaction.tsx, TransactionList.tsx

### CORRECT
- Single `currencies.ts` file with `getCurrencies()`, `getDefaultCurrency()`, `getCurrencyByCode()`
- Single `useCurrency` hook that manages state
- All components receive currency via props or hook

---

## 6. MEMOIZE EXPENSIVE COMPUTATIONS

Any computation that runs on every render and processes arrays/objects must be memoized.

### Must memoize:
- Array `.filter()`, `.map()`, `.reduce()` operations
- String splitting and formatting
- Date calculations
- Object creation from props

### Use `useMemo`:
```typescript
const total = useMemo(() => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}, [transactions]);
```

### Use `useCallback`:
```typescript
const handleClick = useCallback((id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
}, []);
```

---

## 7. NO DEAD CODE

Delete immediately:
- Unused translation maps
- Commented-out code blocks
- Imports that aren't referenced
- Variables that are set but never read
- Functions that are never called
- CSS classes that no elements use

If it's not being used, it's a liability.

---

## 8. TYPE EVERYTHING

- No `any` type
- No implicit `any`
- All function parameters must have types
- All return types must be explicit or inferrable
- All component props must have interfaces

### WRONG
```typescript
function processData(data) { // ❌ implicit any
  return data.map(item => item.value);
}
```

### CORRECT
```typescript
interface DataItem { value: number }
function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

---

## 9. ERROR BOUNDARY REQUIRED

Every React app must have an ErrorBoundary wrapping the root component.

```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
```

---

## 10. CONSISTENT DEFAULTS

When a value has a default, it must be the SAME default everywhere.

### WRONG
- App.tsx defaults to `'₦'`
- AddTransaction defaults to `'$'`
- TransactionList defaults to `'NGN'`

### CORRECT
- Single `getDefaultCurrency()` function returns one default
- All components use the same source

---

## 11. SANITIZE ALL USER INPUT

Any text input from users (notes, usernames, search queries) must be sanitized before storage.

```typescript
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, MAX_LENGTH);
}
```

---

## 12. NO window.confirm FOR DESTRUCTIVE ACTIONS

Always use an accessible confirmation modal.

### WRONG
```typescript
if (window.confirm('Delete?')) { // ❌ inaccessible, non-customizable
  onDelete(id);
}
```

### CORRECT
```typescript
<ConfirmationModal
  title="Delete Transaction"
  message="This action cannot be undone."
  onConfirm={() => onDelete(id)}
  onCancel={() => setShowConfirmation(false)}
/>
```

---

## 13. KEYBOARD ACCESSIBILITY

Every interactive element must:
- Be focusable via Tab
- Have `aria-label` or visible text
- Respond to Enter and Space keys
- Have visible `:focus-visible` styles

### WRONG
```typescript
<div onClick={handleClick}>Click me</div> // ❌ not focusable, no keyboard
```

### CORRECT
```typescript
<button onClick={handleClick} aria-label="Click me">Click me</button>
```

---

## 14. TOUCH TARGET MINIMUM

All interactive elements must be at least **44x44px**.

### WRONG
```css
.close {
  width: 28px;
  height: 28px; /* ❌ too small */
}
```

### CORRECT
```css
.close {
  width: 44px;
  height: 44px; /* ✅ meets WCAG */
}
```

---

## 15. LAZY-LOAD EXTERNAL IMAGES

Any image from an external CDN must:
- Have `loading="lazy"`
- Have an `onError` fallback
- Have appropriate `alt` text (empty string if decorative)

```typescript
function FlagImage({ code }: { code: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return <span className={styles.flagFallback}>{code.toUpperCase()}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      className={styles.flagImage}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
```

---

## 16. NO INLINE STYLES

All styling must use CSS Modules with design tokens.

### WRONG
```typescript
<div style={{ padding: '40px 20px', textAlign: 'center' }}> {/* ❌ */}
```

### CORRECT
```typescript
<div className={styles.placeholder}> {/* ✅ defined in .module.css */}
```

---

## 17. CSS MODULES SCOPE

Each component's styles must be in its own `.module.css` file. Never put multiple component styles in one CSS file.

### WRONG
- `Dashboard.module.css` containing styles for Dashboard, ProfileModal, and SettingsModal

### CORRECT
- `Dashboard.module.css` → Dashboard only
- `ProfileModal.module.css` → ProfileModal only
- `SettingsModal.module.css` → SettingsModal only

---

## 18. SHARED ANIMATIONS

Extract shared `@keyframes` to a single file: `src/styles/animations.css`

All components that use animations must import it:
```css
@import '../../styles/animations.css';
```

---

## 19. CONNECTION POOLING

For IndexedDB, always reuse a single connection. Never open a new connection per operation.

### WRONG
```typescript
export async function getTransactions(): Promise<Transaction[]> {
  const db = await openDB(); // opens new connection every call ❌
  // ...
}
```

### CORRECT
```typescript
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise; // reuse existing connection ✅
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    // ...
  });
  return dbPromise;
}
```

---

## 20. DATABASE VERSIONING

Always include migration logic when incrementing DB version.

```typescript
request.onupgradeneeded = (event) => {
  const db = request.result;
  const oldVersion = event.oldVersion;

  if (oldVersion === 0) {
    // Initial schema
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    store.createIndex('timestamp', 'timestamp', { unique: false });
  }

  if (oldVersion === 1) {
    // Migration from v1 to v2
    const store = request.transaction?.objectStore(STORE_NAME);
    if (store) {
      store.createIndex('categoryId', 'categoryId', { unique: false });
    }
  }
};
```

---

## 21. CONTENT SECURITY POLICY

Always include CSP meta tag in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://flagcdn.com; connect-src 'self';" />
```

---

## 22. ENVIRONMENT VARIABLES

Always create `.env.example` with all environment variables documented.

Never hardcode:
- API keys
- Service URLs
- Feature flags
- App version

Use `import.meta.env.VITE_*` pattern.

---

## 23. THEME PERSISTENCE

Theme must be restored on app load:

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
```

---

## 24. CODE SPLITTING

Configure `manualChunks` in vite.config.ts to split vendor and icon libraries:

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

## 25. TEST EVERYTHING

- Every new feature must have tests
- Every utility function must have tests
- Every bug fix must include a regression test

Run `npm run test:run` before committing.

---

## Final Rule

**If code doesn't pass lint, typecheck, build, and tests — it doesn't ship.**
