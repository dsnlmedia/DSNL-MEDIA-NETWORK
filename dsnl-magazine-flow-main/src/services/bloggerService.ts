// Blogger JSON Feed Service
// Fetches ALL posts from https://www.sameersrivastava.net.in using paginated API calls

const BLOGGER_BASE = 'https://dsnlmedia.blogspot.com/';
const MAX_PER_PAGE = 50; // Blogger API maximum per request

// Build a proxied URL — tries Vite dev proxy first, falls back to corsproxy.io
function buildUrl(startIndex: number): { vite: string; cors: string } {
    const params = `alt=json&max-results=${MAX_PER_PAGE}&start-index=${startIndex}`;
    const direct = `${BLOGGER_BASE}?${params}`;
    return {
        vite: `/blogger-feed?${params}`,
        cors: `https://corsproxy.io/?${encodeURIComponent(direct)}`,
    };
}

async function fetchPage(startIndex: number): Promise<Response> {
    const { vite, cors } = buildUrl(startIndex);

    // Try Vite dev proxy first (local, fast, no external dependency)
    try {
        const res = await fetch(vite, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
            // Vite SPA mode returns index.html (text/html, status 200) for unknown routes.
            // The real Blogger JSON feed returns application/json. Check content-type to tell them apart.
            const ct = res.headers.get('content-type') ?? '';
            if (ct.includes('json') || ct.includes('javascript') || ct.includes('text/plain')) {
                return res; // ✅ real JSON response from proxy
            }
            // Otherwise it's the SPA HTML fallback — fall through to corsproxy.io
        }
    } catch {
        // Timeout (4s) or network error — fall through to corsproxy.io
    }

    // Fallback: corsproxy.io — reliable public CORS proxy
    const res = await fetch(cors);
    if (!res.ok) throw new Error(`Blogger feed request failed: ${res.status}`);
    return res;
}

export interface BlogPost {
    id: string;
    title: string;
    published: string;
    updated: string;
    categories: string[];
    content: string;       // Full HTML content
    excerpt: string;       // Plain-text excerpt (~200 chars)
    thumbnail: string;     // Thumbnail image URL
    postUrl: string;       // Original Blogger post URL
    author: string;
}

interface BloggerFeedEntry {
    id: { $t: string };
    published: { $t: string };
    updated: { $t: string };
    title: { $t: string };
    content: { $t: string };
    category?: { scheme: string; term: string }[];
    link: { rel: string; type: string; href: string; title?: string }[];
    author: { name: { $t: string } }[];
    'media$thumbnail'?: { url: string; height: string; width: string };
}

interface BloggerFeed {
    version: string;
    feed: {
        entry?: BloggerFeedEntry[];
        openSearch$totalResults: { $t: string };
        openSearch$startIndex: { $t: string };
        openSearch$itemsPerPage: { $t: string };
    };
}

function extractExcerpt(html: string, maxLength = 200): string {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length <= maxLength ? text : text.substring(0, maxLength).trimEnd() + '…';
}

function extractPostId(rawId: string): string {
    // "tag:blogger.com,1999:blog-BLOGID.post-POSTID"
    const match = rawId.match(/post-(\d+)$/);
    return match ? match[1] : encodeURIComponent(rawId);
}

function parseFeedEntry(entry: BloggerFeedEntry): BlogPost {
    const alternateLink = entry.link.find((l) => l.rel === 'alternate');
    const rawThumb = entry['media$thumbnail']?.url ?? '';
    // Upgrade thumbnail to a larger size
    const thumbnail = rawThumb.replace(/\/s\d+-c\//, '/w640-h360-c/').replace(/\/s72-[^/]+\//, '/w640-h360-c/');
    const htmlContent = entry.content?.$t ?? '';

    return {
        id: extractPostId(entry.id.$t),
        title: entry.title.$t,
        published: entry.published.$t,
        updated: entry.updated.$t,
        categories: entry.category?.map((c) => c.term) ?? [],
        content: htmlContent,
        excerpt: extractExcerpt(htmlContent),
        thumbnail,
        postUrl: alternateLink?.href ?? '',
        author: entry.author?.[0]?.name?.$t ?? 'Sameer Srivastava',
    };
}

class BloggerService {
    private cache: BlogPost[] | null = null;

    /** Fetches every page of posts until all are retrieved */
    async getPosts(): Promise<BlogPost[]> {
        if (this.cache) return this.cache;

        const allPosts: BlogPost[] = [];
        let startIndex = 1;
        let totalResults = Infinity; // will be set after first response

        while (allPosts.length < totalResults) {
            const response = await fetchPage(startIndex);
            const data: BloggerFeed = await response.json();

            // Parse total from first response
            if (startIndex === 1) {
                totalResults = parseInt(data.feed?.openSearch$totalResults?.$t ?? '0', 10);
                if (totalResults === 0) break;
            }

            const entries = data.feed?.entry ?? [];
            if (entries.length === 0) break; // no more entries

            allPosts.push(...entries.map(parseFeedEntry));
            startIndex += entries.length;
        }

        this.cache = allPosts;
        console.log(`[BloggerService] Loaded ${allPosts.length} of ${totalResults} total posts`);
        return this.cache;
    }

    async getPostById(id: string): Promise<BlogPost | null> {
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

export const bloggerService = new BloggerService();
