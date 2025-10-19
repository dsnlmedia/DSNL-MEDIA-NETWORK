import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./VideoCard";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { useState } from "react";
import { useChannelVideos } from "@/hooks/useYoutube";
import { YouTubeVideo } from "@/services/youtubeService";
import { Star, VideoIcon, Loader2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DSNLOriginalsSection = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  
  // Fetch latest 3 videos from DSNL TV channel
  const { data: videos, isLoading, error } = useChannelVideos(3);
  
  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsPlayerModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsPlayerModalOpen(false);
    setSelectedVideo(null);
  };
  
  const handleViewAllVideos = () => {
    navigate('/dsnl-tv');
  };

  return (
    <>
      <section className="py-12 bg-premium-accent/20">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <VideoIcon className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-headline">
                  DSNL Media Originals
                </h2>
                <p className="text-body text-sm md:text-base">
                  Exclusive video content and in-depth analysis from our editorial team
                </p>
              </div>
            </div>
            
            <Badge className="hidden md:flex items-center space-x-2 bg-primary/10 text-primary border-primary/20">
              <VideoIcon size={14} />
              <span>Original Content</span>
            </Badge>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-metadata">Loading latest videos...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="magazine-card max-w-md mx-auto">
              <div className="flex flex-col items-center text-center p-8">
                <VideoIcon className="h-12 w-12 text-metadata mb-4" />
                <h3 className="font-display text-lg font-bold text-headline mb-2">
                  Unable to Load Videos
                </h3>
                <p className="text-body text-sm mb-4">
                  We couldn't load the latest videos right now. You can still visit DSNL TV to watch our content.
                </p>
                <Button onClick={handleViewAllVideos} className="bg-primary hover:bg-primary/90">
                  <VideoIcon className="h-4 w-4 mr-2" />
                  Visit DSNL TV
                </Button>
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {!isLoading && !error && videos && videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <div key={video.id} className="dsnl-original">
                  <VideoCard
                    video={video}
                    onClick={handleVideoClick}
                    showStats={true}
                    className="border-0"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {!isLoading && !error && videos && videos.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-body mb-4">
                Watch more exclusive content from DSNL Media Originals
              </p>
              <Button 
                onClick={handleViewAllVideos}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Videos
              </Button>
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
    </>
  );
};
