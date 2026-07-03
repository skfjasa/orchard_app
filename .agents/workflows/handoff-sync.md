# Handoff Sync Workflow

Use when the user says `handoff sync` or `session handoff`.

1. Inspect git status, current branch, and latest commit.
2. Update `.agents/current.md`.
3. Update `.agents/next.md`.
4. Add or update a dated file under `.agents/sessions/` only if meaningful code, schema, architecture, workflow, or process changed.
5. Update `personal-os\03-projects\handoffs\orchard_app\latest.md` when status materially changed.
6. Keep current-state files concise.
7. Record checks run, checks not run, known risks, and next recommended task.
8. Do not edit runtime code unless explicitly asked.
