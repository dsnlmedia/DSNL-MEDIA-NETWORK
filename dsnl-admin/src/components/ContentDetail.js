import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import './ContentDetail.css';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/content/admin/${id}`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      if (error.response?.status === 404) {
        navigate('/content');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    setActionLoading(true);
    try {
      const newStatus = content.status === 'published' ? 'unpublish' : 'publish';
      const response = await axios.put(`/api/content/admin/${id}/${newStatus}`);
      
      setContent(prevContent => ({
        ...prevContent,
        status: response.data.content.status,
        publishedAt: response.data.content.publishedAt || prevContent.publishedAt
      }));

    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update content status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${content.title}"? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        await axios.delete(`/api/content/admin/${id}`);
        navigate('/content');
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('Failed to delete content');
        setActionLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading content...</p>
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Content Not Found</h2>
          <p>The requested content could not be found.</p>
          <Link to="/content" className="back-button">
            Back to Content List
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="content-detail">
        <div className="page-header">
          <div className="header-left">
            <Link to="/content" className="back-link">
              ← Back to Content List
            </Link>
            <h1>{content.title}</h1>
            <div className="content-meta">
              {getCategoryBadge(content.category)}
              {getStatusBadge(content.status)}
            </div>
          </div>
          
          <div className="header-actions">
            <button
              onClick={handlePublishToggle}
              disabled={actionLoading}
              className={`action-button ${content.status === 'published' ? 'unpublish' : 'publish'}`}
            >
              {actionLoading ? 'Processing...' : 
               content.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="action-button delete"
            >
              {actionLoading ? 'Processing...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="content-info-grid">
          <div className="info-section">
            <h3>Content Information</h3>
            <div className="info-items">
              <div className="info-item">
                <label>Title:</label>
                <span>{content.title}</span>
              </div>
              
              <div className="info-item">
                <label>Description:</label>
                <span>{content.description}</span>
              </div>
              
              <div className="info-item">
                <label>Author/Editor:</label>
                <span>{content.editorName}</span>
              </div>
              
              <div className="info-item">
                <label>Category:</label>
                <span>{content.category === 'editor-speaks' ? 'Editor Speaks' : 'Article'}</span>
              </div>
              
              <div className="info-item">
                <label>Status:</label>
                <span>{content.status.charAt(0).toUpperCase() + content.status.slice(1)}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>File Information</h3>
            <div className="info-items">
              <div className="info-item">
                <label>Original File:</label>
                <span>{content.originalFileName}</span>
              </div>
              
              <div className="info-item">
                <label>File Type:</label>
                <span>{content.fileType.toUpperCase()}</span>
              </div>
              
              <div className="info-item">
                <label>Created:</label>
                <span>{formatDate(content.createdAt)}</span>
              </div>
              
              {content.publishedAt && (
                <div className="info-item">
                  <label>Published:</label>
                  <span>{formatDate(content.publishedAt)}</span>
                </div>
              )}
              
              {content.updatedAt !== content.createdAt && (
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span>{formatDate(content.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {content.thumbnailUrl && (
          <div className="thumbnail-section">
            <h3>Thumbnail</h3>
            <div className="thumbnail-container">
              <img 
                src={content.thumbnailUrl} 
                alt={`Thumbnail for ${content.title}`}
                className="content-thumbnail"
              />
            </div>
          </div>
        )}

        <div className="content-preview-section">
          <h3>Content Preview</h3>
          <div 
            className="content-preview"
            dangerouslySetInnerHTML={{ __html: content.processedContent }}
          />
        </div>

        {content.status === 'published' && (
          <div className="public-view-section">
            <h3>Public View</h3>
            <p>This content is currently live and visible to the public.</p>
            <a 
              href={`${window.location.origin.replace(':3001', '')}${content.category === 'article' ? '/articles' : '/editorial-speaks'}/${content._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-public-link"
            >
              View Public Page →
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContentDetail;