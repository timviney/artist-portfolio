# Artist Portfolio Website — Vue 3 MVP

## Overview

Build a customisable, single-artist portfolio website for an **actor-musician** using Vue 3 + TypeScript, hosted statically on AWS (S3 + CloudFront), with automated deployment via GitHub Actions.

The purpose (from README): allow artists to host their own portfolio website without paying for Squarespace-style services. A technically-minded person sets up the project once (deploy infra, connect GitHub); after that, the artist customises everything themselves through a browser-based editor with **no development skills and no AWS backend**.

Customisation works via **Sveltia CMS**, a Git-based CMS served at `/admin`: the artist edits content (bio, contact info, headshots, photos, videos, theme colours/fonts) and uploads images in a web UI; changes commit directly to the GitHub repo and the CI pipeline rebuilds and redeploys the site (~1–2 min publish delay). Videos are supported by embedding YouTube/Vimeo URLs — nothing is self-hosted. A draft preview mode was designed but is **deferred to post-v1** (see Future Enhancements).

**In scope (v1):** Home with Actor/Musician headshot tiles, Actor page (hero, showreel videos, headshots carousel, portrait gallery), Musician page (hero, intro, awards, highlight/project videos, gallery), About Me, Contact (links + mailto, no form backend), theme customisation (colours/fonts via CMS), Terraform infrastructure, GitHub Actions CI/CD, documentation for both the technical setter-upper and the non-technical artist.

**Out of scope (v1):** multi-artist tenancy, contact-form backend, custom domain/Route53/ACM, blog, e-commerce, SSR/SEO-heavy rendering optimisations, draft preview mode (deferred — see Future Enhancements), and — critically — **any form of layout composition**: artists edit content and theme only; page structure is fixed in code. No section/page builders (that is Squarespace's product, not this project's). Future flexibility comes from config toggles and layout presets on fixed slots, never from free-form composition.

**agent notes** do not run playwright/e2e tests unless requested as they are slow. Always run the minimum tests/build required. **Never create SVG/placeholder image files unless the user explicitly asks.**

### Site structure (final design, locked 2026-08-22)

The artist works as both actor and musician; the site splits into two halves reached from Home.

- **Nav (all pages):** Home · About Me · Contact — Actor and Musician are deliberately **not** nav items.
- **Home (`/`):** artist name/tagline (from site settings) and two headshots side by side linking to `/actor` and `/musician`.
- **Actor (`/actor`):** fullscreen hero image → "Actor" heading with embedded videos → "Gallery" heading containing Headshots (sideways carousel) and Gallery Images (portrait grid, titles below) → link to Musician.
- **Musician (`/musician`):** fullscreen hero image → "Musician" heading + intro text → Awards (title, text, image) → Highlights (videos with descriptions) → Original Projects (videos) → Gallery (pictures with descriptions) → link back to Actor.
- **About Me (`/about`)** and **Contact (`/contact`)** as previously planned.
- Page skeletons are hardcoded in Vue; **all images and text come from CMS content**, with graceful fallbacks when fields are missing.

## Future Enhancements (post-v1)

Ordered roughly by expected value:

1. **Draft preview mode** — enable Sveltia's editorial workflow (saves become draft commits/PRs instead of direct publishes) and add a `?preview=<branch>` override in the content loaders that fetches draft files from `raw.githubusercontent.com`, falling back to bundled content. Gives the artist full-fidelity preview of unpublished text/images/colours on the real site with zero extra AWS infrastructure. Verify at build time: editorial-workflow + PAT compatibility and raw.githubusercontent CORS/rate limits.
2. **Layout toggles & presets** — config-driven section visibility ("show commissions section") and 2–3 gallery layout options. Config knobs on fixed slots; never free-form composition.
3. **Contact form backend** — API Gateway + Lambda + SES replacing the mailto link.
4. **Custom domain** — Route53 hosted zone + ACM certificate added to the existing Terraform.
5. **Multi-artist tenancy** — only if demand appears; current design deliberately excludes it. If this becomes a maintained template distributed to several artists, split content into a private per-artist repo at that point (move `content/` + uploads, add cross-repo checkout and a content-commit→deploy trigger to the workflow).

## Architecture Summary

