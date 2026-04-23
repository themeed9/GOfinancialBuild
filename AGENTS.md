# GOFINANCIAL — MASTER AGENT.md (SINGLE SOURCE OF TRUTH)

---

## PRODUCT IDENTITY

Product: **GOfinancial**  
Type: Mobile-first Fintech App  
Core Idea: **Frictionless expense tracking that builds daily habit**

> Principle: **“When friction disappears, consistency follows.”**

---

## CORE PURPOSE

Build a **fast, lightweight, globally accessible financial habit tool** that users can use daily without friction.

---

## PRIMARY GOAL

> Maximize **Daily Active Usage (DAU)**

---

## GOLDEN RULE

> If it adds friction, slows the user down, or excludes any user → **DO NOT BUILD IT**

---

## CORE USER FLOW (MOST IMPORTANT)

### Add Transaction Flow

1. Tap “Add”
2. Enter amount
3. Select category
4. Save

### Constraints

- ≤ 5 seconds  
- ≤ 3 interactions  
- Must work offline  
- Must be accessible  

---

## CORE FEATURES (MVP ONLY)

- Add Transaction
- Dashboard (daily total)
- Transaction history
- Basic insights
- Settings (currency, locale)

---

## TECH STACK (MVP — ANTIGRAVITY READY)

### Frontend
- React (Vite)
- TypeScript (strict mode)

### Styling
- CSS Modules
- CSS Variables (`tokens/design-tokens.css`)

### State
- React (`useState`, `useReducer`)

### Storage
- IndexedDB (primary)
- LocalStorage (fallback)

### Backend
- None (MVP)

### Hosting
- Vercel / Netlify

---

## ENVIRONMENT VARIABLES
VITE_APP_NAME=GOfinancial
VITE_DEFAULT_CURRENCY=NGN
VITE_DEFAULT_LOCALE=en-NG
VITE_ENABLE_ANALYTICS=false


### Rules

- Never hardcode env values  
- Use `import.meta.env`

---

## DATA MODELS

### User
- id
- email (optional)
- currency
- locale
- createdAt

### Transaction
- id
- amount
- categoryId
- note
- timestamp
- createdAt
- updatedAt

### Category
- id
- name
- icon

### Daily Summary
- date
- totalSpent

---

## SLUG GENERATION

Used for categories and future sharing.

Rules:
- lowercase
- replace spaces with "-"
- remove special characters

Example:
"Food & Dining" → "food-dining"

---

## SYSTEM BEHAVIOR

- Optimistic UI
- Instant feedback
- Offline-first
- Sync later (future)

---

## EDGE CASES

### Input
- Empty → block
- Invalid → error message
- Negative → restrict

### Offline
- Store locally
- Sync later

### Duplicate
- Prevent double submission

### Accessibility
- Large text must not break layout
- Screen reader must navigate all actions

### Network
- No connection → show offline state

---

## GLOBAL ACCESSIBILITY (MANDATORY)

### Standard
- WCAG 2.1 AA

### Requirements
- Touch targets ≥ 44px  
- Screen reader support  
- Keyboard navigation  
- Visible focus states  
- Text scaling up to 200%  
- No color-only meaning  

### Motion
- Respect “reduce motion”

### Global Support
- Currency formatting
- Locale-aware dates
- Simple language

---

## DESIGN SYSTEM ENFORCEMENT

- Use `tokens/colors.css`
- No hardcoded values
- CSS Modules only

---

## UX RULES

- Speed > Features  
- Clarity > Flexibility  
- Reduce cognitive load  

---

## PERFORMANCE REQUIREMENTS

- Add transaction ≤ 5 sec  
- Load ≤ 2 sec  
- Instant feedback  

---

## STORAGE RULES

- Use IndexedDB  
- Fallback to localStorage  
- Persist across sessions  

---

## SECURITY (MVP)

- Validate all inputs  
- No plain-text sensitive data  
- Prepare for future auth  

---

## MONETIZATION (FUTURE)

Freemium:
- Free → core tracking  
- Paid → insights, analytics  

---

## WHAT TO BUILD

- Fast input system  
- Simple dashboard  
- Clear history  
- Minimal insights  

---

## WHAT TO AVOID

- Heavy frameworks  
- Backend too early  
- Complex flows  
- Feature bloat  
- Decorative UI  

---

## ENFORCEMENT CHECK

Before building:

1. Does it reduce friction?  
2. Does it improve speed?  
3. Does it support daily usage?  
4. Is it globally accessible?  
5. Does it work offline?  

If any answer is NO → **DO NOT IMPLEMENT**

---

## FINAL PRINCIPLE

> The UI must disappear so the habit can form.

User should:
**Open → Log → Close**

Nothing more.