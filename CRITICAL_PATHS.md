# Critical paths — changes here are high risk

A change touching any path below requires: author's read-through **plus** one independent review, per the tier table. The tier workflow (`.github/workflows/tier.yml`) applies the `high risk` label automatically when a diff matches its pattern list — **keep the two in sync**: paths live in CRITICAL_PATHS.md for humans, patterns in tier.yml for the machine.

## Paths

- `.github/workflows/*` — CI/deploy/review run with repo secrets and a live self-hosted runner on a public repo
- `src/*` — the whole app is small; every source file is effectively critical (AniList client, rate limiter, crop tool, PNG metadata embed/extract, card rendering)
- `package.json` / `package-lock.json` — dependency changes (supply-chain surface; Dependabot auto-merge covers patch/minor only)
- `tsconfig*.json` — type-checking gates the build
- `vite.config.ts` — build output shape (must stay a static SPA build)
- `.oxlintrc.json` — lint gate config
- `docs/top-trumps-spec.md` — the spec the reviewer judges against; spec changes silently change the review criteria

## Host-side critical paths (this repo deploys to the homelab)

- **CT 149 `qtoptrumps`** (192.168.129.x, DHCP; `qtoptrumps.lab.qstivi.com`) — the app host: `/opt/qtoptrumps-prod` working copy, PM2 (`qtoptrumps-prod`, serve on :3000), cloudflared systemd service
- **Cloudflare Tunnel `qtoptrumps`** — public ingress `https://qtoptrumps.qstivi.com` → `http://localhost:3000` on CT 149; DNS CNAME in zone qstivi.com
- **Self-hosted runner `qtoptrumps-ct149`** at `/opt/actions-runner-qtoptrumps` on CT 149 (labels `self-hosted,qtoptrumps`) — deploy + review jobs run here
- **Review fence** `/opt/review-agent/` on CT 149 (vibe-home config + review.env) — the read-only boundary the review agent runs under
