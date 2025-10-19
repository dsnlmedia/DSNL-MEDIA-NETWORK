import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import './ContentUpload.css';

const ContentUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    editorName: '',
    category: 'article'
  });
  const [contentFile, setContentFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === 'contentFile') {
      setContentFile(file);
    } else if (e.target.name === 'thumbnail') {
      setThumbnail(file);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.editorName.trim()) {
      setError('Editor name is required');
      return false;
    }
    if (!contentFile) {
      setError('Content file is required');
      return false;
    }

    // Validate file types
    const allowedContentTypes = ['.docx', '.pdf'];
    const contentFileExt = '.' + contentFile.name.split('.').pop().toLowerCase();
    if (!allowedContentTypes.includes(contentFileExt)) {
      setError('Content file must be a Word document (.docx) or PDF');
      return false;
    }

    if (thumbnail) {
      const allowedThumbnailTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const thumbnailExt = '.' + thumbnail.name.split('.').pop().toLowerCase();
      if (!allowedThumbnailTypes.includes(thumbnailExt)) {
        setError('Thumbnail must be an image file');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('editorName', formData.editorName.trim());
      uploadData.append('category', formData.category);
      uploadData.append('contentFile', contentFile);
      
      if (thumbnail) {
        uploadData.append('thumbnail', thumbnail);
      }

      const response = await axios.post('/api/content/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setSuccess('Content uploaded successfully! Redirecting to content list...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/content');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="content-upload">
        <div className="page-header">
          <h1>Upload New Content</h1>
          <p>Upload Word documents or PDFs to create articles and editor speaks</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Enter content title"
                maxLength="200"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="article">Article</option>
                <option value="editor-speaks">Editor Speaks</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Brief description of the content"
              rows="3"
              maxLength="500"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="editorName">Editor/Author Name *</label>
            <input
              type="text"
              id="editorName"
              name="editorName"
              value={formData.editorName}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Name of the editor or author"
              maxLength="100"
            />
          </div>

          <div className="form-row">
            <div className="form-group file-group">
              <label htmlFor="contentFile">Content File *</label>
              <input
                type="file"
                id="contentFile"
                name="contentFile"
                onChange={handleFileChange}
                disabled={loading}
                accept=".docx,.pdf"
                className="file-input"
              />
              <div className="file-hint">
                Accepted formats: Word (.docx), PDF
              </div>
              {contentFile && (
                <div className="selected-file">
                  Selected: {contentFile.name}
                </div>
              )}
            </div>

            <div className="form-group file-group">
              <label htmlFor="thumbnail">Thumbnail Image</label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                onChange={handleFileChange}
                disabled={loading}
                accept="image/*"
                className="file-input"
              />
              <div className="file-hint">
                Optional: JPG, PNG, GIF, WebP
              </div>
              {thumbnail && (
                <div className="selected-file">
                  Selected: {thumbnail.name}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/content')}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  Processing...
                </>
              ) : (
                'Upload Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ContentUpload;