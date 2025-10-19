import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import './ContentList.css';

const ContentList = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || ''
  });
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchContent();
  }, [filters, pagination.currentPage]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: 20
      };

      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;

      const response = await axios.get('/api/content/admin', { params });
      
      setContent(response.data.content);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });

    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Update URL parameters
    const newParams = new URLSearchParams();
    if (newFilters.category) newParams.set('category', newFilters.category);
    if (newFilters.status) newParams.set('status', newFilters.status);
    newParams.set('page', '1');
    setSearchParams(newParams);
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handlePublishToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'unpublish' : 'publish';
      await axios.put(`/api/content/admin/${id}/${newStatus}`);
      
      // Refresh content list
      await fetchContent();
      
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update content status');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`/api/content/admin/${id}`);
        await fetchContent();
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('Failed to delete content');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const displayName = category === 'editor-speaks' ? 'Editor Speaks' : 'Article';
    return (
      <span className={`category-badge ${category}`}>
        {displayName}
      </span>
    );
  };

  return (
    <Layout>
      <div className="content-list">
        <div className="page-header">
          <div className="header-left">
            <h1>Content Management</h1>
            <p>Manage your articles and editor speaks</p>
          </div>
          <div className="header-right">
            <Link to="/upload" className="upload-button">
              Upload New Content
            </Link>
          </div>
        </div>

        <div className="filters-section">
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="article">Articles</option>
                <option value="editor-speaks">Editor Speaks</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {(filters.category || filters.status) && (
              <button
                className="clear-filters"
                onClick={() => {
                  setFilters({ category: '', status: '' });
                  setSearchParams({});
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="results-info">
            Showing {content.length} of {pagination.total} items
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading content...</p>
          </div>
        ) : content.length > 0 ? (
          <>
            <div className="content-table">
              <div className="table-header">
                <div className="col col-title">Title</div>
                <div className="col col-category">Category</div>
                <div className="col col-status">Status</div>
                <div className="col col-author">Author</div>
                <div className="col col-date">Created</div>
                <div className="col col-actions">Actions</div>
              </div>

              {content.map((item) => (
                <div key={item._id} className="table-row">
                  <div className="col col-title">
                    <Link to={`/content/${item._id}`} className="content-title">
                      {item.title}
                    </Link>
                    {item.description && (
                      <p className="content-description">{item.description}</p>
                    )}
                  </div>

                  <div className="col col-category">
                    {getCategoryBadge(item.category)}
                  </div>

                  <div className="col col-status">
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="col col-author">
                    {item.editorName}
                  </div>

                  <div className="col col-date">
                    {formatDate(item.createdAt)}
                    {item.publishedAt && (
                      <div className="published-date">
                        Published: {formatDate(item.publishedAt)}
                      </div>
                    )}
                  </div>

                  <div className="col col-actions">
                    <div className="action-buttons">
                      <Link
                        to={`/content/${item._id}`}
                        className="action-btn view"
                        title="View details"
                      >
                        👁️
                      </Link>

                      <button
                        onClick={() => handlePublishToggle(item._id, item.status)}
                        className={`action-btn ${item.status === 'published' ? 'unpublish' : 'publish'}`}
                        title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {item.status === 'published' ? '📤' : '✅'}
                      </button>

                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="action-btn delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No content found</h3>
            <p>
              {filters.category || filters.status
                ? 'No content matches your current filters.'
                : 'You haven\'t uploaded any content yet.'}
            </p>
            <Link to="/upload" className="upload-button">
              Upload Your First Content
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContentList;