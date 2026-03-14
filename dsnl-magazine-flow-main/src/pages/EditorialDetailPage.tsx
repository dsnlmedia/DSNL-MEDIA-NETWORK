import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { editorialService, EditorialPost } from '@/services/editorialService';
import { ArrowLeft, Calendar, User, Tag, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditorialDetailPage() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();

    const { data: post, isLoading, isError } = useQuery<EditorialPost | null>({
        queryKey: ['dsnl-editorial', postId],
        queryFn: () => editorialService.getPostById(postId ?? ''),
        staleTime: 5 * 60 * 1000,
        enabled: !!postId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 size={40} className="text-primary animate-spin" />
                    <p className="text-body text-lg">Loading editorial...</p>
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
                    <p className="text-headline text-lg font-semibold">Editorial not found</p>
                    <Button variant="ghost" onClick={() => navigate('/editorial-speaks')} className="mt-2">
                        <ArrowLeft size={16} className="mr-2" /> Back to Editorial Speaks
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-10 max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/editorial-speaks')}
                    className="mb-8 text-body hover:text-headline -ml-2"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Editorial Speaks
                </Button>

                <h1 className="font-display text-3xl md:text-4xl font-bold text-headline leading-tight mb-6">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-metadata text-sm mb-8 pb-8 border-b border-border/30">
                    <span className="flex items-center gap-1.5">
                        <User size={14} />
                        {post.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {editorialService.formatDate(post.published)}
                    </span>
                </div>

                <article
                    className="blogger-content w-full overflow-hidden [&_img]:mx-auto [&_img]:block [&_.separator]:text-center [&_table]:mx-auto"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-12 pt-8 border-t border-border/30 space-y-5">
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
                        onClick={() => navigate('/editorial-speaks')}
                        className="border-primary/30 text-primary hover:bg-primary/10"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Editorial Speaks
                    </Button>
                </div>
            </main>
        </div>
    );
}
