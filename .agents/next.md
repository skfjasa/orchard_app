# Next Task

Human UAT forgot-password when practical, then continue provider-internal cleanup after Slice 6, likely with backend chat send/read orchestration or remaining local simulated conversation mutation callbacks next.

## Canonical Startup Context

Read these first:

- `AGENTS.md`
- `.agents/current.md`
- `.agents/next.md`
- `docs/milestone-tracker.md`
- `docs/repo-audit-and-foundation-plan.md`
- `docs/README.md`

Read only if needed:

- `docs/project-status.md`
- `docs/architecture-history.md`
- `docs/supabase-schema.md`
- `docs/backend-migration-plan.md`

## Implemented Scope

- `expo/hooks/use-canonical-back.ts`: removed web `popstate` behavior and web options; kept Android `BackHandler`.
- `expo/app/(tabs)/matches.tsx`: removed `window.history.pushState` / hash sentinel before opening Match Detail.
- `expo/app/match/[id].tsx`: removed web-specific `useCanonicalBack` options.
- `expo/scripts/start-uat-web-tunnel.cjs`: added one-command UAT launcher for Expo web plus standalone ngrok v3.
- `expo/hooks/use-canonical-back.ts`: follow-up restored focused web browser-back handling by replacing to the canonical route instead of using the removed Match-tab hash/history workaround.
- `expo/providers/auth-provider.tsx` and `expo/app/onboarding/sign-in.tsx`: wired hosted Supabase forgot-password recovery and in-app password update.
- `expo/providers/profile-provider-contract.ts`: froze the `useProfile()` compatibility facade.
- `docs/profile-provider-map.md`: categorized provider fields/actions by extraction domain and identified first migration consumers.
- `expo/store/use-preferences-store.ts`: extracted local read/seen preference persistence behind a Zustand store while preserving existing AsyncStorage keys.
- `expo/store/use-interaction-store.ts`: extracted local/demo swipe interaction persistence behind a Zustand store while preserving existing AsyncStorage keys.
- `expo/hooks/api/`: added query keys and React Query hooks for matches, chat threads, and discovery.
- `expo/app/(tabs)/discover.tsx` and `expo/app/(tabs)/fruit.tsx`: moved discovery reads to `useDiscoveryProfilesQuery`.
- `expo/providers/profile-provider.tsx`: moved backend match list reads to `useMatchesQuery().refetch()` while preserving the existing hydration algorithm.
- `expo/hooks/use-matches-read-model.ts` and `expo/app/(tabs)/matches.tsx`: moved the Matches read path behind a focused read-model hook without changing visible UI.
- `expo/hooks/use-inbox-read-model.ts` and `expo/app/(tabs)/inbox.tsx`: moved the Inbox read path behind a focused read-model hook without changing visible UI.
- `expo/hooks/use-match-detail-read-model.ts` and `expo/app/match/[id].tsx`: moved the Match Detail read path and seen-state calls behind a focused read-model hook without changing visible UI or navigation behavior.
- `expo/hooks/use-chat-thread-read-model.ts` and `expo/app/chat/[id].tsx`: moved the Chat thread/read/send path behind a focused read-model hook without changing visible UI or navigation behavior.
- `expo/hooks/use-discover-read-model.ts` and `expo/app/(tabs)/discover.tsx`: moved the Discover discovery query, remembered profiles, exclusion inputs, monetization counters, and swipe actions behind a focused read-model hook without changing visible UI.
- `expo/hooks/use-fruit-read-model.ts` and `expo/app/(tabs)/fruit.tsx`: moved Fruit backend non-fixture discovery, local fixture pool/scoring behavior, remembered profiles, and like/boost actions behind a focused read-model hook without changing visible UI.
- `expo/hooks/use-edit-profile-read-model.ts` and `expo/app/edit-profile.tsx`: moved Edit Profile route provider calls behind a focused hook without changing save behavior.
- `expo/hooks/use-paywall-read-model.ts` and `expo/app/paywall.tsx`: moved Paywall route provider calls behind a focused hook without changing demo purchase/subscription behavior.
- `expo/hooks/use-report-read-model.ts` and `expo/app/report.tsx`: moved Report route provider calls behind a focused hook without changing report submission behavior.
- `expo/hooks/use-safety-legal-read-model.ts` and `expo/app/safety-legal.tsx`: moved Safety & Legal route provider calls behind a focused hook without changing account-deletion request behavior.
- `expo/hooks/use-tab-badge-read-model.ts` and `expo/app/(tabs)/_layout.tsx`: moved tab badge provider calls behind a focused hook without changing badge behavior.
- `expo/hooks/use-profile-tab-read-model.ts` and `expo/app/(tabs)/profile.tsx`: moved Profile tab provider calls behind a focused hook without changing profile, sign-out, monetization, or partner-link behavior.
- `expo/hooks/use-onboarding-completion-read-model.ts` and `expo/app/onboarding/photos.tsx`: moved final onboarding completion behind a focused hook without changing auth/profile completion behavior.
- `expo/hooks/use-sign-in-profile-read-model.ts` and `expo/app/onboarding/sign-in.tsx`: moved sign-in profile readiness reads behind a focused hook without changing forgot-password or bootstrap behavior.
- `expo/hooks/use-app-bootstrap-read-model.ts`, `expo/app/index.tsx`, and `expo/components/navigation/ProtectedRoute.tsx`: moved root/protected-route bootstrap reads behind a focused hook without changing redirect or loader behavior.
- `expo/services/profile-provider-selectors.ts`: moved pure compatibility selector calculations out of `ProfileProvider` without changing facade behavior.
- `expo/store/use-monetization-store.ts`: moved prototype monetization state out of `ProfileProvider` while preserving existing AsyncStorage keys, provider wrappers, and demo behavior.
- `expo/store/use-chat-ui-store.ts`: moved local chat UI state for drafts and simulated typing IDs out of `ProfileProvider` without changing Chat or Inbox behavior.
- `expo/services/local-interaction-service.ts`: moved pure backend conversation merge/read-through helpers out of `ProfileProvider`.
- `expo/hooks/use-persisted-conversations.ts`: moved local conversation state and AsyncStorage persistence out of `ProfileProvider` without changing the compatibility facade.
- `expo/services/local-chat-simulation-service.ts`: moved local chat simulation timing helpers out of `ProfileProvider` without changing simulated reply/photo behavior.
- `expo/services/match-record-utils.ts`: moved repeated backend match-pair lookup out of `ProfileProvider` without changing backend effects.

