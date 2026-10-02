import fs from 'node:fs/promises';
const map = JSON.parse(await fs.readFile('architecture-map.json', 'utf8'));
const summary = JSON.parse(await fs.readFile('architecture-city-summary.json', 'utf8'));
if (!map.nodes?.length || !map.edges || !summary.nodes?.length) throw new Error('Generated map or summary is empty.');
if (map.commit !== summary.commit || map.repository !== summary.repository) throw new Error('Map and summary provenance disagree.');
if (!Number.isInteger(map.protectedNodesOmitted)) throw new Error('Protected-node count is missing.');
console.log(`validated ${map.stats.nodes} public nodes for ${map.repository}`);
