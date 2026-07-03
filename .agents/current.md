# Current Agent State

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`
- Last known good commit: `921e158` - Decouple Rork and advance Supabase backend flows

## Recent Changes

- Removed active legacy-generator/Rork coupling.
- Fixed chat route update loops and safety menu behavior.
- Fixed rematch backend semantics with migration `202607030001_rematch_active_match_history.sql`.
- Started backend text-message persistence behind `createSupabaseChatService`.

## Validation State

- `bun run typecheck`: passed.
- `bun run lint`: passed.
- `git diff --check`: passed.
- `expo\node_modules\.bin\supabase db reset`: passed.
- `expo\node_modules\.bin\supabase test db`: passed with 41 tests.
- Hosted Supabase migration list aligned through `202607030001`.

## Current Risks / Blockers

- Hosted browser UAT did not produce a `messages` row or fresh `matches` timestamp after sending a text message.
- Need to debug whether browser state is using a backend-backed active match and whether local fixture conversation ids resolve to hosted fixture match ids.
- Supabase email rate limit/custom SMTP still blocks full hosted confirmation/photo smoke testing.

## Likely Relevant Files

- `expo/providers/profile-provider.tsx`
- `expo/services/supabase-chat-service.ts`
- `expo/services/supabase-match-service.ts`
- `expo/services/supabase-swipe-service.ts`
- `expo/constants/mock-profile-ids.ts`
- `supabase/migrations/202607030001_rematch_active_match_history.sql`
- `supabase/tests/database/202606200001_mvp_security.sql`

## Read Only If Needed

- `docs/project-status.md`
- `docs/session-handoff.md`
- `docs/backend-migration-plan.md`
- `docs/supabase-schema.md`
- `.agents/handoff.md`

## Next Recommended Task

Debug hosted backend-backed active match resolution for chat persistence.
