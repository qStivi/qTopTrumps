# REVIEW.md — what failure looks like in this repo

For the review agent: this tells you what actually matters here, so you don't burn rounds on what doesn't. Review against these failure modes first; generic style feedback is noise unless it hides one of them.

## Failure modes (priority order)

1. **Embedded card data doesn't round-trip** — the exported image re-uploaded later loses character name, anime, attribute values, or trump flags. The PNG `tEXt`/`zTXt` write/read path is broken, the wrong chunk type is used, or the image gets re-encoded lossily after embedding.
2. **Export format strips metadata** — the download flow offers a format that doesn't preserve text chunks (e.g. plain JPEG/WebP). Only metadata-preserving formats may be offered.
3. **AniList rate limiter violated** — more than 25 req/min, no 2.5 s gap between paginated requests, or no `Retry-After` backoff on 429 → IP throttling for everyone using the app.
4. **Scope breach into backend/persistence** — any server state, database, account, cookie, or analytics code. Hard constraint from the spec: browser-only, `localStorage` for settings only, no backend at all.
5. **Fixed card aspect ratio broken** — crop tool allows "shrink to fit"/"stretch to fit", or the ratio math drifts; crop must enforce the card ratio exactly, filling over-crop overflow with a solid background color (no transparency).
6. **Secrets in code** — AniList public GraphQL needs no key; any token/API key committed anywhere is a Security finding.
7. **Deploy/CI drift** — a change to `.github/workflows/*` that lets PR-triggered jobs reach the self-hosted runner on a public repo, or the served `dist/` on CT 149 diverging from `main`.

## Universal rules (keep verbatim)

### Clearing a finding requires evidence
A false positive is closed with a *written reason backed by a primary source* — the actual merged file, a live command, the CLI's own reference. "I'm confident it's fine" is not a clear. If you cannot cite the evidence, treat the finding as real.

### Non-findings (do not flag)
- Styling, naming, or structural preferences not tied to a failure mode above.
- Missing features — that's the roadmap, not a review finding.
- Choices already recorded in the repo's decision log (DECISIONS.md/ADR, if present).
