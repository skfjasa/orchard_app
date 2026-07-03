# Orchard Expo App

This folder contains the Orchard Expo React Native app.

## Commands

```powershell
bun install
bun run start
bun run start-web
bun run lint
bun run typecheck
```

The app uses Expo Router, TypeScript, Bun, and Supabase-backed services where they have been introduced. It should continue to run in mock mode when Supabase environment variables are absent.

## Important Files

- `app/`: Expo Router screens
- `app/_layout.tsx`: root providers and navigation
- `providers/`: auth, onboarding, and profile state
- `services/`: backend/mock service boundaries
- `mocks/`: local prototype data
- `app.json`: Expo app config
- `package.json`: app scripts and dependencies
