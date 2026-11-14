# AGENTS.md — checklist for coding agents in this repo

Short by design. A checklist, not documentation. Full context: the repo's own SPEC/docs, REVIEW.md, CRITICAL_PATHS.md.

## Repo invariants (hard constraints from docs/top-trumps-spec.md)
- [ ] No backend, no database, no accounts, no cookies, no analytics — static SPA only; `localStorage` for settings only
- [ ] All AniList calls go browser-direct to `https://graphql.anilist.co` through the shared rate limiter: max 25 req/min, 2.5 s gap, `Retry-After` backoff on 429
- [ ] Card data embedded in the exported image (PNG `tEXt`/`zTXt`) must round-trip on re-upload
- [ ] Crop tool enforces the fixed card aspect ratio — no shrink/stretch modes; over-crop overflow is a solid background color

## Before committing
- [ ] Build and lint pass: `npm ci && npm run lint && npm run build`
- [ ] No secrets/DSNs/tokens in code, tests, or logs

## PRs
- Fill the change note template fully — including **undo-how**; "can't state it" = not ready
- Pick the risk tier honestly; when in doubt round up
- Review agent findings: fix, or reply with a clear written reason **backed by evidence** (primary source, live check)

## Babysitting a PR (after you push)
- Never write your own polling/`sleep` loop — one watcher per PR: `python3 scripts/pr-wait <pr>` from the repo root (`--repo qStivi/qTopTrumps` from elsewhere). Vendored from [t3dotgg/tstack](https://github.com/t3dotgg/tstack) (MIT).
- Web UI: run it as one long-running command, it exits on its own. Harness with a monitor tool: run it under the monitor with a long timeout so each event line wakes you.
- No Greptile/Macroscope bots here, so `--until ready` never completes — use `--until green` (required checks) or `--until any-change` (wake on the reviewer's comment / any event); restart after each push or event you handle.
- Exit codes: 0 = done/merged, 1 = needs you (failed check, BEHIND/DIRTY, unresolved threads, closed), 2 = bad input or another pr-wait already owns this PR (kill that pid only if its events don't reach you).
- Act only on events newer than your latest push. All watchers share one GitHub rate limit — if GraphQL is exhausted, read via REST (`gh api repos/<o>/<r>/pulls/<n>`, `.../commits/<sha>/check-runs`).

## Round discipline
- Review capped at 3 rounds. Round 4 = stop, rethink the approach (Layer 0).
- Re-reviews: new commits only.
- Red review check = reviewer broken, not code broken — check for the pipeline-failure comment before treating it as a finding.
