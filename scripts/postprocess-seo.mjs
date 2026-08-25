import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as cheerio from 'cheerio';
import {
  CANONICAL_BASE,
  SITE_BASE_PATH,
  LOCALES,
  DEFAULT_LOCALE,
  PAGES,
  canonicalUrl,
  pageUrl,
  findPageByFile,
} from './seo-config.mjs';

/**
 * @param {string} distDir
 */
export async function postprocessDist(distDir) {
  const htmlFiles = collectHtmlFiles(distDir);
  for (const filePath of htmlFiles) {
    const rel = relative(distDir, filePath).replace(/\\/g, '/');
    const page = findPageByFile(rel);
    if (!page) {
      console.warn(`  skip (no page config): ${rel}`);
      continue;
    }
    const html = readFileSync(filePath, 'utf8');
    const out = postprocessPage(html, page, rel);
    writeFileSync(filePath, out, 'utf8');
    console.log(`  postprocessed: ${rel}`);
  }
}

/**
 * @param {string} html
 * @param {typeof PAGES[number]} page
 * @param {string} relFile
 */
function postprocessPage(html, page, relFile) {
  const $ = cheerio.load(html, { decodeEntities: false });

  $('title').text(page.title);
  setMeta($, 'name', 'description', page.description);

  $('link[rel="canonical"]').remove();
  $('link[rel="alternate"][hreflang]').remove();
  $('meta[property^="og:"]').remove();
  $('meta[name^="twitter:"]').remove();
  $('script[type="application/ld+json"]').remove();

  const canonical = canonicalUrl(page.locale, page);
  $('head').append(`<link rel="canonical" href="${canonical}">`);

  for (const locale of LOCALES) {
    const altPage = PAGES.find((p) => p.id === page.id && p.locale === locale);
    if (!altPage) continue;
    $('head').append(
      `<link rel="alternate" hreflang="${locale}" href="${canonicalUrl(locale, altPage)}">`
    );
  }
  $('head').append(
    `<link rel="alternate" hreflang="x-default" href="${canonicalUrl(DEFAULT_LOCALE, page)}">`
  );

  $('head').append(`<meta property="og:type" content="website">`);
  $('head').append(`<meta property="og:title" content="${escapeAttr(page.title)}">`);
  $('head').append(
    `<meta property="og:description" content="${escapeAttr(page.description)}">`
  );
  $('head').append(`<meta property="og:url" content="${canonical}">`);
  $('head').append(`<meta property="og:image" content="${page.ogImage}">`);
  $('head').append(`<meta property="og:locale" content="en">`);

  $('head').append(`<meta name="twitter:card" content="summary_large_image">`);
  $('head').append(`<meta name="twitter:title" content="${escapeAttr(page.title)}">`);
  $('head').append(
    `<meta name="twitter:description" content="${escapeAttr(page.description)}">`
  );

  const jsonLd = buildJsonLd(page);
  if (jsonLd) {
    $('head').append(
      `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    );
  }

  $('html').attr('lang', page.locale);

  ensureMain($);

  if (SITE_BASE_PATH) {
    rewritePreviewPaths($, relFile);
  }

  return $.html();
}

/**
 * @param {import('cheerio').CheerioAPI} $
 */
function ensureMain($) {
  if ($('main').length) return;
  const nav = $('nav').first();
  const footer = $('footer').first();
  if (!nav.length) return;

  const main = $('<main></main>');
  let node = nav[0]?.nextSibling;
  while (node) {
    const next = node.nextSibling;
    if (footer.length && node === footer[0]) break;
    main.append(node);
    node = next;
  }
  nav.after(main);
}

/**
 * Rewrite root-relative and sibling-relative links for GitHub Pages preview.
 * @param {import('cheerio').CheerioAPI} $
 * @param {string} relFile
 */
function rewritePreviewPaths($, relFile) {
  const depth = relFile.split('/').length - 1;
  const prefix = SITE_BASE_PATH;

  $('link[href], a[href], script[src], img[src]').each((_, el) => {
    const $el = $(el);
    const attr = $el.is('link') ? 'href' : $el.is('script') || $el.is('img') ? 'src' : 'href';
    const val = $el.attr(attr);
    if (!val) return;

    if (
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('mailto:') ||
      val.startsWith('tel:') ||
      val.startsWith('#') ||
      val.startsWith('data:')
    ) {
      return;
    }

    if (val.startsWith('/')) {
      if (val.startsWith(prefix + '/') || val === prefix) return;
      $el.attr(attr, prefix + val);
      return;
    }

    // Relative paths (../, ./, bare filenames)
    const absFromRoot = resolveRelative(relFile, val);
    $el.attr(attr, prefix + absFromRoot);
  });
}

/**
 * Resolve a relative href from an HTML file to a root-absolute path.
 * @param {string} fromFile e.g. ground-truth-method/index.html
 * @param {string} href e.g. ../#contact
 */
function resolveRelative(fromFile, href) {
  const [pathPart, hash = ''] = href.split('#');
  const dirParts = fromFile.split('/').slice(0, -1);
  const segments = pathPart.split('/').filter(Boolean);

  for (const seg of segments) {
    if (seg === '.') continue;
    if (seg === '..') {
      dirParts.pop();
    } else {
      dirParts.push(seg);
    }
  }

  let result = '/' + dirParts.filter(Boolean).join('/');
  if (!pathPart.endsWith('/') && !pathPart.includes('.') && pathPart !== '' && pathPart !== '.') {
    // bare directory name without trailing slash
  }
  if (pathPart.endsWith('/') || pathPart === '' || pathPart === '.') {
    if (result !== '/') result += '/';
  }
  if (hash) result += `#${hash}`;
  return result || '/';
}

/**
 * @param {typeof PAGES[number]} page
 */
function buildJsonLd(page) {
  if (page.id === 'home') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${CANONICAL_BASE}/#organization`,
          name: 'Alice the Time Bender',
          url: `${CANONICAL_BASE}/`,
          email: 'hello@alicethetimebender.com',
          description: page.description,
        },
        {
          '@type': 'WebSite',
          '@id': `${CANONICAL_BASE}/#website`,
          url: `${CANONICAL_BASE}/`,
          name: 'Alice the Time Bender',
          publisher: { '@id': `${CANONICAL_BASE}/#organization` },
          inLanguage: 'en',
        },
      ],
    };
  }

  if (page.id === 'ground-truth-method') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      url: canonicalUrl(page.locale, page),
      description: page.description,
      isPartOf: { '@id': `${CANONICAL_BASE}/#website` },
      inLanguage: 'en',
    };
  }

  return null;
}

/**
 * @param {import('cheerio').CheerioAPI} $
 * @param {'name'|'property'} kind
 * @param {string} key
 * @param {string} value
 */
function setMeta($, kind, key, value) {
  const sel =
    kind === 'name'
      ? `meta[name="${key}"]`
      : `meta[property="${key}"]`;
  const existing = $(sel);
  if (existing.length) {
    existing.attr('content', value);
  } else {
    $('head').append(`<meta ${kind}="${key}" content="${escapeAttr(value)}">`);
  }
}

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/**
 * @param {string} dir
 * @returns {string[]}
 */
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
