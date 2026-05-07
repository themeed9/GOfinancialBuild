---
trigger: always_on
---

# Architecture Rules — GOfinancial

## Core Principle

Build a **lightweight, frontend-first, offline-capable system** that evolves from simplicity.

---

## Architecture Style

- Feature-based structure
- No backend for MVP
- Offline-first data handling
- Single-user, local storage

---

## Folder Strategy

```
src/
├── components/      → Reusable UI (layout, shared elements)
├── features/        → Business logic per domain
│   ├── add-transaction/
│   ├── dashboard/
│   └── history/
├── hooks/           → Reusable logic (useTransactions, useCurrency)
├── services/        → Storage layer (IndexedDB)
├── data/            → Static data (categories, currencies)
├── utils/           → Pure utility functions
├── types/           → TypeScript interfaces
└── styles/          → Shared CSS (animations, resets)
```

---

## Data Flow

```
UI Component → Custom Hook → Service → Storage (IndexedDB)
                ↕
         localStorage (settings)
```

---

## Component Responsibility

| Layer | Responsibility |
|---|---|
| Components | UI rendering, user interaction |
| Hooks | State management, side effects |
| Services | Data persistence (IndexedDB) |
| Data | Static configuration (currencies, categories) |
| Utils | Pure functions (formatting, conversion) |

---

## Rules

- No global state libraries (no Redux, Zustand, etc.)
- No complex abstractions
- Keep logic close to feature
- One component per file
- One CSS module per component
- Shared styles go in `src/styles/`

---

## Anti-Patterns to Avoid

- ❌ Monolithic components (>200 lines)
- ❌ Deep prop drilling (>3 levels)
- ❌ Backend-first thinking (design for API that doesn't exist)
- ❌ Premature microservices
- ❌ Over-engineered abstractions
- ❌ God components (components that do everything)

---

## Upgrade Path

### Phase 1 (Current): MVP
- IndexedDB only
- Single user
- No backend
- Local storage for settings

### Phase 2 (Future): Sync
- Add API layer
- Cloud sync
- Conflict resolution
- Offline queue

### Phase 3 (Future): Multi-user
- Authentication
- User isolation
- Shared categories
- Data export/import

---

## Database Design

### IndexedDB Schema
- Database: `gofinancial-db`
- Store: `transactions`
- Key path: `id`
- Indexes: `timestamp`, `categoryId`

### Version Management
- Always increment `DB_VERSION` for schema changes
- Implement `onupgradeneeded` migration logic
- Never delete data during migration

### Connection Management
- Pool connections (single `dbPromise`)
- Never open new connection per operation
- Never leave connections open

---

## Final Rule

If architecture slows development → simplify it.
If a pattern requires explanation → it's too complex.
