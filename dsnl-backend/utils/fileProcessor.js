const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

/**
 * Process uploaded Word document and extract HTML content
 */
const processWordDocument = async (filePath) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    const result = await mammoth.convertToHtml({ buffer });
    
    // Clean up the HTML content
    let htmlContent = result.value;
    
    // Basic cleanup - remove empty paragraphs and normalize spacing
    htmlContent = htmlContent
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/g, '') // Remove paragraphs with only whitespace
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
    
    return {
      success: true,
      content: htmlContent,
      warnings: result.messages || []
    };
  } catch (error) {
    console.error('Error processing Word document:', error);
    return {
      success: false,
      content: null,
      error: error.message
    };
  }
};

/**
 * Process uploaded PDF document and extract text content
 */
const processPDFDocument = async (filePath) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(buffer);
    
    // Convert plain text to HTML with basic formatting
    let textContent = data.text;
    
    // Basic text to HTML conversion
    textContent = textContent
      .replace(/\n\n+/g, '</p><p>') // Convert double line breaks to paragraphs
      .replace(/\n/g, '<br>') // Convert single line breaks to <br>
      .trim();
    
    // Wrap in paragraph tags
    const htmlContent = `<p>${textContent}</p>`;
    
    return {
      success: true,
      content: htmlContent,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    console.error('Error processing PDF document:', error);
    return {
      success: false,
      content: null,
      error: error.message
    };
  }
};

/**
 * Main function to process uploaded content file
 */
const processContentFile = async (filePath, fileType) => {
  try {
    let result;
    
    if (fileType === 'docx') {
      result = await processWordDocument(filePath);
    } else if (fileType === 'pdf') {
      result = await processPDFDocument(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to process file');
    }
    
    // Validate that we have content
    if (!result.content || result.content.trim().length === 0) {
      throw new Error('No readable content found in the file');
    }
    
    return result;
  } catch (error) {
    console.error('Error in processContentFile:', error);
    throw error;
  }
};

/**
 * Clean up uploaded files in case of error
 * @param {Array} filePaths - Array of file paths to delete
 */
const cleanupFiles = async (filePaths) => {
  for (const filePath of filePaths) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error cleaning up file ${filePath}:`, error);
    }
  }
};

/**
 * Get file extension from filename
 * @param {string} filename - Original filename
 * @returns {string} - File extension (docx, pdf)
 */
const getFileExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.docx') return 'docx';
  if (ext === '.pdf') return 'pdf';
  throw new Error(`Unsupported file type: ${ext}`);
};

/**
 * Generate thumbnail URL for serving
 * @param {string} thumbnailPath - Path to thumbnail file
 * @returns {string|null} - URL for accessing thumbnail or null
 */
const getThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath) return null;
  // Convert file path to URL path - normalize backslashes to forward slashes
  let normalizedPath = thumbnailPath.replace(/\\/g, '/');
  // Extract the path starting from 'uploads/'
  const uploadsIndex = normalizedPath.indexOf('uploads/');
  if (uploadsIndex !== -1) {
    normalizedPath = '/' + normalizedPath.substring(uploadsIndex);
  } else {
    // If 'uploads/' is not found, assume the path is already relative
    normalizedPath = '/' + normalizedPath;
  }
  return `${process.env.API_BASE_URL || 'http://localhost:5001'}${normalizedPath}`;
};

module.exports = {
  processContentFile,
  cleanupFiles,
  getFileExtension,
  getThumbnailUrl
};
