import React, { useState } from 'react';
import { Header } from './Header';
import { VideoCard } from './VideoCard';
import { VideoPlayerModal } from './VideoPlayerModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Youtube, Users, VideoIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useChannelVideos, useChannelInfo, useSearchChannelVideos } from '@/hooks/useYoutube';
import { YouTubeVideo } from '@/services/youtubeService';

export const DSNLTVPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch channel videos and info
  const { 
    data: videos, 
    isLoading: videosLoading, 
    error: videosError,
    refetch: refetchVideos 
  } = useChannelVideos(20);

  const { 
    data: channelInfo, 
    isLoading: channelLoading 
  } = useChannelInfo();

  const { 
    data: searchResults,
    isLoading: searchLoading 
  } = useSearchChannelVideos(searchQuery, 10, isSearching);

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsPlayerModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPlayerModalOpen(false);
    setSelectedVideo(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const displayedVideos = isSearching ? searchResults : videos;
  const isLoading = videosLoading || channelLoading || searchLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-card border-b border-border/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <VideoIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-headline">
                DSNL TV
              </h1>
            </div>
            <div className="w-16 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-sm md:text-base text-body max-w-2xl mx-auto font-medium">
              Where News Meets Visual Storytelling
            </p>
          </div>

          {/* Channel Info */}
          {channelInfo && (
            <div className="magazine-card p-4 md:p-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <img 
                  src={channelInfo.thumbnailUrl} 
                  alt={channelInfo.title}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-border"
                />
                <div className="text-center md:text-left flex-1">
                  <h2 className="font-display text-lg md:text-xl font-bold text-headline mb-2">{channelInfo.title}</h2>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-metadata">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{channelInfo.subscriberCount} subscribers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <VideoIcon className="h-4 w-4" />
                      <span>{channelInfo.videoCount} videos</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => window.open(`https://www.youtube.com/channel/${channelInfo.id}`, '_blank')}
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-background border-b border-border/30">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-metadata h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border focus:ring-primary focus:border-primary"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!searchQuery.trim() || searchLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
              {isSearching && (
                <Button variant="outline" onClick={clearSearch} className="border-border">
                  Clear
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-headline mb-1">
                {isSearching ? `Search Results` : 'Latest Videos'}
              </h2>
              <p className="text-metadata text-sm">
                {isSearching 
                  ? `Found ${searchResults?.length || 0} videos for "${searchQuery}"`
                  : `${videos?.length || 0} videos available`
                }
              </p>
            </div>
            
            {!isSearching && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchVideos()}
                disabled={videosLoading}
                className="border-border"
              >
                {videosLoading ? 
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 
                  <RefreshCw className="h-4 w-4 mr-2" />
                }
                Refresh
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-metadata text-sm">Loading videos...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {videosError && !isLoading && (
            <div className="magazine-card max-w-md mx-auto">
              <CardContent className="flex flex-col items-center text-center p-6">
                <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                <h3 className="font-display text-lg font-bold text-headline mb-2">Unable to Load Videos</h3>
                <p className="text-body text-sm mb-4">
                  Please check your internet connection or try again later.
                </p>
                <Button onClick={() => refetchVideos()} className="bg-primary hover:bg-primary/90">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </div>
          )}

          {/* No Results */}
          {!isLoading && displayedVideos?.length === 0 && (
            <div className="magazine-card max-w-md mx-auto">
              <CardContent className="text-center p-6">
                <VideoIcon className="h-10 w-10 text-metadata mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-headline mb-2">
                  {isSearching ? 'No search results' : 'No videos found'}
                </h3>
                <p className="text-body text-sm mb-4">
                  {isSearching 
                    ? `No videos found for "${searchQuery}". Try a different search term.`
                    : 'No videos are available at the moment.'
                  }
                </p>
                {isSearching && (
                  <Button variant="outline" onClick={clearSearch} className="border-border">
                    View All Videos
                  </Button>
                )}
              </CardContent>
            </div>
          )}

          {/* Videos Grid */}
          {!isLoading && displayedVideos && displayedVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={handleVideoClick}
                  showStats={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={isPlayerModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DSNLTVPage;
