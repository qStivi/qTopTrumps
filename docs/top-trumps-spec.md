# Top Trumps Card Generator (Anime Characters) — Spec

> **Status: FINAL v1.0.** All open questions from the draft have been resolved; see
> section 6 for the decisions.
>
> Scope note: this tool lives in its own repository (**qTopTrumps**), alongside the
> existing AniList projects (qanimetierlist, qanimeranker), and reuses their AniList
> fetching knowledge and tech stack.

## 1. Vision

A small, local, snappy web app for generating **Top Trumps-style cards of anime
characters**. Pick a character from your own (or anyone's) AniList list — or via search —
and the app builds a fixed-template card: character image on top, description, and a set
of attributes. The finished card downloads as an image with the card data embedded in the
image itself, so the image can be re-uploaded later to continue editing.

**Hard constraints:**

- No backend, no database, no accounts. The server (if any) only serves static files and
  saves nothing. Everything runs in the browser.
- Persistence is `localStorage` only (settings) plus the exported image files themselves.
- Must feel **fast and snappy**; simple animations only, in service of fun, never at the
  cost of responsiveness.

## 2. V1 Scope — Anime Top Trumps

### 2.1 Getting a character (AniList)

Both sources are in V1:

- **List browsing:** enter an AniList username and show characters from that user's
  list. No mandatory filters; optional filters (e.g. only **Completed** anime, minimum
  score) may be added if they fit naturally, sorted by the viewer's own score by default.
- **Search:** a search bar querying AniList for any character matching the input,
  matched against **name** and **description** (any keyword).

For each chosen character, AniList provides: name, anime name(s), description, and the
**largest available image** (used as the default card image).

Optional side buttons: **Google** and **DuckDuckGo** search for "character name + anime
name", opening the search engine's results page. Include only if they fit the layout
naturally.

### 2.2 Card template (fixed)

- Fixed card **aspect ratio**; the crop tool enforces it. No "shrink to fit" / "stretch
  to fit" modes.
- Fixed set of six attributes:
  **Power, Age, Height, Weight, Bust Size, Cuteness**.
- Character **description** displayed on the card so info can be extracted into attributes.

### 2.3 Image handling

- Default image: the character's largest image from AniList.
- Custom image upload as a replacement.
- **Crop tool:**
  - Fixed aspect ratio matching the card.
  - Can crop larger than the source image, filling the overflow with a **chosen
    background color** (no transparency option).
  - **Snapping** to image center and edges; must feel good to use.
  - Default pre-processing on upload: automatic **crop-to-fill**; user adjusts with the
    crop tool if the result is bad.

### 2.4 Attributes & "Trump" marking

- Settings (persisted in `localStorage`): for each attribute, the **max value** that
  counts as a trump (e.g. Cuteness = 10 ⇒ any card with Cuteness 10 is marked).
- **Manual trump marking:** any attribute can be manually flagged as a trump; a card can
  have **multiple** trump values.
- Trump visual: plain text — a `*` is appended to the trumped attribute's value on the
  card (e.g. `10*`). No icons or special graphics.

### 2.5 Export / save

- A **Save/Download button** produces the finished card as a digital image file.
- **Card data is embedded into the image** (the most important feature), ComfyUI-style:
  a small payload — a few key-value entries, not necessarily full JSON. Fields: character
  name, anime name, each attribute value + trump flags. The image pixels themselves carry
  no special payload requirement.
- Embedding mechanism: image metadata chosen so a few lines of key-value data round-trip
  reliably. **PNG (`tEXt`/`zTXt` chunks) is the guaranteed format.** JPEG (comment/EXIF
  segment) and WebP (EXIF chunk) are additionally supported at download time if the
  implementation cost stays low; PNG is the reference format for re-upload.
- **Re-upload flow:** uploading a previously exported card image restores the full card
  state into the editor for modification.

### 2.6 Theming

- **Catppuccin Mocha**, consistent with the look of the existing tools (qanimetierlist,
  qanimeranker).
- Simple, snappy animations while creating cards.

## 3. Architecture (inherited from qanimetierlist)

- Static single-page app: **Vite + React + TypeScript**, CSS modules, no server
  component. All AniList calls go directly from the browser to `https://graphql.anilist.co`
  (public, CORS-enabled, unauthenticated for public read data).
- Reuse the existing AniList client patterns: paginated `MediaListCollection` fetching,
  client-side rate limiter (25 req/min, 2.5s gap, `Retry-After` backoff on 429).
- `localStorage` for settings only. No cookies, no analytics, no tracking.
- Card rendering to image: client-side (canvas). Embedding: PNG `tEXt`/`zTXt` chunks (or
  equivalent) written/read in the browser.

## 4. Development workflow

- Every non-draft PR is reviewed by the [review-pipeline](https://github.com/qStivi/review-pipeline)
  workflow: a fresh vibe-cli session reviews the PR on a self-hosted runner, behind a
  read-only tool fence.
- Adopt it into this repo with `install.sh`, then author the per-repo review assets (the
  parts that can't be templated): `REVIEW.md` (this repo's failure modes),
  `CRITICAL_PATHS.md` (high-risk paths), and `AGENTS.md` (repo invariants checklist).
- Runner-side setup (fence, `review.env`, runner registration) is done once per host /
  GitHub account; this repo only needs its own runner registration.

## 5. Roadmap (beyond V1)

- **V2 — General Top Trumps tool:** preset/uploadable card templates & themes; rename,
  add, remove attributes (up to ~6–7); custom icons per attribute from an open-source
  icon library plus custom icon uploads (with the same crop tool).
- **V3 — Print compliance:** optional card backside(s) for printing, CMYK profiles, PDF
  export (print-shop standard), optionally via a cheap business-card printer.
- **V4 (maybe) — General playing-card designer:** expand custom templates into full
  custom card games (own Magic/Pokémon/YGO-style cards). Still designer-only, no database.

## 6. Resolved decisions (from draft v0.2 open questions)

1. **Attributes (6):** Power, Age, Height, Weight, Bust Size, Cuteness.
2. **Character sourcing:** both AniList list browsing and free-text search; no mandatory
   list filters in V1.
3. **Trump marker:** plain `*` appended to the trumped value text; no icon/animation.
4. **Theme:** Catppuccin Mocha.
5. **Export formats:** PNG guaranteed (tEXt/zTXt); JPEG and WebP additionally if cheap.
6. **Defaults:** over-crop overflow background defaults to a Catppuccin Mocha base color;
   default trump-max is 10 per attribute, editable in settings (persisted in
   `localStorage`).
