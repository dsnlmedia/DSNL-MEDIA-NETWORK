import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { newsletterService, NewsletterPost } from '@/services/newsletterService';
import { ArrowLeft, Calendar, User, Tag, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewsletterDetailPage() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();

    const { data: post, isLoading, isError } = useQuery<NewsletterPost | null>({
        queryKey: ['dsnl-newsletter', postId],
        queryFn: () => newsletterService.getPostById(postId ?? ''),
        staleTime: 5 * 60 * 1000,
        enabled: !!postId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 size={40} className="text-primary animate-spin" />
                    <p className="text-body text-lg">Loading newsletter…</p>
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
                    <p className="text-headline text-lg font-semibold">Newsletter not found</p>
                    <Button variant="ghost" onClick={() => navigate('/newsletter')} className="mt-2">
                        <ArrowLeft size={16} className="mr-2" /> Back to Newsletters
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
                    onClick={() => navigate('/newsletter')}
                    className="mb-8 text-body hover:text-headline -ml-2"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Newsletters
                </Button>


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
                        {newsletterService.formatDate(post.published)}
                    </span>
                </div>

                {/* Full Content */}
                <article
                    className="prose prose-neutral dark:prose-invert max-w-none
                     prose-headings:font-display prose-headings:text-headline
                     prose-p:text-body prose-p:leading-relaxed
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-img:mx-auto prose-img:block prose-img:text-center
                     prose-strong:text-headline
                     prose-li:text-body [&_img]:mx-auto [&_img]:block [&_.separator]:text-center"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Footer: tags + back button */}
                <div className="mt-12 pt-8 border-t border-border/30 space-y-5">
                    {/* Category Tags */}
                    {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.categories.map((cat) => (
                                <span
                                    key={cat}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full"
                                >
                                    <Tag size={10} />
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => navigate('/newsletter')}
                        className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Newsletters
                    </Button>
                </div>
            </main>
        </div>
    );
}
