// Browser-compatible RSS parser using CORS proxy and DOMParser
import { getNewsSourceLogo } from '@/utils/newsSourceLogos';

// Multiple CORS proxy services for reliability
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.allorigins.win/get?url='
];

// RSS Feed URLs organized by category (Enhanced for 600-700 articles with image-rich feeds)
const RSS_FEEDS = {
  'trending-stories': [
    // Real-time international sources with images
    'https://feeds.reuters.com/reuters/topNews',
    'https://feeds.reuters.com/reuters/breakingNews',
    'https://feeds.reuters.com/reuters/worldNews',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://feeds.apnews.com/rss/apf-topnews',
    'https://feeds.apnews.com/rss/apf-worldnews',
    'https://www.theguardian.com/world/rss',
    'https://www.theguardian.com/international/rss',
    'https://feeds.skynews.com/feeds/rss/home.xml',
    'https://feeds.independent.co.uk/news/world/rss',
    // High-quality Indian sources with images
    'https://feeds.feedburner.com/ndtvnews-latest',
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    'https://www.indiatoday.in/rss/1206578',
    'https://zeenews.india.com/rss/top-stories.xml',
    'https://www.news18.com/rss/india.xml',
    'https://www.livemint.com/rss/news',
    'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    'https://indianexpress.com/section/india/feed/',
    'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    'https://www.thehindu.com/news/national/feeder/default.rss',
    // Technology and business for variety
    'https://feeds.reuters.com/reuters/technologyNews',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://www.livemint.com/rss/technology',
    'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms'
  ],
  'world-news': [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.reuters.com/Reuters/worldNews',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://www.thehindu.com/news/international/feeder/default.rss',
    // Times of India World News feeds (expanded)
    'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', // World News main
    'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms', // International news
    'https://timesofindia.indiatimes.com/rssfeeds/784865811.cms', // Global affairs
    'https://timesofindia.indiatimes.com/world/rssfeeds/296589292.cms', // World section
    'https://timesofindia.indiatimes.com/world/us/rssfeeds/296589300.cms', // US news
    'https://timesofindia.indiatimes.com/world/uk/rssfeeds/296589310.cms', // UK news
    'https://timesofindia.indiatimes.com/world/europe/rssfeeds/296589315.cms', // Europe
    'https://timesofindia.indiatimes.com/world/middle-east/rssfeeds/296589317.cms', // Middle East
    'https://timesofindia.indiatimes.com/world/south-asia/rssfeeds/296589322.cms', // South Asia
    'https://timesofindia.indiatimes.com/world/china/rssfeeds/296589325.cms', // China
    'https://feeds.apnews.com/rss/apf-worldnews',
    // CNN feed removed as requested
    'https://feeds.npr.org/1004/rss.xml',
    'https://www.news18.com/rss/world.xml',
    'https://feeds.feedburner.com/ndtvnews-world',
    'https://www.indiatoday.in/rss/1206615',
    'https://indianexpress.com/section/world/feed/',
    'https://feeds.skynews.com/feeds/rss/world.xml',
    'https://feeds.foxnews.com/foxnews/world',
    'https://feeds.abcnews.com/abcnews/international',
    'https://rss.cbc.ca/lineup/world.xml',
    'https://feeds.the-guardian.com/theguardian/world/rss',
    'https://feeds.independent.co.uk/news/world/rss',
    'https://feeds.washingtonpost.com/rss/world',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'https://feeds.reuters.com/Reuters/PoliticsNews',
    'https://feeds.usatoday.com/news/world',
    'https://feeds.bloomberg.com/politics.rss',
    'https://feeds.france24.com/en/international/rss',
    'https://feeds.dw.com/dw/en/international/rss.xml',
    'https://feeds.euronews.com/en/news/',
    'https://rss.scmp.com/rss/2/feed',
    'https://feeds.japantimes.com/rss/jt_news.xml',
    'https://feeds.middle-east-online.com/MEO_en',
    'https://feeds.hindustantimes.com/htlatest/world',
    'https://zeenews.india.com/rss/world-news.xml',
    'https://www.republicworld.com/feeds/world.xml'
  ],
  'india': [
    'https://www.thehindu.com/news/national/feeder/default.rss',
    // Times of India India News feeds
    'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms', // India News
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', // Top Stories
    'https://timesofindia.indiatimes.com/city/delhi/rssfeeds/2647163.cms', // Delhi
    'https://timesofindia.indiatimes.com/city/mumbai/rssfeeds/2647164.cms', // Mumbai
    'https://timesofindia.indiatimes.com/city/bengaluru/rssfeeds/2647362.cms', // Bangalore
    'https://timesofindia.indiatimes.com/city/hyderabad/rssfeeds/2647383.cms', // Hyderabad
    'https://timesofindia.indiatimes.com/city/kolkata/rssfeeds/2647259.cms', // Kolkata
    'https://timesofindia.indiatimes.com/city/chennai/rssfeeds/2950623.cms', // Chennai
    'https://feeds.feedburner.com/ndtvnews-latest',
    'https://zeenews.india.com/rss/india-national-news.xml',
    'https://www.indiatoday.in/rss/1206614',
    'https://indianexpress.com/section/india/feed/',
    'https://www.news18.com/rss/india.xml',
    'https://news.abplive.com/news/india/feed',
    'https://www.republicworld.com/feeds/india.xml',
    'https://www.financialexpress.com/india-news/feed/',
    'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    'https://www.thehindu.com/news/cities/feeder/default.rss',
    'https://www.thehindu.com/news/states/feeder/default.rss',
    'https://www.indiatoday.in/rss/1206575',
    'https://indianexpress.com/section/cities/feed/',
    'https://www.news18.com/rss/politics.xml',
    'https://zeenews.india.com/rss/politics.xml',
    'https://feeds.feedburner.com/ndtvnews-politics',
    'https://www.aninews.in/news/national/?format=feed',
    'https://www.deccanherald.com/rss/india.xml',
    'https://www.deccanchronicle.com/rss/nation.xml',
    'https://www.theweek.in/news/india.rss.xml',
    'https://www.outlookindia.com/rss/main/india',
    'https://www.tribuneindia.com/rss/nation.xml',
    'https://www.newindianexpress.com/nation.rss',
    'https://www.millenniumpost.in/nation/feed',
    'https://www.organiser.org/feed',
    'https://www.dnaindia.com/feeds/india.xml',
    'https://www.freepressjournal.in/rss/india.xml'
  ],
  'technology': [
    // Times of India Technology feeds
    'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms', // ET Tech
    'https://timesofindia.indiatimes.com/gadgets-news/rssfeeds/1221656742.cms', // Gadgets
    'https://timesofindia.indiatimes.com/business/tech/rssfeeds/13357270.cms', // Tech Business
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.arstechnica.com/arstechnica/index',
    'https://www.wired.com/feed/rss',
    'https://www.technologyreview.com/feed/',
    'https://spectrum.ieee.org/rss/blog/all',
    'https://venturebeat.com/feed/',
    'https://www.engadget.com/rss.xml',
    'https://www.digitaltrends.com/feed/',
    'https://www.geekwire.com/feed/',
    'https://thenextweb.com/latest/feed/',
    'https://www.anandtech.com/rss/',
    'https://www.tomshardware.com/feeds/all',
    'https://www.techradar.com/rss',
    'https://mashable.com/feeds/rss/tech',
    'https://hnrss.org/frontpage',
    'https://www.zdnet.com/news/rss.xml',
    'https://www.pcmag.com/feeds/news.xml',
    'https://rss.slashdot.org/Slashdot/slashdotMain',
    'https://www.producthunt.com/feed'
  ],
  'business': [
    'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    'https://www.livemint.com/rss/news',
    'https://feeds.reuters.com/reuters/businessNews',
    'https://www.thehindu.com/business/feeder/default.rss',
    'https://www.business-standard.com/rss/home_page_top_stories.rss',
    'https://www.moneycontrol.com/rss/news.xml',
    'https://www.financialexpress.com/feed/',
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.forbes.com/real-time/feed2/',
    'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml',
    // Times of India Business feeds
    'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', // Business
    'https://timesofindia.indiatimes.com/business/rssfeeds/1898056.cms', // Corporate
    'https://timesofindia.indiatimes.com/business/rssfeeds/1898057.cms', // Economy
    'https://timesofindia.indiatimes.com/business/rssfeeds/1898058.cms', // Markets
    'https://timesofindia.indiatimes.com/business/rssfeeds/1898059.cms', // Banking
    'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms',
    'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',
    'https://www.livemint.com/rss/companies',
    'https://www.livemint.com/rss/markets',
    'https://www.livemint.com/rss/money',
    'https://feeds.reuters.com/reuters/INbusinessNews',
    'https://www.business-standard.com/rss/companies-101.rss',
    'https://www.business-standard.com/rss/markets-106.rss',
    'https://www.business-standard.com/rss/finance-103.rss',
    'https://www.moneycontrol.com/rss/marketoutlook.xml',
    'https://www.moneycontrol.com/rss/results.xml',
    'https://www.moneycontrol.com/rss/ipo.xml',
    'https://feeds.bloomberg.com/wealth.rss',
    'https://feeds.bloomberg.com/technology.rss',
    'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    'https://feeds.fortune.com/fortune/headlines',
    'https://feeds.wsj.com/wsj/xml/rss/3_7085.xml',
    'https://feeds.marketwatch.com/marketwatch/topstories',
    'https://feeds.barrons.com/barrons/news/articles',
    'https://feeds.ft.com/ft/rss/home/uk',
    'https://feeds.skynews.com/feeds/rss/business.xml',
    'https://www.indiatoday.in/rss/1206580',
    'https://indianexpress.com/section/business/feed/',
    'https://www.news18.com/rss/business.xml',
    'https://zeenews.india.com/rss/business.xml',
    'https://news.abplive.com/business/feed',
    'https://www.republicworld.com/feeds/business.xml',
    'https://www.financialexpress.com/market/feed/',
    'https://www.financialexpress.com/economy/feed/'
  ],
  'politics': [
    'https://www.thehindu.com/news/national/feeder/default.rss',
    // Times of India Politics feeds (expanded)
    'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms', // India News (includes politics)
    'https://timesofindia.indiatimes.com/rssfeeds/784865811.cms', // Politics main
    'https://timesofindia.indiatimes.com/india/rssfeeds/1221656.cms', // India section
    'https://timesofindia.indiatimes.com/elections/rssfeeds/1512553109.cms', // Elections
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', // Top stories (political)
    'https://timesofindia.indiatimes.com/india/north-india/rssfeeds/2652149.cms', // North India politics
    'https://timesofindia.indiatimes.com/india/west-india/rssfeeds/2652159.cms', // West India politics
    'https://timesofindia.indiatimes.com/india/south-india/rssfeeds/2652154.cms', // South India politics
    'https://timesofindia.indiatimes.com/india/east-india/rssfeeds/2652151.cms', // East India politics
    'https://timesofindia.indiatimes.com/city/delhi/rssfeeds/2647163.cms', // Delhi politics
    'https://timesofindia.indiatimes.com/city/mumbai/rssfeeds/2647164.cms', // Mumbai politics
    'https://feeds.reuters.com/Reuters/PoliticsNews',
    'https://www.indiatoday.in/rss/1206614',
    'https://indianexpress.com/section/political-pulse/feed/',
    'https://zeenews.india.com/rss/india-national-news.xml',
    'https://www.news18.com/rss/politics.xml',
    'https://news.abplive.com/news/india/feed',
    'https://www.republicworld.com/feeds/politics.xml',
    'https://feeds.feedburner.com/ndtvnews-politics',
    'https://www.thehindu.com/opinion/feeder/default.rss',
    'https://www.thehindu.com/opinion/editorial/feeder/default.rss',
    'https://www.indiatoday.in/rss/1206573',
    'https://indianexpress.com/section/india/governance/feed/',
    'https://indianexpress.com/section/opinion/feed/',
    'https://zeenews.india.com/rss/politics.xml',
    'https://feeds.feedburner.com/ndtvnews-latest',
    'https://www.hindustantimes.com/feeds/rss/editorials/rssfeed.xml',
    'https://www.hindustantimes.com/feeds/rss/analysis/rssfeed.xml',
    'https://feeds.reuters.com/reuters/INtopNews',
    'https://feeds.apnews.com/rss/apf-usnews',
    // CNN feed removed as requested
    'https://feeds.npr.org/1014/rss.xml',
    'https://feeds.washingtonpost.com/rss/politics',
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://feeds.bloomberg.com/politics.rss',
    'https://feeds.foxnews.com/foxnews/politics',
    'https://feeds.abcnews.com/abcnews/politics',
    'https://feeds.usatoday.com/news/politics',
    'https://www.outlookindia.com/rss/main/politics',
    'https://www.theweek.in/news/politics.rss.xml',
    'https://www.deccanherald.com/rss/politics.xml',
    'https://www.tribuneindia.com/rss/politics.xml',
    'https://www.newindianexpress.com/opinions.rss',
    'https://www.organiser.org/feed',
    'https://www.dnaindia.com/feeds/politics.xml',
    'https://www.freepressjournal.in/rss/opinion.xml'
  ],
  'entertainment': [
    // Times of India Entertainment feeds
    'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms', // Entertainment
    'https://timesofindia.indiatimes.com/rssfeeds/1227967233.cms', // Bollywood
    'https://timesofindia.indiatimes.com/entertainment/rssfeeds/1081479906.cms', // Entertainment main
    'https://timesofindia.indiatimes.com/entertainment/bollywood/rssfeeds/1227967233.cms', // Bollywood news
    'https://timesofindia.indiatimes.com/entertainment/hindi/rssfeeds/11040822.cms', // Hindi entertainment
    'https://timesofindia.indiatimes.com/entertainment/tv/rssfeeds/43799536.cms', // TV news
    'https://timesofindia.indiatimes.com/entertainment/music/rssfeeds/60319150.cms', // Music
    'https://www.thehindu.com/entertainment/feeder/default.rss',
    'https://zeenews.india.com/rss/entertainment.xml',
    'https://www.indiatoday.in/rss/1206629',
    'https://indianexpress.com/section/entertainment/feed/',
    'https://www.news18.com/rss/movies.xml',
    'https://feeds.feedburner.com/ndtvmovies-latest',
    'https://news.abplive.com/entertainment/feed',
    'https://www.republicworld.com/feeds/entertainment.xml',
    'https://www.financialexpress.com/lifestyle/entertainment/feed/',
    'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml',
    'https://www.thehindu.com/entertainment/music/feeder/default.rss',
    'https://www.thehindu.com/entertainment/movies/feeder/default.rss',
    'https://www.thehindu.com/entertainment/television/feeder/default.rss',
    'https://feeds.feedburner.com/ndtvmovies-latest',
    'https://feeds.feedburner.com/ndtv-entertainment',
    'https://www.indiatoday.in/rss/1206627',
    'https://www.indiatoday.in/rss/1206628',
    'https://indianexpress.com/section/entertainment/bollywood/feed/',
    'https://indianexpress.com/section/entertainment/hollywood/feed/',
    'https://indianexpress.com/section/entertainment/television/feed/',
    'https://www.news18.com/rss/showsha.xml',
    'https://zeenews.india.com/rss/bollywood.xml',
    'https://feeds.pinkvilla.com/pinkvilla-entertainment-latest',
    'https://www.bollywoodhungama.com/rss-feed/',
    'https://feeds.filmcompanion.in/fc-reviews',
    'https://www.koimoi.com/feed/',
    'https://www.spotboye.com/feed/',
    'https://www.mid-day.com/entertainment.rss',
    'https://www.tribuneindia.com/rss/lifestyle.xml',
    'https://www.deccanherald.com/rss/entertainment.xml',
    'https://feeds.variety.com/variety/film',
    'https://feeds.variety.com/variety/tv',
    'https://feeds.ew.com/ew/latest',
    'https://feeds.hollywoodreporter.com/hollywoodreporter/news',
    'https://feeds.deadline.com/deadline/breaking-news',
    'https://feeds.people.com/people/headlines',
    'https://feeds.usmagazine.com/UsWeekly-LatestNews',
    'https://feeds.eonline.com/eonline/topstories'
  ],
  'sports': [
    // Indian Sports Sources (prioritized)
    // Times of India Sports feeds
    'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', // Sports main
    'https://timesofindia.indiatimes.com/sports/rssfeeds/-2128936835.cms', // Sports section
    'https://timesofindia.indiatimes.com/sports/cricket/rssfeeds/4719148.cms', // Cricket
    'https://timesofindia.indiatimes.com/sports/football/rssfeeds/4719760.cms', // Football
    'https://timesofindia.indiatimes.com/sports/tennis/rssfeeds/4719226.cms', // Tennis
    'https://timesofindia.indiatimes.com/sports/badminton/rssfeeds/4719244.cms', // Badminton
    'https://timesofindia.indiatimes.com/sports/olympics/rssfeeds/4719306.cms', // Olympics
    'https://www.thehindu.com/sport/feeder/default.rss',
    'https://zeenews.india.com/rss/sports.xml',
    'https://www.indiatoday.in/rss/1206492',
    'https://indianexpress.com/section/sports/feed/',
    'https://www.news18.com/rss/sports.xml',
    'https://feeds.feedburner.com/ndtvsports-latest',
    'https://news.abplive.com/sports/feed',
    'https://www.republicworld.com/feeds/sports.xml',
    'https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml',
    'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
    'https://www.sportskeeda.com/rss/sports',
    'https://www.firstpost.com/sports/feed',
    'https://www.livemint.com/rss/sports',
    // International Sports Sources
    'https://www.espn.com/espn/rss/news',
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://www.skysports.com/rss/12040',
    'https://theathletic.com/feed/',
    'https://www.si.com/rss/si_topstories.rss',
    'https://sports.yahoo.com/rss',
    'https://www.foxsports.com/rss/rss_feeds',
    'https://bleacherreport.com/rss.xml',
    'https://www.cbssports.com/partners/feeds/rss/all_news',
    'https://www.nba.com/rss/nba_rss.xml',
    'https://www.nfl.com/feeds/rss/home',
    'https://www.formula1.com/rss/news/headlines.rss',
    'https://deadspin.com/rss',
    'https://clutchpoints.com/feed',
    'https://www.eurosport.com/rss.xml',
    'https://90min.com/posts.rss',
    'https://www.sportsnet.ca/feed',
    'https://talksport.com/feed',
    'https://awfulannouncing.com/feed'
  ]
};

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  category: string;
  timeAgo?: string;
}

