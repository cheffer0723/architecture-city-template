# Railway template publish checklist

**Published:** [Architecture City](https://railway.com/deploy/architecture-city) (`architecture-city`)  
**Template editor:** [workspace templates](https://railway.com/workspace/templates/71d21e4f-60ac-4307-84ab-f4385ac2d13b)  
**Demo project:** `Architecture-city` → https://asymmetry-city-production.up.railway.app

Use this after the repo deploys cleanly on your own Railway project. Follow Railway's published guidance: [Create a template](https://docs.railway.com/guides/create), [Best practices](https://docs.railway.com/templates/best-practices), [Publish and share](https://docs.railway.com/templates/publish-and-share).

## Before you create the template

1. Deploy this repo once yourself (empty variables panel).
2. Confirm public URL loads the intro card and 3D canvas.
3. Confirm `/health` returns `ok`.
4. Confirm **LOAD FULL DETAILS** pulls `architecture-map.json` (city densifies).
5. Confirm `/vendor/three/three.core.js` returns JavaScript (not HTML).
6. Confirm mobile/desktop WebGL browsers you care about.
7. Optional: `./scripts/smoke.sh https://your-service.up.railway.app`

If any of those fail, **do not publish**.

## Template composer settings

| Setting | Value |
|---|---|
| Source repo | `https://github.com/cheffer0723/asymmetry-city` |
| Root directory | blank / `.` (not `legacy/`) |
| Builder | Dockerfile (`railway.toml` already sets this) |
| Public HTTP networking | **ON** |
| Healthcheck path | `/health` |
| Healthcheck timeout | `30` |
| Volumes | none |
| Private networking peers | none |
| Variables | **none required** |

## Marketplace metadata

| Field | Guidance |
|---|---|
| Template name | `Architecture City` (capital case, short, no dashes) |
| Service name | `Architecture City` |
| Category | `Observability` (or `Other` if you prefer) |
| Short description | ~one line; must match what deployers get |
| Overview | paste `TEMPLATE.md` (H1/H2 structure Railway expects) |
| Template icon | 1:1 aspect, transparent background |
| Service icon | same rule; Devicon / simple mark is fine |
| Demo project | optional public demo after you have a stable deploy |

## Reputation guards (do these)

- Workspace name: use **your** professional name/brand, not an unaffiliated company name.
- Keep the overview honest: static 3D graph viewer + sample data, not “live production traffic.”
- Ship **zero required secrets** so one-click deploy cannot fail on missing keys.
- Keep Three.js vendored (`vendor/three/`) so CDN outages cannot blank the canvas.
- Do not point the template at a private branch that other accounts cannot build.
- After publish, deploy the marketplace button yourself in a fresh project and re-check `/health` + city boot.

## Publish flow (UI or CLI)

UI: Workspace → Templates → create from project or scratch → Publish → paste overview from `TEMPLATE.md`.

CLI shape (after `railway templates create` / you have a template id):

```bash
railway templates publish <TEMPLATE_ID> \
  --category Observability \
  --description "Deploy and Host Architecture City with Railway" \
  --readme-file TEMPLATE.md
```

## After publish

1. Deploy button is in `README.md` → https://railway.com/deploy/architecture-city
2. Watch the first few community deploys for build failures.
3. Unpublish immediately if the service boots but the city canvas stays blank — fix, redeploy, republish.

### Republish overview / metadata

```bash
# Account/workspace auth: railway login  OR  RAILWAY_API_TOKEN=...
railway templates publish architecture-city \
  --category Observability \
  --description "Deploy and Host Architecture City with Railway" \
  --readme-file TEMPLATE.md \
  --demo-project d8747ce7-8771-4d67-b0fd-2e6fa52c5b16 \
  --json
```

Cloud Agent note: put the account/workspace token in secret **`RAILWAY_API_TOKEN`** (not project `RAILWAY_TOKEN`).
