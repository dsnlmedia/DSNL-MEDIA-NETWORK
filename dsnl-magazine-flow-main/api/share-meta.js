export const config = {
  maxDuration: 60,
};

const SITE_URL = process.env.SITE_URL || "https://www.dsnlmedia.co.in";
const MAX_PER_PAGE = 500;
const FETCH_TIMEOUT_MS = 12000;
const IMAGE_CHECK_TIMEOUT_MS = 6000;
const ENTRY_ATTEMPTS = 6;
const IMAGE_ATTEMPTS = 4;
const RETRY_WAIT_MS = 2000;

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

function getThumbCandidates(thumbUrl) {
  if (!thumbUrl) return [];

  const candidates = [thumbUrl];
  if (/\/s\d+-c\//.test(thumbUrl) || /\/s72-[^/]+\//.test(thumbUrl)) {
    candidates.push(
      thumbUrl.replace(/\/s\d+-c\//, "/w1200-h630-c/").replace(/\/s72-[^/]+\//, "/w1200-h630-c/")
    );
    candidates.push(
      thumbUrl.replace(/\/s\d+-c\//, "/w640-h360-c/").replace(/\/s72-[^/]+\//, "/w640-h360-c/")
    );
  }

  return uniq(candidates.map(ensureAbsoluteUrl));
}

function extractImageCandidatesFromHtml(html) {
  if (!html) return [];

  const candidates = [];

  const srcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const dataSrcRegex = /<img[^>]+data-src=["']([^"']+)["']/gi;
  const dataOrigRegex = /<img[^>]+data-original=["']([^"']+)["']/gi;
  const srcSetRegex = /<img[^>]+srcset=["']([^"']+)["']/gi;

  for (const regex of [srcRegex, dataSrcRegex, dataOrigRegex]) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      candidates.push(match[1]);
    }
  }

  let srcSetMatch;
  while ((srcSetMatch = srcSetRegex.exec(html)) !== null) {
    const srcSetValue = srcSetMatch[1] || "";
    const first = srcSetValue.split(",")[0]?.trim().split(" ")[0];
    if (first) candidates.push(first);
  }

  return uniq(candidates.map(ensureAbsoluteUrl));
}

function extractImageCandidatesFromEntry(entry) {
  const thumb = entry?.["media$thumbnail"]?.url ?? "";
  const html = entry?.content?.$t ?? "";

  return uniq([
    ...getThumbCandidates(thumb),
    ...extractImageCandidatesFromHtml(html),
  ]);
}

