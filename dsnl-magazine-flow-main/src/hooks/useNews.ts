import { useQuery } from '@tanstack/react-query';
import { fetchNewsByCategory, fetchTrendingStories, getCategoryStoryCount } from '@/services/newsService';

// Hook to fetch news by category
export const useNewsByCategory = (category: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['news', category],
    queryFn: () => fetchNewsByCategory(category),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

// Hook to fetch trending stories
export const useTrendingStories = () => {
  return useQuery({
    queryKey: ['trending-stories'],
    queryFn: fetchTrendingStories,
    staleTime: 5 * 60 * 1000, // 5 minutes (shorter for trending)
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true // Refetch when window regains focus
  });
};

// Hook to get category story counts
export const useCategoryStoryCount = (category: string) => {
  return useQuery({
    queryKey: ['category-count', category],
    queryFn: () => getCategoryStoryCount(category),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

// Hook to prefetch category data
export const usePrefetchCategories = () => {
  const categories = [
    'Trending Stories',
    'World News', 
    'India',
    'Technology',
    'Business',
    'Politics',
    'Entertainment'
  ];

  return categories.map(category => 
    useNewsByCategory(category, false) // Don't auto-fetch, just prepare queries
  );
};

