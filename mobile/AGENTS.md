# GOfinancial mobile — agent notes

The product rules live in the root brief, `../AGENTS.md` (golden rule, add-transaction flow ≤ 3 taps / ≤ 5 s, offline-first, WCAG 2.1 AA, enforcement check). Follow it. Where this app's stack differs from the brief's web stack, the table below wins.

## Rebuild decisions (differences from the web app)

| Area | Web app (`../src`) | Mobile app (`./src`) | Why |
|---|---|---|---|
| Framework | React + Vite | React Native + Expo (Expo Router) | One codebase for Play Store and App Store |
| Styling | CSS Modules + CSS variables | `StyleSheet` + `useTheme()` from `src/theme` | Native has no CSS; tokens still come from `../tokens` |
| Design tokens | `tokens/design-tokens.css` | `src/theme/tokens.generated.ts` (run `npm run generate-theme`; never edit by hand) | Single source of truth |
| Storage | IndexedDB + localStorage | SQLite (`expo-sqlite`) | Reliable on-device database on both platforms |
| Money | Floating-point major units | **Integer minor units** (`amountMinor`, kobo/cents) | No rounding drift when summing |
| Currencies | Hard-coded exchange rates convert history | Each transaction keeps its own currency; no silent conversion | Changing currency must not rewrite past spending |
| Budget | Counter that resets each period | **Running ledger** with carry-over (`src/core/budget`) | Leftover/overspend must carry into the next period |
| Budget changes | One record, overwritten | Append-only plan history (`addBudgetPlan`) | Past periods keep the amount that applied then |
| Deletes | Hard delete | Soft delete (`deletedAt`) | Lets a future sync propagate deletions |
| Week start | Sunday | Monday by default (configurable `WeekStart`) | |

## Release 1 scope (from the case study's "what I would do differently")

Lesson from V1: *building more is not the same as strengthening the product.* Protect Quick Add and the daily total, remove steps that don't serve capture or awareness, and make every secondary feature earn its place.

### Core loop (protect above everything)

**Open → Add → amount → tap category → saved → daily total updates → close.**

- Tapping a category saves the entry. The note is optional and added later through edit, so it never blocks the loop.
- The Add button is always visible and is the most prominent control on every main screen.
- After saving, the user lands back on the dashboard with the new total visible.

### In release 1

| Feature | Why it earns its place |
|---|---|
| Quick Add | The product |
| Daily total (dashboard) | Immediate awareness after each entry |
| Weekly glow-trend graph + recent transactions (home) | The next layer of context (V2 design A, picked by the owner) |
| History with edit/delete | Fix mistakes; required for trust |
| Username step (first run) | Owner decision: personal touch, and the moment an anonymous user is registered |
| Budget step (first run, **skippable**) | Owner decision; Skip goes straight to the dashboard |
| Budget with carry-over (Insight) | Requested by the owner after V1 lost carried-over money |
| Monthly spending by category (Insight tab) | Categories exist so entries add up to context |
| CSV export (Settings) | The only backup and route out while data is on-device |
| Delete all data (Settings) | Clear ownership and deletion |

### Deferred until there's evidence they're needed

Visible accounts/login (built but hidden — see below) · onboarding slides and language picker (currency and language come from the device) · theme setting (follow the system) · calendar view · printable HTML report · per-transaction currency switching or conversion · bank sync · AI guidance. Do not build these without the owner's go-ahead.

### Architecture assumptions (stated up front this time)

- **One user, one device.** Transactions, budget and username live only in on-device SQLite.
- **Anonymous registration (owner decision, Nov 2026):** finishing the username step creates an anonymous Firebase user and a `users/{uid}` record (platform, app version, locale, currency — no username, no money data). Once per local day the app writes `dailyActive/{YYYY-MM-DD}/users/{uid}` for daily-active counts. All calls are fire-and-forget and no-ops without config (`src/services/registration.ts`). Rules: `firebase/firestore.rules` (write-only from phones).
- **Data safety form:** declare *App activity* and *Device or other IDs* (anonymous user id), collected for analytics, not shared, deletable.
- **Ownership and deletion:** "Delete all data" wipes the phone and deletes the anonymous account and its record.
- **Email accounts are built but hidden** (`FEATURES.emailAccounts` in `src/config/features.ts`). Creating an account upgrades the anonymous user in place, so counts carry over. Firebase sends a password-reset *link*, not the OTP shown in the V2 design. "Continue with Google" needs native Google sign-in setup first.
- **Recovery:** CSV export only. Losing the phone loses unexported data; the app must say so plainly near the export.
- **Before any cloud sync or wider multi-device use:** design real authentication, record ownership, user isolation, recovery, sync conflicts and server-side deletion first. That is a separate project.

### Validate repeat usage before expanding

Play Store's required closed test (a group of testers for about two weeks) doubles as the repeat-usage check. The success criteria are decided by the owner before the test starts. No feature from the deferred list gets built until that test has run.

## V2 navigation (owner's Figma, Nov 2026)

- **No tab bar.** Home has three controls: avatar → Settings sheet (Profile tab), "See all" → History, **Add expense**. Tapping the trend card opens Insight; pencils edit rows.
- History and Insight are stack screens with a back arrow. Insight = month/week heatmap, logging streak, biggest-weekday sentence, budget card, "Where it went" donut.
- Settings is one sheet with Profile / Settings / Terms / Privacy tabs. "Log out" from the design is **Delete all data** (there are no visible accounts yet).
- Preview builds can be filled with demo data: `EXPO_PUBLIC_DEMO_DATA=1 npx expo export --platform web` (never set it for store builds).

## Layout

- `src/core/` — pure TypeScript domain logic (no React, no React Native). Must stay importable from Node so it can be unit-tested with Vitest.
- `src/theme/` — generated tokens + `useTheme()`.
- `src/app/` — Expo Router routes only (every file is a screen).
- `src/components/` — reusable UI.
- `src/__tests__/` — Vitest tests, run in `America/New_York` so daylight-saving bugs surface.

## Checks before finishing

```bash
npm run typecheck
npx expo lint
npm run test:run
```

Note: `npx expo install` needs Expo's API. If it is unreachable, read the SDK-matched version from `node_modules/expo/bundledNativeModules.json` and set it in `package.json`.

---

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
