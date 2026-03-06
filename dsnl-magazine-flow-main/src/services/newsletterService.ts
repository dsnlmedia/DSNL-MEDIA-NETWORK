// Newsletter Service — fetches posts from dsnlmedia-news.blogspot.com

const NEWSLETTER_BASE = 'https://dsnlmedia-news.blogspot.com/feeds/posts/default';
const MAX_PER_PAGE = 50;

function buildUrl(startIndex: number): { vite: string; cors: string } {
    const params = `alt=json&max-results=${MAX_PER_PAGE}&start-index=${startIndex}`;
    const direct = `${NEWSLETTER_BASE}?${params}`;
    return {
        vite: `/dsnl-news-feed?${params}`,
        cors: `https://corsproxy.io/?${encodeURIComponent(direct)}`,
    };
}

async function fetchPage(startIndex: number): Promise<Response> {
    const { vite, cors } = buildUrl(startIndex);

    // Try Vite dev proxy first
    try {
        const res = await fetch(vite, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
            const ct = res.headers.get('content-type') ?? '';
            if (ct.includes('json') || ct.includes('javascript') || ct.includes('text/plain')) {
                return res;
            }
        }
    } catch {
        // Vite proxy not ready or SPA HTML fallback — fall through
    }

    // Fallback: corsproxy.io
    const res = await fetch(cors);
    if (!res.ok) throw new Error(`Newsletter feed request failed: ${res.status}`);
    return res;
}

export interface NewsletterPost {
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

function extractExcerpt(html: string, maxLength = 200): string {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length <= maxLength ? text : text.substring(0, maxLength).trimEnd() + '…';
}

function extractPostId(rawId: string): string {
    const match = rawId.match(/post-(\d+)$/);
    return match ? match[1] : encodeURIComponent(rawId);
}

function parseEntry(entry: BloggerFeedEntry): NewsletterPost {
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
        author: entry.author?.[0]?.name?.$t ?? 'DSNL Media',
        categories: (entry.category ?? []).map((c: { term: string }) => c.term),
    };
}

class NewsletterService {
    private cache: NewsletterPost[] | null = null;

    async getPosts(): Promise<NewsletterPost[]> {
        if (this.cache) return this.cache;

        const allPosts: NewsletterPost[] = [];
        let startIndex = 1;
        let totalResults = Infinity;

        while (allPosts.length < totalResults) {
            const response = await fetchPage(startIndex);
            const data: BloggerFeed = await response.json();

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
        console.log(`[NewsletterService] Loaded ${allPosts.length} of ${totalResults} total posts`);
        return this.cache;
    }

    async getPostById(id: string): Promise<NewsletterPost | null> {
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

export const newsletterService = new NewsletterService();
