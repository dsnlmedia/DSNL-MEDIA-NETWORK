#!/usr/bin/env node

/**
 * Generates static share pages for:
 * - /blogs/:postId
 * - /newsletter/:postId
 *
 * These pages improve link previews on WhatsApp/Telegram/Facebook crawlers.
 */

const fs = require('fs');
const path = require('path');

const MAX_PER_PAGE = 50;
const SITE_URL = process.env.SITE_URL || 'https://www.dsnlmedia.co.in';

const FEEDS = [
  {
    name: 'blog',
    feedUrl: 'https://dsnlmedia.blogspot.com/feeds/posts/default',
    outBasePath: 'blogs',
    canonicalBasePath: 'blogs',
    redirectParam: 'blogId',
    defaultDescription: 'Read this article on DSNL Media Network.',
    openingText: 'Opening article...',
  },
  {
    name: 'newsletter',
    feedUrl: 'https://dsnlmedia-news.blogspot.com/feeds/posts/default',
    outBasePath: 'newsletter',
    canonicalBasePath: 'newsletter',
    redirectParam: 'newsletterId',
    defaultDescription: 'Read this newsletter on DSNL Media Network.',
    openingText: 'Opening newsletter...',
  },
];

function ensureAbsoluteUrl(url) {
  if (!url) return `${SITE_URL}/dsnl-logo.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max = 180) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
}

function extractPostId(rawId) {
  const match = String(rawId ?? '').match(/post-(\d+)$/);
  return match ? match[1] : encodeURIComponent(String(rawId ?? ''));
}

function extractImage(entry) {
  const thumb = entry?.['media$thumbnail']?.url ?? '';
  if (thumb) {
    return thumb
      .replace(/\/s\d+-c\//, '/w1200-h630-c/')
      .replace(/\/s72-[^/]+\//, '/w1200-h630-c/');
  }

  const html = entry?.content?.$t ?? '';
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : `${SITE_URL}/dsnl-logo.png`;
}

function buildShareHtml(config, post) {
  const title = escapeHtml(post.title);
  const description = escapeHtml(post.description);
  const image = escapeHtml(ensureAbsoluteUrl(post.image));
  const canonicalUrl = `${SITE_URL}/${config.canonicalBasePath}/${encodeURIComponent(post.id)}`;
  const escapedCanonicalUrl = escapeHtml(canonicalUrl);
  const escapedId = escapeHtml(post.id);
  const escapedOpeningText = escapeHtml(config.openingText);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${escapedCanonicalUrl}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="DSNL Media Network" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${escapedCanonicalUrl}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />

    <script>
      (function () {
        var target = '/?${config.redirectParam}=${escapedId}';
        if (window.location.search.indexOf('no_redirect=1') !== -1) return;
        window.location.replace(target);
      })();
    </script>
  </head>
  <body>
    <p>${escapedOpeningText}</p>
    <p><a href="/?${config.redirectParam}=${escapedId}">Continue</a></p>
  </body>
</html>`;
}

async function fetchAllEntries(feedUrl) {
  const entries = [];
  let startIndex = 1;
  let totalResults = Infinity;

  while (entries.length < totalResults) {
    const params = new URLSearchParams({
      alt: 'json',
      'max-results': String(MAX_PER_PAGE),
      'start-index': String(startIndex),
    });
    const url = `${feedUrl}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const feed = data?.feed ?? {};
    const pageEntries = feed.entry ?? [];

    if (startIndex === 1) {
      totalResults = parseInt(feed?.openSearch$totalResults?.$t ?? '0', 10) || 0;
      if (totalResults === 0) break;
    }

    if (!pageEntries.length) break;
    entries.push(...pageEntries);
    startIndex += pageEntries.length;
  }

  return entries;
}

async function generateForFeed(config, distDir) {
  const entries = await fetchAllEntries(config.feedUrl);
  let count = 0;

  for (const entry of entries) {
    const id = extractPostId(entry?.id?.$t);
    if (!id) continue;

    const title = stripHtml(entry?.title?.$t || 'Post');
    const description = truncate(stripHtml(entry?.content?.$t || ''), 180) || config.defaultDescription;
    const image = extractImage(entry);

    const html = buildShareHtml(config, { id, title, description, image });
    const outDir = path.join(distDir, config.outBasePath, id);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    count += 1;
  }

  return count;
}

async function generate() {
  const distDir = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    console.warn('[share-pages] dist folder not found. Run vite build first.');
    return;
  }

  for (const config of FEEDS) {
    try {
      const count = await generateForFeed(config, distDir);
      console.log(`[share-pages] Generated ${count} ${config.name} share page(s).`);
    } catch (err) {
      // Do not fail deployment build if a feed is temporarily unavailable.
      console.warn(`[share-pages] Skipped ${config.name}: ${err.message}`);
    }
  }
}

generate().catch((err) => {
  console.warn(`[share-pages] Skipped generation: ${err.message}`);
});