// Clean HTML tags and decode entities from text
const cleanText = (text: string): string => {
  if (!text) return '';
  
  // Remove HTML tags
  const cleanHtml = text.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = cleanHtml;
  
  // Clean up whitespace
  return textarea.value.replace(/\s+/g, ' ').trim();
};

// Browser RSS parser using DOMParser
const parseRSSFeed = (xmlText: string, feedUrl: string): any[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('XML parsing error');
    }
    
    // Get feed items
    const items = xmlDoc.querySelectorAll('item');
    const feedTitle = xmlDoc.querySelector('title')?.textContent || '';
    
    return Array.from(items).map(item => {
      const title = item.querySelector('title')?.textContent || 'No Title';
      const description = item.querySelector('description')?.textContent || 
                         item.querySelector('summary')?.textContent || 
                         'No description available';
      const link = item.querySelector('link')?.textContent || 
                  item.querySelector('guid')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || 
                     item.querySelector('published')?.textContent || 
                     new Date().toISOString();
      
      // Enhanced image extraction from multiple sources
      let imageUrl = '';
      
      // 1. Check media:content (most common in modern feeds)
      const mediaContent = item.querySelector('media\\:content, content');
      if (mediaContent) {
        imageUrl = mediaContent.getAttribute('url') || mediaContent.getAttribute('href') || '';
      }
      
      // 2. Check media:thumbnail
      if (!imageUrl) {
        const mediaThumbnail = item.querySelector('media\\:thumbnail');
        if (mediaThumbnail) {
          imageUrl = mediaThumbnail.getAttribute('url') || '';
        }
      }
      
      // 3. Check enclosure for images
      if (!imageUrl) {
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
          imageUrl = enclosure.getAttribute('url') || '';
        }
      }
      
      // 4. Check image element
      if (!imageUrl) {
        const imageElement = item.querySelector('image');
        if (imageElement) {
          imageUrl = imageElement.getAttribute('url') || imageElement.textContent || '';
        }
      }
      
      // 5. Check various namespaced image elements
      if (!imageUrl) {
        const nsImage = item.querySelector('itunes\\:image, feedburner\\:origImage, atom\\:link[type="image"]');
        if (nsImage) {
          imageUrl = nsImage.getAttribute('url') || nsImage.getAttribute('href') || '';
        }
      }
      
      // 6. Extract from description HTML (multiple patterns)
      if (!imageUrl) {
        // Try multiple img tag patterns
        const imgPatterns = [
          /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
          /<img[^>]+src=([^\s>]+)[^>]*>/i,
          /&lt;img[^&]*src=["']([^"']+)["'][^&]*&gt;/i
        ];
        
        for (const pattern of imgPatterns) {
          const imgMatch = description.match(pattern);
          if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1].replace(/&amp;/g, '&');
            break;
          }
        }
      }
      
      // 7. Check for thumbnail or featured image in item attributes
      if (!imageUrl) {
        const thumbnail = item.getAttribute('thumbnail') || item.getAttribute('image');
        if (thumbnail) {
          imageUrl = thumbnail;
        }
      }
      
      // Clean and validate image URL
      if (imageUrl) {
        imageUrl = imageUrl.trim();
        // Convert relative URLs to absolute if needed
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
          const urlObj = new URL(feedUrl);
          imageUrl = urlObj.origin + imageUrl;
        }
        // Skip tiny or placeholder images
        if (imageUrl.includes('1x1') || imageUrl.includes('pixel') || imageUrl.includes('spacer')) {
          imageUrl = '';
        }
      }
      
      return {
        title: cleanText(title),
        description: cleanText(description),
        link: link.trim(),
        pubDate: pubDate.trim(),
        imageUrl: imageUrl,
        feedTitle: feedTitle
      };
    });
  } catch (error) {
    console.error('RSS parsing error:', error);
    return [];
  }
};

