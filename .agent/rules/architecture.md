---
trigger: always_on
---

# Architecture Rules — GOfinancial

## Core Principle
Build a **lightweight, frontend-first, offline-capable system**.

---

## Architecture Style

- Feature-based structure
- No backend for MVP
- Offline-first data handling

---

## Folder Strategy

- `/features` → business logic per domain
- `/components` → reusable UI
- `/services` → storage + utilities
- `/hooks` → reusable logic

---

## Data Flow

UI → Hook → Service → Storage (IndexedDB)

---

## Rules

- No global state libraries
- No complex abstractions
- Keep logic close to feature

---

## Upgrade Path

Phase 1:
- IndexedDB only

Phase 2:
- Add API layer

Phase 3:
- Add database + auth

---

## Anti-Patterns

- Monolithic components
- Deep prop drilling
- Backend-first thinking

---

## Final Rule

If architecture slows development → simplify it