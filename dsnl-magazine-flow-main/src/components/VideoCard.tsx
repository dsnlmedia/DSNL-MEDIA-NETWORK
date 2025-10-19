import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Eye, ThumbsUp, Clock, ExternalLink } from 'lucide-react';
import { YouTubeVideo } from '@/services/youtubeService';
import { youtubeService } from '@/services/youtubeService';

interface VideoCardProps {
  video: YouTubeVideo;
  onClick?: (video: YouTubeVideo) => void;
  showStats?: boolean;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onClick, 
  showStats = true,
  className = '' 
}) => {
  const timeAgo = youtubeService.getTimeAgo(video.publishedAt);

  const handleCardClick = () => {
    if (onClick) {
      onClick(video);
    }
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <Card 
      className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="aspect-video overflow-hidden">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-video.png';
            }}
          />
        </div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
        
        {/* Duration badge */}
        <Badge 
          variant="secondary" 
          className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/80"
        >
          <Clock className="h-3 w-3 mr-1" />
          {video.duration}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {truncateDescription(video.description)}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>{timeAgo}</span>
            
            {showStats && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{video.viewCount}</span>
                </div>
                {video.likeCount && (
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{video.likeCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs px-2 py-1 h-auto"
              onClick={handleCardClick}
            >
              <Play className="h-3 w-3 mr-1" />
              Watch Now
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs px-2 py-1 h-auto"
              onClick={handleExternalClick}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              YouTube
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
