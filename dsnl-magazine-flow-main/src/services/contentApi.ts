import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ContentItem {
  _id: string;
  title: string;
  description: string;
  editorName: string;
  category: 'article' | 'editor-speaks';
  status: 'published' | 'draft';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  processedContent: string;
  thumbnailUrl?: string;
  originalFileName?: string;
  fileType?: string;
}

export interface ContentListResponse {
  articles?: ContentItem[];
  editorSpeaks?: ContentItem[];
  totalPages: number;
  currentPage: number;
  total: number;
}

class ContentAPIService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/api/content/public`,
    timeout: 10000,
  });

  /**
   * Get full URL for uploaded files (thumbnails, PDFs, etc.)
   */
  getFileUrl(relativePath?: string): string {
    if (!relativePath) return '';
    // If it's already a full URL, return as is
    if (relativePath.startsWith('http')) {
      // Replace localhost with the actual API base URL for mobile compatibility
      return relativePath.replace('http://localhost:5000', API_BASE_URL.replace('/api/content/public', '')).replace('http://localhost:5001', API_BASE_URL.replace('/api/content/public', ''));
    }
    // If it's a relative path, prepend the base URL
    return `${API_BASE_URL.replace('/api/content/public', '')}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
  }

  /**
   * Get published articles with pagination
   */
  async getArticles(page: number = 1, limit: number = 10): Promise<ContentListResponse> {
    try {
      const response = await this.api.get('/articles', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Failed to fetch articles');
    }
  }

  /**
   * Get published editor speaks with pagination
   */
  async getEditorSpeaks(page: number = 1, limit: number = 10): Promise<ContentListResponse> {
    try {
      const response = await this.api.get('/editor-speaks', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching editor speaks:', error);
      throw new Error('Failed to fetch editor speaks');
    }
  }

  /**
   * Get a single content item by ID
   */
  async getContentById(id: string): Promise<ContentItem> {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching content:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Content not found');
      }
      throw new Error('Failed to fetch content');
    }
  }

  /**
   * Get recent articles for homepage
   */
  async getRecentArticles(limit: number = 5): Promise<ContentItem[]> {
    try {
      const response = await this.getArticles(1, limit);
      return response.articles || [];
    } catch (error) {
      console.error('Error fetching recent articles:', error);
      return [];
    }
  }

  /**
   * Get recent editor speaks for homepage
   */
  async getRecentEditorSpeaks(limit: number = 3): Promise<ContentItem[]> {
    try {
      const response = await this.getEditorSpeaks(1, limit);
      return response.editorSpeaks || [];
    } catch (error) {
      console.error('Error fetching recent editor speaks:', error);
      return [];
    }
  }

  /**
   * Search content across all categories
   */
  async searchContent(query: string, page: number = 1, limit: number = 10): Promise<{
    results: ContentItem[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    try {
      // For now, we'll fetch both articles and editor speaks and filter client-side
      // In a production environment, you'd want server-side search
      const [articlesResponse, editorSpeaksResponse] = await Promise.all([
        this.getArticles(1, 50), // Get more items to search through
        this.getEditorSpeaks(1, 50)
      ]);

      const allContent = [
        ...(articlesResponse.articles || []),
        ...(editorSpeaksResponse.editorSpeaks || [])
      ];

      // Simple client-side search
      const filteredContent = allContent.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.editorName.toLowerCase().includes(query.toLowerCase())
      );

      // Paginate results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = filteredContent.slice(startIndex, endIndex);

      return {
        results: paginatedResults,
        totalPages: Math.ceil(filteredContent.length / limit),
        currentPage: page,
        total: filteredContent.length
      };
    } catch (error) {
      console.error('Error searching content:', error);
      return {
        results: [],
        totalPages: 0,
        currentPage: 1,
        total: 0
      };
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  }

  /**
   * Get excerpt from processed content
   */
  getExcerpt(processedContent: string, maxLength: number = 200): string {
    // Strip HTML tags and get text content
    const textContent = processedContent.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) {
      return textContent;
    }
    return textContent.substring(0, maxLength).trim() + '...';
  }
}

export const contentAPI = new ContentAPIService();