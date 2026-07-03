# Orchard Repo Audit: Second Opinion & Critical Findings (2026-06-21)

This document serves as an independent, second-opinion audit of the Orchard project, comparing findings against the initial `20260621_repo_audit_recommendations.md` and outlining an adjusted strategy for the MVP share release.

## 1. Comparison with Previous Audit

The previous audit correctly identified several high-level architectural goals: splitting the `ProfileProvider`, removing stale generated/default namespaces, wiring the remaining backend services (Discovery/Chat/Swipes), and using `expo-secure-store` for sensitive data.

However, a deeper inspection of the codebase reveals **several critical security and reliability flaws that the first audit missed**. These must be addressed before *any* user, even a trusted tester, installs the app.

### Critical Findings Missed by the First Audit

> **1. Plaintext Passwords in Local Storage**
> Passwords collected during onboarding are attached to the `Profile` object under the `credentials` array and saved directly to the device's unencrypted `AsyncStorage` via `JSON.stringify(profile)` in `expo/services/local-profile-storage.ts`. **This is a severe security vulnerability.**

> **2. Zero Error Boundaries**
> There is not a single React `ErrorBoundary` in the entire application, including the root layout. Any unhandled JavaScript error during rendering will result in a hard crash (white screen) for the user.

> **3. Silent Data Loss in React Query**
> The `ProfileProvider` contains 10 `useMutation` hooks for saving local state (likes, passes, conversations, etc.). **Every single mutation is fire-and-forget with no `onError` handling.** If AsyncStorage fails, the UI will update optimistically but the data will be lost silently.

> **4. Type Safety and Schema Drift**
> The manual `Database` type in `expo/lib/supabase.ts` is critically out of sync with the SQL migration (`202606190001_initial_mvp_schema.sql`). 
> *   **Missing in TS:** The `swipes`, `messages`, and `blocks` tables are entirely absent from the TypeScript definitions.
> *   **Session update:** `age_verified` exists in the base migration, and `is_test_fixture` was added by `202606210001_fixture_profiles_and_settings.sql`. The remaining type-safety recommendation still stands: generate Supabase TypeScript types instead of maintaining them manually.

---

## 2. Updated Engineering Best Practices

Building on the previous audit, here are the revised engineering priorities to stabilize the codebase.

### A. Immediate Security Remediation
1.  **Stop persisting passwords:** Refactor the onboarding flow to use Supabase Auth immediately without attaching the password to the `Profile` object. If temporary credential storage is needed for a pending state, use `expo-secure-store`.
2.  **Secure Auth Tokens:** Update the Supabase client instantiation (`expo/lib/supabase.ts`) to use `expo-secure-store` as the storage adapter instead of `AsyncStorage`.
3.  **Update URL Scheme:** Change the generic generated scheme in `app.json` to an Orchard-specific scheme (e.g., `"orchard"`) to prevent deep link hijacking from unrelated generated apps.

### B. Reliability and Architecture
1.  **Implement Error Boundaries:** Wrap the main `<Stack>` in `expo/app/_layout.tsx` with a global Error Boundary to gracefully handle crashes and allow the user to reset the app state.
2.  **Fix React Query Mutations:** Add `onError` callbacks to all `useMutation` calls to alert the user of saving failures and rollback optimistic UI updates.
3.  **Synchronize Types:** Replace the manual `Database` type with an automated generation script using the Supabase CLI (`supabase gen types typescript --local > expo/types/supabase.ts`) to eliminate schema drift.
4.  **Complete the Service Layer:** As noted previously, the `DiscoveryService`, `ChatService`, and `AnalyticsService` currently lack Supabase adapters. Prioritize `DiscoveryService` and `ChatService` for the MVP.

### C. Local Development Workflow (ngrok)
To test webhooks or real device connections, you need to expose your local bundler securely:
1. Run your Expo server normally: `bun run start` (from the `expo` directory).
2. Note the Metro bundler port (usually `8081`).
3. In a separate terminal, launch ngrok: `ngrok http 8081` (or the specific port Expo chose).
4. Update any necessary `.env` variables or Supabase Auth Redirect URLs to point to your new `https://<random>.ngrok.io` tunnel.

---

## 3. Product Management: The 3-Stage Release Strategy

The previous product recommendations (focusing on structured matching and prioritizing safety tools) remain correct. However, based on the engineering realities and your deployment strategy, the release roadmap follows a clear 3-stage mental model:

### Stage 1: The "ngrok" MVP (Current Goal)
*   **Audience:** Very small trusted circle (5-20 close friends).
*   **Platform:** Mobile web browsers (accessed via an ngrok tunnel to your local machine).
*   **Infrastructure:** Zero Apple bureaucracy. Instant updates.
*   **Security Needs:** You must fix the plaintext password bug immediately. `expo-secure-store` is not strictly required here (as web browsers fall back to `localStorage`), but the codebase must gracefully handle this fallback.
*   **Feature Scope:** Secure auth, profile persistence, basic discovery, reciprocal matching, realtime chat, and basic safety (Block/Delete).

