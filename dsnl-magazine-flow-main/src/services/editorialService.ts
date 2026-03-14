// Editorial Service
// Fetches all public posts from DSNL Editorial Blogger feed using paginated calls.

const EDITORIAL_FEED_URL = 'https://dsnlmedia-editorials.blogspot.com/feeds/posts/default';
const MAX_PER_PAGE = 50;
const JSONP_TIMEOUT_MS = 12000;

export interface EditorialPost {
    id: string;
    title: string;
    published: string;
    updated: string;
    content: string;
    excerpt: string;
    thumbnail: string;
    postUrl: string;
    author: string;
    categories: string[];
}

interface BloggerFeedEntry {
    id: { $t: string };
    published: { $t: string };
    updated: { $t: string };
    title: { $t: string };
    content: { $t: string };
    link: { rel: string; type: string; href: string }[];
    author: { name: { $t: string } }[];
    category?: { scheme: string; term: string }[];
    'media$thumbnail'?: { url: string; height: string; width: string };
}

interface BloggerFeed {
    feed: {
        entry?: BloggerFeedEntry[];
        openSearch$totalResults: { $t: string };
    };
}

function buildProxyUrl(startIndex: number): string {
    const params = new URLSearchParams({
        alt: 'json',
        'max-results': String(MAX_PER_PAGE),
        'start-index': String(startIndex),
    });
    return `/dsnl-editorials-feed?${params.toString()}`;
}

function buildJsonpUrl(startIndex: number, callbackName: string): string {
    const params = new URLSearchParams({
        alt: 'json-in-script',
        callback: callbackName,
        'max-results': String(MAX_PER_PAGE),
        'start-index': String(startIndex),
    });
    return `${EDITORIAL_FEED_URL}?${params.toString()}`;
}

async function fetchViaDevProxy(startIndex: number): Promise<BloggerFeed | null> {
    const isLocalHost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isLocalHost) return null;

    try {
        const res = await fetch(buildProxyUrl(startIndex), { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return null;

        const contentType = res.headers.get('content-type') ?? '';
        const looksLikeJson =
            contentType.includes('json') ||
            contentType.includes('javascript') ||
            contentType.includes('text/plain');

        if (!looksLikeJson) return null;
        return (await res.json()) as BloggerFeed;
    } catch {
        return null;
    }
}

function fetchViaJsonp(startIndex: number): Promise<BloggerFeed> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            reject(new Error('Editorial feed is unavailable in this environment'));
            return;
        }

        const callbackName = `__dsnlEditorialFeed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const script = document.createElement('script');
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            const globalWindow = window as unknown as Record<string, unknown>;
            delete globalWindow[callbackName];
            script.remove();
        };

        const globalWindow = window as unknown as Record<string, unknown>;
        globalWindow[callbackName] = (data: BloggerFeed) => {
            cleanup();
            if (!data?.feed) {
                reject(new Error('Invalid editorial feed response'));
                return;
            }
            resolve(data);
        };

        script.src = buildJsonpUrl(startIndex, callbackName);
        script.async = true;
        script.onerror = () => {
            cleanup();
            reject(new Error('Editorial feed request failed'));
        };

        timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Editorial feed request timed out'));
        }, JSONP_TIMEOUT_MS);

        document.head.appendChild(script);
    });
}

async function fetchPage(startIndex: number): Promise<BloggerFeed> {
    const proxyData = await fetchViaDevProxy(startIndex);
    if (proxyData) return proxyData;
    return fetchViaJsonp(startIndex);
}

function extractExcerpt(html: string, maxLength = 200): string {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length <= maxLength ? text : `${text.substring(0, maxLength).trimEnd()}...`;
}

function extractPostId(rawId: string): string {
    const match = rawId.match(/post-(\d+)$/);
    return match ? match[1] : encodeURIComponent(rawId);
}

function parseEntry(entry: BloggerFeedEntry): EditorialPost {
    const alternateLink = entry.link.find((l) => l.rel === 'alternate');
    const rawThumb = entry['media$thumbnail']?.url ?? '';
    const thumbnail = rawThumb.replace(/\/s\d+-c\//, '/w640-h360-c/').replace(/\/s72-[^/]+\//, '/w640-h360-c/');
    const htmlContent = entry.content?.$t ?? '';

    return {
        id: extractPostId(entry.id.$t),
        title: entry.title.$t,
        published: entry.published.$t,
        updated: entry.updated.$t,
        content: htmlContent,
        excerpt: extractExcerpt(htmlContent),
        thumbnail,
        postUrl: alternateLink?.href ?? '',
        author: entry.author?.[0]?.name?.$t ?? 'Editorial Desk',
        categories: (entry.category ?? []).map((c) => c.term),
    };
}

class EditorialService {
    private cache: EditorialPost[] | null = null;

    async getPosts(): Promise<EditorialPost[]> {
        if (this.cache) return this.cache;

        const allPosts: EditorialPost[] = [];
        let startIndex = 1;
        let totalResults = Infinity;

        while (allPosts.length < totalResults) {
            const data = await fetchPage(startIndex);

            if (startIndex === 1) {
                totalResults = parseInt(data.feed?.openSearch$totalResults?.$t ?? '0', 10);
                if (totalResults === 0) break;
            }

            const entries = data.feed?.entry ?? [];
            if (entries.length === 0) break;

            allPosts.push(...entries.map(parseEntry));
            startIndex += entries.length;
        }

        this.cache = allPosts;
        console.log(`[EditorialService] Loaded ${allPosts.length} of ${totalResults} total posts`);
        return this.cache;
    }

    async getPostById(id: string): Promise<EditorialPost | null> {
        const posts = await this.getPosts();
        return posts.find((p) => p.id === id) ?? null;
    }

    formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Unknown date';
        }
    }

    clearCache(): void {
        this.cache = null;
    }
}

export const editorialService = new EditorialService();
