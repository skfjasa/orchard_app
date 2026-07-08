# Orchard Docs Index

Last updated: 2026-07-06

This directory intentionally uses a small set of active source-of-truth docs. Older milestone, backlog, checklist, and audit docs were consolidated so future planning does not drift across multiple files.

## Canonical Docs

- [Closed-Beta Milestone Tracker](milestone-tracker.md): canonical milestone roadmap, current tasks, checklists, blockers, UAT loop, human decisions, and closed-beta launch readiness.
- [Repo Audit & Foundation Refactor Plan](repo-audit-and-foundation-plan.md): active engineering execution plan for the July 2026 foundation cleanup.
- [Project Status](project-status.md): running narrative status log. Keep concise status changes here when commits materially change project state.
- [Architecture Audit History](architecture-history.md): durable historical findings and decisions from old audits and deleted planning docs.

## Reference Docs

- [Backend Migration Plan](backend-migration-plan.md): backend migration principles and service-boundary guidance. Current milestone status lives in the milestone tracker.
- [Supabase Schema Draft](supabase-schema.md): current schema/RLS/migration reference.
- [Supabase Hardening Plan](supabase-hardening-plan.md): security/RLS principles and current hardening reference.
- [Supabase Moderation Workflow](supabase-moderation-workflow.md): interim Supabase Studio review process for reports, account deletion requests, blocks, and manual moderation during inner-circle testing.
- [Development Setup](setup.md): local setup, commands, environment variables, and TestFlight setup notes.
- [Codex Operating Guide](codex-operating-guide.md): operating rules for agent sessions.
- [Profile Provider Responsibility Map](profile-provider-map.md): provider extraction context; not a rewrite directive.
- [Monetization Candidates](monetization-candidates.md): deferred monetization policy and possible future surfaces.

## Session Continuity

- `.agents/current.md`: compact current state loaded by `status report`.
- `.agents/next.md`: next task and acceptance criteria loaded by `status report`.
- `docs/project-status.md`: narrative status log for material project changes.

## Deleted / Consolidated Docs

The following old docs were consolidated into the milestone tracker and architecture history:

- `docs/repo-audit.md`
- `docs/20260620_project_review.md`
- `docs/20260621_repo_audit_recommendations.md`
- `docs/20260621_second_opinion_audit_v2.md`
- `docs/mvp-plan.md`
- `docs/mvp-backlog.md`
- `docs/mvp-prototype-gap-assessment.md`
- `docs/mobile-release-checklist.md`
- `docs/safety-and-privacy-checklist.md`
