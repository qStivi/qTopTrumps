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

## Round discipline
- Review capped at 3 rounds. Round 4 = stop, rethink the approach (Layer 0).
- Re-reviews: new commits only.
- Red review check = reviewer broken, not code broken — check for the pipeline-failure comment before treating it as a finding.
