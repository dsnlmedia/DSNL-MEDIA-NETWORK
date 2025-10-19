import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, X, Share2, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: {
    title: string;
    description: string;
    category: string;
    source: string;
    timeAgo: string;
    imageUrl: string;
    link: string;
  } | null;
}

export const StoryModal = ({ isOpen, onClose, story }: StoryModalProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Prevent body scroll when modal is open on mobile
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  if (!story) return null;

  const handleReadMore = () => {
    window.open(story.link, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: story.title,
          text: story.description,
          url: story.link,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(story.link);
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(story.link);
      // You could show a toast notification here
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to localStorage or a backend
  };

  // Extract first words from description based on device
  const getBriefDescription = (text: string, wordLimit?: number): string => {
    const limit = wordLimit || (isMobile ? 45 : 60);
    const words = text.split(' ');
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '...';
  };

  // Mobile-specific full-screen modal
  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="h-screen max-h-screen w-screen max-w-none m-0 p-0 rounded-none border-none overflow-hidden">
          {/* Mobile Header with slide-down close */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-10 w-10 rounded-full"
                >
                  <X size={20} />
                </Button>
                <Badge className="category-badge text-xs px-2 py-1">
                  {story.category}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  className="h-10 w-10 rounded-full"
                >
                  <Bookmark 
                    size={18} 
                    className={isBookmarked ? "fill-primary text-primary" : ""}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="h-10 w-10 rounded-full"
                >
                  <Share2 size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-safe">
            {/* Hero Image */}
            {story.imageUrl && (
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Title and Meta */}
              <div>
                <h1 className="font-display text-2xl font-bold text-headline leading-tight mb-3">
                  {story.title}
                </h1>
                <div className="flex items-center space-x-3 text-metadata text-sm">
                  <span className="font-medium">{story.source}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{story.timeAgo}</span>
                  </div>
                </div>
              </div>

              {/* Story Summary */}
              <div className="space-y-4">
                <p className="text-body text-base leading-relaxed">
                  {getBriefDescription(story.description)}
                </p>
              </div>

              {/* Mobile Action Buttons */}
              <div className="space-y-3 pt-6">
                <Button 
                  onClick={handleReadMore}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
                >
                  <ExternalLink size={20} className="mr-3" />
                  Read Full Story
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                    className="flex-1 h-12"
                  >
                    <Share2 size={16} className="mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleBookmark}
                    className="flex-1 h-12"
                  >
                    <Bookmark size={16} className="mr-2" />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>

              {/* Source Attribution */}
              <div className="bg-accent/20 rounded-lg p-4 mt-6">
                <p className="text-metadata text-sm text-center">
                  This is a preview. Tap "Read Full Story" to view the complete article on <span className="font-medium">{story.source}</span>.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop version (unchanged)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="category-badge text-xs">
                  {story.category}
                </Badge>
                <span className="text-metadata text-xs">•</span>
                <span className="text-metadata text-xs font-medium">{story.source}</span>
                <span className="text-metadata text-xs">•</span>
                <div className="flex items-center space-x-1 text-metadata text-xs">
                  <Clock size={12} />
                  <span>{story.timeAgo}</span>
                </div>
              </div>
              <DialogTitle className="font-display text-xl md:text-2xl font-bold text-headline leading-tight">
                {story.title}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0 h-8 w-8"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Story Image */}
          {story.imageUrl && (
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Story Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-headline text-lg">Story Summary</h3>
            <p className="text-body text-base leading-relaxed">
              {getBriefDescription(story.description)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button 
              onClick={handleReadMore}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ExternalLink size={16} className="mr-2" />
              Read Full Article on {story.source}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4">
            <p className="text-metadata text-sm">
              This summary is generated from the original article. 
              Click "Read Full Article" to view the complete story on {story.source}.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