- **App:** Vue 3 + TypeScript + Vite SPA. Dependencies kept minimal: `vue`, `vue-router`. State via composables (no Pinia needed at this scale).
- **Content:** JSON files under `content/` (settings/, pages/, actor/, musician/), edited by Sveltia CMS, imported at **build time** via `import.meta.glob`. Fully static output.
- **Images:** uploaded via CMS to `public/images/uploads/`, committed to repo, served through CloudFront.
- **Videos:** embedded YouTube/Vimeo URLs, rendered as iframes inline in the Actor/Musician sections. No video is self-hosted and the lightbox handles images only.
- **Admin:** Sveltia CMS at `public/admin/` (index.html + config.yml matching the content schema). Auth via GitHub personal access token entered once by the artist.
- **Infra:** private S3 bucket + CloudFront (Origin Access Control) defined in `infra/` with Terraform. Default `*.cloudfront.net` certificate. Deploy role via IAM OIDC trust with GitHub Actions.
- **CI/CD:** `.github/workflows/` — CI on PRs (lint, typecheck, tests), deploy on push to `main` (build, sync to S3, invalidate CloudFront).

### Proposed repository layout

```
src/                  # Vue app (components/, views/, composables/, router/, styles/)
content/              # CMS-managed content (settings/, pages/, actor/, musician/)
public/images/uploads/# CMS-uploaded media
public/admin/         # Sveltia CMS entry point + config.yml
infra/                # Terraform configuration
.github/workflows/    # CI + deploy pipelines
tests/e2e/            # Playwright specs
docs/                 # ARTIST_GUIDE.md etc.
```

## Tasks

- [x] 1. Scaffold the Vue 3 + TypeScript project
  - [x] Create Vite + Vue 3 + TS app in repo root (respect existing README/.gitignore/LICENSE)
  - [x] Add ESLint (flat config, Vue + TS plugins), Prettier, `vue-tsc` typecheck script
  - [x] Add Vitest + @vue/test-utils, wire `npm run test`; add Playwright skeleton with one trivial passing spec
  - [x] Set up directory structure (components/views/composables/router/content), base global stylesheet, vue-router with placeholder routes for all four pages
  - [x] Verify: dev server runs, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass
- [x] 2. Build the content layer
  - [x] Define TS types + loader composables for: site settings (name, tagline, social links, theme), home content, about page, contact page, artwork entries
  - [x] Load `content/**` at build time with `import.meta.glob`; provide sensible fallback defaults when files/fields are missing
  - [x] Seed `content/` with realistic example data (incl. one video artwork entry) and placeholder images
  - [x] Unit tests for loaders incl. missing-content fallback behaviour
- [x] 2b. Restructure content layer for the actor–musician design (2026-08-22 redesign)
  - [x] Replace the artworks model with actor/musician types + defaults + normalizers (home headshots, actor page + videos/headshots/gallery, musician page + awards/highlights/projects/gallery)
  - [x] Replace loaders: `useHomePage`, `useActorPage`, `useActorVideos`, `useHeadshots`, `useActorGallery`, `useMusicianPage`, `useAwards`, `useHighlights`, `useProjects`, `useMusicianGallery`
  - [x] Routes: drop `/gallery`; add `/actor` + `/musician` with placeholder views; nav placeholder shows Home/About Me/Contact; update router tests
  - [x] Reseed content with an actor–musician persona: new folder collections, reuse kept placeholder SVGs in fitting slots, delete obsolete ones (create no new images)
  - [x] Rewrite loader unit tests incl. fallback behaviour; verify lint/typecheck/test/build
- [ ] 3. Implement the theme system
  - [ ] Map theme config (palette: primary/accent/background/text; font pairing from preset list) to CSS custom properties applied at app root
  - [ ] Verify contrast/responsive behaviour across presets; unit test the theme-to-CSS-variable mapping
- [ ] 4. Build shared layout and navigation
  - [ ] Header with site name + nav links (Home, About Me, Contact only), footer with social links + copyright; active-route styling; responsive mobile menu
  - [ ] Component tests for nav rendering and mobile toggle
- [ ] 5. Build the Home view
  - [ ] Artist name + tagline from site settings; two headshot tiles side by side linking to /actor and /musician
  - [ ] Component test: renders CMS-driven headshots, handles missing images gracefully
- [ ] 6. Build the Actor view
  - [ ] Fullscreen hero image; "Actor" heading with video embeds
  - [ ] "Gallery" heading: headshots carousel (sideways prev/next, keyboard accessible) + portrait gallery grid with titles below
  - [ ] Cross-link tile/section to the Musician page
  - [ ] Component tests: sections render from content; graceful handling of missing images/videos
- [ ] 7. Build the lightbox viewer
  - [ ] Lightweight custom lightbox (no external modal library): fullscreen overlay for gallery images with prev/next and captions
  - [ ] Keyboard navigation (arrows, Esc), click-outside close, body scroll lock; image-only (videos are inline embeds)
  - [ ] Component tests: open/close, navigation, caption rendering
