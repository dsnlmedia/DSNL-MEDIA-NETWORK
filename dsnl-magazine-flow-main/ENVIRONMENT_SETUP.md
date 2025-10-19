# 🔐 DSNL Environment Variables Setup Guide

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER commit `.env` files to version control!** These files contain sensitive API keys, database credentials, and security tokens that could compromise your application if exposed.

## 🚀 Quick Setup

### 1. Frontend Environment Setup

```bash
# Navigate to frontend directory
cd dsnl-magazine-flow-main

# Copy the example file
cp .env.example .env

# Edit .env with your actual values
# Use a secure text editor, not a public IDE
```

### 2. Backend Environment Setup

```bash
# Navigate to backend directory
cd ../dsnl-backend

# Copy the example file
cp .env.example .env

# Edit .env with your secure credentials
```

## 🔑 Required API Keys and Credentials

### YouTube Data API v3 Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing

2. **Enable YouTube Data API v3**
   - Navigate to APIs & Services > Library
   - Search for "YouTube Data API v3"
   - Click Enable

3. **Create API Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - **IMPORTANT**: Restrict the API key
     - Application restrictions: HTTP referrers (websites)
     - Add your domain(s): `http://localhost:*`, `https://yourdomain.com`
     - API restrictions: YouTube Data API v3 only

4. **Find Your Channel ID**
   - Method 1: Visit https://www.youtube.com/account_advanced
   - Method 2: View your channel page source and search for "channelId"
   - Method 3: Use YouTube Studio > Settings > Channel

### Database Setup

#### Development (Local MongoDB)
```bash
# Install MongoDB Community Server
# Visit: https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod

# Database will be created automatically at:
# mongodb://localhost:27017/dsnl_content
```

#### Production (MongoDB Atlas)
1. Create account at https://cloud.mongodb.com/
2. Create a new cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dsnl_content`
4. Replace `<username>` and `<password>` with your credentials

## 🛡️ Security Configuration

### Generate Secure Secrets

#### For JWT_SECRET and SESSION_SECRET:
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: Using OpenSSL (if available)
openssl rand -hex 64

# Method 3: Online generator (NOT recommended for production)
# Use only for development, never for production
```

### Admin Credentials Security

**Default credentials are for DEVELOPMENT ONLY:**
- Username: `dsnl_admin`
- Password: `DSNL@2024!SecureP@ss`

**For Production:**
1. Use a strong, unique username (not "admin")
2. Generate a secure password:
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Use a password manager
3. Use a real email address for admin notifications

## 📁 File Structure

```
DSNL Final/
├── dsnl-magazine-flow-main/
│   ├── .env                 # ⚠️  Your actual frontend secrets
│   ├── .env.example         # ✅  Template file (safe to commit)
│   └── .env.backup          # 🔒  Backup of original values
├── dsnl-backend/
│   ├── .env                 # ⚠️  Your actual backend secrets
│   ├── .env.example         # ✅  Template file (safe to commit)
│   └── .env.backup          # 🔒  Backup of original values
```

## 🚨 Security Checklist

### Before Development:
- [ ] Copied `.env.example` to `.env` in both projects
- [ ] Replaced all placeholder values with real credentials
- [ ] Generated secure JWT and session secrets
- [ ] Changed default admin credentials
- [ ] Verified `.env` files are in `.gitignore`

### Before Production:
- [ ] Used production database URL
- [ ] Enabled HTTPS
- [ ] Restricted API keys to production domains
- [ ] Used secure, unique admin credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configured CORS for production domains only
- [ ] Set up environment variables in hosting platform

### API Key Security:
- [ ] YouTube API key is restricted to your domains
- [ ] API key is restricted to YouTube Data API v3 only
- [ ] No API keys in client-side code (use VITE_ prefix correctly)
- [ ] Regular key rotation schedule established

## 🔧 Environment Variables Reference

### Frontend (.env)
```bash
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_YOUTUBE_CHANNEL_ID=your_channel_id
VITE_API_BASE_URL=http://localhost:5001
```

### Backend (.env)
```bash
# Server
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dsnl_content

# Security
JWT_SECRET=your_64_character_hex_string
JWT_EXPIRE=24h
SESSION_SECRET=your_64_character_hex_string

# Admin
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=your-admin@your-domain.com

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# CORS & Rate Limiting
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment Considerations

### Environment Variables in Production

**Never use `.env` files in production!** Instead:

#### Vercel/Netlify:
- Add environment variables in dashboard settings
- Use different values for production

#### Docker:
```dockerfile
ENV VITE_YOUTUBE_API_KEY=your_key
# Never hardcode secrets in Dockerfile!
# Use docker secrets or external secret management
```

#### AWS/Google Cloud/Azure:
- Use their secret management services
- AWS Secrets Manager, Google Secret Manager, Azure Key Vault

## 🔄 Regular Maintenance

### Monthly:
- [ ] Review and rotate API keys
- [ ] Check access logs for unusual activity
- [ ] Update dependencies

### Quarterly:
- [ ] Rotate JWT and session secrets
- [ ] Review admin access logs
- [ ] Update admin credentials

## 🆘 Emergency Procedures

### If API Keys Are Compromised:
1. **Immediately** revoke the compromised key in Google Cloud Console
2. Generate new API key with proper restrictions
3. Update environment variables
4. Review access logs for unauthorized usage
5. Consider rotating all related credentials

### If Database Is Compromised:
1. Change database connection credentials
2. Rotate all JWT and session secrets
3. Force all users to re-authenticate
4. Review all admin actions in logs
5. Scan for data integrity issues

## 📞 Support

For security concerns or questions:
- Check documentation first
- Review Google Cloud Console API quotas and restrictions
- Verify MongoDB connection strings and permissions
- Test with development environment first

---

**Remember: Security is everyone's responsibility. When in doubt, choose the more secure option.**