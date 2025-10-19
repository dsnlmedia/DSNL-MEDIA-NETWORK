const express = require('express');
const Content = require('../models/Content');
const authMiddleware = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { processContentFile, cleanupFiles, getFileExtension, getThumbnailUrl } = require('../utils/fileProcessor');

const router = express.Router();

/**
 * @route   GET /api/content/public/articles
 * @desc    Get all published articles for public viewing
 * @access  Public
 */
router.get('/public/articles', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const articles = await Content.find({
      category: 'article',
      status: 'published'
    })
    .select('title description editorName publishedAt thumbnailPath fileType')
    .sort({ publishedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Content.countDocuments({
      category: 'article',
      status: 'published'
    });

    res.json({
      articles: articles.map(article => ({
        ...article.toObject(),
        thumbnailUrl: getThumbnailUrl(article.thumbnailPath)
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching public articles:', error);
    res.status(500).json({
      message: 'Failed to fetch articles'
    });
  }
});

/**
 * @route   GET /api/content/public/editor-speaks
 * @desc    Get all published editor speaks for public viewing
 * @access  Public
 */
router.get('/public/editor-speaks', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const editorSpeaks = await Content.find({
      category: 'editor-speaks',
      status: 'published'
    })
    .select('title description editorName publishedAt thumbnailPath fileType')
    .sort({ publishedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Content.countDocuments({
      category: 'editor-speaks',
      status: 'published'
    });

    res.json({
      editorSpeaks: editorSpeaks.map(item => ({
        ...item.toObject(),
        thumbnailUrl: getThumbnailUrl(item.thumbnailPath)
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching public editor speaks:', error);
    res.status(500).json({
      message: 'Failed to fetch editor speaks'
    });
  }
});

/**
 * @route   GET /api/content/public/:id
 * @desc    Get single published content item for public viewing
 * @access  Public
 */
router.get('/public/:id', async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      status: 'published'
    });

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    res.json({
      ...content.toObject(),
      thumbnailUrl: getThumbnailUrl(content.thumbnailPath)
    });

  } catch (error) {
    console.error('Error fetching public content:', error);
    res.status(500).json({
      message: 'Failed to fetch content'
    });
  }
});

/**
 * @route   POST /api/content/upload
 * @desc    Upload and process content file with metadata
 * @access  Private (Admin only)
 */
router.post('/upload', authMiddleware, handleUpload, async (req, res) => {
  let filePaths = [];
  
  try {
    const { title, description, editorName, category } = req.body;

    // Validation
    if (!title || !description || !editorName || !category) {
      return res.status(400).json({
        message: 'Title, description, editor name, and category are required'
      });
    }

    if (!req.files || !req.files.contentFile || !req.files.contentFile[0]) {
      return res.status(400).json({
        message: 'Content file is required'
      });
    }

    const contentFile = req.files.contentFile[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    filePaths.push(contentFile.path);
    if (thumbnailFile) {
      filePaths.push(thumbnailFile.path);
    }

    // Get file type
    const fileType = getFileExtension(contentFile.originalname);
    
    // Process the content file
    console.log(`Processing ${fileType} file: ${contentFile.path}`);
    const processResult = await processContentFile(contentFile.path, fileType);

    if (!processResult.success) {
      await cleanupFiles(filePaths);
      return res.status(400).json({
        message: 'Failed to process file',
        error: processResult.error
      });
    }

    // Create content record
    const content = new Content({
      title: title.trim(),
      description: description.trim(),
      editorName: editorName.trim(),
      category,
      originalFileName: contentFile.originalname,
      filePath: contentFile.path,
      fileType,
      processedContent: processResult.content,
      thumbnailPath: thumbnailFile ? thumbnailFile.path : null,
      status: 'draft'
    });

    await content.save();

    res.status(201).json({
      message: 'Content uploaded and processed successfully',
      content: {
        id: content._id,
        title: content.title,
        description: content.description,
        editorName: content.editorName,
        category: content.category,
        status: content.status,
        createdAt: content.createdAt,
        thumbnailUrl: getThumbnailUrl(content.thumbnailPath)
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded files on error
    await cleanupFiles(filePaths);
    
    res.status(500).json({
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/content/admin
 * @desc    Get all content for admin management
 * @access  Private (Admin only)
 */
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const content = await Content.find(filter)
      .select('title description editorName category status createdAt updatedAt publishedAt thumbnailPath')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Content.countDocuments(filter);

    res.json({
      content: content.map(item => ({
        ...item.toObject(),
        thumbnailUrl: getThumbnailUrl(item.thumbnailPath)
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching admin content:', error);
    res.status(500).json({
      message: 'Failed to fetch content'
    });
  }
});

/**
 * @route   GET /api/content/admin/:id
 * @desc    Get single content item with full details for admin
 * @access  Private (Admin only)
 */
router.get('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    res.json({
      ...content.toObject(),
      thumbnailUrl: getThumbnailUrl(content.thumbnailPath)
    });

  } catch (error) {
    console.error('Error fetching admin content:', error);
    res.status(500).json({
      message: 'Failed to fetch content'
    });
  }
});

/**
 * @route   PUT /api/content/admin/:id/publish
 * @desc    Publish content item
 * @access  Private (Admin only)
 */
router.put('/admin/:id/publish', authMiddleware, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    content.status = 'published';
    content.publishedAt = new Date();
    await content.save();

    res.json({
      message: 'Content published successfully',
      content: {
        id: content._id,
        title: content.title,
        status: content.status,
        publishedAt: content.publishedAt
      }
    });

  } catch (error) {
    console.error('Error publishing content:', error);
    res.status(500).json({
      message: 'Failed to publish content'
    });
  }
});

/**
 * @route   PUT /api/content/admin/:id/unpublish
 * @desc    Unpublish content item
 * @access  Private (Admin only)
 */
router.put('/admin/:id/unpublish', authMiddleware, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    content.status = 'draft';
    await content.save();

    res.json({
      message: 'Content unpublished successfully',
      content: {
        id: content._id,
        title: content.title,
        status: content.status
      }
    });

  } catch (error) {
    console.error('Error unpublishing content:', error);
    res.status(500).json({
      message: 'Failed to unpublish content'
    });
  }
});

/**
 * @route   DELETE /api/content/admin/:id
 * @desc    Delete content item
 * @access  Private (Admin only)
 */
router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    // Clean up associated files
    const filesToCleanup = [content.filePath];
    if (content.thumbnailPath) {
      filesToCleanup.push(content.thumbnailPath);
    }

    await cleanupFiles(filesToCleanup);
    await Content.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      message: 'Failed to delete content'
    });
  }
});

/**
 * @route   GET /api/content/public/:id/file
 * @desc    Serve original content file (PDF/DOCX)
 * @access  Public
 */
router.get('/public/:id/file', async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      status: 'published'
    });

    if (!content) {
      return res.status(404).json({
        message: 'Content not found'
      });
    }

    const fs = require('fs');
    const path = require('path');

    // Check if file exists
    if (!fs.existsSync(content.filePath)) {
      return res.status(404).json({
        message: 'File not found'
      });
    }

    // Set appropriate content type based on file type
    const contentType = content.fileType === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    // Set headers for inline display (especially for PDFs)
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${content.originalFileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Stream the file
    const fileStream = fs.createReadStream(content.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving content file:', error);
    res.status(500).json({
      message: 'Failed to serve file'
    });
  }
});

module.exports = router;
