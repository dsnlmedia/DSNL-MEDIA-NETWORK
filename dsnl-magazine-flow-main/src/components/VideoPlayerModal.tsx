import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Eye, ThumbsUp, Clock } from 'lucide-react';
import { YouTubeVideo } from '@/services/youtubeService';
import { youtubeService } from '@/services/youtubeService';

interface VideoPlayerModalProps {
  video: YouTubeVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  isOpen,
  onClose,
}) => {
  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!video) return null;

  const timeAgo = youtubeService.getTimeAgo(video.publishedAt);

  const handleExternalClick = () => {
    window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{video.title}</DialogTitle>
        </DialogHeader>
        
        {/* Close button */}
        <DialogClose asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-2 z-50 bg-black/50 text-white hover:bg-black/70 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>

        <div className="flex flex-col h-full">
          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            <iframe
              src={`${video.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          {/* Video Information */}
          <div className="p-6 space-y-4">
            <div>
              <h1 className="text-xl font-bold leading-tight mb-2">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.viewCount} views</span>
                </div>
                
                {video.likeCount && (
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{video.likeCount} likes</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{video.duration}</span>
                </div>
                
                <span>Published {timeAgo}</span>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Description</h3>
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg max-h-32 overflow-y-auto">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {video.description.slice(0, 500)}
                    {video.description.length > 500 && '...'}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  DSNL TV
                </Badge>
              </div>
              
              <Button 
                variant="outline"
                onClick={handleExternalClick}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Watch on YouTube</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;