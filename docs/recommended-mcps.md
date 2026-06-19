# Recommended MCPs

## Principle

- `AGENTS.md` = rules
- Skills = repeatable workflows
- MCPs = external context/tools
- Tests/manual QA = truth
- Human review = release gate

## Install / Use Now

### 1. Context7 MCP

Use for up-to-date documentation and examples for:

- Expo
- React Native
- Expo Router
- Supabase
- EAS
- PostHog
- Sentry

Use it when implementation details may have changed or official docs matter.

### 2. GitHub MCP

Use for:

- Repo navigation
- Issues
- PR review
- Backlog management
- Cross-file context in GitHub

Keep changes reviewed through normal Git/GitHub workflow.

## Use When Backend Begins

### 3. Supabase MCP

Use for:

- Schema inspection
- Migrations
- Logs
- Storage debugging
- Auth debugging
- Realtime debugging
- Advisors

Access rules:

- Dev project write access only.
- Staging/prod writes require human approval.
- Never expose service-role keys in the mobile app.

## Install Later

### 4. Playwright MCP

Useful once there is:

- Web landing page
- Privacy/deletion page
- Admin/moderation panel
- Browser-based QA surface

Not needed for pure mobile UI first.

## Optional Later

### 5. Sentry Tooling / API Integration

Use after Sentry is implemented and beta crashes exist.

Good uses:

- Crash triage
- Release regression checks
- Error grouping review

### 6. PostHog Tooling / API Integration

Use after analytics events exist.

Good uses:

- Event QA
- Funnel QA
- Beta usage review

## Avoid Early

- Random untrusted MCPs
- Production DB write access
- Broad shell MCPs if Codex already has terminal access
- Payment/subscription MCPs
- SMS auth tooling
- Marketing automation
- App-store automation beyond documented EAS/App Store Connect workflow