- [ ] 8. Build the Musician view
  - [ ] Fullscreen hero image; "Musician" heading + intro text
  - [ ] Awards section (title, text, optional image); Highlights (videos with descriptions); Original Projects (videos); Gallery (pictures with descriptions)
  - [ ] Cross-link back to the Actor page
  - [ ] Component tests for all sections
- [ ] 9. Build About Me and Contact views
  - [ ] About: portrait photo, bio paragraphs, optional statement
  - [ ] Contact: email address, `mailto:` enquiry button, social links; note in UI copy that replies go to the artist's email
  - [ ] Component tests for both views
- [ ] 10. Integrate Sveltia CMS
  - [ ] Add `public/admin/index.html` + `config.yml` whose collections/schema exactly match the content layer types (settings, pages, actor videos/headshots/gallery, musician awards/highlights/projects/gallery; media folder `public/images/uploads`)
  - [ ] Verify locally against seeded content (Sveltia local dev workflow)
  - [ ] Document GitHub fine-grained PAT setup for the artist's login
  - [ ] E2E smoke check that `/admin` serves and config parses
- [ ] 11. Define AWS infrastructure with Terraform
  - [ ] `infra/`: versioned private S3 bucket, CloudFront distribution with Origin Access Control, response-headers/caching policy, bucket policy limited to the distribution
  - [ ] IAM OIDC provider + least-privilege deploy role trusted by the GitHub repo (s3 sync + cloudfront invalidation only)
  - [ ] Outputs: bucket name, distribution ID, distribution URL
  - [ ] Validate: `terraform fmt`, `terraform validate`, and `terraform plan` (apply requires user's AWS credentials — user runs apply)
- [ ] 12. Create GitHub Actions workflows
  - [ ] `ci.yml`: lint + typecheck + unit tests (+ e2e) on pull requests
  - [ ] `deploy.yml`: on push to `main` — install, lint, test, build, assume OIDC role, sync `dist/` to S3 with correct cache headers, create CloudFront invalidation
  - [ ] Document required repo variables/secrets (AWS region, role ARN, bucket name)
- [ ] 13. Write documentation
  - [ ] Rewrite README: what it is, architecture overview, developer quickstart, one-time setup/deploy guide (Terraform apply, GitHub secrets, CMS/PAT setup)
  - [ ] Add `docs/ARTIST_GUIDE.md`: non-technical walkthrough — logging into /admin, editing each section (headshots, videos, awards, galleries), uploading images, embedding a video, changing colours/fonts, publishing expectations (1–2 min delay)
- [ ] 14. Final verification pass
  - [ ] Full suite green: lint, typecheck, unit tests, e2e, production build
  - [ ] Manual smoke checklist across all five routes (/, /actor, /musician, /about, /contact) at desktop + mobile widths, including carousel, lightbox and an embedded video
  - [ ] Confirm `npm run preview` serves the built site correctly (SPA fallback caveat noted below)

## Current Unknowns

- [ ] Unknown: editorial workflow behaviour with PAT authentication (draft branch naming, PR flow) — verify during task 9.
- [ ] Unknown: SPA client-side routing on CloudFront needs a custom error response mapping 403/404 → index.html; confirm behaviour in task 10 and document any limitations for deep links.
- [ ] Unknown: whether GitHub-hosted runners + S3 transfer costs stay within free tier for typical usage — expected yes for a portfolio-scale site; revisit if usage grows.
- [ ] Unknown: visual design direction beyond "clean, neutral, content-first" — v1 ships one tasteful default theme; artist adjusts via theme settings.

## Decisions

| Decision | Rationale |
|---|---|
| Single artist per deployment | User confirmed; avoids auth/multi-tenancy complexity; each artist deploys their own copy. |
| Git-based CMS (Sveltia) instead of a backend | User wants zero-backend ideally; Sveltia gives non-technical users a real editor UI while keeping infra to static hosting only. |
| Sveltia over Decap | Comparable schema/config model but better editor UX and no OAuth-proxy infrastructure required. |
| Sveltia auth via GitHub PAT ("Sign In with Token") | Verified against official docs: zero server-side setup; token page opens with required scopes pre-selected. Upgrade path exists (Sveltia CMS Authenticator OAuth client) if needed later. |
| S3 + CloudFront with Origin Access Control | User choice; cheap, fast, private origin; default CloudFront certificate for v1. |
| Terraform for IaC | User choice; repeatable infra in `infra/`. |
| GitHub Actions with OIDC deploy role | User choice; no long-lived AWS keys stored in GitHub. |
| Content imported at build time (static) | Site remains purely static and fast; publish delay accepted by user. |
| Vue 3 + TypeScript + Vite; vue-router only, no Pinia | User chose TS; app state is simple enough for composables — fewer dependencies. |
| Videos via YouTube/Vimeo embed URLs only | Avoids video hosting/storage entirely; matches "no backend" goal. |
| Custom lightweight lightbox | Avoids pulling a modal/UI library for one well-understood component. |
| Contact page = links + mailto in v1 | Keeps v1 backend-free; form backend (Lambda + SES) recorded as future enhancement. |
| Vitest + Vue Test Utils; Playwright for one e2e smoke spec | Standard Vue ecosystem tooling; e2e kept deliberately small. |
| CloudFront default URL in v1 | User choice; Route53/ACM added later behind existing Terraform. |
| Fixed page structure; artists edit content + theme only | Avoids rebuilding Squarespace. Layout lives in code; all customisation is data (content, colours, fonts, toggles). Future flexibility = config knobs on fixed slots, not composition. |
| Draft preview mode deferred to post-v1 | User decision: v1 ships without it. The designed approach (editorial workflow + `?preview=<branch>` fetching raw GitHub content, zero extra infra) is preserved in Future Enhancements for the follow-up session. |
| Single **public** repo holding both code and content | User wants the project visible as portfolio work. Repo content equals site content (already public); public repos get unlimited Actions minutes; the Sveltia PAT is required for writes regardless of visibility. Two-repo split still adds cross-repo checkout + deploy triggering for no v1 benefit; documented as a future migration if template-distribution ever happens. Known trade-off: post-v1 draft branches would be publicly browsable pre-publish. Never commit secrets — AWS access uses OIDC roles only. |
| Node upgraded to 24 LTS on dev machine (user-approved) | Latest stack requires it: vue-router 5 needs vite ≥7.3, and vite 7.3+/8 + jsdom 27+ require Node ≥22.12 (dev box had 22.8). CI runners already use current Node. |
| TypeScript pinned to ^6.0.x (not 7) | TS 7 is the new native compiler and removed `lib/tsc`; vue-tsc@3.3.11 cannot drive it yet (`ERR_PACKAGE_PATH_NOT_EXPORTED`). Revisit pin when a TS7-compatible vue-tsc ships. |
| ESLint 10 flat config: plugin-vue `flat/essential` + @vue/eslint-config-typescript; Prettier owns formatting | `flat/essential` avoids stylistic template rules that conflict with Prettier. Verified working combo: eslint@10.9, eslint-plugin-vue@10.10, @vue/eslint-config-typescript@14.9. |
| Latest majors adopted: vite@8, vitest@4, jsdom@30, vue-router@5, @playwright/test@1.62 | User requested latest compatible installs; full toolchain verified green on this set. Vitest config lives in separate `vitest.config.ts` sharing the `@` alias with `vite.config.ts`. |
| Content stored as JSON files (not Markdown) | Structured fields map 1:1 to Sveltia widgets and TS types; avoids adding a markdown parser dependency for v1's fixed layout. Long-form text is arrays of paragraph strings (`bioParagraphs`). |
| Content layer lives in `src/composables/content/` (types / defaults / normalize / loaders) | Keeps planned `composables/` structure; normalizers are pure functions over `unknown` so missing-file/missing-field fallbacks are unit-testable without mocking `import.meta.glob`. Loaders are non-reactive plain functions (content is static at build time). |
| Artwork slugs derived from filenames (`artworks/<slug>.json`) | Single source of truth, CMS-friendly (Sveltia uses filename as identifier); titles fall back to a prettified slug when absent. |
| Font pairing presets defined in the content type: `classic \| modern \| editorial \| playful` | Lets seed data validate against the real preset list now; task 3 maps each preset to actual font stacks/CSS variables. Unknown values fall back to `classic`. |
| Placeholder media committed as hand-made SVGs in `public/images/uploads/` | No offline source of real artwork photos; lightweight, diff-friendly, artist replaces them via the CMS upload flow. Seed contact email uses `.example` domain to avoid pointing at a real address. |
| **Redesign (2026-08-22): actor–musician dual portfolio** | User's final design: nav = Home · About Me · Contact only; Home shows two headshot tiles linking to `/actor` and `/musician`; generic Gallery route + artworks collection removed. Page skeletons stay hardcoded in Vue; all images/text come from CMS content with graceful fallbacks. |
| One Sveltia folder collection per page section (`actor/{videos,headshots,gallery}`, `musician/{awards,highlights,projects,gallery}`) | Each editable section maps to exactly one CMS collection — clearest UX for a non-technical artist; filename becomes the slug, `order` field controls display sequence. |
| Section headings live in page JSON with hardcoded code fallbacks | Structure is fixed in code but wording stays artist-editable; missing fields render sensible defaults ("Actor", "Gallery", "Awards", …). |
| Headshots = inline sideways carousel; gallery grids open an image-only lightbox | User choice. Videos are inline embeds in the new design, so the lightbox drops its planned video branch. |
| Existing placeholder SVGs partially reused; no new image files created | User instruction: reuse existing placeholders where they fit (portrait → headshots, scenic images → heroes/galleries), delete the rest, and never create SVGs unless explicitly asked. Seed content ships with some slots intentionally empty to exercise graceful-missing behaviour. |

## Progress Log

| Date | Event |
|---|---|
| 2026-08-22 | Plan created. |
| 2026-08-22 | Verified Sveltia CMS auth via official docs (PAT sign-in, no OAuth server needed); resolved auth unknown. |
| 2026-08-22 | Added draft preview mode (editorial workflow + `?preview=<branch>`) after scope discussion; recorded target user (single artist, "Max"). |
| 2026-08-22 | Deferred draft preview mode to post-v1 per user decision; moved to new Future Enhancements section. |
| 2026-08-22 | Decided single private repo for code + content; two-repo split recorded as future migration path. |
| 2026-08-22 | Flipped to single **public** repo per user preference (portfolio visibility); trade-offs recorded. |
| 2026-08-22 | Task 1 complete. Scaffolded Vite + Vue 3 + TS app in repo root: ESLint 10 flat config + Prettier + vue-tsc typecheck; Vitest 4 (jsdom) with router unit tests; Playwright skeleton with 2 passing e2e specs; vue-router 5 with placeholder routes for Home/Gallery/About/Contact; base stylesheet + planned directory structure (`src/components`, `src/composables`, `content/*`, `public/images/uploads`). User approved Node upgrade to 24.19 LTS during install resolution; TS pinned to ^6.0.3 (vue-tsc lacks TS7 support). All verification green: dev server HTTP 200, lint, typecheck, unit tests (2 passed), e2e (2 passed), production build. |
| 2026-08-22 | Task 2 complete. Built content layer in `src/composables/content/`: TS types for settings/theme/pages/artworks, pure normalizers with per-field fallback defaults, and eager `import.meta.glob('/content/**/*.json')` loaders (`useSiteSettings`, `useTheme`, `useHomePage`, `useAboutPage`, `useContactPage`, `useArtworks` sorted by `order`, `useArtwork(slug)`). Seeded fictional artist "Max Rivera": site/theme/home/about/contact JSON + 6 artworks incl. one YouTube video entry; 8 SVG placeholder images in `public/images/uploads/`. 26 new unit tests cover normalizer fallbacks and seeded-content loading through the real glob path. Verification green: lint, typecheck, unit tests (28 passed), production build. Note: content module is tree-shaken out of the current bundle because no view consumes it yet — views wire up in tasks 5–8; glob inlining is verified by the Vitest run which uses the same Vite transform pipeline. |
| 2026-08-22 | Design locked with user (Q&A): actor–musician dual portfolio. Nav = Home/About Me/Contact only; Home = two headshot tiles → `/actor` + `/musician`; Actor page = hero, videos, headshots carousel, portrait gallery; Musician page = hero, intro, awards, highlights, original projects, gallery; cross-links between both. Generic Gallery route + artworks collection removed; lightbox becomes image-only (videos inline); headshot carousel stays inline. Plan restructured: task 2b added, tasks 4–14 rewritten/renumbered, Overview gained a "Site structure" section, 5 new decisions recorded. |
| 2026-08-22 | Task 2b complete (user approved immediate implementation). Content layer rebuilt for the new design: types/defaults/normalizers/loaders for `useHomePage` (headshot slots), `useActorPage`, `useActorVideos`, `useHeadshots`, `useActorGallery`, `useMusicianPage`, `useAwards`, `useHighlights`, `useProjects`, `useMusicianGallery`; shared generic `loadEntries(dir, normalize)` sorts by explicit `order`. Router: `/gallery` removed, `/actor` + `/musician` added with placeholder views; nav placeholder = Home/About Me/Contact; e2e spec updated to match (not run). Content reseeded as an actor-musician persona across 7 new folder collections (14 entry files); placeholder SVGs reused where they fit (portrait → headshots, scenic → heroes/galleries), `artwork-studio-process.svg` deleted, no new images created. 36 content tests + router tests green. Verification: lint ✓, typecheck ✓, unit tests 38 passed, production build ✓ (all five view chunks emitted). |
