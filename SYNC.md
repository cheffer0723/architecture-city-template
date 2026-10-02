# Snapshot lifecycle

Architecture City is a repository snapshot viewer.

1. A contributor pushes source changes to `main`.
2. GitHub Actions runs `scripts/generate-city-map.mjs` against that checkout.
3. The validator confirms the generated full map and first-paint summary agree.
4. When the map changed, the workflow commits only the generated JSON files as `architecture-city[bot]`.
5. The same workflow deploys the static files to GitHub Pages.
6. Optional hosts such as Railway deploy the committed static files from `main`.

This is automatic only for the repository that contains the template. To visualize a different project, use the template in that project's repository or add an explicitly reviewed cross-repository workflow. Do not assume a public city is connected to another repository unless its workflow and generated provenance show that connection.
