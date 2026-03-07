export const config = {
  maxDuration: 60,
};

const SITE_URL = process.env.SITE_URL || "https://www.dsnlmedia.co.in";
const MAX_PER_PAGE = 50;
const MAX_PAGES_TO_SCAN = 5;

const FEEDS = {
  blog: {
    baseUrl: "https://dsnlmedia.blogspot.com/feeds/posts/default",
    pathBase: "blogs",
    redirectParam: "blogId",
    fallbackTitle: "DSNL Article",
    fallbackDescription: "Read this article on DSNL Media Network.",
    openingText: "Opening article...",
  },
  newsletter: {
    baseUrl: "https://dsnlmedia-news.blogspot.com/feeds/posts/default",
    pathBase: "newsletter",
    redirectParam: "newsletterId",
    fallbackTitle: "DSNL Newsletter",
    fallbackDescription: "Read this newsletter on DSNL Media Network.",
    openingText: "Opening newsletter...",
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function ensureAbsoluteUrl(url) {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function extractPostId(rawId) {
  const match = String(rawId ?? "").match(/post-(\d+)$/);
  return match ? match[1] : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, max = 180) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}...`;
}

function ensureAbsoluteUrl(url) {
  if (!url) return `${SITE_URL}/dsnl-logo.png`;
  if (url.startsWith("//")) return `https:${url}`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function fetchEntryById(config, id) {
  const url = `${config.baseUrl}/${encodeURIComponent(id)}?alt=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.entry ?? null;
}

function extractImage(entry) {
  const thumb = entry?.["media$thumbnail"]?.url ?? "";
  if (thumb) {
    return thumb
      .replace(/\/s\d+-c\//, "/w1200-h630-c/")
      .replace(/\/s72-[^/]+\//, "/w1200-h630-c/");
  }

  return null;
}

if (imgMatch) return imgMatch[1];

const srcSetMatch = html.match(/<img[^>]+srcset=["']([^"']+)["']/i);
if (srcSetMatch) {
  const firstSrcSetUrl = srcSetMatch[1].split(",")[0]?.trim().split(" ")[0];
  if (firstSrcSetUrl) return firstSrcSetUrl;
}

return imgMatch ? imgMatch[1] : `${SITE_URL}/dsnl-logo.png`;


function buildHtml(config, id, title, description, image) {
  const safeTitle = escapeHtml(title || config.fallbackTitle);
  const safeDescription = escapeHtml(description || config.fallbackDescription);
  const safeImage = escapeHtml(ensureAbsoluteUrl(image));
  const canonicalUrl = `${SITE_URL}/${config.pathBase}/${encodeURIComponent(id)}`;
  const safeCanonicalUrl = escapeHtml(canonicalUrl);
  const safeId = escapeHtml(id);
  const safeOpeningText = escapeHtml(config.openingText);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${safeCanonicalUrl}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="DSNL Media Network" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${safeCanonicalUrl}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />

    <script>
      (function () {
        var target = '/?${config.redirectParam}=${safeId}';
        if (window.location.search.indexOf('no_redirect=1') !== -1) return;
        window.location.replace(target);
      })();
    </script>
  </head>
  <body>
    <p>${safeOpeningText}</p>
    <p><a href="/?${config.redirectParam}=${safeId}">Continue</a></p>
  </body>
</html>`;
}

async function fetchEntry(config, id) {
  const url = `${config.baseUrl}/${encodeURIComponent(id)}?alt=json`;
  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    if (data?.entry) return data.entry;
  }

  // Fallback: scan latest feed pages and match by extracted numeric post id.
  for (let page = 0; page < MAX_PAGES_TO_SCAN; page += 1) {
    const startIndex = 1 + page * MAX_PER_PAGE;
    const feedUrl = `${config.baseUrl}?alt=json&max-results=${MAX_PER_PAGE}&start-index=${startIndex}`;
    const feedRes = await fetch(feedUrl);
    if (!feedRes.ok) break;

    const feedData = await feedRes.json();
    const entries = feedData?.feed?.entry ?? [];
    if (!entries.length) break;

    const match = entries.find((entry) => extractPostId(entry?.id?.$t) === id);
    if (match) return match;
  }

  return null;
}

export default async function handler(req, res) {
  const rawType = String(req.query?.type || "blog").toLowerCase();
  const id = String(req.query?.id || "").trim();
  const config = FEEDS[rawType] || FEEDS.blog;

  if (!id) {
    res.status(400).send("Missing id");
    return;
  }

  let title = config.fallbackTitle;
  let description = config.fallbackDescription;
  let image = `${SITE_URL}/dsnl-logo.png`;

  try {
    const entry = await fetchEntry(config, id);
    if (entry) {
      title = stripHtml(entry?.title?.$t || config.fallbackTitle);
      description = truncate(stripHtml(entry?.content?.$t || ""), 180) || config.fallbackDescription;
      image = extractImage(entry);
    }
  } catch {
    // Serve fallback metadata if feed lookup fails.
  }

  const html = buildHtml(config, id, title, description, image);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
  res.status(200).send(html);
}
