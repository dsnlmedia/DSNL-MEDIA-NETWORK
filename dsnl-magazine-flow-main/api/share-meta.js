const SITE_URL = process.env.SITE_URL || "https://www.dsnlmedia.co.in";

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

function ensureAbsoluteUrl(url) {
  if (!url) return `${SITE_URL}/dsnl-logo.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function extractImage(entry) {
  const thumb = entry?.["media$thumbnail"]?.url ?? "";
  if (thumb) {
    return thumb
      .replace(/\/s\d+-c\//, "/w1200-h630-c/")
      .replace(/\/s72-[^/]+\//, "/w1200-h630-c/");
  }

  const html = entry?.content?.$t ?? "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : `${SITE_URL}/dsnl-logo.png`;
}

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
  if (!res.ok) return null;
  const data = await res.json();
  return data?.entry ?? null;
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
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.status(200).send(html);
}

