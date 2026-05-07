---
trigger: always_on
---

# State Management Rules — GOfinancial

## Core Principle

State must be predictable, centralized, and never duplicated.

---

## 1. SINGLE SOURCE OF TRUTH

Each piece of state must have exactly ONE owner.

### WRONG
```typescript
// App.tsx
const [currencySymbol, setCurrencySymbol] = useState('₦');

// AddTransaction.tsx
const [currencySymbol, setCurrencySymbol] = useState('$');

// TransactionList.tsx
const [selectedCurrency, setSelectedCurrency] = useState('NGN');
```

### CORRECT
```typescript
// useCurrency.ts
export function useCurrency() {
  const [currency, setCurrency] = useState(getDefaultCurrency);
  return { currency, setCurrency };
}

// All components use the same hook or receive via props
```

---

## 2. CUSTOM HOOKS FOR SHARED STATE

When state is used by 2+ components, extract it into a custom hook.

### Hook must:
- Initialize from localStorage/sessionStorage
- Provide a setter function
- Return all values needed by consumers
- Handle errors gracefully

```typescript
interface UseCurrencyReturn {
  currency: CurrencyOption;
  isoCode: string;
  setCurrency: (currency: CurrencyOption) => void;
  currencies: CurrencyOption[];
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrencyState] = useState<CurrencyOption>(loadSavedCurrency);
  // ...
}
```

---

## 3. FUNCTIONAL UPDATES FOR STATE THAT DEPENDS ON PREVIOUS VALUE

When the new state depends on the previous state, always use the functional form.

### WRONG
```typescript
setTransactions(prev.filter(t => t.id !== id)); // ❌ not functional update
```

### CORRECT
```typescript
setTransactions(prev => prev.filter(t => t.id !== id)); // ✅
```

---

## 4. useCallback FOR CALLBACKS PASSED TO CHILDREN

Any function passed as a prop to a child component must be wrapped in `useCallback`.

### WRONG
```typescript
const handleClick = (id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
};

return <Child onClick={handleClick} />; // ❌ recreated every render
```

### CORRECT
```typescript
const handleClick = useCallback((id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
}, []);

return <Child onClick={handleClick} />; // ✅ stable reference
```

---

## 5. useMemo FOR EXPENSIVE COMPUTATIONS

Any computation that:
- Processes arrays
- Transforms objects
- Formats strings/dates
- Depends on props/state

Must be wrapped in `useMemo`.

### WRONG
```typescript
const total = transactions.reduce((sum, t) => sum + t.amount, 0); // ❌ runs every render
const dayTransactions = transactions.filter(t => isToday(t.timestamp)); // ❌ runs every render
```

### CORRECT
```typescript
const total = useMemo(() => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}, [transactions]);

const dayTransactions = useMemo(() => {
  return transactions.filter(t => isToday(t.timestamp));
}, [transactions]);
```

---

## 6. LAZY INITIALIZATION FOR EXPENSIVE DEFAULTS

When the initial state value requires computation or localStorage access, use lazy initialization.

### WRONG
```typescript
const [user] = useState(JSON.parse(localStorage.getItem('user'))); // ❌ runs on every render? No, but can throw
```

### CORRECT
```typescript
const [user] = useState(() => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : defaultUser;
  } catch {
    return defaultUser;
  }
});
```

---

## 7. LOCALSTORAGE WRAPPER

Never access localStorage directly in components. Use wrapper functions.

### WRONG
```typescript
const saved = localStorage.getItem('gofinancial_currency');
const data = JSON.parse(saved);
localStorage.setItem('gofinancial_currency', JSON.stringify(newData));
```

### CORRECT
```typescript
function loadCurrency(): CurrencyOption {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return getDefaultCurrency();
}

function saveCurrency(currency: CurrencyOption): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currency));
}
```

---

## 8. NO POLLING FOR STATE CHANGES

Never use `setInterval` to check if state has changed.

### WRONG
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const current = getSelectedCurrency();
    if (current !== selectedCurrency) {
      setSelectedCurrency(current);
    }
  }, 500);
  return () => clearInterval(interval);
}, [selectedCurrency]);
```

### CORRECT
```typescript
// Use a shared hook that manages the state
// Or use an event-based pattern if cross-tab sync is needed
const { currency } = useCurrency();
```

---

## 9. OPTIMISTIC UPDATES WITH ROLLBACK

When performing async operations that affect state:

1. Update state immediately (optimistic)
2. Perform the async operation
3. On failure, revert to previous state

### Pattern:
```typescript
const deleteTransaction = useCallback(async (id: string) => {
  // 1. Optimistic update
  setTransactions(prev => prev.filter(t => t.id !== id));

  try {
    // 2. Async operation
    await storage.deleteTransaction(id);
  } catch {
    // 3. Rollback using functional updater (not stale closure)
    setTransactions(prev => {
      const tx = prev.find(t => t.id === id);
      return tx ? [...prev, tx] : prev;
    });
  }
}, []);
```

---

## 10. STATE SEPARATION

Separate concerns into distinct state slices:

- `useTransactions` → transaction data
- `useCurrency` → currency/locale settings
- `useUser` → user profile/settings

Do NOT mix transaction state with user state.

---

## 11. EVENT LISTENER CLEANUP

Every `addEventListener` in a useEffect must have a corresponding `removeEventListener` in the cleanup.

### WRONG
```typescript
useEffect(() => {
  document.addEventListener('keydown', handleEsc);
  // ❌ missing cleanup
});
```

### CORRECT
```typescript
useEffect(() => {
  document.addEventListener('keydown', handleEsc);
  return () => document.removeEventListener('keydown', handleEsc);
}, [handleEsc]);
```

---

## 12. CLICK OUTSIDE HANDLER

When implementing click-outside behavior, ensure the event listener is properly managed.

```typescript
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);
```

---

## 13. ESCAPE KEY HANDLER

Every modal must support closing with the Escape key.

```typescript
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEsc);
  return () => document.removeEventListener('keydown', handleEsc);
}, [onClose]);
```

---

## 14. AVOID UNNECESSARY RE-RENDERS

- Use `React.memo` for components that render frequently with the same props
- Split large components into smaller ones
- Lift state up only when necessary
- Keep state as local as possible

---

## 15. TYPE ALL STATE

```typescript
// WRONG
const [user, setUser] = useState(null);

// CORRECT
const [user, setUser] = useState<User | null>(null);

// CORRECT (with initialization)
const [user, setUser] = useState<User>(() => loadUser());
```

---

## Final Rule

**If state changes unexpectedly or causes re-render loops, the problem is always in the effect dependencies or missing memoization.**
