# Project Structure

This repository is organized to keep runtime app code separate from data tooling.

## Runtime app code
- `components/`: reusable UI components
- `screens/`: screen-level containers and layout logic
- `navigation/`: stack/tab/drawer navigation setup
- `services/`: data and business logic services
- `hooks/`: custom React hooks
- `config/`: app configuration
  - Active files: `firebase.js`, `firebaseAuth.js`, `firebaseApp.js`, `designSystem.js`
- `constants/`, `types/`, `utils/`: shared constants, types, utilities
- `assets/`: static media assets
- `data/`: runtime data sources used by the app

## Build and platform
- `app.config.js`: Expo app config
- `eas.json`: EAS build/submit profiles
- `metro.config.js`, `babel.config.js`, `tsconfig.json`: tooling config
- `android/`, `ios/`: native platform projects

## Data tooling
- `scripts/`: enrichment, normalization, and migration scripts
  - Script-local inputs/outputs are resolved from `scripts/` to avoid root clutter.

## Docs
- `docs/RELEASE_CHECKLIST.md`: iOS release/TestFlight checklist
- `docs/PROJECT_STRUCTURE.md`: this file
