# Artist Portfolio Website — Vue 3 MVP

## Overview

Build a customisable, single-artist portfolio website using Vue 3 + TypeScript, hosted statically on AWS (S3 + CloudFront), with automated deployment via GitHub Actions.

The purpose (from README): allow artists to host their own portfolio website without paying for Squarespace-style services. A technically-minded person sets up the project once (deploy infra, connect GitHub); after that, the artist customises everything themselves through a browser-based editor with **no development skills and no AWS backend**.

Customisation works via **Sveltia CMS**, a Git-based CMS served at `/admin`: the artist edits content (artworks, bio, contact info, theme colours/fonts) and uploads images in a web UI; changes commit directly to the GitHub repo and the CI pipeline rebuilds and redeploys the site (~1–2 min publish delay). Videos are supported by embedding YouTube/Vimeo URLs — nothing is self-hosted. A draft preview mode was designed but is **deferred to post-v1** (see Future Enhancements).

**In scope (v1):** Home/hero, Gallery (filterable, lightbox, video embeds), About, Contact (links + mailto, no form backend), theme customisation (colours/fonts via CMS), Terraform infrastructure, GitHub Actions CI/CD, documentation for both the technical setter-upper and the non-technical artist.

**Out of scope (v1):** multi-artist tenancy, contact-form backend, custom domain/Route53/ACM, blog, e-commerce, SSR/SEO-heavy rendering optimisations, draft preview mode (deferred — see Future Enhancements), and — critically — **any form of layout composition**: artists edit content and theme only; page structure is fixed in code. No section/page builders (that is Squarespace's product, not this project's). Future flexibility comes from config toggles and layout presets on fixed slots, never from free-form composition.

## Future Enhancements (post-v1)

Ordered roughly by expected value:

1. **Draft preview mode** — enable Sveltia's editorial workflow (saves become draft commits/PRs instead of direct publishes) and add a `?preview=<branch>` override in the content loaders that fetches draft files from `raw.githubusercontent.com`, falling back to bundled content. Gives the artist full-fidelity preview of unpublished text/images/colours on the real site with zero extra AWS infrastructure. Verify at build time: editorial-workflow + PAT compatibility and raw.githubusercontent CORS/rate limits.
2. **Layout toggles & presets** — config-driven section visibility ("show commissions section") and 2–3 gallery layout options. Config knobs on fixed slots; never free-form composition.
3. **Contact form backend** — API Gateway + Lambda + SES replacing the mailto link.
4. **Custom domain** — Route53 hosted zone + ACM certificate added to the existing Terraform.
5. **Multi-artist tenancy** — only if demand appears; current design deliberately excludes it. If this becomes a maintained template distributed to several artists, split content into a private per-artist repo at that point (move `content/` + uploads, add cross-repo checkout and a content-commit→deploy trigger to the workflow).

## Architecture Summary

- **App:** Vue 3 + TypeScript + Vite SPA. Dependencies kept minimal: `vue`, `vue-router`. State via composables (no Pinia needed at this scale).
- **Content:** Markdown/JSON files under `content/`, edited by Sveltia CMS, imported at **build time** via `import.meta.glob`. Fully static output.
- **Images:** uploaded via CMS to `public/images/uploads/`, committed to repo, served through CloudFront.
- **Videos:** artwork entries have an optional `videoUrl` (YouTube/Vimeo); rendered as iframe embed in the lightbox. Poster/thumbnail image required alongside.
- **Admin:** Sveltia CMS at `public/admin/` (index.html + config.yml matching the content schema). Auth via GitHub personal access token entered once by the artist.
- **Infra:** private S3 bucket + CloudFront (Origin Access Control) defined in `infra/` with Terraform. Default `*.cloudfront.net` certificate. Deploy role via IAM OIDC trust with GitHub Actions.
- **CI/CD:** `.github/workflows/` — CI on PRs (lint, typecheck, tests), deploy on push to `main` (build, sync to S3, invalidate CloudFront).

### Proposed repository layout

```
src/                  # Vue app (components/, views/, composables/, router/, styles/)
content/              # CMS-managed content (settings/, pages/, artworks/)
public/images/uploads/# CMS-uploaded media
public/admin/         # Sveltia CMS entry point + config.yml
infra/                # Terraform configuration
.github/workflows/    # CI + deploy pipelines
tests/e2e/            # Playwright specs
docs/                 # ARTIST_GUIDE.md etc.
```

## Tasks

- [ ] 1. Scaffold the Vue 3 + TypeScript project
  - [ ] Create Vite + Vue 3 + TS app in repo root (respect existing README/.gitignore/LICENSE)
  - [ ] Add ESLint (flat config, Vue + TS plugins), Prettier, `vue-tsc` typecheck script
  - [ ] Add Vitest + @vue/test-utils, wire `npm run test`; add Playwright skeleton with one trivial passing spec
  - [ ] Set up directory structure (components/views/composables/router/content), base global stylesheet, vue-router with placeholder routes for all four pages
  - [ ] Verify: dev server runs, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass
