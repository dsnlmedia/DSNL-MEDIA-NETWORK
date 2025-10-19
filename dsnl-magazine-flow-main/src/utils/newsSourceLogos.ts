/**
 * News Source Logo Mapping for RSS Feeds
 * Maps news sources to their respective logos for stories without images
 */

// News source logo mappings - using custom branded text logos for reliability
export const NEWS_SOURCE_LOGOS: Record<string, string> = {
  // Indian News Sources (using local branded SVGs for reliability)
  'NDTV': '/src/assets/logos/ndtv-logo.svg',
  'The Hindu': '/src/assets/logos/thehindu-logo.svg',
  'Times of India': '/src/assets/logos/timesofindia-logo.svg',
  'India Today': '/src/assets/logos/indiatoday-logo.svg',
  'BBC News': '/src/assets/logos/bbc-logo.svg',
  'Reuters': '/src/assets/logos/reuters-logo.svg',
  'CNN': '/src/assets/logos/cnn-logo.svg',
  
  // Additional Indian News Sources
  'Hindustan Times': '/src/assets/logos/hindustantimes-logo.svg',
  'Indian Express': '/src/assets/logos/indianexpress-logo.svg',
  'Economic Times': '/src/assets/logos/economictimes-logo.svg',
  
  'Zee News': '/src/assets/logos/zeenews-logo.svg',
  
  // Business & Financial News Sources  
  'Business Standard': '/src/assets/logos/generic-news-logo.svg',
  'Mint': '/src/assets/logos/generic-news-logo.svg',
  'MoneyControl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Moneycontrol_logo.svg/320px-Moneycontrol_logo.svg.png',
  'Financial Express': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/The_Financial_Express_logo.svg/320px-The_Financial_Express_logo.svg.png',
  
  // Other Indian News Sources
  'News18': '/src/assets/logos/generic-news-logo.svg',
  'ABP Live': '/src/assets/logos/generic-news-logo.svg',
  'Republic World': '/src/assets/logos/generic-news-logo.svg',
  
  // International News Sources
  'Associated Press': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Associated_Press_logo_2012.svg/320px-Associated_Press_logo_2012.svg.png',
  'Al Jazeera': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Aljazeera.svg/320px-Aljazeera.svg.png',
  'Bloomberg': '/src/assets/logos/generic-news-logo.svg',
  'Forbes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Forbes_logo.svg/320px-Forbes_logo.svg.png',
  'NPR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/NPR-logo.svg/320px-NPR-logo.svg.png',
  
  // Technology News Sources
  'TechCrunch': '/src/assets/logos/generic-news-logo.svg',
  'The Verge': '/src/assets/logos/generic-news-logo.svg',
  'Wired': '/src/assets/logos/generic-news-logo.svg',
  'Ars Technica': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Ars_Technica_logo_%282016%29.svg/320px-Ars_Technica_logo_%282016%29.svg.png',
  
  // Sports News Sources  
  'ESPN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',
  'ESPN Cricinfo': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/ESPN_Cricinfo_logo.svg/320px-ESPN_Cricinfo_logo.svg.png',

  // Generic fallback
  'News Source': '/src/assets/logos/generic-news-logo.svg'
};

// Alternative source name mappings for better recognition
export const SOURCE_NAME_ALIASES: Record<string, string> = {
  'Zee :India National': 'Zee News',
  'Zee India National': 'Zee News',
  'ZEE NEWS': 'Zee News',
  'zee news': 'Zee News',
  'Times Of India': 'Times of India',
  'THE HINDU': 'The Hindu',
  'NDTV.com': 'NDTV',
  'India Today.in': 'India Today',
  'Indian Express.com': 'Indian Express'
};

