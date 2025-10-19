import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentAPI, ContentItem } from '../services/contentApi';
import ContinuousPDFViewer from '../components/ContinuousPDFViewer';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ContentItem[]>([]);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
      fetchRelatedArticles();
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const articleData = await contentAPI.getContentById(articleId);
      setArticle(articleData);
      
      // Update page title
      document.title = `${articleData.title} - DSNL Publications`;
    } catch (err) {
      setError('Article not found or failed to load.');
      document.title = 'Article Not Found - DSNL Publications';
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const articles = await contentAPI.getRecentArticles(4);
      setRelatedArticles(articles);
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  useEffect(() => {
    return () => {
      // Reset page title when component unmounts
      document.title = 'DSNL Publications';
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-metadata font-sans">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl text-primary">📄</div>
            </div>
            <h1 className="text-3xl font-display font-bold text-headline mb-3">Article Not Found</h1>
            <p className="text-lg text-body font-sans mb-8 max-w-md mx-auto leading-relaxed">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/articles"
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-display font-semibold"
            >
              Browse All Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter out the current article from related articles
  const filteredRelatedArticles = relatedArticles.filter(item => item._id !== article._id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Breadcrumb with Red Accent */}
      <div className="bg-card border-b border-border/30">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm text-metadata font-sans">
            <div className="w-1 h-4 bg-primary rounded-full mr-2"></div>
            <Link to="/" className="hover:text-headline transition-colors">Home</Link>
            <span className="text-border">›</span>
            <Link to="/articles" className="hover:text-headline transition-colors">Articles</Link>
            <span className="text-border">›</span>
            <span className="text-headline font-semibold line-clamp-1 max-w-md">{article.title}</span>
          </nav>
        </div>
        {/* Breadcrumb accent line */}
        <div className="h-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"></div>
      </div>

      {/* Premium Article Header - Full Width */}
      <div className="w-full px-6 py-8 bg-card">
        <header className="mb-8">
          
          {/* Article Category & Metadata with Red Accent */}
          <div className="flex items-center text-sm text-metadata mb-6">
            <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
            <span className="category-badge mr-4">
              {window.location.pathname.includes('editorial') ? 'EDITORIAL' : 'ARTICLE'}
            </span>
            <span className="font-sans">By {article.editorName}</span>
            <span className="mx-3">•</span>
            <time dateTime={article.publishedAt} className="font-sans">
              {contentAPI.formatDate(article.publishedAt)}
            </time>
          </div>
          
          {/* Article Title with Red Accent */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-headline mb-3 leading-tight">
              {article.title}
            </h1>
            {/* Decorative title underline */}
            <div className="flex items-center space-x-2">
              <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-primary/70 rounded-full"></div>
              <div className="w-10 h-0.5 bg-primary/50 rounded-full"></div>
              <div className="w-4 h-0.5 bg-primary/30 rounded-full"></div>
            </div>
          </div>
          
          {/* Premium Article Details with Red Accents */}
          <div className="bg-accent/10 rounded-lg p-4 mb-4 border border-border/20 relative overflow-hidden">
            {/* Red accent line */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
              <div className="mb-3 lg:mb-0 flex items-start">
                {/* Vertical red accent */}
                <div className="w-1 h-12 bg-gradient-to-b from-primary to-primary/40 rounded-full mr-3 mt-1"></div>
                <div>
                  <p className="text-xs text-metadata mb-1 font-sans">Published by</p>
                  <p className="font-display font-bold text-headline text-lg">{article.editorName}</p>
                  <p className="text-xs text-metadata font-sans mt-1">
                    {contentAPI.formatDate(article.publishedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center px-4 py-2 text-sm text-body bg-card rounded-lg hover:bg-accent/30 transition-all duration-300 border border-border font-display font-semibold"
                >
                  <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: article.title,
                      text: article.description,
                      url: window.location.href
                    }).catch(() => {
                      // Fallback: copy URL to clipboard
                      navigator.clipboard?.writeText(window.location.href);
                    });
                  }}
                  className="flex items-center px-4 py-2 text-sm text-body bg-card rounded-lg hover:bg-accent/30 transition-all duration-300 border border-border font-display font-semibold"
                >
                  <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
            
            {/* Premium Article Description */}
            <div className="border-t border-border/30 pt-4 relative">
              {/* Description label with red accent */}
              <div className="flex items-center mb-3">
                <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full mr-2"></div>
                <h3 className="text-xs font-display font-semibold text-headline uppercase tracking-wider">
                  Article Overview
                </h3>
              </div>
              
              {/* Decorative quote mark */}
              <div className="absolute top-6 left-0 text-4xl text-primary/10 font-display leading-none select-none">
                “
              </div>
              
              {/* Enhanced description */}
              <div className="relative pl-6">
                <p className="text-lg text-body font-sans leading-relaxed mb-3">
                  {article.description}
                </p>
                
                {/* Decorative bottom accent */}
                <div className="flex items-center space-x-1 mt-2">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
                  <div className="w-3 h-0.5 bg-primary/40 rounded-full"></div>
                  <div className="w-1.5 h-0.5 bg-primary/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Article Content - Full Width for PDF */}
      <article className="w-full bg-background">
        {article.fileType === 'pdf' ? (
          // Display PDF with full-width custom viewer
          <ContinuousPDFViewer
            fileUrl={`${import.meta.env.VITE_API_BASE_URL}/api/content/public/${article._id}/file`}
            fileName={article.originalFileName || article.title + '.pdf'}
            title={article.title}
          />
        ) : (
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                {article.fileType === 'docx' ? (
              // For Word documents, provide download link and show processed content
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 mb-2">This is a Word document. Click below to download the original file:</p>
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL}/api/content/public/${article._id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Original Document
                  </a>
                </div>
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: article.processedContent }}
                />
              </div>
                ) : (
                  // Fallback for other content types
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: article.processedContent }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </article>


      {/* Red Accent Divider */}
      <div className="w-full h-1 bg-gradient-to-r from-primary/60 via-primary/40 to-transparent"></div>
      
      {/* Premium Related Articles */}
      {filteredRelatedArticles.length > 0 && (
        <section className="bg-card px-6 py-12">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center mb-8">
              <div className="w-2 h-8 bg-primary rounded-full mr-4"></div>
              <h2 className="text-3xl font-display font-bold text-headline">
                Related Articles
              </h2>
            </div>
            
            {/* Decorative red bars */}
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-16 h-1 bg-primary rounded-full"></div>
              <div className="w-10 h-1 bg-primary/70 rounded-full"></div>
              <div className="w-6 h-1 bg-primary/40 rounded-full"></div>
            </div>
            
            <div className="magazine-grid">
              {filteredRelatedArticles.map((relatedArticle) => (
                <article
                  key={relatedArticle._id}
                  className="magazine-card group cursor-pointer"
                  onClick={() => window.location.href = `/articles/${relatedArticle._id}`}
                >
                  {relatedArticle.thumbnailUrl && (
                    <div className="aspect-[4/3] bg-muted/50 overflow-hidden">
                      <img
                        src={relatedArticle.thumbnailUrl}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  {/* Red accent line for related articles */}
                  <div className="h-1 bg-gradient-to-r from-primary/60 to-primary/20"></div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-metadata mb-3">
                      <div className="w-1 h-4 bg-primary/70 rounded-full mr-2"></div>
                      <span className="font-sans">By {relatedArticle.editorName}</span>
                      <span className="mx-2">•</span>
                      <span className="font-sans">{contentAPI.formatDate(relatedArticle.publishedAt)}</span>
                    </div>
                    
                    <h3 className="text-lg font-display font-bold text-headline mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {relatedArticle.title}
                    </h3>
                    
                    <p className="text-body font-sans mb-4 line-clamp-3 leading-relaxed">
                      {relatedArticle.description}
                    </p>
                    
                    <Link
                      to={`/articles/${relatedArticle._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-display font-semibold text-sm transition-colors duration-300 group-hover:translate-x-1 transform"
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
            
            <div className="text-center mt-12">
              <Link
                to="/articles"
                className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 font-display font-semibold"
              >
                View All Articles
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticleDetailPage;