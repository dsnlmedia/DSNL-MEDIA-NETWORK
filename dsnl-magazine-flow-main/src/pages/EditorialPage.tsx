import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { editorialService, EditorialPost } from '@/services/editorialService';
import { Edit3, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function EditorialPage() {
    const navigate = useNavigate();

    const { data: posts, isLoading, isError, error } = useQuery<EditorialPost[]>({
        queryKey: ['dsnl-editorials'],
        queryFn: () => editorialService.getPosts(),
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Content */}
            <main className="container mx-auto px-4 py-12">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 size={40} className="text-primary animate-spin" />
                        <p className="text-body text-lg">Loading editorials...</p>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <AlertCircle size={40} className="text-destructive" />
                        <p className="text-headline text-lg font-semibold">Failed to load editorials</p>
                        <p className="text-metadata text-sm">
                            {(error as Error)?.message ?? 'Please check your internet connection and try again.'}
                        </p>
                    </div>
                )}

                {posts && posts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <EditorialCard
                                key={post.id}
                                post={post}
                                onClick={() => navigate(`/editorial-speaks/${post.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

interface EditorialCardProps {
    post: EditorialPost;
    onClick: () => void;
}

function EditorialCard({ post, onClick }: EditorialCardProps) {
    const date = editorialService.formatDate(post.published);

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
                        <Edit3 size={48} className="text-primary/30" />
                    </div>
                )}
                <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    Editorial
                </span>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-metadata text-xs mb-3">
                    <Calendar size={12} />
                    <span>{date}</span>
                </div>

                <h2 className="font-display text-base font-semibold text-headline leading-snug mb-3
                       group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {post.title}
                </h2>

                <p className="text-body text-sm leading-relaxed line-clamp-3 flex-1">
                    {post.excerpt}
                </p>

                <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-end">
                    <span className="flex items-center gap-1 text-primary text-xs font-semibold
                           group-hover:gap-2 transition-all duration-200">
                        Read <ArrowRight size={12} />
                    </span>
                </div>
            </div>
        </article>
    );
}
