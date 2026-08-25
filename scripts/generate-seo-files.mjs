import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CANONICAL_BASE,
  SITE,
  LOCALES,
  PAGES,
  canonicalUrl,
} from './seo-config.mjs';

/**
 * @param {string} distDir
 */
export async function generateSeoFiles(distDir) {
  writeFileSync(join(distDir, 'sitemap.xml'), buildSitemap(), 'utf8');
  writeFileSync(join(distDir, 'robots.txt'), buildRobots(), 'utf8');
  writeFileSync(join(distDir, 'llms.txt'), buildLlmsTxt(), 'utf8');
  console.log('  generated: sitemap.xml, robots.txt, llms.txt');
}

function buildSitemap() {
  const urls = PAGES.map((page) => {
    const loc = canonicalUrl(page.locale, page);
    const alternates = LOCALES.map((locale) => {
      const altPage = PAGES.find((p) => p.id === page.id && p.locale === locale);
      if (!altPage) return '';
      return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${canonicalUrl(locale, altPage)}" />`;
    }).join('\n');

    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl('en', page)}" />`;

    return `  <url>
    <loc>${loc}</loc>
${alternates}
${xDefault}
    <changefreq>monthly</changefreq>
    <priority>${page.id === 'home' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

function buildRobots() {
  return `# Alice the Time Bender — ${CANONICAL_BASE}/
User-agent: *
Allow: /

# Search index bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: DuckDuckBot
Allow: /

# AI search / retrieval bots (allow indexing)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${CANONICAL_BASE}/sitemap.xml
`;
}

function buildLlmsTxt() {
  const pageLines = PAGES.map((page) => {
    const url = canonicalUrl(page.locale, page);
    return `- ${page.title}: ${url}`;
  }).join('\n');

  return `# ${SITE.name}

> Discreet family enterprise advisory. Long-term guidance through strategy, governance, succession and legacy. Based in Europe, working globally.

## About

${SITE.name} is a discreet family-enterprise advisory practice. The site is static HTML with full content available without JavaScript.

## Key pages (English)

${pageLines}

## Contact

Email: ${SITE.email}

## Canonical site

${CANONICAL_BASE}/

## GitHub Pages preview (not canonical)

https://${SITE.githubUser}.github.io/${SITE.repoName}/

## Sitemap

${CANONICAL_BASE}/sitemap.xml
`;
}
