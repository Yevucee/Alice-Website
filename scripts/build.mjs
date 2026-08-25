import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { postprocessDist } from './postprocess-seo.mjs';
import { generateSeoFiles } from './generate-seo-files.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');

const COPY_PATHS = [
  'index.html',
  'favicon.svg',
  'CNAME',
  '.nojekyll',
  'assets',
  'ground-truth-method',
];

console.log('Building Alice the Time Bender site…');
console.log(`  CANONICAL_BASE=${process.env.CANONICAL_BASE || '(default)'}`);
console.log(`  SITE_BASE_PATH=${process.env.SITE_BASE_PATH || '(default)'}`);

if (existsSync(DIST)) {
  rmSync(DIST, { recursive: true, force: true });
}
mkdirSync(DIST, { recursive: true });

for (const item of COPY_PATHS) {
  const src = join(ROOT, item);
  const dest = join(DIST, item);
  if (!existsSync(src)) continue;
  cpSync(src, dest, { recursive: true });
}

await postprocessDist(DIST);
await generateSeoFiles(DIST);

console.log('Build complete → dist/');
