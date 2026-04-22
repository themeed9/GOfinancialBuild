---
trigger: always_on
---

# Design System.md — GOFINANCIAL (UPDATED)

---
## Token files Are The Source Of Truth

The file has one design token file. The agent must never modify them:

## TOKEN RULE

- Use `tokens/design-tokens.css`
- No hardcoded values

## Mandatory: Use CSS Variables, Never Raw Values
---

## COLOR RULES

- 80–90% neutral
- Primary only for actions

### Accessibility
- WCAG AA contrast
- No color-only meaning

---

## TYPOGRAPHY

- Font: Inter
- Base: 15px
- Use tokens only

### Accessibility
- Support 200% zoom
- Dynamic scaling

---

## SPACING

- 4px system only

---

## BORDER RADIUS

- 4px / 8px / 12px only

---

## LAYOUT

- Mobile-first
- Single column
- ≥ 44px touch targets

---

## COMPONENTS

- One primary CTA
- Clear inputs
- Accessible labels

---

## STYLING

- CSS Modules only
- No inline styles

---

## INTERACTION

- Instant feedback
- Minimal motion

---

## ACCESSIBILITY

- WCAG 2.1 AA
- Screen reader support
- Keyboard navigation
- Focus states required

---

## PERFORMANCE

- ≤ 5 sec actions
- ≤ 2 sec load

---

## FINAL RULE

The UI must disappear for every user.