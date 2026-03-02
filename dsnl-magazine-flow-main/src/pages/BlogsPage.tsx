import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bloggerService, BlogPost } from '@/services/bloggerService';
import { Header } from '@/components/Header';
import { BookOpen, Calendar, Tag, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function BlogsPage() {
    const navigate = useNavigate();

    const { data: posts, isLoading, isError, error } = useQuery<BlogPost[]>({
        queryKey: ['blogger-posts'],
        queryFn: () => bloggerService.getPosts(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Banner */}
            <section className="relative border-b border-border/30 bg-gradient-to-br from-card via-background to-accent/10 py-16 px-4">
                <div className="container mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                        <BookOpen size={28} className="text-primary" />
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-headline mb-4">
                        Sameer Speaks
                    </h1>
                    <p className="text-body text-lg max-w-2xl mx-auto leading-relaxed">
                        Insights on Technology, Strategy, AI, Cybersecurity & Leadership by{' '}
                        <span className="text-primary font-semibold">Sameer Srivastava</span> — COO &amp; CISO, Anant Raj Cloud.
                    </p>
                    {posts && (
                        <p className="mt-3 text-metadata text-sm">
                            {posts.length} articles published
                        </p>
                    )}
                </div>
            </section>

            {/* Content */}
            <main className="container mx-auto px-4 py-12">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 size={40} className="text-primary animate-spin" />
                        <p className="text-body text-lg">Loading blogs…</p>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <AlertCircle size={40} className="text-destructive" />
                        <p className="text-headline text-lg font-semibold">Failed to load blogs</p>
                        <p className="text-metadata text-sm">
                            {(error as Error)?.message ?? 'Please check your internet connection and try again.'}
                        </p>
                    </div>
                )}

                {posts && posts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <BlogCard key={post.id} post={post} onClick={() => navigate(`/blogs/${post.id}`)} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

interface BlogCardProps {
    post: BlogPost;
    onClick: () => void;
}

function BlogCard({ post, onClick }: BlogCardProps) {
    const date = bloggerService.formatDate(post.published);
    const topCategories = post.categories.slice(0, 3);

    return (
        <article
            onClick={onClick}
            className="group cursor-pointer bg-card border border-border/30 rounded-2xl overflow-hidden
                 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
                 transition-all duration-300 flex flex-col"
        >
            {/* Thumbnail */}
            <div className="relative overflow-hidden aspect-[16/9] bg-muted">
                {post.thumbnail ? (
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20">
                        <BookOpen size={48} className="text-primary/30" />
                    </div>
                )}
                {/* Category pill overlay */}
                {topCategories[0] && (
                    <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {topCategories[0]}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                {/* Date */}
                <div className="flex items-center gap-1.5 text-metadata text-xs mb-3">
                    <Calendar size={12} />
                    <span>{date}</span>
                </div>

                {/* Title */}
                <h2 className="font-display text-base font-semibold text-headline leading-snug mb-3
                       group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-body text-sm leading-relaxed line-clamp-3 flex-1">
                    {post.excerpt}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between gap-2">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                        {topCategories.slice(1).map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 text-[10px] text-metadata bg-muted/60 rounded-full px-2 py-0.5"
                            >
                                <Tag size={8} />
                                {tag}
                            </span>
                        ))}
                    </div>
                    {/* Read more */}
                    <span className="flex-shrink-0 flex items-center gap-1 text-primary text-xs font-semibold
                           group-hover:gap-2 transition-all duration-200">
                        Read <ArrowRight size={12} />
                    </span>
                </div>
            </div>
        </article>
    );
}
