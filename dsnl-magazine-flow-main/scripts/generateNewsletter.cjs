const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Simple HTTP/HTTPS request function for Node.js
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// RSS feed URLs for story curation (using reliable feeds that work directly)
const RSS_FEEDS = {
  'Technology': [
    'https://feeds.feedburner.com/TechCrunch',
    'https://www.wired.com/feed/rss'
  ],
  'Business': [
    'https://feeds.feedburner.com/entrepreneur/latest',
    'https://feeds.feedburner.com/fastcompany/headlines',
    'https://feeds.feedburner.com/business2/headlines'
  ],
  'Sports': [
    'https://www.espn.com/espn/rss/news',
    'https://feeds.feedburner.com/time/sports',
    'https://rss.cnn.com/rss/edition_sport.rss'
  ],
  'World News': [
    'https://feeds.feedburner.com/time/topstories',
    'https://feeds.feedburner.com/time/world'
  ],
  'Politics': [
    'https://feeds.feedburner.com/time/politics',
    'https://feeds.feedburner.com/politico/headlines'
  ]
};

// Fetch RSS feed content directly (no CORS issues in Node.js)
async function fetchRSSFeed(url) {
  try {
    console.log(`  Fetching from ${url}...`);
    const xmlContent = await fetchUrl(url);
    
    if (!xmlContent || xmlContent.trim().length === 0) {
      throw new Error('Empty response');
    }
    
    // Basic validation that it's XML/RSS
    if (!xmlContent.includes('<rss') && !xmlContent.includes('<feed')) {
      throw new Error('Not a valid RSS/XML feed');
    }
    
    return xmlContent;
  } catch (error) {
    console.log(`  ❌ Failed to fetch ${url}: ${error.message}`);
    throw error;
  }
}

// Simple XML parser for RSS feeds
function parseRSS(xmlText) {
  const items = [];
  const itemRegex = /<item[^>]*>(.*?)<\/item>/gs;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    
    const title = extractTag(itemXml, 'title');
    const description = extractTag(itemXml, 'description');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    
    // Extract image from description or media:thumbnail
    const imageMatch = itemXml.match(/<img[^>]+src="([^"]+)"/i) || 
                      itemXml.match(/<media:thumbnail[^>]+url="([^"]+)"/i) ||
                      itemXml.match(/<media:content[^>]+url="([^"]+[.](jpg|jpeg|png|gif))"/i);
    
    const imageUrl = imageMatch ? imageMatch[1] : null;

    if (title && description && link) {
      items.push({
        title: cleanText(title),
        description: cleanText(description).substring(0, 200) + '...',
        link: link.trim(),
        pubDate: pubDate || '',
        imageUrl: imageUrl || 'https://via.placeholder.com/400x200?text=DSNL+News',
        timeAgo: formatTimeAgo(pubDate)
      });
    }
  }

  return items;
}

// Extract text content from XML tags
function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

