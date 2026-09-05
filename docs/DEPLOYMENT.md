# Deployment setup

This repo deploys automatically via GitHub Actions. Two workflows are included:

- **`.github/workflows/ci.yml`** — runs on pull requests: lint, typecheck, unit
  tests, and Playwright e2e.
- **`.github/workflows/deploy.yml`** — runs on every push to `main`: installs,
  lints, tests, builds, syncs `dist/` to S3 and invalidates CloudFront.

No long-lived AWS credentials are stored in GitHub. The deploy workflow assumes
an IAM role via GitHub's OpenID Connect (OIDC) provider, both of which are
defined in `infra/` (see `infra/iam.tf`).

## One-time setup

1. **Apply the Terraform infrastructure** (once, with an AWS account that can
   create the resources):

   ```sh
   cd infra
   terraform init
   terraform apply
   ```

   `terraform apply` creates the S3 bucket, CloudFront distribution, the OIDC
   provider and a least-privilege deploy role. It prints the values you need for
   the next step.

   The same apply also provisions the custom domain (`maxpavlovsky.com`): a
   Route53 hosted zone, an ACM TLS certificate (requested in `us-east-1`, as
   CloudFront requires), and A/AAAA alias records for the apex and `www`.
   Because the certificate only validates once the domain publicly resolves to
   Route53, apply this in two stages:

   ```sh
   terraform apply -target=aws_route53_zone.site   # create the zone first
   terraform output name_servers                   # copy these four values
   ```

   Set those four nameservers at your registrar (Spaceship), wait for
   delegation to propagate, then run `terraform apply` to finish (certificate
   validation, CloudFront aliases and DNS records). `www` redirects to the apex
   automatically via the distribution's viewer-request edge function.

2. **Add the deploy outputs as repository variables.** In the GitHub repo, open
   **Settings → Secrets and variables → Actions → Variables** and add:

   | Name | Value | Source |
   | --- | --- | --- |
   | `AWS_REGION` | e.g. `eu-north-1` | `infra/variables.tf` (`aws_region`, default `eu-north-1`) |
   | `AWS_ROLE_ARN` | `arn:aws:iam::…:role/artist-portfolio-deploy` | `terraform output deploy_role_arn` |
   | `S3_BUCKET_NAME` | `artist-portfolio-site-<account-id>` | `terraform output bucket_name` |
   | `CLOUDFRONT_DISTRIBUTION_ID` | e.g. `E1234ABCDEFGH` | `terraform output distribution_id` |

   These are non-secret values, so plain repository **variables** are the right
   place (no AWS secret keys are involved). You can view them any time with
   `terraform output`.

   The deploy role's trust policy only allows `repo:timviney/artist-portfolio`
   on the `main` branch to assume it, so a workflow running anywhere else cannot
   touch AWS.

3. **Push to `main`** (or make a change through the CMS and publish). The
   `Deploy` workflow builds and publishes the site. The public URL is
   `https://maxpavlovsky.com` (or `terraform output distribution_url` for the
   raw CloudFront domain).

## How the deploy works

- **Credentials:** `aws-actions/configure-aws-credentials` exchanges the
  workflow's OIDC token for temporary credentials against the deploy role.
- **S3 sync:** two passes over `dist/`:
  - hashed files under `assets/` get `public, max-age=31536000, immutable`
    (they change filename on every build, so they can be cached forever);
  - everything else (`index.html`, images, PDFs, `/admin/`) gets
    `public, max-age=0, must-revalidate` so content edits are never served stale.
- **Cache invalidation:** `aws cloudfront create-invalidation --paths "/*"`
  purges the edge cache so a publish is visible immediately rather than after
  CloudFront's default TTL.

## Cache-heading note

The conservative choice — long cache for hashed assets only, no-cache for
everything else — prioritises correctness for a content-edited site (the artist
changes text/photos often) over edge-cache efficiency. Images could later be
moved to a longer TTL once filenames are guaranteed immutable.
