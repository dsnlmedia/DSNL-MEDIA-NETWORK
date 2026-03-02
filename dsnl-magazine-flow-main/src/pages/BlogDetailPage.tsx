import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bloggerService, BlogPost } from '@/services/bloggerService';
import { Header } from '@/components/Header';
import { ArrowLeft, Calendar, User, Tag, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogDetailPage() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();

    const { data: post, isLoading, isError } = useQuery<BlogPost | null>({
        queryKey: ['blogger-post', postId],
        queryFn: () => bloggerService.getPostById(postId ?? ''),
        staleTime: 5 * 60 * 1000,
        enabled: !!postId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 size={40} className="text-primary animate-spin" />
                    <p className="text-body text-lg">Loading article…</p>
                </div>
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <AlertCircle size={40} className="text-destructive" />
                    <p className="text-headline text-lg font-semibold">Article not found</p>
                    <Button variant="ghost" onClick={() => navigate('/blogs')} className="mt-2">
                        <ArrowLeft size={16} className="mr-2" /> Back to Blogs
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-10 max-w-4xl">
                {/* Back button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/blogs')}
                    className="mb-8 text-body hover:text-headline -ml-2"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Blogs
                </Button>

                {/* Hero thumbnail */}
                {post.thumbnail && (
                    <div className="w-full rounded-2xl overflow-hidden mb-8 aspect-[16/7] bg-muted">
                        <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Category tags */}
                {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {post.categories.map((cat) => (
                            <span
                                key={cat}
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full"
                            >
                                <Tag size={10} />
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="font-display text-3xl md:text-4xl font-bold text-headline leading-tight mb-6">
                    {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-metadata text-sm mb-8 pb-8 border-b border-border/30">
                    <span className="flex items-center gap-1.5">
                        <User size={14} />
                        {post.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {bloggerService.formatDate(post.published)}
                    </span>
                    <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-primary hover:underline ml-auto"
                    >
                        View on Blogger <ExternalLink size={12} />
                    </a>
                </div>

                {/* Full Blog Content */}
                <article
                    className="blogger-content w-full overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Footer back button */}
                <div className="mt-12 pt-8 border-t border-border/30">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/blogs')}
                        className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Blogs
                    </Button>
                </div>
            </main>
        </div>
    );
}
