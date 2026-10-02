# Architecture City Template

A reusable static Three.js template that turns the **public-safe structure of the repository containing it** into a navigable 3D city. Systems become districts, files become towers, and path-derived relationships become illuminated routes.

This repository is the template's own working example. It is not linked to ASYMMETRY, does not need a database or API, and does not inspect any other repository by default.

## What is included

- A no-dependency Node scanner (`scripts/generate-city-map.mjs`)
- Configurable directory-to-district rules (`architecture-city.config.json`)
- A browser-only Three.js city viewer with desktop hover/tap inspection
- A GitHub Actions workflow that regenerates the map on each push to `main` and deploys GitHub Pages
- A Dockerfile and Caddy configuration for optional Railway or other container-based static hosts
- A validator and HTTP smoke test

## Start here

1. Click **Use this template** on GitHub to make a repository for the project you want to visualize.
2. Edit `architecture-city.config.json`:
   - `projectName` is the visible project label.
   - `publicRepository` is the public repository name shown in the viewer.
   - `groups` maps path prefixes to city districts.
   - `excludeDirectories` keeps generated and dependency folders out of the public map.
3. Commit and push to `main`.
4. In GitHub repository settings, enable **Pages → GitHub Actions**. The included workflow scans the checkout, validates the public-safe graph, commits refreshed map JSON when needed, and deploys it.

The template visualizes its own source until you add it to another project or replace the surrounding code with your project. No separate Railway service is needed for GitHub Pages.

## What is public

The generator emits file paths, filenames, byte/line counts, directory membership, selected source symbol names, and Markdown headings. It never emits file contents. It also omits paths, symbols, headings, and edges whose names match the protected-name policy (for example secrets, credentials, tokens, private keys, cryptographic primitives, and environment files).

That filter is a cautious publishing boundary, not a security review. Do not put private repositories or sensitive information into a public template without independently reviewing the generated JSON.

## Local verification

From the repository root:

```bash
node scripts/generate-city-map.mjs
node scripts/validate-city-map.mjs
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. For the production static-server path, use Caddy or the included Dockerfile, then run:

```bash
./scripts/smoke.sh http://127.0.0.1:8080
```

## Optional Railway deployment

Railway is simply an alternate static host. Create one service from this GitHub repository, leave the root directory as `.`, enable public networking, and use `/health` as the health check. The supplied Dockerfile serves the same committed static viewer and generated JSON; it needs no environment variables or database. See [TEMPLATE.md](TEMPLATE.md).

## Files you will edit most

| Path | Purpose |
| --- | --- |
| `architecture-city.config.json` | Project name, attribution, safe directory exclusions, district rules |
| `index.html` | Viewer, colors, lighting, labels, interactions |
| `scripts/generate-city-map.mjs` | Public-safe source scanner and graph writer |
| `.github/workflows/deploy.yml` | Generate, validate, commit city data, deploy GitHub Pages |
| `TEMPLATE.md` | Hosting guidance for template users |

## Current boundaries

- The template is static and read-only. It does not show live production traffic, runtime telemetry, or private source contents.
- A push triggers a new snapshot. It is not a live connection to a running application.
- GitHub Pages and Railway can host the same files independently.
