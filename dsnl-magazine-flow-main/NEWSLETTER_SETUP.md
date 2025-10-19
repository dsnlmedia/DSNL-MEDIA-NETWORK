# 📧 DSNL Newsletter System Setup Guide

## 🎯 Overview

You now have a **completely free** newsletter system that automatically generates and sends weekly newsletters using:

- **GitHub Actions** (2000 free minutes/month)
- **EmailJS** (200 free emails/month)
- **JSON file storage** (free with GitHub)

## ⚡ Quick Start

### 1. EmailJS Setup (5 minutes)

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (no credit card required)
3. Create a new service:
   - Go to "Email Services" → "Add New Service"
   - Choose "Gmail" or your preferred email provider
   - Follow the setup instructions
   - Note down your **Service ID**

4. Create an email template:
   - Go to "Email Templates" → "Create New Template"
   - Set template name: `dsnl_newsletter`
   - Use this template content:

```html
Subject: {{subject}}

<div>
  <h2>{{newsletter_date}}</h2>
  {{{newsletter_html}}}
  
  <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5;">
    <p><a href="{{unsubscribe_link}}">Unsubscribe</a></p>
  </div>
</div>
```

5. Get your credentials:
   - Service ID: From your service settings
   - Template ID: From your template settings  
   - Public Key: Go to "Account" → "General" → "Public Key"

### 2. GitHub Secrets Setup (2 minutes)

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these repository secrets:

```
EMAILJS_SERVICE_ID: your_service_id_here
EMAILJS_TEMPLATE_ID: your_template_id_here  
EMAILJS_PUBLIC_KEY: your_public_key_here
```

### 3. Test the System (1 minute)

1. Run the newsletter generation manually:
```bash
npm install
node scripts/generateNewsletter.cjs
```

2. Check generated files in `public/newsletters/`

3. Test the workflow:
   - Go to "Actions" tab in GitHub
   - Click "Weekly Newsletter Generation"
   - Click "Run workflow"

## 🚀 How It Works

### Automatic Weekly Generation
- **Every Sunday at 8 AM UTC**, GitHub Actions runs
- Curates top 10 stories from CNN, BBC across categories
- Generates beautiful HTML newsletter
- Sends to all subscribers via EmailJS
- Archives newsletters in your repository

### Manual Triggering
- Visit GitHub Actions tab
- Run "Weekly Newsletter Generation" manually anytime

### Subscriber Management
- Users subscribe via the modal in your website header
- Email addresses stored in `public/data/subscribers.json`
- View subscribers by checking the file in your repo

## 📊 Current Limits (Free Tier)

| Service | Free Limit | What It Means |
|---------|------------|---------------|
| EmailJS | 200 emails/month | Can serve 200 subscribers initially |
| GitHub Actions | 2000 minutes/month | ~130 newsletter generations (way more than weekly) |
| Storage | Unlimited | Store unlimited subscribers & newsletters |

## 🎨 Customization Options

### Change Newsletter Schedule
Edit `.github/workflows/newsletter.yml`:
```yaml
schedule:
  - cron: '0 8 * * 0'  # Sunday 8 AM UTC
  # Change to:
  - cron: '0 18 * * 5' # Friday 6 PM UTC
```

### Add More News Sources
Edit `scripts/generateNewsletter.cjs`:
```javascript
const RSS_FEEDS = {
  'Technology': [
    'https://rss.cnn.com/rss/edition_technology.rss',
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://your-new-feed.com/rss' // Add here
  ]
}
```

### Customize Email Template
- Login to EmailJS dashboard
- Edit your template design
- Changes apply automatically

## 🎉 Features You Get

### ✅ Frontend
- Newsletter subscription modal in header
- Email validation and duplicate checking
- Success/error messages
- Mobile-responsive design

### ✅ Backend  
- Automated story curation from multiple sources
- HTML email generation with responsive design
- Subscriber management with JSON storage
- Weekly automated sending

### ✅ Automation
- GitHub Actions workflow
- Error handling and notifications
- Archive management (keeps last 12 newsletters)
- Workflow summaries with statistics

## 🛠️ Advanced Features

### Custom Email Templates
Edit `src/templates/newsletterTemplate.ts` to change:
- Newsletter layout and styling
- Story formatting
- Colors and fonts
- Header/footer content

### Subscriber Import/Export
```bash
# Export subscribers to CSV
node -e "console.log(JSON.parse(require('fs').readFileSync('public/data/subscribers.json')).map(s=>s.email).join('\n'))"

# Import from CSV (create a script)
node scripts/importSubscribers.js subscribers.csv
```

### Analytics & Tracking
- Newsletter open rates: Check EmailJS dashboard
- Subscriber growth: Check git history of subscribers.json
- Popular categories: Analyze story engagement

## 🚨 Troubleshooting

### Newsletter not sending?
1. Check GitHub Actions logs
2. Verify EmailJS secrets are set correctly
3. Ensure EmailJS account is active

### No subscribers receiving emails?
1. Check `public/data/subscribers.json` exists
2. Verify subscriber email format
3. Check EmailJS sending limits

### Stories not loading?
1. Check CORS proxy availability  
2. Verify RSS feed URLs are accessible
3. Review console logs in Actions

## 🌟 Scaling Up

When you outgrow the free limits:

### More Subscribers (200+ emails)
- Upgrade EmailJS to paid plan ($15/month for 10K emails)
- Or switch to Resend, SendGrid, or Mailgun

### Better Storage
- Move to Supabase (free tier: 500MB)
- Or use MongoDB Atlas (free tier: 512MB)

## 🎊 You're All Set!

Your newsletter system is now:
- ✅ **100% Free** 
- ✅ **Fully Automated**
- ✅ **Production Ready**
- ✅ **Scalable**

Users can now subscribe via your website, and they'll automatically receive beautiful weekly newsletters every Sunday!

---

## 📞 Need Help?

- Check the GitHub Actions logs for detailed error messages
- Verify all secrets are properly set in GitHub repository settings
- Test the EmailJS configuration in their dashboard first

**Happy Newsletter Sending! 📧✨**