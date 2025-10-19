import { useQuery } from '@tanstack/react-query';
import { youtubeService, YouTubeVideo, YouTubeChannel } from '@/services/youtubeService';

/**
 * Hook to fetch videos from DSNL YouTube channel
 */
export const useChannelVideos = (maxResults: number = 20) => {
  return useQuery({
    queryKey: ['youtube-videos', maxResults],
    queryFn: () => youtubeService.getChannelVideos(maxResults),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch DSNL channel information
 */
export const useChannelInfo = () => {
  return useQuery({
    queryKey: ['youtube-channel-info'],
    queryFn: () => youtubeService.getChannelInfo(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

/**
 * Hook to search videos within DSNL channel
 */
export const useSearchChannelVideos = (query: string, maxResults: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['youtube-search', query, maxResults],
    queryFn: () => youtubeService.searchChannelVideos(query, maxResults),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};