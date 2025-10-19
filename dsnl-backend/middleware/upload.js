const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads/articles',
    'uploads/editor-speaks',
    'uploads/thumbnails'
  ];
  
  dirs.forEach(dir => {
    fs.ensureDirSync(path.join(__dirname, '..', dir));
  });
};

// Create directories on startup
createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'thumbnail') {
      uploadPath += 'thumbnails/';
    } else if (req.body.category === 'editor-speaks') {
      uploadPath += 'editor-speaks/';
    } else {
      uploadPath += 'articles/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    // Accept images for thumbnails
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'), false);
    }
  } else if (file.fieldname === 'contentFile') {
    // Accept PDF and Word documents for content
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2 // Maximum 2 files (content + thumbnail)
  },
  fileFilter: fileFilter
});

// Upload middleware for content creation
const uploadContent = upload.fields([
  { name: 'contentFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Error handling wrapper
const handleUpload = (req, res, next) => {
  uploadContent(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 10MB.' 
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          message: 'Too many files. Maximum 2 files allowed.' 
        });
      }
      return res.status(400).json({ 
        message: `Upload error: ${err.message}` 
      });
    } else if (err) {
      return res.status(400).json({ 
        message: err.message 
      });
    }
    
    next();
  });
};

module.exports = { handleUpload, uploadContent };