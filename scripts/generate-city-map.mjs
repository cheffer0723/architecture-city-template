import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const config = JSON.parse(await fs.readFile(path.join(root, 'architecture-city.config.json'), 'utf8'));
const protectedName = /(^|[\/_.\s-])(secrets?|credentials?|passwords?|passwds?|tokens?|private.?keys?|keypairs?|seeds?|mnemonics?|keystores?|vaults?|env|crypto(?:graphy)?|ciphers?|encrypt(?:ion)?|decrypt(?:ion)?|key.?deriv(?:ation)?|zk|snarks?|poseidon|provers?|verifiers?|ed25519|x25519|chacha|aes|rsa|sodium)(?=$|[\/_.\s-])/i;
const textExtensions = new Set(['.cjs','.css','.go','.html','.java','.js','.json','.jsx','.md','.mdx','.mjs','.php','.py','.rb','.rs','.sh','.sol','.toml','.ts','.tsx','.txt','.yaml','.yml']);
const binaryExtensions = new Set(['.gif','.ico','.jpeg','.jpg','.pdf','.png','.svg','.wasm','.webp','.woff','.woff2','.zip']);
const excluded = new Set(config.excludeDirectories ?? []);
const generatedFiles = new Set(['architecture-map.json', 'architecture-city-summary.json', 'source-manifest.json']);
const camel = value => String(value ?? '').replace(/([a-z0-9])([A-Z])/g, '$1-$2');
const protectedText = value => protectedName.test(camel(value));
const relative = file => path.relative(root, file).split(path.sep).join('/');

async function walk(directory, prefix = '') {
  const found = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excluded.has(entry.name)) continue;
    const next = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) found.push(...await walk(path.join(directory, entry.name), next));
    if (entry.isFile()) found.push(next);
  }
  return found;
}

function groupFor(file) {
  return config.groups.find(group => group.paths.some(prefix => file.startsWith(prefix)))?.id ?? 'root';
}

function typeFor(file) {
  const ext = path.posix.extname(file).toLowerCase();
  if (ext === '.md' || ext === '.mdx') return 'document';
  if (['.json','.toml','.yaml','.yml'].includes(ext)) return 'configuration';
  if (ext === '.rs') return 'rust';
  if (ext === '.py') return 'python';
  if (ext === '.go') return 'go';
  if (ext === '.sol') return 'contract';
  return 'source';
}

function symbols(text, file) {
  const ext = path.posix.extname(file).toLowerCase();
  const rules = ext === '.py' ? [['function', /^\s*(?:async\s+)?def\s+(\w+)/gm], ['class', /^\s*class\s+(\w+)/gm]]
    : ext === '.rs' ? [['function', /(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/g], ['struct', /(?:pub\s+)?struct\s+(\w+)/g], ['enum', /(?:pub\s+)?enum\s+(\w+)/g]]
    : /\.(?:js|jsx|mjs|cjs|ts|tsx)$/.test(file) ? [['function', /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g], ['class', /(?:export\s+)?class\s+(\w+)/g], ['const', /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g], ['interface', /(?:export\s+)?interface\s+(\w+)/g]]
    : [];
  const seen = new Set();
  return rules.flatMap(([type, expression]) => [...text.matchAll(expression)].map(match => ({ name: match[1], type })))
    .filter(item => !protectedText(item.name) && !seen.has(`${item.type}:${item.name}`) && seen.add(`${item.type}:${item.name}`)).slice(0, 300);
}

function nodeWeight(node, byId) {
  const lines = Number(node.lines) || 0, size = Number(node.size) || 0;
  if (node.type === 'file') return 1 + lines + size / 90 + (node.symbols?.length ?? 0) * 34 + (node.headings?.length ?? 0) * 18;
  if (node.type === 'symbol') return 12 + Math.sqrt(nodeWeight(byId.get(node.parent) ?? {}, byId)) * 2;
  if (node.type === 'directory') return 12;
  if (node.type === 'heading') return 8;
  if (node.type === 'system') return 180;
  return 10;
}

function metrics(nodes) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const result = {}, groups = config.groups.map(group => group.id);
  for (const group of groups) result[group] = { systems: 0, files: 0, directories: 0, symbols: 0, headings: 0, nodes: 0, lines: 0, bytes: 0, weight: 0, maxFileWeight: 1 };
  let fileWeightMax = 1;
  for (const node of nodes) {
    const item = result[node.group] ?? result.root;
    const weight = nodeWeight(node, byId); item.nodes++; item.weight += weight;
    if (node.type === 'system') item.systems++;
    if (node.type === 'file') { item.files++; item.lines += node.lines || 0; item.bytes += node.size || 0; item.maxFileWeight = Math.max(item.maxFileWeight, weight); fileWeightMax = Math.max(fileWeightMax, weight); }
    if (node.type === 'directory') item.directories++;
    if (node.type === 'symbol') item.symbols++;
    if (node.type === 'heading') item.headings++;
  }
  return { groupMetrics: result, fileWeightMax, districtWeightMax: Math.max(1, ...Object.values(result).map(item => item.weight)) };
}

