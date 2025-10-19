import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalArticles: 0,
    totalEditorSpeaks: 0
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all content for statistics
      const contentResponse = await axios.get('/api/content/admin', {
        params: { limit: 50 }
      });

      const content = contentResponse.data.content;
      
      // Calculate statistics
      const totalContent = content.length;
      const publishedContent = content.filter(item => item.status === 'published').length;
      const draftContent = content.filter(item => item.status === 'draft').length;
      const totalArticles = content.filter(item => item.category === 'article').length;
      const totalEditorSpeaks = content.filter(item => item.category === 'editor-speaks').length;

      setStats({
        totalContent,
        publishedContent,
        draftContent,
        totalArticles,
        totalEditorSpeaks
      });

      // Set recent content (first 5 items, already sorted by creation date)
      setRecentContent(content.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Overview of your content management system</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalContent}</div>
              <div className="stat-label">Total Content</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.publishedContent}</div>
              <div className="stat-label">Published</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-number">{stats.draftContent}</div>
              <div className="stat-label">Drafts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📰</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalArticles}</div>
              <div className="stat-label">Articles</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🗣️</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalEditorSpeaks}</div>
              <div className="stat-label">Editor Speaks</div>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Content</h2>
              <Link to="/content" className="view-all-link">
                View All Content →
              </Link>
            </div>

            {recentContent.length > 0 ? (
              <div className="recent-content-list">
                {recentContent.map((item) => (
                  <div key={item._id} className="content-item">
                    <div className="content-info">
                      <h3>
                        <Link to={`/content/${item._id}`} className="content-title">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="content-meta">
                        By {item.editorName} • {formatDate(item.createdAt)}
                      </p>
                      <p className="content-description">{item.description}</p>
                    </div>
                    <div className="content-badges">
                      {getCategoryBadge(item.category)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No content yet. Start by uploading your first article or editor speak.</p>
                <Link to="/upload" className="upload-button">
                  Upload Content
                </Link>
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            
            <div className="quick-actions">
              <Link to="/upload" className="action-button upload">
                <span className="action-icon">📤</span>
                <div className="action-content">
                  <div className="action-title">Upload New Content</div>
                  <div className="action-description">Add articles or editor speaks</div>
                </div>
              </Link>

              <Link to="/content?status=draft" className="action-button draft">
                <span className="action-icon">📝</span>
                <div className="action-content">
                  <div className="action-title">Review Drafts</div>
                  <div className="action-description">Publish pending content</div>
                </div>
              </Link>

              <Link to="/content?status=published" className="action-button published">
                <span className="action-icon">👁️</span>
                <div className="action-content">
                  <div className="action-title">View Published</div>
                  <div className="action-description">See live content</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;