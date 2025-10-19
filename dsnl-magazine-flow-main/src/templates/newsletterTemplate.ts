export interface NewsletterStory {
  title: string;
  description: string;
  category: string;
  source: string;
  timeAgo: string;
  imageUrl: string;
  link: string;
}

export const generateNewsletterHTML = (stories: NewsletterStory[], weekOf: string): string => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSNL Weekly Digest - ${weekOf}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            width: 50px;
            height: 50px;
            background-color: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-weight: bold;
            font-size: 24px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .date {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .intro {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .intro h2 {
            font-size: 24px;
            color: #2d3748;
            margin-bottom: 12px;
        }
        
        .intro p {
            font-size: 16px;
            color: #718096;
        }
        
        .stories-grid {
            margin-bottom: 40px;
        }
        
        .story {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            margin-bottom: 24px;
            overflow: hidden;
            transition: all 0.2s ease;
        }
        
        .story:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .story-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
        }
        
        .story-content {
            padding: 24px;
        }
        
        .story-category {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        
        .story-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
            line-height: 1.3;
        }
        
        .story-title a {
            color: inherit;
            text-decoration: none;
        }
        
        .story-title a:hover {
            color: #667eea;
        }
        
        .story-description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 16px;
            line-height: 1.5;
        }
        
        .story-meta {
            font-size: 14px;
            color: #718096;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
        }
        
        .featured {
            border: 2px solid #667eea;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }
        
        .cta {
            text-align: center;
            padding: 32px;
            background-color: #f7fafc;
            border-radius: 12px;
            margin-bottom: 32px;
        }
        
        .cta h3 {
            font-size: 20px;
            color: #2d3748;
            margin-bottom: 12px;
        }
        
        .cta p {
            font-size: 16px;
            color: #718096;
            margin-bottom: 20px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
        }
        
        .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .footer {
            background-color: #2d3748;
            color: white;
            padding: 32px 30px;
            text-align: center;
        }
        
        .footer-logo {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
        }
        
        .footer p {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 8px;
        }
        
        .unsubscribe {
            font-size: 12px;
            opacity: 0.6;
            margin-top: 20px;
        }
        
        .unsubscribe a {
            color: #a0aec0;
            text-decoration: none;
        }
        
        .unsubscribe a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0 10px;
            }
            
            .header,
            .content,
            .footer {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .story-content {
                padding: 16px;
            }
            
            .story-title {
                font-size: 18px;
            }
            
            .story-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">D</div>
            <h1>DSNL Weekly Digest</h1>
            <p>Your weekly dose of essential news</p>
            <div class="date">${currentDate}</div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="intro">
                <h2>This Week's Top Stories</h2>
                <p>Here are the most important stories from the past week, curated just for you.</p>
            </div>
            
            <div class="stories-grid">
                ${generateStoriesHTML(stories)}
            </div>
            
            <div class="cta">
                <h3>Want More Stories?</h3>
                <p>Visit our website for breaking news, analysis, and in-depth coverage.</p>
                <a href="https://your-website.com" class="button">Visit DSNL Media</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">DSNL Media Network</div>
            <p>Premium news and magazine-style content for the modern reader.</p>
            <p>© 2024 DSNL Media Network. All rights reserved.</p>
            
            <div class="unsubscribe">
                <p>You're receiving this because you subscribed to our weekly newsletter.</p>
                <a href="{{unsubscribe_link}}">Unsubscribe</a> | 
                <a href="{{manage_preferences_link}}">Manage Preferences</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

const generateStoriesHTML = (stories: NewsletterStory[]): string => {
  return stories.map((story, index) => {
    const isFeatured = index === 0; // First story is featured
    
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
};

// Generate plain text version for email clients that don't support HTML
export const generateNewsletterText = (stories: NewsletterStory[], weekOf: string): string => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let textContent = `
DSNL WEEKLY DIGEST - ${weekOf}
${currentDate}

This Week's Top Stories
=======================

`;

  stories.forEach((story, index) => {
    textContent += `${index + 1}. ${story.title}
Category: ${story.category}
Source: ${story.source} • ${story.timeAgo}

${story.description}

Read more: ${story.link}

---

`;
  });

  textContent += `
Visit DSNL Media Network: https://your-website.com

© 2024 DSNL Media Network. All rights reserved.
You're receiving this because you subscribed to our weekly newsletter.
To unsubscribe: {{unsubscribe_link}}
`;

  return textContent;
};