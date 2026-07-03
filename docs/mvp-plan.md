# MVP Plan

## Product Goal

Build an iOS-first TestFlight MVP for a polyamorous / ENM dating app. The MVP should validate whether users get value from dating profiles that make relationship structure, partnered status, dating mode, boundaries, and expectations clear before matching and chatting.

This should not become a generic swipe app with different labels.

## MVP User Outcomes

A closed beta tester should be able to:

1. Install the app on an iPhone.
2. Create an account.
3. Complete a dating profile.
4. Upload photos.
5. Discover compatible profiles.
6. Like or pass.
7. Match only when likes are mutual.
8. Chat with active matches.
9. Block, report, or unmatch.
10. Delete their account or request deletion.
11. Provide feedback while basic analytics are collected.

## Recommended Architecture

Frontend:

- Expo React Native
- Expo Router
- TypeScript
- Bun

Backend:

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime or polling fallback for chat

Optional:

- PostHog for analytics
- Sentry for crash/error logging
- EAS Build for TestFlight

Required development principle:

- Preserve mock mode when Supabase environment variables are missing.

## What To Preserve

The existing prototype already has useful UI for:

- Onboarding
- Profile cards
- Swipe deck
- Profile detail
- Matches
- Inbox
- Chat
- Profile editing

Keep these surfaces where practical. Replace data and behavior behind them gradually.

## What To Defer

Do not prioritize these for the first MVP:

- Paid subscriptions
- Boosts
- Super Likes
- Advanced ranking
- ML matching
- Video profiles
- Audio messages
- Group chat
- Couple-linked accounts
- Social graph or contacts integration
- Public App Store launch polish
- Android production launch

Prototype features like paywall, boosts, super likes, simulated photo approval, and fake chat replies should be removed, hidden, or kept behind demo/mock mode until there is a real product reason to ship them.

## Poly/ENM-Specific Profile Fields

Minimum structured fields:

- Display name
- Birthdate or age
- 18+ confirmation
- City / approximate location
- Gender identity
- Orientation
- Relationship structure
- Partnered status
- Dating mode: solo, couple, either
- Looking-for values
- Boundaries / dealbreakers
- Bio
- Photos
- Preferred age range
- Preferred distance
- Show-me preferences
- Relationship structures user is open to

Potential relationship structure values:

- Solo poly
- Partnered poly
- Hierarchical poly
- Non-hierarchical poly
- Open relationship
- ENM
- Relationship anarchist
- Swinging
- Exploring
- Monogamish
- Couple dating together
- Couple dating separately

## Safety Requirements

Safety is MVP infrastructure, not a later feature.

Required:

- Block user
- Report profile
- Report message
- Unmatch
- Hide own profile
- Delete account or request deletion
- Support/contact screen
- Community standards screen
- Privacy policy screen or link
- Terms screen or link
- Basic moderation workflow

Blocked users must not:

- See each other in discovery
- Match with each other
- Continue chatting
- Appear in active match lists

## Data Model Starting Point

Initial Supabase tables:

- `profiles`
- `profile_members`
- `profile_photos`
- `swipes`
- `matches`
- `messages`
- `blocks`
- `reports`
- `user_settings`
- `account_deletion_requests`

### profiles

- `id uuid primary key references auth.users(id)`
- `display_name text`
- `birthdate date`
- `age_verified boolean`
- `city text`
- `region text`
- `country text`
- `latitude_approx numeric`
- `longitude_approx numeric`
- `gender text`
- `orientation text`
- `relationship_structure text[]`
- `partnered_status text`
- `dating_mode text`
- `looking_for text[]`
- `boundaries text[]`
- `bio text`
- `is_visible boolean`
- `is_suspended boolean`
- `onboarding_completed boolean`
- `created_at timestamptz`
- `updated_at timestamptz`
- `last_active_at timestamptz`

### profile_members

- `id uuid primary key`
- `profile_id uuid references profiles(id)`
- `display_name text`
- `birthdate date`
- `gender text`
- `orientation text`
- `bio text`
- `sort_order int`
- `created_at timestamptz`
- `updated_at timestamptz`

### profile_photos

- `id uuid primary key`
- `profile_id uuid references profiles(id)`
- `member_id uuid references profile_members(id)`
- `storage_path text`
- `sort_order int`
- `moderation_status text`
- `created_at timestamptz`

### swipes

- `id uuid primary key`
- `swiper_id uuid references profiles(id)`
- `target_id uuid references profiles(id)`
- `decision text`
- `created_at timestamptz`
- `unique(swiper_id, target_id)`

### matches

- `id uuid primary key`
- `user_a uuid references profiles(id)`
- `user_b uuid references profiles(id)`
- `status text`
- `created_at timestamptz`
- `unmatched_by uuid nullable`
- `unmatched_at timestamptz nullable`