// Fetch RSS feed through CORS proxy
const fetchRSSFeed = async (feedUrl: string, proxyIndex: number = 0): Promise<any[]> => {
  if (proxyIndex >= CORS_PROXIES.length) {
    throw new Error('All CORS proxies failed');
  }
  
  try {
    const proxyUrl = CORS_PROXIES[proxyIndex] + encodeURIComponent(feedUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    let xmlText = await response.text();
    
    // Handle allorigins.win JSON response format
    if (CORS_PROXIES[proxyIndex].includes('allorigins.win/get')) {
      try {
        const jsonResponse = JSON.parse(xmlText);
        xmlText = jsonResponse.contents || xmlText;
      } catch (e) {
        // If not JSON, use as is
      }
    }
    
    return parseRSSFeed(xmlText, feedUrl);
    
  } catch (error) {
    console.warn(`CORS proxy ${proxyIndex} failed for ${feedUrl}:`, error);
    // Try next proxy
    return fetchRSSFeed(feedUrl, proxyIndex + 1);
  }
};

// Get relative time string
const getRelativeTime = (pubDate: string): string => {
  const date = new Date(pubDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffHours >= 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes >= 1) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Check if article is within the last 100 days (fresh news only)
const isArticleRecent = (pubDate: string, category?: string): boolean => {
  const articleDate = new Date(pubDate);
  const now = new Date();
  const diffMs = now.getTime() - articleDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // For trending stories, accept ALL articles regardless of date
  if (category?.toLowerCase() === 'trending stories') {
    console.log(`📅 Trending story: ${diffDays} days old (${articleDate.toLocaleDateString()}) - ACCEPTING ALL`);
    return !isNaN(articleDate.getTime());
  }
  
  // For other categories, use 100 days
  if (diffDays > 100) {
    console.log(`🚫 Filtering out old article: ${diffDays} days old (${articleDate.toLocaleDateString()})`);
  }
  
  // Only include articles from the last 100 days
  return diffDays <= 100 && !isNaN(articleDate.getTime());
};

// Extract source name from feed title or URL
const extractSourceName = (feedTitle: string, feedUrl: string): string => {
  if (feedTitle) {
    // Clean up feed titles
    const cleanTitle = feedTitle
      .replace(/RSS|Feed|News/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleanTitle) return cleanTitle;
  }
  
  // Extract from URL
  const urlMap: Record<string, string> = {
    'ndtv': 'NDTV',
    'thehindu': 'The Hindu',
    'hindustantimes': 'Hindustan Times',
    'timesofindia': 'Times of India',
    'economictimes': 'Economic Times',
    'indiatoday': 'India Today',
    'indianexpress': 'Indian Express',
    'zeenews': 'Zee News',
    'news18': 'News18',
    'bbc': 'BBC News',
    'reuters': 'Reuters',
    'cnn': 'CNN',
    'apnews': 'Associated Press',
    'aljazeera': 'Al Jazeera',
    'techcrunch': 'TechCrunch',
    'theverge': 'The Verge',
    'wired': 'Wired',
    'arstechnica': 'Ars Technica',
    'technologyreview': 'MIT Technology Review',
    'spectrum.ieee': 'IEEE Spectrum',
    'venturebeat': 'VentureBeat',
    'engadget': 'Engadget',
    'digitaltrends': 'Digital Trends',
    'geekwire': 'GeekWire',
    'thenextweb': 'The Next Web',
    'anandtech': 'AnandTech',
    'tomshardware': "Tom's Hardware",
    'techradar': 'TechRadar',
    'mashable': 'Mashable',
    'hnrss': 'Hacker News',
    'zdnet': 'ZDNet',
    'pcmag': 'PCMag',
    'slashdot': 'Slashdot',
    'producthunt': 'Product Hunt',
    'espn': 'ESPN',
    'skysports': 'Sky Sports',
    'theathletic': 'The Athletic',
    'si.com': 'Sports Illustrated',
    'sports.yahoo': 'Yahoo Sports',
    'foxsports': 'Fox Sports',
    'bleacherreport': 'Bleacher Report',
    'cbssports': 'CBS Sports',
    'nba.com': 'NBA',
    'nfl.com': 'NFL',
    'formula1': 'Formula 1',
    'deadspin': 'Deadspin',
    'clutchpoints': 'ClutchPoints',
    'eurosport': 'Eurosport',
    '90min': '90min',
    'sportsnet': 'Sportsnet',
    'talksport': 'talkSPORT',
    'awfulannouncing': 'Awful Announcing',
    'espncricinfo': 'ESPN Cricinfo',
    'sportskeeda': 'Sportskeeda',
    'firstpost': 'Firstpost',
    'cnn': 'CNN',
    'npr': 'NPR',
    'cbs': 'CBS News',
    'nbcnews': 'NBC News',
    'washingtonpost': 'Washington Post',
    'nytimes': 'New York Times',
    'republicworld': 'Republic World',
    'economictimes': 'Economic Times',
    'business-standard': 'Business Standard',
    'livemint': 'Mint',
    'moneycontrol': 'MoneyControl',
    'financialexpress': 'Financial Express',
    'bloomberg': 'Bloomberg',
    'forbes': 'Forbes'
  };
  
  for (const [key, name] of Object.entries(urlMap)) {
    if (feedUrl.includes(key)) {
      return name;
    }
  }
  
  return 'News Source';
};

// Array of tech dummy images for variety
const TECH_DUMMY_IMAGES = [
  '/src/assets/tech-images/tech-1-ai-robot.svg',
  '/src/assets/tech-images/tech-2-smartphone.svg',
  '/src/assets/tech-images/tech-3-cloud.svg',
  '/src/assets/tech-images/tech-4-cybersecurity.svg',
  '/src/assets/tech-images/tech-5-analytics.svg',
  '/src/assets/tech-images/tech-6-blockchain.svg',
  '/src/assets/tech-images/tech-7-vr.svg',
  '/src/assets/tech-images/tech-8-battery.svg',
  '/src/assets/tech-images/tech-9.svg',
  '/src/assets/tech-images/tech-10.svg',
  '/src/assets/tech-images/tech-11.svg',
  '/src/assets/tech-images/tech-12.svg',
  '/src/assets/tech-images/tech-13.svg',
  '/src/assets/tech-images/tech-14.svg',
  '/src/assets/tech-images/tech-15.svg',
  '/src/assets/tech-images/tech-16.svg',
  '/src/assets/tech-images/tech-17.svg',
  '/src/assets/tech-images/tech-18.svg',
  '/src/assets/tech-images/tech-19.svg',
  '/src/assets/tech-images/tech-20.svg'
];

// Track used images to ensure better distribution
let techImageIndex = 0;

// Get a tech dummy image with better distribution (less repetitive)
const getRandomTechImage = (): string => {
  // Use sequential selection with some randomness for better distribution
  const baseIndex = techImageIndex % TECH_DUMMY_IMAGES.length;
  const randomOffset = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  const finalIndex = Math.max(0, Math.min(TECH_DUMMY_IMAGES.length - 1, baseIndex + randomOffset));
  
  techImageIndex++;
  return TECH_DUMMY_IMAGES[finalIndex];
};

// Get appropriate image for news story - prioritize RSS images, then logos/dummies
const getStoryImage = (imageUrl: string | undefined, sourceName: string, feedUrl: string, category: string): string => {
  // If the story already has an image from RSS feed, always use it (highest priority)
  if (imageUrl && imageUrl.trim()) {
    console.log(`Using RSS feed image for ${sourceName}: ${imageUrl}`);
    return imageUrl;
  }
  
  // For technology category, use random tech dummy images instead of source logos
  if (category.toLowerCase() === 'technology') {
    return getRandomTechImage();
  }
  
  // For trending stories, also try to avoid too many logos - mix with some variety
  if (category.toLowerCase() === 'trending stories' || category.toLowerCase() === 'trending-stories') {
    // Use logos but could potentially add variety images here in the future
    return getNewsSourceLogo(sourceName, feedUrl);
  }
  
  // For other categories, use news source logo
  return getNewsSourceLogo(sourceName, feedUrl);
};

// Keep category fallback for edge cases where source logo isn't available
const getDefaultImage = (category: string): string => {
  // For technology, use a random tech image even as fallback
  if (category.toLowerCase() === 'technology') {
    return getRandomTechImage();
  }
  
  const defaultImages: Record<string, string> = {
    'trending-stories': '/src/assets/logos/generic-news-logo.svg',
    'world-news': '/src/assets/logos/generic-news-logo.svg',
    'india': '/src/assets/logos/generic-news-logo.svg',
    'technology': getRandomTechImage(),
    'business': '/src/assets/logos/generic-news-logo.svg',
    'politics': '/src/assets/logos/generic-news-logo.svg',
    'entertainment': '/src/assets/logos/generic-news-logo.svg',
    'sports': '/src/assets/logos/generic-news-logo.svg'
  };
  
  return defaultImages[category] || '/src/assets/logos/generic-news-logo.svg';
};

// Fetch news from multiple RSS feeds for a category
export const fetchNewsByCategory = async (category: string): Promise<NewsItem[]> => {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
  const feeds = RSS_FEEDS[categoryKey as keyof typeof RSS_FEEDS] || [];
  
  if (feeds.length === 0) {
    console.warn(`No RSS feeds configured for category: ${category}`);
    return [];
  }
  
  const allNews: NewsItem[] = [];
  
  // Fetch from multiple feeds concurrently with better error handling
  const feedPromises = feeds.map(async (feedUrl, index) => {
    try {
      console.log(`Fetching ${category} feed ${index + 1}/${feeds.length}: ${feedUrl}`);
      const feedItems = await fetchRSSFeed(feedUrl);
      
      if (!feedItems || feedItems.length === 0) {
        console.warn(`No items returned from feed: ${feedUrl}`);
        return [];
      }
      
      const sourceName = extractSourceName(feedItems[0]?.feedTitle || '', feedUrl);
      
      // Get more stories per feed to reach 600-700 total articles
      // Significantly increased to ensure we get enough articles
      const categoryLower = category.toLowerCase();
      let articlesPerFeed = 25; // Base articles per feed
      
      if (categoryLower === 'technology') {
        articlesPerFeed = 100; // 20 feeds × 100 = 2000, we'll limit later
      } else if (categoryLower === 'sports') {
        articlesPerFeed = 50;  // 33 feeds × 50 = 1650, we'll limit later
      } else if (categoryLower === 'trending stories' || categoryLower === 'trending-stories') {
        articlesPerFeed = 50;  // 27 feeds × 50 = 1350
      } else if (categoryLower === 'world news' || categoryLower === 'world-news') {
        articlesPerFeed = 25;  // 32 feeds × 25 = 800
      } else if (categoryLower === 'india') {
        articlesPerFeed = 30;  // 33 feeds × 30 = 990
      } else if (categoryLower === 'business') {
        articlesPerFeed = 20;  // 40 feeds × 20 = 800
      } else if (categoryLower === 'politics') {
        articlesPerFeed = 20;  // 37 feeds × 20 = 740
      } else if (categoryLower === 'entertainment') {
        articlesPerFeed = 18;  // 40 feeds × 18 = 720
      }
      
      // Filter articles (100 days for most categories, NO LIMIT for trending stories)
      const recentFeedItems = feedItems.filter(item => isArticleRecent(item.pubDate, category));
      const oldArticlesCount = feedItems.length - recentFeedItems.length;
      
      if (oldArticlesCount > 0) {
        console.log(`Filtered out ${oldArticlesCount} articles older than 100 days from ${sourceName}`);
      }
      
      const articles = recentFeedItems.slice(0, articlesPerFeed).map((item: any, index: number) => {
        // Debug: Log first few article dates for trending stories
        if (category.toLowerCase() === 'trending stories' && index < 3) {
          console.log(`📅 ${sourceName} article ${index + 1}: ${item.pubDate} (${new Date(item.pubDate).toLocaleDateString()})`);
        }
        
        return {
          title: item.title,
          description: item.description,
          link: item.link,
          pubDate: item.pubDate,
          source: sourceName,
          imageUrl: getStoryImage(item.imageUrl, sourceName, feedUrl, category),
          category: category,
          timeAgo: getRelativeTime(item.pubDate)
        };
      });
      
      const articlesWithImages = articles.filter(a => a.imageUrl && !a.imageUrl.includes('/src/assets/logos/'));
      console.log(`Successfully fetched ${articles.length} recent articles (within 100 days) from ${sourceName}, ${articlesWithImages.length} have RSS images`);
      return articles;
    } catch (error) {
      console.error(`Error fetching feed ${feedUrl}:`, error);
      return [];
    }
  });
  
  const feedResults = await Promise.all(feedPromises);
  feedResults.forEach(items => allNews.push(...items));
  
  console.log(`Total articles fetched before sorting: ${allNews.length}`);
  
  // Remove duplicates based on title and link
  const uniqueNews = allNews.filter((article, index, self) => 
    index === self.findIndex(a => 
      a.title.toLowerCase() === article.title.toLowerCase() || 
      (a.link && article.link && a.link === article.link)
    )
  );
  
  console.log(`Articles after removing duplicates: ${uniqueNews.length}`);
  
  // Sort by publication date (newest first)
  const sortedNews = uniqueNews
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  
  // Return 600-700 stories for all categories
  const categoryLower = category.toLowerCase();
  let storyLimit = 650; // Base target for most categories
  
  if (categoryLower === 'technology') {
    storyLimit = 700; // Target 600-700 tech stories
  } else if (categoryLower === 'sports') {
    storyLimit = 700; // Target 600-700 sports stories
  } else if (categoryLower === 'trending stories' || categoryLower === 'trending-stories') {
    storyLimit = 650; // Target 600-700 trending stories
  } else if (categoryLower === 'world news' || categoryLower === 'world-news') {
    storyLimit = 650; // Target 600-700 world news stories
  } else if (categoryLower === 'india') {
    storyLimit = 650; // Target 600-700 india stories
  } else if (categoryLower === 'business') {
    storyLimit = 650; // Target 600-700 business stories
  } else if (categoryLower === 'politics') {
    storyLimit = 650; // Target 600-700 politics stories
  } else if (categoryLower === 'entertainment') {
    storyLimit = 650; // Target 600-700 entertainment stories
  }
  
  const finalNews = sortedNews.slice(0, storyLimit);
  const finalWithImages = finalNews.filter(a => a.imageUrl && !a.imageUrl.includes('/src/assets/logos/'));
  const finalWithLogos = finalNews.filter(a => a.imageUrl && a.imageUrl.includes('/src/assets/logos/'));
  const finalWithTech = finalNews.filter(a => a.imageUrl && a.imageUrl.includes('/src/assets/tech-images/'));
  
  console.log(`Final ${category} summary:`);
  console.log(`- Total articles: ${finalNews.length}`);
  console.log(`- Articles with RSS images: ${finalWithImages.length}`);
  console.log(`- Articles with source logos: ${finalWithLogos.length}`);
  console.log(`- Articles with tech dummy images: ${finalWithTech.length}`);
  
  // Show date range of articles
  if (finalNews.length > 0) {
    const dates = finalNews.map(article => new Date(article.pubDate)).filter(date => !isNaN(date.getTime()));
    if (dates.length > 0) {
      const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
      console.log(`- Date range: ${oldestDate.toLocaleDateString()} to ${newestDate.toLocaleDateString()}`);
    }
  } else {
    console.warn(`⚠️ No ${category} articles found! Check RSS feeds and CORS proxies.`);
  }
  
  return finalNews;
};

// Debug function to test feed access
export const testFeedAccess = async (): Promise<void> => {
  console.log('🔍 Testing feed access...');
  
  const testFeeds = [
    'https://feeds.reuters.com/reuters/topNews',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms'
  ];
  
  for (const feed of testFeeds) {
    try {
      console.log(`Testing: ${feed}`);
      const result = await fetchRSSFeed(feed);
      console.log(`✅ Success: ${result.length} items from ${feed}`);
    } catch (error) {
      console.log(`❌ Failed: ${feed}`, error);
    }
  }
};

// Fetch trending stories (mix from multiple categories)
export const fetchTrendingStories = async (): Promise<NewsItem[]> => {
  // Uncomment to test feed access
  // await testFeedAccess();
  
  return fetchNewsByCategory('Trending Stories');
};

// Get story count for a category (for display in category cards)
export const getCategoryStoryCount = async (category: string): Promise<number> => {
  try {
    const stories = await fetchNewsByCategory(category);
    return stories.length;
  } catch (error) {
    console.error(`Error getting story count for ${category}:`, error);
    return 0;
  }
};