## Validation

- `cd expo; bun run typecheck`: passed.
- `cd expo; bun run lint`: passed.
- `git diff --check`: passed.
- Targeted desktop Chrome and Android Chrome UAT passed for Chat and Match Detail back navigation. Android Match Detail has a brief app-background loader during early repeated backs, then warms up.
- Forgot-password fix: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 2: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 3: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 4: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 5: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 6 Matches read path: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 6 Inbox read path: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 6 Match Detail read path: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Foundation Slice 6 Chat thread/read/send path: `cd expo; bun run typecheck` passed and `cd expo; bun run lint` passed.
- Foundation Slice 6 Discover/Fruit read path: `cd expo; bun run typecheck` passed and `cd expo; bun run lint` passed.
- Foundation Slice 6 profile/safety/paywall route facades: `cd expo; bun run typecheck` passed and `cd expo; bun run lint` passed.
- Foundation Slice 6 final route migration: `cd expo; bun run typecheck` passed and `cd expo; bun run lint` passed.
- Provider selector extraction: `cd expo; bun run typecheck` passed and `cd expo; bun run lint` passed.
- Monetization store extraction: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Chat UI store extraction: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Conversation helper extraction: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Persisted conversations hook: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Chat simulation helper extraction: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.
- Match record helper extraction: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.

## Follow-Up After Slice 1

Navigation cleanup is accepted. Forgot-password is wired but still needs human UAT when practical. Slices 2, 3, 4, 5, and 6 are implemented. App routes/components no longer import `useProfile()` directly; focused hooks own the route/provider boundary. Provider-internal selector, monetization, chat UI, persisted conversation, chat simulation timing, match-record lookup, and pure conversation helper cleanup are implemented. Next engineering task is moving the next small state domain, likely backend chat send/read orchestration or remaining local simulated conversation mutation callbacks, out of `ProfileProvider` behind clearer services.
