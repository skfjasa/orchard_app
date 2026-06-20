# MVP Backlog

## Milestone 0 - Operating Layer

Current status:

- Repo audit exists.
- Project operating docs exist, including repo-level `AGENTS.md`.
- `expo/.env.example` exists.
- No EAS config.
- Backend foundation exists, but production backend behavior is not wired as source of truth.

Tasks:

- Add `AGENTS.md`.
- Add `expo/.env.example`.
- Update docs.
- Document commands.
- Document current route/screen map.
- Document implementation risks.

Acceptance:

- Future Codex sessions can follow project rules.
- No runtime behavior changed.

## Milestone 1 - App Foundation And Adapter Boundaries

Current status:

- Local state centralized in `expo/providers/profile-provider.tsx`.
- Mock data in `expo/mocks`.
- Types in `expo/types/index.ts`.
- Service interfaces, mock adapters, Supabase adapters for swipe/match/safety, and backend/mock service factory exist.
- Swipe persistence has a gated non-blocking Supabase hook, while local state remains the UI source of truth.

Tasks:

- Map current provider responsibilities.
- Extract domain/service boundaries without changing behavior.
- Centralize mock data access behind adapters.
- Add domain types if missing.
- Preserve existing Rork UI and local behavior.
- Add route/auth/onboarding state concepts without requiring backend yet.

Acceptance:

- App still works locally.
- Swipe/chat/profile demo behavior still works.
- Provider responsibilities are easier to replace later.

## Milestone 2 - Supabase Backend Foundation

Current status:

- Supabase client, auth/session provider foundation, hardened schema/RLS/RPC migration draft, local Supabase config, service adapters, and initial database/RLS tests exist.
- Docker Desktop is operational after enabling firmware virtualization, and local Supabase database/RLS tests pass.
- No live Supabase project has been applied as the app source of truth.

Tasks:

- Add Supabase dependency.
- Add `expo/lib/supabase.ts`.
- Add env-var gated client setup.
- Add auth/session provider.
- Add migration folder.
- Keep mock mode when Supabase env vars are missing.
- Add initial schema draft for profiles, profile_photos, swipes, matches, messages, blocks, reports, user_settings, account_deletion_requests.

Acceptance:

- App runs with or without Supabase env vars.
- No secrets committed.
- Auth foundation exists.

## Milestone 3 - Real Auth And Onboarding

Current status:

- Prototype/local sign-in only.
- Onboarding screens exist under `expo/app/onboarding`.

Tasks:

- Replace local sign-in with real auth while preserving UI.
- Add 18+ age gate.
- Persist onboarding completion to backend.
- Create/edit profile.
- Add poly/ENM structured fields.
- Keep local fallback for mock mode.

Acceptance:

- User can create account and complete profile.
- Session persists.
- Profile persists after app restart.

## Milestone 4 - Photo Upload And Profile Storage

Current status:

- Photo/image behavior is local or mock-based.

Tasks:

- Add Supabase Storage bucket plan.
- Add photo upload from Expo Image Picker.
- Store photo metadata.
- Add moderation status.
- Preserve demo/mock image behavior.

Acceptance:

- User can upload profile photos.
- Photos persist.
- No unsafe storage access rules.

## Milestone 5 - Discovery, Swipes, Mutual Matches

Current status:

- Discovery uses local mock profiles.
- Right swipe creates local match/conversation immediately.

Tasks:

- Query eligible backend profiles.
- Exclude self.
- Exclude invisible/suspended users.
- Exclude blocked users both directions.
- Exclude already-swiped users.
- Persist like/pass.
- Create match only on reciprocal likes.
- Prevent duplicate matches.
- Preserve mock swipe behavior when backend absent.

Acceptance:

- Swipe decisions persist.
- Mutual like creates a match.
- Non-mutual like does not create chat.
- Blocked/ineligible users do not appear.

## Milestone 6 - Matches And Chat

Current status:

- Chat is local/simulated.

Tasks:

- Store matches.
- Store messages.
- Restrict chat to active matches.
- Add realtime updates or polling fallback.
- Disable chat after unmatch/block.
- Do not log private message bodies.

Acceptance:

- Active matches can chat.
- Non-matches cannot access chat.
- Unmatched/blocked users cannot continue chat.

## Milestone 7 - Safety And Moderation

Current status:

- Local unmatch exists and is exposed from chat safety actions.
- Report profile, report message, block, and account deletion request entry points exist and call the safety service boundary.
- Backend persistence for safety actions depends on real auth/profile source-of-truth wiring.

Tasks:

- Implement block user.
- Implement report profile.
- Implement report message.
- Implement unmatch with backend persistence.
- Add report reasons/details.
- Add moderation status fields.
- Add Supabase Studio workflow docs if no admin panel exists.
- Exclude blocked users from discovery/matches/chat.

Acceptance:

- Report/block/unmatch flows exist.
- Reports persist.
- Blocked users cannot see/message each other.

## Milestone 8 - Privacy, Terms, Support, Account Deletion

Current status:

- Initial in-app Safety & Legal screen exists, with privacy, terms, community standards, support, and account deletion request sections.
- Final public Privacy Policy, Terms, Support, and Account Deletion URLs/email are still human decisions.

Tasks:

- Add Privacy Policy screen/link.
- Add Terms screen/link.
- Add Community Standards screen/link.
- Add Support/contact screen/link.
- Add Delete Account screen.
- Add account deletion request flow.
- Document manual or automated deletion procedure.
- Prepare public web URLs.

Acceptance:

- User can access all required legal/safety surfaces.
- User can initiate account deletion in app.
- Store metadata URLs are ready or documented as blockers.

## Milestone 9 - Analytics And Crash Reporting

Current status:

- No analytics/crash reporting implementation.

Tasks:

- Add PostHog optional integration.
- Add Sentry optional integration.
- Gate both by env vars.
- Track funnel/safety events.
- Avoid PII/private message/profile text.

Events:

- `signup_started`
- `signup_completed`
- `onboarding_started`
- `onboarding_completed`
- `profile_photo_uploaded`
- `swipe_like`
- `swipe_pass`
- `match_created`
- `chat_opened`
- `message_sent`
- `report_submitted`
- `block_submitted`
- `unmatch_submitted`
- `account_deletion_requested`
- `app_error`

Acceptance:

- App runs without analytics env vars.
- Events are consistent and privacy-safe.

## Milestone 10 - iOS TestFlight

Current status:

- `expo/app.json` exists.
- Bundle ID currently uses Rork-generated ID.
- No `eas.json`.
- No App Store metadata.

Tasks:

- Decide production bundle ID.
- Add `eas.json`.
- Add EAS build profiles.
- Review icon/splash.
- Review permission strings.
- Add privacy/deletion/support URLs.
- Prepare beta app description.
- Prepare reviewer notes.
- Prepare demo account/seed data.
- Upload TestFlight build.

Acceptance:

- iOS build can be produced.
- TestFlight metadata is ready.
- App has safety/legal surfaces.
- App has demo path for reviewer/testers.

## Milestone 11 - Android Later

Current status:

- Android package exists in app config.
- No full native Android project config.
- Android is secondary.

Tasks:

- Decide production package name.
- Add adaptive icon review.
- Add Android permissions.
- Build AAB through EAS.
- Prepare Play Console internal testing docs.

Acceptance:

- Android build path exists after iOS MVP is stable.