async function fetchEntryById(config, id) {
  const url = `${config.baseUrl}/${encodeURIComponent(id)}?alt=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.entry ?? null;
}

async function fetchEntryByQuery(config, id) {
  const url = `${config.baseUrl}?alt=json&max-results=10&q=${encodeURIComponent(id)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;

  const data = await res.json();
  const entries = data?.feed?.entry ?? [];
  const match = entries.find((entry) => extractPostId(entry?.id?.$t) === id);
  return match ?? null;
}

async function scanEntryInFeed(config, id) {
  let startIndex = 1;
  let totalResults = Infinity;

  while (startIndex <= totalResults) {
    const url = `${config.baseUrl}?alt=json&max-results=${MAX_PER_PAGE}&start-index=${startIndex}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) break;

    const data = await res.json();
    const feed = data?.feed ?? {};
    const entries = feed.entry ?? [];

    if (startIndex === 1) {
      totalResults = parseInt(feed?.openSearch$totalResults?.$t ?? "0", 10) || 0;
      if (!totalResults) break;
    }

    if (!entries.length) break;

    const match = entries.find((entry) => extractPostId(entry?.id?.$t) === id);
    if (match) return match;

    startIndex += entries.length;
  }

  return null;
}

async function resolveEntryWithRetries(config, id) {
  for (let attempt = 1; attempt <= ENTRY_ATTEMPTS; attempt += 1) {
    const byId = await fetchEntryById(config, id);
    if (byId) return byId;

    const byQuery = await fetchEntryByQuery(config, id);
    if (byQuery) return byQuery;

    // Full scan periodically and on final attempt.
    if (attempt === ENTRY_ATTEMPTS || attempt % 2 === 0) {
      const byScan = await scanEntryInFeed(config, id);
      if (byScan) return byScan;
    }

    if (attempt < ENTRY_ATTEMPTS) {
      await sleep(RETRY_WAIT_MS);
    }
  }

  return null;
}

async function extractPostPageImageCandidates(entry) {
  const alternateUrl = (entry?.link ?? []).find((link) => link?.rel === "alternate")?.href;
  if (!alternateUrl) return [];

  try {
    const res = await fetchWithTimeout(
      alternateUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; DSNLShareBot/1.0)",
          "Accept": "text/html,application/xhtml+xml",
        },
      },
      FETCH_TIMEOUT_MS
    );

    if (!res.ok) return [];

    const html = await res.text();

    const metaCandidates = [];
    const ogMetaRegexes = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/gi,
    ];

    for (const regex of ogMetaRegexes) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        metaCandidates.push(match[1]);
      }
    }

    return uniq([
      ...metaCandidates.map(ensureAbsoluteUrl),
      ...extractImageCandidatesFromHtml(html),
    ]);
  } catch {
    return [];
  }
}

async function isReachableImage(url) {
  if (!url) return false;

  try {
    const head = await fetchWithTimeout(url, { method: "HEAD" }, IMAGE_CHECK_TIMEOUT_MS);
    if (head.ok) {
      const contentType = (head.headers.get("content-type") || "").toLowerCase();
      if (!contentType || contentType.startsWith("image/")) return true;
    }
  } catch {
    // Try GET fallback below.
  }

  try {
    const get = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: { Range: "bytes=0-2048" },
      },
      IMAGE_CHECK_TIMEOUT_MS
    );

    if (!get.ok && get.status !== 206) return false;
    const contentType = (get.headers.get("content-type") || "").toLowerCase();
    return !contentType || contentType.startsWith("image/");
  } catch {
    return false;
  }
}

async function pickReachableImage(candidates) {
  for (const candidate of uniq(candidates)) {
    if (await isReachableImage(candidate)) {
      return candidate;
    }
  }
  return "";
}

async function resolveImageWithRetries(entry) {
  const feedCandidates = extractImageCandidatesFromEntry(entry);

  for (let attempt = 1; attempt <= IMAGE_ATTEMPTS; attempt += 1) {
    const postPageCandidates = await extractPostPageImageCandidates(entry);
    const image = await pickReachableImage([...feedCandidates, ...postPageCandidates]);
    if (image) return image;

    if (attempt < IMAGE_ATTEMPTS) {
      await sleep(RETRY_WAIT_MS);
    }
  }

  return "";
}

function resolveDescription(entry, title) {
  const contentText = stripHtml(entry?.content?.$t || "");
  const summaryText = stripHtml(entry?.summary?.$t || "");
  const rawText = contentText || summaryText;
  if (rawText) return truncate(rawText, 180);
  return `Read "${title}" on DSNL Media Network.`;
}

function buildHtml(config, id, title, description, image) {
  const safeTitle = escapeHtml(title || config.fallbackTitle);
  const safeDescription = escapeHtml(description || `Read "${title}" on DSNL Media Network.`);
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

export default async function handler(req, res) {
  const rawType = String(req.query?.type || "blog").toLowerCase();
  const id = String(req.query?.id || "").trim();
  const config = FEEDS[rawType] || FEEDS.blog;

  if (!id) {
    res.status(400).send("Missing id");
    return;
  }

  try {
    const entry = await resolveEntryWithRetries(config, id);
    if (!entry) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.setHeader("Retry-After", "20");
      res.status(503).send("Metadata is still syncing. Please retry in a moment.");
      return;
    }

    const image = await resolveImageWithRetries(entry);
    if (!image) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.setHeader("Retry-After", "20");
      res.status(503).send("Image is still syncing. Please retry in a moment.");
      return;
    }

    const title = stripHtml(entry?.title?.$t || config.fallbackTitle);
    const description = resolveDescription(entry, title);

    const html = buildHtml(config, id, title, description, image);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).send(html);
  } catch {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Retry-After", "20");
    res.status(503).send("Metadata lookup failed. Please retry shortly.");
  }
}
