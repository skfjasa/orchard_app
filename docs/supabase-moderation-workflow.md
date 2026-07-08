# Supabase Moderation Workflow

Last updated: 2026-07-08

This is the interim moderation workflow for inner-circle testing while Orchard does not have an admin dashboard. Use Supabase Studio with a trusted project owner/admin account. Do not expose service-role credentials to the mobile app or testers.

## Scope

Use this workflow for:

- Profile reports from Profile Detail.
- Message reports from Chat.
- Blocks that need operator review.
- Unmatch/block visibility checks.
- Account deletion requests.
- Manual suspension or visibility changes during testing.

This is not a production moderation console. It is an operational checklist for `orchard-dev` until a real admin surface or approved support process exists.

## Relevant Backend State

- `public.reports`: created by `submit_report(reported_profile_id, report_reason, report_details, reported_message_id)`.
- `public.account_deletion_requests`: created by `request_account_deletion(deletion_reason)`.
- `public.blocks`: created by `block_profile(blocked_profile_id)` and used to suppress discovery/match/chat visibility.
- `public.matches`: active matches can become `unmatched` or `blocked`.
- `public.messages`: message reports can reference a reported message id.
- `public.profiles`: `is_visible` and `is_suspended` are trusted moderation controls.
- `public.profile_photos` and `public.messages`: `moderation_status` exists for future review states.

Mobile clients should not write moderation/admin fields directly. Current RLS lets users read only their own report/deletion rows; moderator review is through Supabase Studio or another service-role context.

## Daily Review Loop

1. Open Supabase Studio for the hosted `orchard-dev` project.
2. Review `public.reports` filtered to `status = 'open'`, sorted by `created_at` ascending.
3. For each report, record the reporter id, reported profile id, reason, details, and reported message id if present.
4. If a reported message id exists, inspect `public.messages` by that id and verify the sender is the reported profile.
5. Inspect the reported profile in `public.profiles`, `public.profile_members`, and `public.profile_photos`.
6. Choose an action: no action, request more context, hide profile, suspend profile, verify block/unmatch state, or escalate outside the app.
7. Update the report `status` after review. The current allowed values are `open`, `reviewing`, `resolved`, and `dismissed`.
8. Keep any sensitive review notes outside public/mobile-readable tables until a dedicated moderator-notes table exists.

## Account Deletion Requests

1. Review `public.account_deletion_requests` filtered to `status = 'requested'`, sorted by `created_at` ascending.
2. Confirm the request belongs to the authenticated profile id in the row.
3. For inner-circle testing, mark the row `in_progress` when work starts.
4. If deletion is completed manually, mark the row `completed`.
5. If the request is invalid or cancelled by the tester, mark the row `cancelled`.
6. Do not delete auth/profile data casually during active UAT unless the tester explicitly requested it and the test account is no longer needed.

## Manual Moderation Actions

Use the least destructive action that handles the risk:

- Hide from discovery: set `public.profiles.is_visible = false`.
- Suspend account: set `public.profiles.is_suspended = true`.
- Restore account visibility: set `is_visible = true` only after review.
- Unsuspend account: set `is_suspended = false` only after review.
- Hide profile photo: set `public.profile_photos.moderation_status = 'rejected'` or another supported status.
- Flag/hide message: `public.messages.moderation_status` supports `visible`, `hidden`, and `flagged`, but the current app may not yet consume hidden/flagged states everywhere.

After changing profile visibility or suspension, retest that discovery, matching, and chat behavior still follows the expected server rules.

## Verification After Actions

For block/unmatch/report cases, verify:

- Block rows exist in `public.blocks` for the relevant profile pair when a user blocked another user.
- Any active match between blocked users has `public.matches.status = 'blocked'`.
- Unmatched pairs have `public.matches.status = 'unmatched'`.
- Suspended or invisible profiles do not appear in discovery.
- Blocked users do not appear in each other's discovery, match lists, or chat.
- Reported private message bodies are not copied into analytics, logs, docs, or support notes.

## Current Limitations

- No dedicated admin UI exists.
- No moderator notes table exists.
- No explicit moderator identity/audit table exists for Studio edits.
- Message/photo moderation statuses exist, but app behavior for hidden or flagged content still needs hardening before production.
- Real public legal/support/account deletion URLs are still required before TestFlight polish.
- Production moderation process must be revisited before `orchard-prod`.
