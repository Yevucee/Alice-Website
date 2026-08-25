/**
 * Dual-URL SEO config for GitHub Pages preview vs production canonical.
 *
 * CANONICAL_BASE  → production domain (never includes SITE_BASE_PATH)
 * SITE_BASE_PATH  → GitHub Pages project-site prefix (e.g. /Alice-Website)
 */

export const SITE = {
  name: 'Alice the Time Bender',
  email: 'hello@alicethetimebender.com',
  githubUser: 'Yevucee',
  repoName: 'Alice-Website',
};

export const CANONICAL_BASE = (
  process.env.CANONICAL_BASE || 'https://alicethetimebender.com'
).replace(/\/+$/, '');

export const SITE_BASE_PATH = normalizeBasePath(
  process.env.SITE_BASE_PATH || '/Alice-Website'
);

export const LOCALES = ['en'];
export const DEFAULT_LOCALE = 'en';

/** @type {import('./seo-config.mjs').PageDef[]} */
export const PAGES = [
  {
    id: 'home',
    file: 'index.html',
    locale: 'en',
    title: 'Alice the Time Bender',
    description:
      'Discreet family enterprise advisory. Long-term guidance through strategy, governance, succession and legacy, based in Europe, working globally.',
    path: '/',
    ogImage: 'https://picsum.photos/id/1018/1800/1100?grayscale',
    schema: ['Organization', 'WebSite'],
  },
  {
    id: 'ground-truth-method',
    file: 'ground-truth-method/index.html',
    locale: 'en',
    title: 'The Alice Ground Truth Method | Human-Led Field Research',
    description:
      "Discover Alice's proprietary approach to field research, human insight and strategic interpretation for complex investments, organisations and operating environments.",
    path: '/ground-truth-method/',
    ogImage: 'https://picsum.photos/id/1043/1800/1100?grayscale',
    schema: ['WebPage'],
  },
];

/**
 * Production canonical URL — always CANONICAL_BASE, never SITE_BASE_PATH.
 * @param {string} locale
 * @param {typeof PAGES[number]} page
 */
export function canonicalUrl(locale, page) {
  void locale;
  return `${CANONICAL_BASE}${page.path}`;
}

/**
 * GitHub Pages preview URL path (includes SITE_BASE_PATH).
 * @param {string} locale
 * @param {typeof PAGES[number]} page
 */
export function pageUrl(locale, page) {
  void locale;
  if (page.path === '/') {
    return `${SITE_BASE_PATH}/`;
  }
  return `${SITE_BASE_PATH}${page.path}`;
}

/**
 * Runtime helper — returns SITE_BASE_PATH on github.io preview, '' on production root.
 * @param {string} [hostname]
 */
export function detectSiteBase(hostname = '') {
  if (!hostname) return SITE_BASE_PATH;
  if (hostname.endsWith('.github.io')) {
    return SITE_BASE_PATH;
  }
  return '';
}

function normalizeBasePath(path) {
  if (!path || path === '/') return '';
  const trimmed = path.replace(/\/+$/, '');
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function findPageByFile(relativeFile) {
  const normalized = relativeFile.replace(/\\/g, '/');
  return PAGES.find((p) => p.file === normalized);
}