// Clean HTML tags and decode entities
function cleanText(text) {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Format publication date to "X hours ago" format
function formatTimeAgo(pubDate) {
  if (!pubDate) return 'Recently';
  
  try {
    const date = new Date(pubDate);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  } catch (error) {
    return 'Recently';
  }
}

// Create sample stories for demonstration (replace with real RSS fetching in production)
function createSampleStories() {
  return [
    {
      title: "AI Breakthrough: New Language Model Surpasses Human Performance",
      description: "Researchers have developed a revolutionary AI system that demonstrates unprecedented understanding of complex reasoning tasks, marking a significant milestone in artificial intelligence development.",
      category: "Technology",
      source: "BBC News",
      timeAgo: "2 hours ago",
      imageUrl: "https://via.placeholder.com/400x200?text=AI+Technology",
      link: "https://example.com/ai-breakthrough",
      pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Global Markets Rally as Economic Indicators Show Strong Growth",
      description: "Stock markets worldwide experienced significant gains today following the release of positive economic data, with tech and energy sectors leading the surge in trading volumes.",
      category: "Business",
      source: "CNN",
      timeAgo: "4 hours ago",
      imageUrl: "https://via.placeholder.com/400x200?text=Market+Rally",
      link: "https://example.com/market-rally",
      pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Climate Summit Reaches Historic Agreement on Carbon Reduction",
      description: "World leaders have signed a landmark climate agreement setting ambitious targets for carbon emissions reduction, with binding commitments from major industrial nations.",
      category: "World News",
      source: "BBC News",
      timeAgo: "6 hours ago",
      imageUrl: "https://via.placeholder.com/400x200?text=Climate+Summit",
      link: "https://example.com/climate-summit",
      pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Revolutionary Clean Energy Technology Promises 90% Efficiency",
      description: "Scientists have unveiled a groundbreaking solar panel technology that achieves unprecedented efficiency rates, potentially transforming the renewable energy landscape.",
      category: "Technology",
      source: "CNN",
      timeAgo: "8 hours ago",
      imageUrl: "https://via.placeholder.com/400x200?text=Clean+Energy",
      link: "https://example.com/clean-energy",
      pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Major Tech Companies Announce Joint Cybersecurity Initiative",
      description: "Leading technology firms have formed an unprecedented alliance to combat cyber threats, sharing resources and expertise to enhance global digital security measures.",
      category: "Technology",
      source: "BBC News",
      timeAgo: "10 hours ago",
      imageUrl: "https://via.placeholder.com/400x200?text=Cybersecurity",
      link: "https://example.com/cybersecurity",
      pubDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
    }
  ];
}

// Get source name from URL
function getSourceName(url) {
  if (url.includes('techcrunch.com') || url.includes('feedburner.com/TechCrunch')) return 'TechCrunch';
  if (url.includes('wired.com')) return 'Wired';
  if (url.includes('cnn.com')) return 'CNN';
  if (url.includes('reuters.com')) return 'Reuters';
  if (url.includes('entrepreneur.com') || url.includes('feedburner.com/entrepreneur')) return 'Entrepreneur';
  if (url.includes('fastcompany') || url.includes('feedburner.com/fastcompany')) return 'Fast Company';
  if (url.includes('business2/headlines')) return 'Business 2.0';
  if (url.includes('espn.com')) return 'ESPN';
  if (url.includes('sportsillustrated')) return 'Sports Illustrated';
  if (url.includes('sbnation')) return 'SB Nation';
  if (url.includes('politico.com') || url.includes('feedburner.com/politico')) return 'Politico';
  if (url.includes('time.com') || url.includes('feedburner.com/time')) return 'Time Magazine';
  return 'News Source';
}

// Curate top stories from multiple categories with balanced distribution
async function curateTopStories() {
  console.log('🚀 Fetching real RSS feeds for newsletter...');
  
  const categorizedStories = {};
  
  // Initialize categories
  for (const category of Object.keys(RSS_FEEDS)) {
    categorizedStories[category] = [];
  }
  
  for (const [category, urls] of Object.entries(RSS_FEEDS)) {
    console.log(`\n📰 Fetching stories from ${category}...`);
    
    for (const url of urls) {
      try {
        const xmlContent = await fetchRSSFeed(url);
        const stories = parseRSS(xmlContent);
        
        if (stories.length > 0) {
          // Add category and source info, take top 2 stories from each feed
          const feedStories = stories.slice(0, 2).map(story => ({
            ...story,
            category,
            source: getSourceName(url)
          }));
          
          categorizedStories[category].push(...feedStories);
          console.log(`  ✓ Fetched ${feedStories.length} stories from ${getSourceName(url)}`);
        }
        
        // Small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`  ❌ Error fetching from ${getSourceName(url)}: ${error.message}`);
        // Continue to next feed instead of failing completely
      }
    }
    
    // Sort stories within each category by date and limit to 2 per category
    categorizedStories[category] = categorizedStories[category]
      .sort((a, b) => {
        const dateA = new Date(a.pubDate || 0);
        const dateB = new Date(b.pubDate || 0);
        return dateB - dateA;
      })
      .slice(0, 2); // Take top 2 stories per category for balanced distribution
    
    console.log(`📈 Selected ${categorizedStories[category].length} top ${category} stories`);
    console.log(`   Stories: ${categorizedStories[category].map(s => s.title.substring(0, 50) + '...').join(', ')}`);
  }
  
  // Combine all stories ensuring balanced representation
  const balancedStories = [];
  
  // Add exactly 2 stories from each category for perfect balance
  for (const category of Object.keys(RSS_FEEDS)) {
    const categoryStories = categorizedStories[category].slice(0, 2);
    console.log(`\n🔍 Adding ${category} stories: ${categoryStories.length}`);
    
    // Add each story with a fallback description if needed
    categoryStories.forEach(story => {
      if (!story.description || story.description === '...') {
        story.description = `Latest ${category.toLowerCase()} news from ${story.source}. Click to read the full story.`;
      }
      balancedStories.push(story);
    });
  }
  
  console.log(`\n📝 Total balanced stories: ${balancedStories.length}`);
  
  // Sort by publication date but keep all stories
  const finalStories = balancedStories
    .filter(story => story.title && story.link && story.title.length > 5)
    .sort((a, b) => {
      const dateA = new Date(a.pubDate || 0);
      const dateB = new Date(b.pubDate || 0);
      return dateB - dateA;
    });
    
  console.log(`\n📦 Final stories after filtering: ${finalStories.length}`);
  
  console.log(`\n✅ Newsletter Summary:`);
  
  // Show category distribution
  const categoryCount = {};
  finalStories.forEach(story => {
    categoryCount[story.category] = (categoryCount[story.category] || 0) + 1;
  });
  
  for (const [category, count] of Object.entries(categoryCount)) {
    console.log(`  📊 ${category}: ${count} stories`);
  }
  
  console.log(`\n✓ Total curated stories: ${finalStories.length}`);
  
  // Fallback to sample stories if no real stories found
  if (finalStories.length === 0) {
    console.log('⚠️  No stories fetched from RSS feeds, using sample content...');
    return createSampleStories();
  }
  
  return finalStories;
}

// Generate newsletter HTML content
function generateNewsletterHTML(stories) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const storiesHTML = stories.map((story, index) => {
    const isFeatured = index === 0;
    return `
      <div class="story ${isFeatured ? 'featured' : ''}">
        <img src="${story.imageUrl}" alt="${story.title}" class="story-image" />
        <div class="story-content">
          <span class="story-category">${story.category}</span>
          <h3 class="story-title">
            <a href="${story.link}" target="_blank">${story.title}</a>
          </h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <span>By ${story.source}</span>
            <span>•</span>
            <span>${story.timeAgo}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSNL Weekly Digest</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { width: 50px; height: 50px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; font-weight: bold; font-size: 24px; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; margin-bottom: 5px; }
        .date { font-size: 14px; opacity: 0.8; }
        .content { padding: 40px 30px; }
        .intro { text-align: center; margin-bottom: 40px; }
        .intro h2 { font-size: 24px; color: #2d3748; margin-bottom: 12px; }
        .intro p { font-size: 16px; color: #718096; }
        .story { border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; overflow: hidden; }
        .story-image { width: 100%; height: 200px; object-fit: cover; display: block; }
        .story-content { padding: 24px; }
        .story-category { display: inline-block; background-color: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
        .story-title { font-size: 20px; font-weight: 600; color: #2d3748; margin-bottom: 12px; }
        .story-title a { color: inherit; text-decoration: none; }
        .story-description { font-size: 16px; color: #4a5568; margin-bottom: 16px; }
        .story-meta { font-size: 14px; color: #718096; display: flex; align-items: center; gap: 12px; }
        .featured { border: 2px solid #667eea; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); }
        .footer { background-color: #2d3748; color: white; padding: 32px 30px; text-align: center; }
        .footer-logo { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
        .footer p { font-size: 14px; opacity: 0.8; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">D</div>
            <h1>DSNL Weekly Digest</h1>
            <p>Your weekly dose of essential news</p>
            <div class="date">${currentDate}</div>
        </div>
        
        <div class="content">
            <div class="intro">
                <h2>This Week's Top Stories</h2>
                <p>Here are the most important stories from the past week, curated just for you.</p>
            </div>
            
            <div class="stories-grid">
                ${storiesHTML}
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-logo">DSNL Media Network</div>
            <p>Premium news and magazine-style content for the modern reader.</p>
            <p>© 2024 DSNL Media Network. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
}

// Main function to generate and save newsletter
async function generateNewsletter() {
  try {
    console.log('🚀 Starting newsletter generation...');
    
    // Curate top stories
    const stories = await curateTopStories();
    
    if (stories.length === 0) {
      throw new Error('No stories found for newsletter generation');
    }
    
    // Generate HTML content
    const htmlContent = generateNewsletterHTML(stories);
    
    // Save newsletter data
    const newsletterData = {
      id: `newsletter-${Date.now()}`,
      title: `DSNL Weekly Digest - ${new Date().toLocaleDateString()}`,
      content: htmlContent,
      stories: stories,
      generatedDate: new Date().toISOString(),
      status: 'ready'
    };
    
    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', 'public', 'newsletters');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save HTML file
    const htmlFile = path.join(outputDir, `${newsletterData.id}.html`);
    fs.writeFileSync(htmlFile, htmlContent);
    
    // Save newsletter metadata
    const dataFile = path.join(outputDir, `${newsletterData.id}.json`);
    fs.writeFileSync(dataFile, JSON.stringify(newsletterData, null, 2));
    
    console.log('✅ Newsletter generated successfully!');
    console.log(`📁 HTML saved to: ${htmlFile}`);
    console.log(`📄 Data saved to: ${dataFile}`);
    console.log(`📊 Stories curated: ${stories.length}`);
    
    return newsletterData;
    
  } catch (error) {
    console.error('❌ Newsletter generation failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateNewsletter()
    .then((result) => {
      console.log('Newsletter generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Newsletter generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateNewsletter, curateTopStories };