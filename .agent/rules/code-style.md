---
trigger: always_on
---

# Code Style Rules — GOfinancial

---

## Language

- TypeScript (strict mode)
- No `any` unless unavoidable

---

## Naming

- Components → PascalCase
- Variables → camelCase
- Files → kebab-case or PascalCase (consistent)

---

## Components

- One responsibility per component
- Max 150–200 lines

---

## Functions

- Small and pure
- Max 30–40 lines

---

## Imports

- Absolute imports preferred
- Group:
  - React
  - Libraries
  - Local files

---

## Comments

- Only when necessary
- Explain WHY, not WHAT

---

## Error Handling

- Always handle errors explicitly
- No silent failures

---

## Accessibility

- Always include labels
- Use semantic HTML

---

## Final Rule

Readable code > clever code