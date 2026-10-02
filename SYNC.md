# Sync model: Asymmetry → Architecture City

Architecture City is meant to **keep pace with `cheffer0723/asymmetry`**, not load that repo live in the browser.

## How it works

```text
asymmetry (private, source of truth)
  └─ on update: generate + safety-filter architecture graph
       └─ asymmetry-city-sync[bot] commits JSON into asymmetry-city
            └─ GitHub Pages (and any Railway service on main) serve the new city
```

| Piece | Where it lives |
|---|---|
| Graph generators | Private `asymmetry` (`scripts/generate-*-architecture-city-*.mjs`) |
| Sync workflow | Private `asymmetry` (`.github/workflows/architecture-city-sync.yml`) |
| Public artifacts | This repo: `architecture-city-summary.json`, `architecture-map.json` |
| Viewer | This repo: static `index.html` + vendored Three.js |

The browser never clones asymmetry. It only fetches the committed JSON next to `index.html`.

## What “keep up” means

- **Yes:** when asymmetry updates and the sync workflow runs, this repo gets a new map commit (`chore(city): sync architecture map from <sha>`), then Pages/Railway redeploy.
- **Not:** a WebSocket or live API from the city back into asymmetry at view time.

That is the right shape for a public city: public-safe snapshots, no private source exposure.

## Ops checklist (in private asymmetry)

If the city looks stale:

1. Confirm asymmetry has commits newer than the SHA in the latest city sync commit message.
2. Confirm `.github/workflows/architecture-city-sync.yml` is enabled and recent runs succeeded.
3. Confirm the write credential to `asymmetry-city` (PAT / fine-grained token) still has `contents: write`.
4. Prefer also refreshing `source-manifest.json` in the same sync commit so provenance matches the map.

## Railway note

Railway hosts whatever JSON is in the branch it deploys. Point the production Railway service at `main` so each sync bot push can redeploy automatically (or redeploy on GitHub push). Template one-click forks get a frozen sample until their owner wires their own sync.
