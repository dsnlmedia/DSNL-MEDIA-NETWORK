const SITE_URL = process.env.SITE_URL || "https://www.dsnlmedia.co.in";
const MAX_PER_PAGE = 500;
const FETCH_TIMEOUT_MS = 12000;
const METADATA_ATTEMPTS = 3;
const RETRY_WAIT_MS = 1200;

const FEEDS = {
  blog: {
    baseUrl: "https://dsnlmedia.blogspot.com/feeds/posts/default",
    pathBase: "blogs",
    redirectParam: "blogId",
    fallbackTitle: "DSNL Article",
    openingText: "Opening article...",
  },
  newsletter: {
    baseUrl: "https://dsnlmedia-news.blogspot.com/feeds/posts/default",
    pathBase: "newsletter",
    redirectParam: "newsletterId",
    fallbackTitle: "DSNL Newsletter",
    openingText: "Opening newsletter...",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
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

function extractImage(entry) {
  const thumb = entry?.["media$thumbnail"]?.url ?? "";
  if (thumb) {
    return ensureAbsoluteUrl(
      thumb
      .replace(/\/s\d+-c\//, "/w1200-h630-c/")
      .replace(/\/s72-[^/]+\//, "/w1200-h630-c/")
    );
  }

  const html = entry?.content?.$t ?? "";
  const imgMatch =
    html.match(/<img[^>]+src=["']([^"']+)["']/i) ||
    html.match(/<img[^>]+data-src=["']([^"']+)["']/i) ||
    html.match(/<img[^>]+data-original=["']([^"']+)["']/i);

  if (imgMatch) return ensureAbsoluteUrl(imgMatch[1]);

  const srcSetMatch = html.match(/<img[^>]+srcset=["']([^"']+)["']/i);
  if (srcSetMatch) {
    const firstSrcSetUrl = srcSetMatch[1].split(",")[0]?.trim().split(" ")[0];
    if (firstSrcSetUrl) return ensureAbsoluteUrl(firstSrcSetUrl);
  }

  return "";
}

async function extractImageFromPostPage(entry) {
  const alternateUrl = (entry?.link ?? []).find((link) => link?.rel === "alternate")?.href;
  if (!alternateUrl) return "";

  try {
    const res = await fetchWithTimeout(alternateUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DSNLShareBot/1.0)",
      },
    });
    if (!res.ok) return "";

    const html = await res.text();
    const ogImageMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    if (ogImageMatch?.[1]) return ensureAbsoluteUrl(ogImageMatch[1]);

    const htmlImageMatch =
      html.match(/<img[^>]+src=["']([^"']+)["']/i) ||
      html.match(/<img[^>]+data-src=["']([^"']+)["']/i) ||
      html.match(/<img[^>]+data-original=["']([^"']+)["']/i);

    return ensureAbsoluteUrl(htmlImageMatch?.[1] ?? "");
  } catch {
    return "";
  }
}

async function resolveImage(entry) {
  const imageFromFeed = extractImage(entry);
  if (imageFromFeed) return imageFromFeed;

  const imageFromPostPage = await extractImageFromPostPage(entry);
  if (imageFromPostPage) return imageFromPostPage;

  return "";
}

function resolveDescription(config, entry, title) {
  const contentText = stripHtml(entry?.content?.$t || "");
  const summaryText = stripHtml(entry?.summary?.$t || "");
  const rawText = contentText || summaryText;
  if (rawText) return truncate(rawText, 180);
  return `Read "${title}" on DSNL Media Network.`;
}

function buildHtml(config, id, title, description, image) {
  const safeTitle = escapeHtml(title || config.fallbackTitle);
  const safeDescription = escapeHtml(description || `Read "${safeTitle}" on DSNL Media Network.`);
  const safeImage = escapeHtml(image);
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
  const res = await fetchWithTimeout(url);
  if (res.ok) {
    const data = await res.json();
    if (data?.entry) return data.entry;
  }

  // Exhaustive scan from latest to oldest pages until match is found.
  let startIndex = 1;
  let totalResults = Infinity;

  while (startIndex <= totalResults) {
    const feedUrl = `${config.baseUrl}?alt=json&max-results=${MAX_PER_PAGE}&start-index=${startIndex}`;
    const feedRes = await fetchWithTimeout(feedUrl);
    if (!feedRes.ok) break;

    const feedData = await feedRes.json();
    const feed = feedData?.feed ?? {};
    const entries = feed.entry ?? [];
    if (startIndex === 1) {
      totalResults = parseInt(feed?.openSearch$totalResults?.$t ?? "0", 10) || 0;
      if (totalResults === 0) break;
    }
    if (!entries.length) break;

    const match = entries.find((entry) => extractPostId(entry?.id?.$t) === id);
    if (match) return match;

    startIndex += entries.length;
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

  try {
    let entry = null;
    let image = "";

    for (let attempt = 1; attempt <= METADATA_ATTEMPTS; attempt += 1) {
      entry = await fetchEntry(config, id);
      if (entry) {
        image = await resolveImage(entry);
        if (image) break;
      }

      if (attempt < METADATA_ATTEMPTS) {
        await sleep(RETRY_WAIT_MS);
      }
    }

    if (!entry || !image) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.setHeader("Retry-After", "15");
      res.status(503).send("Metadata is still syncing. Please retry in a moment.");
      return;
    }

    const title = stripHtml(entry?.title?.$t || config.fallbackTitle);
    const description = resolveDescription(config, entry, title);
    const html = buildHtml(config, id, title, description, image);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).send(html);
    return;
  } catch {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Retry-After", "15");
    res.status(503).send("Metadata lookup failed. Please retry shortly.");
    return;
  }
}
