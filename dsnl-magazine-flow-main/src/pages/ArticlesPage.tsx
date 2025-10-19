import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { contentAPI, ContentItem } from '../services/contentApi';

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  const fetchArticles = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contentAPI.getArticles(page, 12);
      setArticles(response.articles || []);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total
      });
    } catch (err) {
      setError('Failed to load articles. Please try again later.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, pagination.currentPage - half);
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (pagination.currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          className="px-4 py-2 text-sm bg-card border border-border rounded-lg hover:bg-accent/30 transition-all duration-300 font-display font-semibold text-body hover:text-headline"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-4 py-2 text-sm border rounded-lg transition-all duration-300 font-display font-semibold ${
            page === pagination.currentPage
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-body border-border hover:bg-accent/30 hover:text-headline'
          }`}
        >
          {page}
        </button>
      );
    }

    // Next button
    if (pagination.currentPage < pagination.totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          className="px-4 py-2 text-sm bg-card border border-border rounded-lg hover:bg-accent/30 transition-all duration-300 font-display font-semibold text-body hover:text-headline"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-12">
        {pages}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-metadata font-sans">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-sans">{error}</p>
            </div>
            <button
              onClick={() => fetchArticles(currentPage)}
              className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-display font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Magazine Header */}
      <div className="bg-card border-b border-border/30">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl">
            <div className="flex items-center mb-4">
              <div className="w-2 h-8 bg-primary rounded-full mr-3"></div>
              <div>
                <h1 className="text-4xl font-display font-bold text-headline mb-1 tracking-tight">
                  Articles
                </h1>
                <div className="w-24 h-0.5 bg-primary/30 rounded-full"></div>
              </div>
            </div>
            <p className="text-lg text-body font-sans leading-relaxed mb-4 max-w-2xl">
              Discover our latest insights, research, and thought leadership pieces that shape the conversation in our industry.
            </p>
            {/* Decorative red bars */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-12 h-1 bg-primary rounded-full"></div>
              <div className="w-8 h-1 bg-primary/70 rounded-full"></div>
              <div className="w-4 h-1 bg-primary/40 rounded-full"></div>
            </div>
            {pagination.total > 0 && (
              <div className="inline-flex items-center px-4 py-2 bg-accent/20 rounded-full">
                <span className="text-sm text-metadata font-sans">
                  {pagination.total} article{pagination.total !== 1 ? 's' : ''} available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Red Accent Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>
      
      {/* Premium Content Area */}
      <div className="container mx-auto px-6 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl text-primary">📄</div>
            </div>
            <h2 className="text-3xl font-display font-bold text-headline mb-3">No Articles Yet</h2>
            <p className="text-lg text-body font-sans mb-8 max-w-md mx-auto leading-relaxed">
              We're working on bringing you exceptional content and insights. Check back soon!
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-display font-semibold"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="magazine-grid">
              {articles.map((article) => (
                <article
                  key={article._id}
                  className="magazine-card group cursor-pointer"
                  onClick={() => window.location.href = `/articles/${article._id}`}
                >
                  <div className="aspect-[4/3] bg-muted/50 overflow-hidden flex items-center justify-center">
                    {/* Debug: Log article data */}
                    {console.log('Article data:', { id: article._id, title: article.title, thumbnailUrl: article.thumbnailUrl })}
                    {article.thumbnailUrl ? (
                      <img
                        src={contentAPI.getFileUrl(article.thumbnailUrl)}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onLoad={() => console.log('Image loaded successfully:', article.thumbnailUrl)}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          console.error('Image failed to load:', img.src, 'Article:', article.title);
                          const parent = img.parentElement;
                          img.style.display = 'none';
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex flex-col items-center justify-center text-metadata h-full">
                                <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span class="text-xs font-sans">Article</span>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-metadata h-full">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs font-sans">Article</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Red Accent Line for Articles */}
                  <div className="h-1 bg-gradient-to-r from-primary to-primary/50"></div>
                  
                  <div className="p-6">
                    {/* Article Category & Metadata with Red Accent */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-metadata">
                        {/* Small red accent bar */}
                        <div className="w-1 h-4 bg-primary rounded-full mr-3"></div>
                        <span className="font-sans">By {article.editorName}</span>
                        <span className="mx-2">•</span>
                        <span className="font-sans">{contentAPI.formatDate(article.publishedAt)}</span>
                      </div>
                      <span className="category-badge">
                        {article.fileType?.toUpperCase() || 'ARTICLE'}
                      </span>
                    </div>
                    
                    {/* Article Title */}
                    <h2 className="text-xl font-display font-bold text-headline mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {article.title}
                    </h2>
                    
                    {/* Article Description */}
                    <p className="text-body font-sans mb-6 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                    
                    {/* Read More Link */}
                    <Link
                      to={`/articles/${article._id}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-display font-semibold text-sm transition-colors duration-300 group-hover:translate-x-1 transform"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Read Article
                      <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;