- [ ] 2. Build the content layer
  - [ ] Define TS types + loader composables for: site settings (name, tagline, social links, theme), home content, about page, contact page, artwork entries
  - [ ] Load `content/**` at build time with `import.meta.glob`; provide sensible fallback defaults when files/fields are missing
  - [ ] Seed `content/` with realistic example data (incl. one video artwork entry) and placeholder images
  - [ ] Unit tests for loaders incl. missing-content fallback behaviour
- [ ] 3. Implement the theme system
  - [ ] Map theme config (palette: primary/accent/background/text; font pairing from preset list) to CSS custom properties applied at app root
  - [ ] Verify contrast/responsive behaviour across presets; unit test the theme-to-CSS-variable mapping
- [ ] 4. Build shared layout and navigation
  - [ ] Header with site name + nav links, footer with social links + copyright; active-route styling; responsive mobile menu
  - [ ] Component tests for nav rendering and mobile toggle
- [ ] 5. Build the Home view
  - [ ] Hero section: featured image/artwork, artist name, tagline, CTAs to Gallery and Contact
  - [ ] Component test: renders CMS-driven fields, handles empty featured image gracefully
- [ ] 6. Build the Gallery view
  - [ ] Responsive grid of artworks from content collection, category filter chips derived from artwork categories
  - [ ] ArtworkCard component (image, title, meta) with graceful handling of missing images
  - [ ] Component tests: grid rendering, filtering logic
- [ ] 7. Build the lightbox viewer
  - [ ] Lightweight custom lightbox (no external modal library): fullscreen overlay, image display, captions/details
  - [ ] Keyboard navigation (arrows, Esc), click-outside close, body scroll lock
  - [ ] Video support: when artwork has `videoUrl` (YouTube/Vimeo), render privacy-enhanced iframe embed instead of image
  - [ ] Component tests: open/close, navigation, video-vs-image branch
- [ ] 8. Build About and Contact views
  - [ ] About: portrait photo, bio paragraphs, optional statement
  - [ ] Contact: email address, `mailto:` enquiry button, social links; note in UI copy that replies go to the artist's email
  - [ ] Component tests for both views
- [ ] 9. Integrate Sveltia CMS
  - [ ] Add `public/admin/index.html` + `config.yml` whose collections/schema exactly match the content layer types (settings, pages, artworks; media folder `public/images/uploads`)
  - [ ] Verify locally against seeded content (Sveltia local dev workflow)
  - [ ] Document GitHub fine-grained PAT setup for the artist's login
  - [ ] E2E smoke check that `/admin` serves and config parses
- [ ] 10. Define AWS infrastructure with Terraform
  - [ ] `infra/`: versioned private S3 bucket, CloudFront distribution with Origin Access Control, response-headers/caching policy, bucket policy limited to the distribution
  - [ ] IAM OIDC provider + least-privilege deploy role trusted by the GitHub repo (s3 sync + cloudfront invalidation only)
  - [ ] Outputs: bucket name, distribution ID, distribution URL
  - [ ] Validate: `terraform fmt`, `terraform validate`, and `terraform plan` (apply requires user's AWS credentials — user runs apply)
- [ ] 11. Create GitHub Actions workflows
  - [ ] `ci.yml`: lint + typecheck + unit tests (+ e2e) on pull requests
  - [ ] `deploy.yml`: on push to `main` — install, lint, test, build, assume OIDC role, sync `dist/` to S3 with correct cache headers, create CloudFront invalidation
  - [ ] Document required repo variables/secrets (AWS region, role ARN, bucket name)
- [ ] 12. Write documentation
  - [ ] Rewrite README: what it is, architecture overview, developer quickstart, one-time setup/deploy guide (Terraform apply, GitHub secrets, CMS/PAT setup)
  - [ ] Add `docs/ARTIST_GUIDE.md`: non-technical walkthrough — logging into /admin, adding/editing artworks, uploading images, embedding a video, changing colours/fonts, publishing expectations (1–2 min delay)
- [ ] 13. Final verification pass
  - [ ] Full suite green: lint, typecheck, unit tests, e2e, production build
  - [ ] Manual smoke checklist across all four routes at desktop + mobile widths, including a video-artwork lightbox session
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

## Progress Log

| Date | Event |
|---|---|
| 2026-08-22 | Plan created. |
| 2026-08-22 | Verified Sveltia CMS auth via official docs (PAT sign-in, no OAuth server needed); resolved auth unknown. |
| 2026-08-22 | Added draft preview mode (editorial workflow + `?preview=<branch>`) after scope discussion; recorded target user (single artist, "Max"). |
| 2026-08-22 | Deferred draft preview mode to post-v1 per user decision; moved to new Future Enhancements section. |
| 2026-08-22 | Decided single private repo for code + content; two-repo split recorded as future migration path. |
| 2026-08-22 | Flipped to single **public** repo per user preference (portfolio visibility); trade-offs recorded. |