// URL domain to source name mapping for better recognition
export const URL_DOMAIN_MAPPING: Record<string, string> = {
  'ndtv.com': 'NDTV',
  'feedburner.com/ndtv': 'NDTV',
  'thehindu.com': 'The Hindu',
  'hindustantimes.com': 'Hindustan Times',
  'timesofindia.indiatimes.com': 'Times of India',
  'indiatimes.com': 'Times of India',
  'indiatoday.in': 'India Today',
  'indianexpress.com': 'Indian Express',
  'zeenews.india.com': 'Zee News',
  'news18.com': 'News18',
  'economictimes.indiatimes.com': 'Economic Times',
  'business-standard.com': 'Business Standard',
  'livemint.com': 'Mint',
  'moneycontrol.com': 'MoneyControl',
  'financialexpress.com': 'Financial Express',
  'abplive.com': 'ABP Live',
  'republicworld.com': 'Republic World',
  'bbc.co.uk': 'BBC News',
  'bbci.co.uk': 'BBC News',
  'reuters.com': 'Reuters',
  'cnn.com': 'CNN',
  'apnews.com': 'Associated Press',
  'aljazeera.com': 'Al Jazeera',
  'bloomberg.com': 'Bloomberg',
  'forbes.com': 'Forbes',
  'npr.org': 'NPR',
  'techcrunch.com': 'TechCrunch',
  'theverge.com': 'The Verge',
  'wired.com': 'Wired',
  'arstechnica.com': 'Ars Technica',
  'espn.com': 'ESPN',
  'espncricinfo.com': 'ESPN Cricinfo'
};

/**
 * Get news source logo based on source name or feed URL
 * @param sourceName - The name of the news source
 * @param feedUrl - Optional feed URL for domain-based detection
 * @returns Logo URL for the news source
 */
export const getNewsSourceLogo = (sourceName: string, feedUrl?: string): string => {
  console.log('🔍 Getting logo for source:', sourceName, 'from URL:', feedUrl);
  
  // First, check if source name has an alias mapping
  const aliasedSource = SOURCE_NAME_ALIASES[sourceName];
  if (aliasedSource && NEWS_SOURCE_LOGOS[aliasedSource]) {
    console.log('✅ Found alias mapping:', sourceName, '→', aliasedSource, '→', NEWS_SOURCE_LOGOS[aliasedSource]);
    return NEWS_SOURCE_LOGOS[aliasedSource];
  }
  
  // Try direct source name match
  if (NEWS_SOURCE_LOGOS[sourceName]) {
    console.log('✅ Found direct match:', sourceName, '→', NEWS_SOURCE_LOGOS[sourceName]);
    return NEWS_SOURCE_LOGOS[sourceName];
  }

  // If feedUrl provided, try to match by domain
  if (feedUrl) {
    for (const [domain, mappedSource] of Object.entries(URL_DOMAIN_MAPPING)) {
      if (feedUrl.includes(domain)) {
        return NEWS_SOURCE_LOGOS[mappedSource] || NEWS_SOURCE_LOGOS['News Source'];
      }
    }
  }

  // Try partial matching for source name (improved logic)
  const sourceNameLower = sourceName.toLowerCase();
  
  // Check if source name contains any of our known sources
  for (const [sourceKey, logoUrl] of Object.entries(NEWS_SOURCE_LOGOS)) {
    const sourceKeyLower = sourceKey.toLowerCase();
    if (sourceNameLower.includes(sourceKeyLower) || 
        sourceKeyLower.includes(sourceNameLower)) {
      return logoUrl;
    }
  }
  
  // Special handling for common news source patterns
  if (sourceNameLower.includes('zee')) {
    return NEWS_SOURCE_LOGOS['Zee News'];
  }
  if (sourceNameLower.includes('times') && sourceNameLower.includes('india')) {
    return NEWS_SOURCE_LOGOS['Times of India'];
  }
  if (sourceNameLower.includes('hindu')) {
    return NEWS_SOURCE_LOGOS['The Hindu'];
  }
  if (sourceNameLower.includes('ndtv')) {
    return NEWS_SOURCE_LOGOS['NDTV'];
  }

  // Return generic news logo as final fallback
  console.log('⚠️  No logo found, using generic fallback for:', sourceName);
  return NEWS_SOURCE_LOGOS['News Source'];
};

/**
 * Check if a news source has a dedicated logo
 * @param sourceName - The name of the news source
 * @returns Boolean indicating if source has a logo
 */
export const hasNewsSourceLogo = (sourceName: string): boolean => {
  return Boolean(NEWS_SOURCE_LOGOS[sourceName]);
};

/**
 * Get all available news source names with logos
 * @returns Array of news source names that have logos
 */
export const getAvailableNewsSources = (): string[] => {
  return Object.keys(NEWS_SOURCE_LOGOS).filter(source => source !== 'News Source');
};