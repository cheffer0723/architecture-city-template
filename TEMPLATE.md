# Host Architecture City

Architecture City is a static browser application. A host only needs to serve `index.html`, the generated JSON maps, and the vendored Three.js files. WebGL rendering happens on the visitor's device.

## Railway

1. Create a Railway project and add a service from your GitHub copy of this template.
2. Keep the root directory at `.`.
3. Railway detects the supplied `Dockerfile`, starts Caddy, and injects `PORT`.
4. Enable public networking and set the health check to `/health`.
5. No variables, database, volume, or worker are required.

The source repository's GitHub Action produces the generated map files. Railway only serves the latest committed static files after a deployment.

## Other hosts

GitHub Pages is built in through `.github/workflows/deploy.yml`. Any static host that supports HTML, JavaScript modules, JSON, and the `vendor/` directory can serve the template. For a container host, use the included Dockerfile and Caddyfile.

## Verify a deployment

Run the included check against the host URL:

```bash
./scripts/smoke.sh https://your-city.example
```

It checks the health route, page, map JSON, required Three.js assets, correct module MIME types, and that missing module URLs return 404 rather than HTML.

## Safety reminder

Before making a city public, inspect `architecture-map.json` and `architecture-city-summary.json`. The supplied protected-name filter reduces accidental publication of sensitive-looking paths and identifiers; it cannot certify a repository safe to expose.
