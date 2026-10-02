# Railway marketplace publication checklist

This repository is prepared for a Railway template, but it is **not represented here as already published**. Complete and record the following only after a real Railway deployment succeeds.

## Before submitting

1. Deploy this repository in a fresh Railway project with an empty variables panel.
2. Confirm the public URL opens the city and its intro panel.
3. Confirm `GET /health` returns `ok`.
4. Confirm **LOAD FULL DETAILS** loads `architecture-map.json`.
5. Confirm the required Three.js modules return JavaScript rather than HTML.
6. Run `./scripts/smoke.sh https://your-service.up.railway.app`.
7. Test one mobile and one desktop WebGL-capable browser.

If a check fails, repair the template before publishing it.

## Composer settings

| Setting | Value |
| --- | --- |
| Source repo | This template repository |
| Root directory | `.` |
| Builder | Dockerfile (`railway.toml` included) |
| Public HTTP networking | On |
| Healthcheck path | `/health` |
| Variables | None required |
| Database, volume, worker | Not required |

## Marketplace description boundary

Describe it as a **static, public-safe repository architecture viewer**. Do not advertise live production traffic, runtime telemetry, source-code publication, security review, or automatic cross-repository syncing unless those capabilities have been separately implemented and tested.

Use [TEMPLATE.md](TEMPLATE.md) as the overview source after the hosted deployment is verified.