const files = (await walk(root)).filter(file => !generatedFiles.has(file) && !protectedText(file) && !binaryExtensions.has(path.posix.extname(file).toLowerCase())).sort();
const nodes = [], edges = [], directories = new Set();
for (const file of files) for (let dir = path.posix.dirname(file); dir && dir !== '.'; dir = path.posix.dirname(dir)) directories.add(dir);
for (const directory of [...directories].sort()) nodes.push({ id: `dir:${directory}`, type: 'directory', label: path.posix.basename(directory), path: directory, group: groupFor(`${directory}/`) });
for (const file of files) {
  let text = ''; if (textExtensions.has(path.posix.extname(file).toLowerCase())) try { text = await fs.readFile(path.join(root, file), 'utf8'); } catch { /* file remains represented without text-derived details */ }
  const id = `file:${file}`, group = groupFor(file), fileSymbols = symbols(text, file), fileHeadings = /\.(?:md|mdx)$/.test(file) ? [...text.matchAll(/^#{1,4}\s+(.+)$/gm)].map(match => match[1].trim()).filter(value => !protectedText(value)).slice(0, 200) : [];
  nodes.push({ id, type: 'file', label: path.posix.basename(file), path: file, group, kind: typeFor(file), status: file.includes('/test') || /\.(?:test|spec)\./.test(file) ? 'tested' : 'source', size: text.length, lines: text ? text.split('\n').length : 0, symbols: fileSymbols, headings: fileHeadings });
  const parent = path.posix.dirname(file); if (parent !== '.') edges.push({ from: id, to: `dir:${parent}`, type: 'contained-in', confidence: 'path-derived' });
  for (const symbol of fileSymbols) { const symbolId = `symbol:${file}#${symbol.name}`; nodes.push({ id: symbolId, type: 'symbol', label: symbol.name, path: file, symbolType: symbol.type, group, parent: id }); edges.push({ from: id, to: symbolId, type: 'defines', confidence: 'parser-derived' }); }
  for (const heading of fileHeadings) { const headingId = `heading:${file}#${heading}`; nodes.push({ id: headingId, type: 'heading', label: heading, path: file, group, parent: id }); edges.push({ from: id, to: headingId, type: 'contains-heading', confidence: 'parser-derived' }); }
}
for (const group of config.groups) nodes.push({ id: `system:${group.id}`, type: 'system', label: group.label, group: group.id });
for (const node of nodes.filter(node => node.type === 'file')) edges.push({ from: `system:${node.group}`, to: node.id, type: 'domain-artifact', confidence: 'path-derived' });
const safeNodes = nodes.filter(node => !protectedText([node.id,node.path,node.label,node.symbolType,...(node.symbols ?? []).map(item => item.name),...(node.headings ?? [])].filter(Boolean).join(' ')));
const safeIds = new Set(safeNodes.map(node => node.id));
const safeEdges = edges.filter(edge => safeIds.has(edge.from) && safeIds.has(edge.to));
const fullStats = { files: safeNodes.filter(node => node.type === 'file').length, directories: safeNodes.filter(node => node.type === 'directory').length, symbols: safeNodes.filter(node => node.type === 'symbol').length, headings: safeNodes.filter(node => node.type === 'heading').length, nodes: safeNodes.length, edges: safeEdges.length };
const commit = process.env.GITHUB_SHA || 'local';
const map = { schemaVersion: '1.0.0', projectName: config.projectName, repository: config.publicRepository, commit, generatedAt: new Date().toISOString(), fidelity: { principle: 'repository-is-source-of-truth', publicPolicy: 'paths and identifiers only; no file contents' }, stats: fullStats, nodes: safeNodes, edges: safeEdges, protectedNodesOmitted: nodes.length - safeNodes.length };
const systems = safeNodes.filter(node => node.type === 'system'), systemIds = new Set(systems.map(node => node.id)), summaryMetrics = metrics(safeNodes);
const summary = { schemaVersion: map.schemaVersion, projectName: map.projectName, repository: map.repository, commit, generatedAt: map.generatedAt, fidelity: 'city-summary', stats: { files: 0, directories: 0, symbols: 0, headings: 0, nodes: systems.length, edges: safeEdges.filter(edge => systemIds.has(edge.from) && systemIds.has(edge.to)).length, fullFiles: fullStats.files, fullDirectories: fullStats.directories, fullSymbols: fullStats.symbols, fullHeadings: fullStats.headings, fullNodes: fullStats.nodes, fullEdges: fullStats.edges }, nodes: systems, edges: safeEdges.filter(edge => systemIds.has(edge.from) && systemIds.has(edge.to)), protectedNodesOmitted: map.protectedNodesOmitted, summaryOf: 'architecture-map.json', groupMetrics: summaryMetrics.groupMetrics, sizeModel: { districtWeightMax: summaryMetrics.districtWeightMax, fileWeightMax: summaryMetrics.fileWeightMax, sizing: 'Districts reflect public-safe repository weight; structures reflect public-safe file metadata.' } };
await fs.writeFile(path.join(root, 'architecture-map.json'), `${JSON.stringify(map, null, 2)}\n`);
await fs.writeFile(path.join(root, 'architecture-city-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(root, 'source-manifest.json'), `${JSON.stringify({ sourceRepository: config.publicRepository, sourceRef: process.env.GITHUB_REF_NAME || 'local', sourceCommit: commit, capturedAt: map.generatedAt, purpose: 'Public-safe repository architecture snapshot generated by Architecture City Template.' }, null, 2)}\n`);
console.log(`architecture city: ${fullStats.files} files, ${fullStats.nodes} public nodes, ${map.protectedNodesOmitted} protected nodes omitted`);
