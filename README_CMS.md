# DSNL Publications - Content Management System

A complete content management solution for DSNL Publications that allows uploading Word/PDF documents and automatically converts them to web content.

## 🚀 System Architecture

This system consists of three main components:

1. **Backend API** (`dsnl-backend/`) - Node.js + Express + MongoDB
2. **Admin Dashboard** (`dsnl-admin/`) - React admin interface
3. **Public Frontend** (`dsnl-magazine-flow-main/`) - Updated with CMS integration

## 📋 Features

### Backend API
- **Document Processing**: Automatic conversion of Word (.docx) and PDF files to HTML
- **File Management**: Secure file upload with validation and thumbnail support
- **Authentication**: JWT-based admin authentication
- **Content Management**: Full CRUD operations for articles and editor speaks
- **RESTful API**: Clean API endpoints for public and admin access

### Admin Dashboard
- **Secure Login**: JWT-based authentication system
- **Content Upload**: Drag-and-drop file upload with metadata forms
- **Content Management**: List, view, edit, publish/unpublish content
- **Dashboard Analytics**: Overview of published content statistics
- **Responsive Design**: Works on desktop and mobile devices

### Public Website Integration
- **Dynamic Content**: Articles and Editorial Speaks from CMS
- **SEO Optimized**: Proper meta tags and structured data
- **Responsive Layout**: Mobile-first design
- **Search Functionality**: Client-side content search
- **Pagination**: Efficient content browsing

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Backend Setup

```bash
cd dsnl-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dsnl-cms
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Default admin credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

```bash
# Start MongoDB (if running locally)
mongod

# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 2. Admin Dashboard Setup

```bash
cd dsnl-admin

# Install dependencies
npm install

# Start the admin dashboard
npm start
```

The admin dashboard will be available at `http://localhost:3001`

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change these credentials in production!

### 3. Public Website Integration

The main website has been updated with CMS integration. The new pages include:
- `/articles` - List all published articles
- `/articles/:id` - View individual articles
- `/editorial-speaks` - List all published editorial speaks
- `/editorial-speaks/:id` - View individual editorial speaks

Create a `.env` file in the main website root:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 📁 Project Structure

```
DSNL Final/
├── dsnl-backend/                 # Backend API
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── upload.js            # File upload handling
│   ├── models/
│   │   ├── Admin.js             # Admin user model
│   │   └── Content.js           # Content model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── content.js           # Content CRUD routes
│   ├── utils/
│   │   └── fileProcessor.js     # Document processing utilities
│   ├── uploads/                 # File storage directory
│   ├── server.js                # Main server file
│   └── package.json
│
├── dsnl-admin/                   # Admin Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js         # Login component
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   ├── ContentUpload.js # Upload interface
│   │   │   ├── ContentList.js   # Content management
│   │   │   ├── ContentDetail.js # Content details
│   │   │   └── Layout.js        # Common layout
│   │   ├── context/
│   │   │   └── AuthContext.js   # Authentication context
│   │   └── App.js               # Main app component
│   └── package.json
│
└── dsnl-magazine-flow-main/      # Public Website
    ├── src/
    │   ├── services/
    │   │   └── contentApi.ts     # CMS API integration
    │   ├── pages/
    │   │   ├── ArticlesPage.tsx  # Articles listing
    │   │   ├── ArticleDetailPage.tsx # Single article
    │   │   └── EditorialSpeaksPage.tsx # Editorial speaks
    │   └── ...
    └── package.json
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/content/public/articles` - Get published articles
- `GET /api/content/public/editor-speaks` - Get published editorial speaks
- `GET /api/content/public/:id` - Get single content item

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/content/upload` - Upload new content
- `GET /api/content/admin` - Get all content (admin)
- `PUT /api/content/admin/:id/publish` - Publish content
- `DELETE /api/content/admin/:id` - Delete content

## 📊 Usage Guide

### For Content Managers

1. **Login to Admin Dashboard**
   - Go to `http://localhost:3001`
   - Use admin credentials to login

2. **Upload Content**
   - Click "Upload Content" in sidebar
   - Fill in title, description, author name
   - Select category (Article or Editor Speaks)
   - Upload Word (.docx) or PDF file
   - Optional: Upload thumbnail image
   - Click "Upload Content"

3. **Manage Content**
   - View all content in "Manage Content" section
   - Publish/unpublish content with action buttons
   - View detailed content with processed HTML
   - Delete content if needed

4. **Dashboard Overview**
   - View content statistics
   - See recent uploads
   - Quick access to common actions

### For Developers

1. **Adding New Content Types**
   - Update Content model in `models/Content.js`
   - Add new routes in `routes/content.js`
   - Update admin interface components

2. **Customizing File Processing**
   - Modify `utils/fileProcessor.js`
   - Add support for new file formats
   - Customize HTML output

3. **Frontend Integration**
   - Use `contentAPI` service for data fetching
   - Create new pages/components as needed
   - Update routing in main app

## 🔒 Security Features

- **JWT Authentication**: Secure admin access
- **File Validation**: Only allow specific file types
- **Input Sanitization**: Prevent XSS and injection attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Secure configuration management

## 🚀 Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use a process manager (PM2)
3. Set up nginx reverse proxy
4. Use MongoDB Atlas or similar
5. Configure proper CORS origins

### Admin Dashboard
```bash
npm run build
# Serve the build folder with nginx or similar
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dsnl-cms
JWT_SECRET=your-production-jwt-secret
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
API_BASE_URL=https://your-api-domain.com
```

## 🧪 Testing

### Backend Testing
```bash
cd dsnl-backend
npm test
```

### Admin Dashboard Testing
```bash
cd dsnl-admin
npm test
```

## 📝 File Processing Details

The system supports:

- **Word Documents (.docx)**: Converted to HTML using mammoth.js
- **PDF Files**: Text extraction using pdf-parse
- **Images**: Thumbnail support (JPG, PNG, GIF, WebP)

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **File Upload Fails**
   - Check file permissions in uploads directory
   - Verify file size limits

3. **Authentication Issues**
   - Check JWT_SECRET in .env
   - Verify admin credentials

4. **CORS Errors**
   - Update CORS configuration in server.js
   - Check API_BASE_URL in frontend

### Debug Mode
Set `DEBUG=true` in .env for detailed logging.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the DSNL Publications development team.

---

**Created by**: DSNL Publications Development Team
**Last Updated**: November 2024
**Version**: 1.0.0