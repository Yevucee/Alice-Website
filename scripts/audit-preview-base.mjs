import {
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, relative, dirname, normalize } from 'node:path';
import * as cheerio from 'cheerio';
import { SITE, SITE_BASE_PATH, findPageByFile } from './seo-config.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');

/** @type {{ ok: number; fail: number; issues: string[] }} */
const stats = { ok: 0, fail: 0, issues: [] };

function pass(msg) {
  stats.ok++;
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  stats.fail++;
  stats.issues.push(msg);
  console.error(`  ✗ ${msg}`);
}

function collectHtmlFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectHtmlFiles(full));
    } else if (entry.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * @param {string} distDir
 * @param {string} fromRel e.g. ground-truth-method/index.html
 * @param {string} href
 * @returns {string | null} dist-relative file to check, or null to skip
 */
function resolveInternalFile(distDir, fromRel, href) {
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('data:')) {
    return null;
  }
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
    return null;
  }

  const hashIdx = href.indexOf('#');
  const pathPart = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  if (!pathPart) {
    return null;
  }

  const fromDir = dirname(fromRel);
  let resolved;
  if (pathPart.startsWith('/')) {
    resolved = pathPart.replace(/^\//, '');
  } else {
    resolved = normalize(join(fromDir, pathPart)).replace(/\\/g, '/');
  }

  if (resolved === '.' || resolved === '') {
    return 'index.html';
  }

  const asFile = join(distDir, resolved);
  if (existsSync(asFile) && statSync(asFile).isFile()) {
    return resolved;
  }

  const asIndex = join(distDir, resolved, 'index.html');
  if (existsSync(asIndex)) {
    return join(resolved, 'index.html').replace(/\\/g, '/');
  }

  return resolved;
}

console.log('audit:preview-base — scanning dist/ …');
console.log(`  SITE_BASE_PATH=${SITE_BASE_PATH || '(empty — custom domain root)'}\n`);

if (!existsSync(DIST)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const htmlFiles = collectHtmlFiles(DIST);
const previewPrefix = `/${SITE.repoName}`;

for (const filePath of htmlFiles) {
  const rel = relative(DIST, filePath).replace(/\\/g, '/');
  const page = findPageByFile(rel);
  if (!page) continue;

  const html = readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  console.log(`${rel}:`);

  if (!SITE_BASE_PATH) {
    if (html.includes(previewPrefix)) {
      fail(`${rel}: contains GitHub preview path ${previewPrefix} on production build`);
    } else {
      pass(`${rel}: no preview path prefix in HTML`);
    }
  } else {
    const duplicateSegment = new RegExp(
      `${escapeRegex(SITE_BASE_PATH)}${escapeRegex(SITE_BASE_PATH)}`
    );
    if (duplicateSegment.test(html)) {
      fail(`${rel}: duplicate SITE_BASE_PATH segment`);
    } else {
      pass(`${rel}: no duplicate base path`);
    }
  }

  $('link[href], a[href], script[src], img[src]').each((_, el) => {
    const $el = $(el);
    const attr = $el.is('link') ? 'href' : $el.is('script') || $el.is('img') ? 'src' : 'href';
    const val = $el.attr(attr) || '';

    if ($el.is('link[rel="canonical"]') && SITE_BASE_PATH && val.includes(SITE_BASE_PATH)) {
      fail(`${rel}: canonical contains preview base: ${val}`);
    }
    if ($el.is('link[rel="alternate"]') && SITE_BASE_PATH && val.includes(SITE_BASE_PATH)) {
      fail(`${rel}: hreflang contains preview base: ${val}`);
    }

    const target = resolveInternalFile(DIST, rel, val);
    if (target === null) return;

    const full = join(DIST, target);
    if (!existsSync(full)) {
      fail(`${rel}: broken internal ${attr} "${val}" → missing ${target}`);
    }
  });

  pass(`${rel}: internal link scan complete`);
  console.log('');
}

console.log(`\naudit:preview-base — ${stats.ok}/${stats.ok + stats.fail} checks passed`);

if (stats.fail > 0) {
  console.error(`\n${stats.fail} check(s) failed:`);
  for (const issue of stats.issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('All preview-base audits passed.');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