### Stage 2: TestFlight Internal (Native Beta)
*   **Audience:** Up to 100 internal testers.
*   **Platform:** Installed natively on iPhones via the TestFlight app.
*   **Infrastructure:** Requires an Apple Developer account, EAS builds, and certificates. No Apple review required.
*   **Security Needs:** **This is the milestone where `expo-secure-store` becomes mandatory.** Running natively on iOS requires using the native Keychain to secure Supabase session tokens.
*   **Feature Scope:** Push notifications, advanced filtering.

### Stage 3: Public Readiness (TestFlight External / App Store)
*   **Audience:** 10,000+ public beta testers or full App Store launch.
*   **Infrastructure:** Requires formal App Review by Apple.
*   **Security Needs:** Full privacy policy, terms of service, and comprehensive moderation tools fully wired to the backend.

---

## 4. Revised Action Plan & Next Steps

Here is the immediate, tactical sequence to prepare for **Stage 1 (ngrok MVP)**:

0.  **Architecture Refactor (Task 0):** Migrate `ProfileProvider` to Zustand slices (`auth`, `swipe`, `chat`) to decouple state and future-proof the codebase before adding new backend adapters. Ensure `onError` callbacks are implemented in the new Zustand actions to prevent silent data loss.
1.  **Security Hotfix (Task 1):** Remove plaintext password storage. Add a platform-aware storage adapter that uses `expo-secure-store` natively but gracefully falls back to `AsyncStorage` on the web.
2.  **Schema Alignment (Task 2):** Add missing columns to the SQL migration and generate the `Database` TypeScript types automatically.
3.  **Reliability Pass (Task 3):** Implement a global Error Boundary and add error handling to local storage mutations.
4.  **Backend Wiring (Task 4):** Implement the Supabase adapters for Discovery and Chat.
5.  **MVP Testing (Task 5):** Share the ngrok URL with your trusted circle and gather product feedback.

---

## 5. Security & Reliability Hotfix Implementation Plan

This section outlines the immediate code changes needed to resolve the critical flaws identified above.

> **Data Loss Warning for Existing Dev Installs**
> Moving from `AsyncStorage` to `expo-secure-store` for Supabase authentication, and removing passwords from the `Profile` object, will log out any existing local development sessions. Testers or developers will need to sign in again after this update.

> **expo-secure-store Caveat (Web Testing)**
> We need to add `expo-secure-store` for native security. However, since the MVP test will be conducted via ngrok URLs in the tester's mobile browser, `SecureStore` will not be available. The implementation must include a graceful fallback to `AsyncStorage` for the web platform, meaning tester sessions during this specific MVP test will be stored in standard browser local storage.

### Security Dependencies

*   **`expo/package.json`**: Add `expo-secure-store` to the project to securely manage Supabase session tokens and any temporary sensitive data.

### Supabase Client Configuration

*   **`expo/lib/supabase.ts`**: Implement a platform-aware storage adapter for the Supabase client initialization. For native platforms (iOS/Android), use `expo-secure-store` to encrypt session tokens. For the web platform (used during browser-based MVP testing), fall back to `AsyncStorage` (which wraps `localStorage`) because `SecureStore` is not supported in the browser.
*   *Reason:* Supabase session tokens (access and refresh tokens) are currently written to disk in plaintext. `SecureStore` encrypts these on iOS (Keychain) and Android (Keystore). However, a web fallback is strictly required for the browser-based ngrok testing strategy.

### Profile Storage Security

*   **`expo/services/local-profile-storage.ts`**: Currently, the entire `Profile` object is serialized and saved via `JSON.stringify(profile)`. This includes the `credentials` array containing plaintext passwords. Implement a `stripCredentialsBeforeSave` utility that ensures the `credentials` field is stripped from the `Profile` object before it hits `AsyncStorage`.
*   **`expo/providers/onboarding-provider.tsx`**: The draft state holds plaintext passwords. This is acceptable while the form is open, but we must ensure they are properly cleared upon completion.
*   **`expo/app/onboarding/photos.tsx`**: Refactor the `completeOnboarding` flow to NOT attach the `credentials` property to the `Profile` object.

### App Reliability & Architecture Refactor (Zustand)

*   **`expo/app/+error.tsx`**: Create a global error boundary using Expo Router's `+error.tsx` convention. Provide a safe fallback UI that allows the user to tap "Retry" or "Return Home" instead of the app white-screening when a JS exception occurs.
*   **`expo/providers/profile-provider.tsx` & `expo/store/*`**: This 984-line "God file" must be refactored into Zustand slices (e.g., `useAuthStore`, `useSwipeStore`, `useChatStore`) *before* executing the remaining tasks. 
    *   **Context:** It currently manages 14 pieces of state, 10 local storage mutations, and 24 callbacks.
    *   **Execution Directive for Codex:** Break this into logical domain slices. When migrating the 10 local storage mutations, you **must add `onError` callbacks** (with `console.error` and `Alert.alert`) to prevent the silent data loss that currently exists in the codebase. Keep the existing mock implementations intact during the refactor. We are changing the *state management architecture*, not replacing the underlying mock services yet.

### Deep Link Security

*   **`expo/app.json`**: Change the generic generated scheme to `"scheme": "orchard"`.
*   *Reason:* A generic scheme makes the app vulnerable to deep link hijacking if another generated app is installed on the same device.
