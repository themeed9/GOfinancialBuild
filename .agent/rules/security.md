---
trigger: always_on
---

# Security Rules — GOfinancial

## Core Principle

Protect user data. Assume every input is hostile.

---

## INPUT VALIDATION

- Validate ALL inputs at the point of entry
- Sanitize before storage (escape HTML entities)
- Enforce maximum lengths
- Reject negative numbers for amounts
- Block empty submissions

### Sanitization Function
```typescript
function sanitizeInput(input: string, maxLength: number): string {
  return input
    .replace(/</g, '&lt;')
    ..replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, maxLength);
}
```

---

## DATA STORAGE

### localStorage
- Never store financial transaction data in localStorage
- Only store non-sensitive settings (currency, theme, locale)
- Wrap all access in try/catch (storage can be full or disabled)
- Set size limits on stored data (profile images < 2MB)

### IndexedDB
- Do not encrypt financial data in MVP (local-only, no network)
- Plan encryption layer for future cloud sync
- Validate data before writing to database

### Profile Images
- Validate file type (`file.type.startsWith('image/')`)
- Validate file size (`file.size < 2 * 1024 * 1024`)
- Store as base64 only in localStorage (temporary until cloud)

---

## CONTENT SECURITY POLICY

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

### CSP Directives Explained:
- `default-src 'self'` — Only allow resources from same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — Allow inline scripts (needed for React)
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` — Allow Google Fonts
- `font-src 'self' https://fonts.gstatic.com` — Allow Google Font files
- `img-src 'self' data: https://flagcdn.com` — Allow local images, base64, and flag CDN
- `connect-src 'self'` — Only allow fetch to same origin

---

## EXTERNAL RESOURCES

### Third-party CDNs
- Flag images from `flagcdn.com` — acceptable, but add error fallback
- Google Fonts — acceptable, but add `crossorigin` attribute
- Never load scripts from untrusted CDNs

### Lazy Loading
- All external images must use `loading="lazy"`
- All external images must have `onError` handler

---

## ERROR HANDLING

- Never expose internal errors to users
- Never log sensitive data to console in production
- Show user-friendly error messages
- Always handle promise rejections

### WRONG
```typescript
.catch(console.error); // ❌ exposes stack traces
```

### CORRECT
```typescript
.catch(err => {
  console.error('Failed to save transaction:', err);
  // Show user-friendly UI message
});
```

---

## AUTHENTICATION (FUTURE)

When auth is added:
- Use token-based authentication (JWT or session)
- Store tokens in httpOnly cookies (not localStorage)
- Implement CSRF protection
- Use HTTPS for all API calls
- Implement rate limiting
- Add session timeout

---

## DESTRUCTIVE ACTIONS

### Delete Operations
- Always require confirmation
- Use accessible confirmation modal (not `window.confirm`)
- Support undo for accidental deletions
- Never auto-delete without user consent

### Data Export
- Export must include all user data
- Export format must be readable (JSON)
- Never include sensitive data in export filenames

---

## XSS PREVENTION

### Rules:
- Never use `dangerouslySetInnerHTML` without sanitization
- Escape all user input before rendering
- Sanitize data before storage (defense in depth)
- Validate data types (number vs string)

### Safe Rendering:
```typescript
// SAFE - React auto-escapes
<span>{userInput}</span>

// UNSAFE - bypasses escaping
<span dangerouslySetInnerHTML={{ __html: userInput }} />

// SAFE - sanitized before storage
const safe = sanitizeInput(userInput, 100);
<span>{safe}</span>
```

---

## COMPLIANCE

### NDPR Ready (Nigeria)
- Data stored locally on device
- User can export their data
- User can delete their data
- Privacy policy included in app

### GDPR Ready Structure
- No data transmission to external servers
- User consent for profile data
- Data portability via export
- Right to be forgotten via local data clear

---

## ENVIRONMENT VARIABLES

### Rules:
- Never hardcode secrets, keys, or URLs
- Use `import.meta.env.VITE_*` pattern
- Create `.env.example` with all variables documented
- Never commit `.env` files (in `.gitignore`)
- Prefix all env vars with `VITE_` (Vite requirement)

---

## Final Rule

If data is unsafe → do not store it.
If input is untrusted → sanitize it.
If error is internal → hide it.
