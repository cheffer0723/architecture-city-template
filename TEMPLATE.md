# Deploy and Host Architecture City with Railway

Architecture City is a browser-based 3D map of a software repository: systems become districts, files become towers, and evidence-labelled relationships become illuminated traces. This template deploys a static Caddy service that serves the viewer and a committed sample graph with **no environment variables and no API keys**.

## About Hosting Architecture City

Hosting this template means running a single Railway service from the GitHub repository root. Railway builds the included Dockerfile, starts Caddy on the injected `PORT`, health-checks `/health`, and serves `index.html` plus the architecture JSON over public HTTPS. WebGL rendering happens in the visitor's browser; Railway only delivers static assets (HTML, vendored Three.js, and graph JSON). There is no database, worker, or secret panel required for a working deploy.

## Common Use Cases

- One-click public demo of a repository-derived architecture city
- Share a read-only 3D orientation surface without publishing source file contents
- Replace the sample JSON with your own safety-filtered architecture graph
- Keep GitHub Pages and Railway as independent static hosts of the same viewer
- Start from zero config, then iterate branding and graph fidelity later

## Dependencies for Architecture City Hosting

- Public GitHub source: `cheffer0723/asymmetry-city` (repository root)
- Caddy 2 static file server (Dockerfile)
- Vendored Three.js `0.179.1` (no CDN at runtime)
- Sample graphs: `architecture-city-summary.json` (fast first paint) and `architecture-map.json` (full detail on demand)
- A WebGL-capable desktop or mobile browser for visitors

### Deployment Dependencies

- Railway public HTTP networking on the service
- Healthcheck path `/health` (returns plain `ok`)
- No required variables — deploy with an empty variables panel
- Optional later: swap the two JSON files and edit titles in `index.html`
- GitHub Pages remains optional and independent (`.github/workflows/deploy.yml`)

### Implementation Details

Caddy listens on Railway's `$PORT`, enables gzip for the large detail graph, and serves only the runtime assets copied into `/srv`. Vendor scripts are long-cache immutable; graph JSON stays short-cache. Missing `.js` paths return **404** (not `index.html`) so a broken vendor tree cannot blank the WebGL city with an HTML MIME type. The viewer loads the city summary first, prefetches the full map when idle, then installs `architecture-map.json` when a visitor chooses **LOAD FULL DETAILS**.

### Why Deploy Architecture City on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it. By deploying Architecture City on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
