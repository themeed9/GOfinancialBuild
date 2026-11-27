# GOfinancial — mobile app

The Android (and later iOS) version of GOfinancial, built with React Native and Expo. The web app in the repository root keeps working as it is.

## Run it

```bash
cd mobile
npm install
npx expo start
```

Then press `a` to open an Android emulator, or scan the QR code with the Expo Go app on your phone.

## Checks

```bash
npm run typecheck   # TypeScript
npx expo lint       # ESLint
npm run test:run    # Vitest (core logic)
```

## How the budget works

The budget is a running account, not a counter that resets every week:

- Each week (or month), your budget amount is added to the account.
- Each expense is taken out of it.
- Whatever is left over, or overspent, carries into the next week.

So the dashboard can show both "this week: ₦10,000 + ₦4,000 carried over" and your overall balance. Changing the budget only affects the current period onwards; past weeks keep the amount that applied then. The logic is in `src/core/budget/` and covered by `src/__tests__/ledger.test.ts`.

## Counting users (Firebase, optional)

The app registers an **anonymous** user when someone finishes the username step and records one "opened today" per user per day. Without Firebase config it simply skips this.

1. Create a project at console.firebase.google.com (the free Spark plan is enough).
2. **Authentication → Sign-in method → Anonymous → Enable.** (Enable **Email/Password** too, for the hidden account screens.)
3. **Firestore Database → Create database**, then paste `firebase/firestore.rules` into the Rules tab and publish.
4. **Project settings → Your apps → Web app (</>)**: copy `apiKey`, `authDomain`, `projectId`, `appId` into `mobile/.env.local` (see `.env.example`) and as GitHub repository **variables** with the same names, for the Android test build.

Where to read the numbers:
- **Registered users:** Authentication → Users.
- **Daily active users:** Firestore → `dailyActive` → a day → number of documents in `users`.

## Design tokens

Colours, type and spacing come from `../tokens`, shared with the web app. After editing them:

```bash
npm run generate-theme
```

## Releasing

Builds are made in the cloud with EAS (no Android Studio or Mac needed):

```bash
npx eas-cli@latest build --platform android
```

Before the first Play Store release, replace the placeholder icon and splash images in `assets/images/`, and confirm the app ID `app.gofinancial` in `app.json`. It cannot be changed after the app is published.
