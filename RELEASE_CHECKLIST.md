# DishDecide iOS Release Checklist

## 1. Pre-Release Sanity
- Confirm branch is clean: `git status`
- Commit all changes before build
- Verify app config:
  - Bundle ID: `com.mahir93.dishdecideapp`
  - EAS submit App ID (`ascAppId`) matches active App Store Connect app
- Confirm critical env/config values are set for production

## 2. Versioning
- App version (`app.config.js`): update `version` when needed (e.g. `0.15.1`)
- Build number (remote source): let EAS manage it automatically
- Optional check:
  - `npx eas-cli@latest build:version:get --platform ios`

## 3. Build + Submit
- Run:
  - `npx eas-cli@latest build --platform ios --profile production --auto-submit`
- Monitor build in Expo dashboard
- Monitor submission status in Expo dashboard

## 4. TestFlight Processing
- Open TestFlight page:
  - https://appstoreconnect.apple.com/apps/6759682451/testflight/ios
- Wait for Apple processing to complete
- Add build to Internal Testing group
- Add/select testers and confirm availability

## 5. Smoke Test (Real Device)
- Auth:
  - Sign up / log in / log out
- Discovery:
  - Home search
  - Filter + location radius
  - Restaurant details opens correctly
- Menu AI flow:
  - Prompt search returns relevant results
  - Empty state is readable and non-blocking
- Profile:
  - Preferences persist and influence ranking/feed
  - Avatar/profile edits work
- Favourites:
  - Add/remove persists correctly

## 6. Release Readiness
- No blocking crashes in console logs
- No broken images in key restaurant cards
- Submission metadata in App Store Connect is complete
- Privacy/compliance sections are accurate

## 7. If Submit Fails
- Confirm app is active (not removed) in App Store Connect
- Confirm `ascAppId` in `eas.json` is correct
- Retry submit without rebuild:
  - `npx eas-cli@latest submit --platform ios --latest`
