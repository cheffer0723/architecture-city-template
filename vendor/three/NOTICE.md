# Three.js (vendored)

Version: `0.179.1`

Files:

- `three.core.js` — from `build/three.core.js` (required by `three.module.js` in 0.179+)
- `three.module.js` — from `build/three.module.js`
- `OrbitControls.js` — from `examples/jsm/controls/OrbitControls.js`

Upstream: https://github.com/mrdoob/three.js  
License: MIT

Vendored into this repository so Railway (and GitHub Pages) deploys do not depend on a third-party CDN at runtime. Refresh by replacing these two files from the same Three.js release and keeping the import map in `index.html` pointed at `./vendor/three/…`.
