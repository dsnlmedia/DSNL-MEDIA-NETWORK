import axios from 'axios';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount?: string;
  videoUrl: string;
  embedUrl: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
}

class YouTubeService {
  private apiKey: string;
  private channelId: string;

  constructor() {
    this.apiKey = API_KEY || '';
    this.channelId = CHANNEL_ID || '';
    
    if (!this.apiKey || !this.channelId) {
      console.warn('YouTube API key or Channel ID not configured');
    }
  }

  /**
   * Fetch videos from the DSNL YouTube channel
   */
  async getChannelVideos(maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      if (!this.apiKey || !this.channelId) {
        throw new Error('YouTube API key or Channel ID not configured');
      }

      // First, get the uploads playlist ID
      const channelResponse = await axios.get(
        `${YOUTUBE_API_BASE_URL}/channels`,
        {
          params: {
            key: this.apiKey,
            id: this.channelId,
            part: 'contentDetails',
          },
        }
      );

      const uploadsPlaylistId = 
        channelResponse.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error('Could not find uploads playlist for channel');
      }

      // Get videos from the uploads playlist
      const playlistResponse = await axios.get(
        `${YOUTUBE_API_BASE_URL}/playlistItems`,
        {
          params: {
            key: this.apiKey,
            playlistId: uploadsPlaylistId,
            part: 'snippet',
            maxResults,
            order: 'date',
          },
        }
      );

      const videoIds = playlistResponse.data.items
        .map((item: any) => item.snippet.resourceId.videoId)
        .join(',');

      // Get detailed video information
      const videosResponse = await axios.get(
        `${YOUTUBE_API_BASE_URL}/videos`,
        {
          params: {
            key: this.apiKey,
            id: videoIds,
            part: 'snippet,statistics,contentDetails',
          },
        }
      );

      return videosResponse.data.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails?.maxres?.url || 
                     video.snippet.thumbnails?.high?.url || 
                     video.snippet.thumbnails?.medium?.url,
        publishedAt: video.snippet.publishedAt,
        duration: this.parseDuration(video.contentDetails.duration),
        viewCount: this.formatNumber(video.statistics.viewCount),
        likeCount: this.formatNumber(video.statistics.likeCount),
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
      }));
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(): Promise<YouTubeChannel | null> {
    try {
      if (!this.apiKey || !this.channelId) {
        throw new Error('YouTube API key or Channel ID not configured');
      }

      const response = await axios.get(
        `${YOUTUBE_API_BASE_URL}/channels`,
        {
          params: {
            key: this.apiKey,
            id: this.channelId,
            part: 'snippet,statistics',
          },
        }
      );

      const channel = response.data.items[0];
      if (!channel) {
        return null;
      }

      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: channel.snippet.thumbnails?.high?.url || 
                     channel.snippet.thumbnails?.medium?.url,
        subscriberCount: this.formatNumber(channel.statistics.subscriberCount),
        videoCount: this.formatNumber(channel.statistics.videoCount),
      };
    } catch (error) {
      console.error('Error fetching channel info:', error);
      return null;
    }
  }

  /**
   * Search for videos by keyword within the channel
   */
  async searchChannelVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      if (!this.apiKey || !this.channelId) {
        throw new Error('YouTube API key or Channel ID not configured');
      }

      const searchResponse = await axios.get(
        `${YOUTUBE_API_BASE_URL}/search`,
        {
          params: {
            key: this.apiKey,
            channelId: this.channelId,
            q: query,
            part: 'snippet',
            maxResults,
            type: 'video',
            order: 'relevance',
          },
        }
      );

      const videoIds = searchResponse.data.items
        .map((item: any) => item.id.videoId)
        .join(',');

      if (!videoIds) {
        return [];
      }

      // Get detailed video information
      const videosResponse = await axios.get(
        `${YOUTUBE_API_BASE_URL}/videos`,
        {
          params: {
            key: this.apiKey,
            id: videoIds,
            part: 'snippet,statistics,contentDetails',
          },
        }
      );

      return videosResponse.data.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails?.high?.url || 
                     video.snippet.thumbnails?.medium?.url,
        publishedAt: video.snippet.publishedAt,
        duration: this.parseDuration(video.contentDetails.duration),
        viewCount: this.formatNumber(video.statistics.viewCount),
        likeCount: this.formatNumber(video.statistics.likeCount),
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
      }));
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      throw error;
    }
  }

  /**
   * Parse YouTube duration format (PT#M#S) to readable format
   */
  private parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format numbers for display (e.g., 1000 -> 1K)
   */
  private formatNumber(num: string | number): string {
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(number)) return '0';
    
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  }

  /**
   * Get time ago string from published date
   */
  getTimeAgo(publishedAt: string): string {
    const publishedDate = new Date(publishedAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - publishedDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

export const youtubeService = new YouTubeService();
export default youtubeService;