### messages

- `id uuid primary key`
- `match_id uuid references matches(id)`
- `sender_id uuid references profiles(id)`
- `body text`
- `moderation_status text`
- `created_at timestamptz`

### blocks

- `id uuid primary key`
- `blocker_id uuid references profiles(id)`
- `blocked_id uuid references profiles(id)`
- `created_at timestamptz`
- `unique(blocker_id, blocked_id)`

### reports

- `id uuid primary key`
- `reporter_id uuid references profiles(id)`
- `reported_user_id uuid references profiles(id)`
- `reported_message_id uuid nullable references messages(id)`
- `reason text`
- `details text`
- `status text`
- `created_at timestamptz`
- `reviewed_at timestamptz nullable`
- `reviewed_by uuid nullable`

### user_settings

- `profile_id uuid primary key references profiles(id)`
- `min_age int`
- `max_age int`
- `max_distance_miles int`
- `show_me text[]`
- `relationship_structures text[]`
- `push_enabled boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### account_deletion_requests

- `id uuid primary key`
- `profile_id uuid references profiles(id)`
- `status text`
- `requested_at timestamptz`
- `completed_at timestamptz nullable`

## Discovery And Matching Logic

Keep the first version simple.

Discovery should exclude:

- Current user
- Suspended users
- Invisible users
- Blocked users in either direction
- Already-swiped users
- Users outside basic preferences

Initial ranking:

1. Eligible profiles only.
2. Recently active first.
3. Profile completeness.
4. Rough compatibility on relationship structure and looking-for fields.

Like flow:

1. Insert `swipes` row.
2. Check whether target user already liked current user.
3. If yes, create `matches` row.
4. Prevent duplicate matches with constraints or transaction logic.
5. Show match state in the app.

Chat should only be available for active matches.

## Milestones

### Milestone 0: Repo Audit

Complete. See `docs/repo-audit.md`.

### Milestone 1: App Foundation

- Add environment/config module
- Add mock mode detection
- Add Supabase client skeleton
- Add app setup docs
- Add iOS deployment notes
- Add adapter boundaries for data access

### Milestone 2: Supabase Integration

- Install Supabase client
- Add typed Supabase client
- Add auth/session provider
- Add login/logout
- Preserve mock fallback

### Milestone 3: Onboarding And Profiles

- Save profiles to Supabase
- Upload photos to Supabase Storage
- Mark onboarding complete
- Add real profile editing
- Add profile completeness helper

### Milestone 4: Discovery, Swipes, Matches

- Load discovery profiles from Supabase
- Filter blocked, swiped, invisible, suspended users
- Persist likes/passes
- Create match on mutual like
- Prevent duplicate matches

### Milestone 5: Chat

- Match-scoped chat
- Send text messages
- Realtime or polling fallback
- Message list persistence
- Chat access only for active matches

### Milestone 6: Safety And Moderation

- Report profile
- Report message
- Block user
- Unmatch
- Support/contact screen
- Community standards screen
- Supabase Studio moderation workflow docs

### Milestone 7: Privacy And Account Deletion

- Terms screen/link
- Privacy policy screen/link
- Delete account screen
- Account deletion request table
- Public deletion/support URL plan

### Milestone 8: Analytics And Crash Reporting

- Add optional PostHog
- Add optional Sentry
- Track funnel events
- Add tester feedback link

Core events:

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
- `account_deletion_requested`
- `app_error`

### Milestone 9: iOS TestFlight

- Configure app name
- Configure bundle identifier
- Configure version/build number
- Add EAS build profiles
- Add iOS permission strings
- Prepare App Store Connect beta metadata
- Prepare demo account or seeded beta data
- Add reviewer/tester notes

### Milestone 10: Android Later

- Configure Android package name
- Add adaptive icon
- Build AAB
- Document Play Console closed testing

## First 10 PR-Sized Tasks

1. Add `.env.example`.
2. Add setup and deployment docs.
3. Add typed environment/mock-mode helper.
4. Add Supabase client skeleton.
5. Add data adapter interface for mock vs Supabase mode.
6. Add auth/session provider shell.
7. Add profile completeness helper.
8. Add route guard design for auth/onboarding/main app.
9. Add initial Supabase schema migration draft.
10. Add moderation/account deletion docs.

## Open Questions

1. Which Supabase project will be used?
2. What should the production bundle identifier be?
3. What domain will host privacy policy, terms, support, and deletion pages?
4. Should closed beta use invite-only signup?
5. What launch geography should discovery assume?
6. Which profile fields are mandatory in the first beta?
7. Is PostHog desired from day one, or should analytics start with a lighter event log?
8. Is Sentry required before TestFlight?
9. How should moderation be staffed during the beta?
10. Should current paywall/super-like/boost UI be hidden before beta?
