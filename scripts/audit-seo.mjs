import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';
import {
  CANONICAL_BASE,
  LOCALES,
  PAGES,
  canonicalUrl,
  findPageByFile,
} from './seo-config.mjs';

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

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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

console.log('audit:seo — scanning dist/ …\n');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

const htmlFiles = collectHtmlFiles(DIST);

for (const filePath of htmlFiles) {
  const rel = relative(DIST, filePath).replace(/\\/g, '/');
  const page = findPageByFile(rel);
  if (!page) {
    fail(`${rel}: no page config`);
    continue;
  }

  const html = readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  console.log(`${rel}:`);

  // canonical
  const canonicals = $('link[rel="canonical"]');
  if (canonicals.length !== 1) {
    fail(`${rel}: expected 1 canonical, found ${canonicals.length}`);
  } else {
    const expected = canonicalUrl(page.locale, page);
    const href = canonicals.attr('href');
    if (href !== expected) {
      fail(`${rel}: canonical mismatch — got ${href}, want ${expected}`);
    } else if (href.includes('/Alice-Website')) {
      fail(`${rel}: canonical must not include SITE_BASE_PATH`);
    } else {
      pass(`${rel}: canonical OK (${href})`);
    }
  }

  // hreflang
  for (const locale of LOCALES) {
    const alt = $(`link[rel="alternate"][hreflang="${locale}"]`);
    if (!alt.length) {
      fail(`${rel}: missing hreflang="${locale}"`);
    } else {
      const expected = canonicalUrl(locale, page);
      if (alt.attr('href') !== expected) {
        fail(`${rel}: hreflang="${locale}" mismatch`);
      } else {
        pass(`${rel}: hreflang="${locale}" OK`);
      }
    }
  }

  const xDefault = $('link[rel="alternate"][hreflang="x-default"]');
  if (!xDefault.length) {
    fail(`${rel}: missing hreflang="x-default"`);
  } else {
    pass(`${rel}: hreflang="x-default" OK`);
  }

  // html lang
  const lang = $('html').attr('lang');
  if (lang !== page.locale) {
    fail(`${rel}: <html lang> is "${lang}", want "${page.locale}"`);
  } else {
    pass(`${rel}: <html lang="${lang}"> OK`);
  }

  // h1
  const h1s = $('h1');
  if (h1s.length !== 1) {
    fail(`${rel}: expected 1 h1, found ${h1s.length}`);
  } else {
    pass(`${rel}: single h1 OK`);
  }

  // main content
  const main = $('main');
  if (!main.length) {
    fail(`${rel}: missing <main>`);
  } else {
    const text = stripTags(main.html() || '');
    if (text.length < 200) {
      fail(`${rel}: main text too short (${text.length} chars)`);
    } else {
      pass(`${rel}: main text ≥200 chars (${text.length})`);
    }
  }

  // noindex
  const robots = $('meta[name="robots"]');
  if (robots.length && /noindex/i.test(robots.attr('content') || '')) {
    fail(`${rel}: has noindex`);
  } else {
    pass(`${rel}: no noindex`);
  }

  // ?lang= in links
  const badLinks = [];
  $('a[href*="?lang="]').each((_, el) => {
    badLinks.push($(el).attr('href'));
  });
  if (badLinks.length) {
    fail(`${rel}: found ?lang= in links: ${badLinks.join(', ')}`);
  } else {
    pass(`${rel}: no ?lang= links`);
  }

  // JSON-LD
  const ldScripts = $('script[type="application/ld+json"]');
  if (!ldScripts.length) {
    fail(`${rel}: missing JSON-LD`);
  } else {
    let valid = true;
    ldScripts.each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}');
        const str = JSON.stringify(data);
        if (/placeholder|lorem ipsum|TODO|FIXME/i.test(str)) {
          fail(`${rel}: JSON-LD contains placeholder text`);
          valid = false;
        }
        if (/aggregateRating|price|streetAddress/i.test(str)) {
          fail(`${rel}: JSON-LD contains invented ratings/prices/addresses`);
          valid = false;
        }
      } catch {
        fail(`${rel}: invalid JSON-LD`);
        valid = false;
      }
    });
    if (valid) pass(`${rel}: JSON-LD valid`);
  }

  // og:url must be canonical
  const ogUrl = $('meta[property="og:url"]').attr('content');
  const expectedCanonical = canonicalUrl(page.locale, page);
  if (ogUrl !== expectedCanonical) {
    fail(`${rel}: og:url mismatch — got ${ogUrl}`);
  } else {
    pass(`${rel}: og:url OK`);
  }

  console.log('');
}

console.log(`\naudit:seo — ${stats.ok}/${stats.ok + stats.fail} checks passed`);

if (stats.fail > 0) {
  console.error(`\n${stats.fail} check(s) failed:`);
  for (const issue of stats.issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('All SEO audits passed.');
