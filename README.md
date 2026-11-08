# qTopTrumps

Generate **Top Trumps-style cards of anime characters** from any AniList list — pick a
character, and the app builds a fixed-template card (image, description, attributes).
Export the finished card as an image with the card data **embedded in the image itself**,
so it can be re-uploaded later to continue editing.

- **Stack:** Vite + React + TypeScript, CSS modules — static SPA, no backend, no
  database, no accounts. Everything runs in the browser; AniList's public GraphQL API
  is called directly from the client (rate-limited). Settings persist in
  `localStorage` only.
- **Spec:** [docs/top-trumps-spec.md](docs/top-trumps-spec.md)
- **Review pipeline:** every non-draft PR is reviewed by a fenced vibe-cli session on a
  self-hosted runner — see [qStivi/review-pipeline](https://github.com/qStivi/review-pipeline).
  Repo-specific review criteria: [REVIEW.md](REVIEW.md), [CRITICAL_PATHS.md](CRITICAL_PATHS.md).

## Develop

```bash
npm ci
npm run dev      # vite dev server
npm run lint     # oxlint
npm run build    # tsc -b && vite build
```

## Deploy

Pushes to `main` deploy automatically (`.github/workflows/deploy.yml`) to the homelab
CT 149 `qtoptrumps` via the self-hosted runner, served at
[https://qtoptrumps.qstivi.com](https://qtoptrumps.qstivi.com) (Cloudflare Tunnel) and
`qtoptrumps.lab.qstivi.com` on the LAN.

<!-- pipeline verification marker -->
