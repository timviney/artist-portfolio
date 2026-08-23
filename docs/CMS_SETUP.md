# Content editing setup (Sveltia CMS)

The site's content — text, photos, videos, theme — is edited in a browser-based
CMS served at `/admin` (for example `https://your-site.example/admin/`). It is
built with [Sveltia CMS](https://github.com/sveltia/sveltia-cms), which commits
changes straight to this GitHub repository; the deploy pipeline then rebuilds
and publishes the site (expect roughly a 1–2 minute delay before edits appear).

There is no server and no database: everything lives in this repo.

## One-time setup: create a GitHub token

The CMS signs you in with a **GitHub fine-grained personal access token** that
you create once and paste into the login screen. Sveltia stores it in your
browser only — it never leaves your machine except when talking to GitHub.

1. Go to <https://github.com/settings/personal-access-tokens/new>.
2. **Token name:** something like `Portfolio website editor`.
3. **Expiration:** pick the longest available (e.g. 1 year). You will need to
   create a new one when it expires.
4. **Repository access:** *Only select repositories* → choose this repository.
5. **Permissions → Repository permissions → Contents:** *Read and write*
   (Metadata is granted automatically alongside it).
6. **Generate token** and copy the value (starts with `github_pat_…`).
7. Open `/admin/`, choose the option to sign in **with a token**, paste it, done.

Keep the token private like a password: anyone holding it can edit the site.

## Everyday use

- Log in at `/admin/`, pick a section from the sidebar, edit, press **Save**,
  then **Publish**. Publishing pushes a commit to `main`; CI redeploys.
- Photos are uploaded through any image field and stored under
  `public/images/uploads/` in the repo (served from `/images/uploads/…`).
- Videos are not uploaded — paste a YouTube or Vimeo page link into a video
  field; the site embeds it for you.

## What each section edits

| Sidebar section | Where it appears on the site |
| --- | --- |
| Settings · Site settings | Artist name, tagline, social links (header/footer/contact) |
| Settings · Theme | Colour/font preset ("chocolate truffle" today) |
| Pages · Home | The two headshot tiles linking to Actor/Musician |
| Pages · About Me / Contact | Those pages' titles, portrait, bio, email, phone, note |
| Pages · Actor page / Musician page | Hero images, section titles, intro & awards text/photos |
| Actor · Showreel videos / Headshots / Production gallery | The Actor page sections |
| Musician · Highlights / Original projects / Gallery | The Musician page sections |

Every list has a **Display order** number — lower numbers come first.

## Editing locally (optional)

While developing on your own machine you can point Sveltia at a local checkout
instead of GitHub: build and serve the site (`npm run build && npm run preview`),
open `http://localhost:4173/admin/`, and use Sveltia's local-repository option
(Chromium browsers) to select this project folder. Changes stay on disk as
ordinary file edits — commit them yourself when happy.

## Troubleshooting

- **401/403 after saving** — the token expired or lacks *Contents: Read and
  write*. Create a fresh one (steps above) and sign in again.
- **Edits not appearing live** — check the Actions tab of the repo; deploys run
  on every push to `main` and take 1–2 minutes.
- **Wrong repo / branch errors** — `public/admin/config.yml` points at
  `timviney/artist-portfolio` branch `main`; update it if the repo moves.
