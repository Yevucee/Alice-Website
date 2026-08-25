import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';
import { SITE_BASE_PATH, findPageByFile } from './seo-config.mjs';

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

console.log('audit:preview-base — scanning dist/ …');
console.log(`  SITE_BASE_PATH=${SITE_BASE_PATH || '(empty — production root)'}\n`);

if (!SITE_BASE_PATH) {
  console.log('No SITE_BASE_PATH set — preview-base checks skipped (production build).');
  process.exit(0);
}

if (!existsSync(DIST)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const htmlFiles = collectHtmlFiles(DIST);
const duplicateSegment = new RegExp(
  `${escapeRegex(SITE_BASE_PATH)}${escapeRegex(SITE_BASE_PATH)}`
);
const doubleLocale = new RegExp(`${escapeRegex(SITE_BASE_PATH)}/[a-z]{2}/[a-z]{2}/`);

for (const filePath of htmlFiles) {
  const rel = relative(DIST, filePath).replace(/\\/g, '/');
  const page = findPageByFile(rel);
  if (!page) continue;

  const html = readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  console.log(`${rel}:`);

  // Duplicate SITE_BASE_PATH segments
  if (duplicateSegment.test(html)) {
    fail(`${rel}: duplicate SITE_BASE_PATH segment`);
  } else {
    pass(`${rel}: no duplicate base path`);
  }

  // Double locale prefix
  if (doubleLocale.test(html)) {
    fail(`${rel}: double locale prefix detected`);
  } else {
    pass(`${rel}: no double locale prefix`);
  }

  // Internal asset/link paths should use SITE_BASE_PATH for root-relative
  $('link[href], a[href], script[src], img[src]').each((_, el) => {
    const $el = $(el);
    const attr = $el.is('link') ? 'href' : $el.is('script') || $el.is('img') ? 'src' : 'href';
    const val = $el.attr(attr) || '';

    if (
      val.startsWith('http') ||
      val.startsWith('mailto:') ||
      val.startsWith('tel:') ||
      val.startsWith('#') ||
      val.startsWith('data:')
    ) {
      return;
    }

    // Canonical must NOT have preview base
    if ($el.is('link[rel="canonical"]') && val.includes(SITE_BASE_PATH)) {
      fail(`${rel}: canonical contains preview base: ${val}`);
      return;
    }

    // hreflang must NOT have preview base
    if ($el.is('link[rel="alternate"]') && val.includes(SITE_BASE_PATH)) {
      fail(`${rel}: hreflang contains preview base: ${val}`);
      return;
    }

    // Root-relative internal paths should be prefixed
    if (val.startsWith('/') && !val.startsWith(SITE_BASE_PATH)) {
      // fonts.googleapis.com etc. are absolute URLs; root-relative internal should be prefixed
      if (!val.startsWith('//')) {
        fail(`${rel}: root-relative path missing preview base: ${val}`);
      }
    }

    // Bare relative assets on subpages (e.g. assets/foo without ../)
    if (
      rel.includes('/') &&
      !val.startsWith('/') &&
      !val.startsWith('../') &&
      !val.startsWith('./') &&
      !val.startsWith('#') &&
      (attr === 'src' || (attr === 'href' && !val.includes(':')))
    ) {
      // favicon etc. should have been rewritten to absolute with base
      if (!val.startsWith(SITE_BASE_PATH)) {
        fail(`${rel}: bare relative path on subpage: ${val}`);
      }
    }
  });

  pass(`${rel}: preview path scan complete`);
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
