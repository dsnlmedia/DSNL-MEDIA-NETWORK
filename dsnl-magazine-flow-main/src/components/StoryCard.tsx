import { Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StoryCardProps {
  title: string;
  description: string;
  category: string;
  source: string;
  timeAgo: string;
  imageUrl: string;
  variant?: 'hero' | 'large' | 'medium' | 'small';
  isDSNLOriginal?: boolean;
  link?: string;
  onStoryClick?: (story: {
    title: string;
    description: string;
    category: string;
    source: string;
    timeAgo: string;
    imageUrl: string;
    link: string;
  }) => void;
}

export const StoryCard = ({ 
  title, 
  description, 
  category, 
  source, 
  timeAgo, 
  imageUrl, 
  variant = 'medium',
  isDSNLOriginal = false,
  link,
  onStoryClick
}: StoryCardProps) => {
  const cardSizeClasses = {
    hero: 'md:col-span-2 md:row-span-2',
    large: 'md:col-span-2',
    medium: 'md:col-span-1',
    small: 'md:col-span-1'
  };

  const imageSizeClasses = {
    hero: 'h-64 md:h-80',
    large: 'h-48 md:h-56',
    medium: 'h-40 md:h-48',
    small: 'h-32 md:h-36'
  };

  const handleClick = () => {
    if (onStoryClick && link) {
      onStoryClick({
        title,
        description,
        category,
        source,
        timeAgo,
        imageUrl,
        link
      });
    } else if (link) {
      // Fallback to direct link if no modal handler
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article 
      className={`magazine-card group cursor-pointer ${cardSizeClasses[variant]} ${isDSNLOriginal ? 'dsnl-original' : ''}`}
      onClick={handleClick}
      role={link ? 'button' : 'article'}
      tabIndex={link ? 0 : -1}
      onKeyDown={(e) => {
        if (link && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Image Section */}
      <div className={`relative overflow-hidden ${imageSizeClasses[variant]}`}>
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Fallback to generic news logo if external logo fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== '/src/assets/logos/generic-news-logo.svg') {
              target.src = '/src/assets/logos/generic-news-logo.svg';
            }
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="category-badge text-xs font-medium">
            {category}
          </Badge>
        </div>

        {/* DSNL Original Badge */}
        {isDSNLOriginal && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs font-medium">
              DSNL EXCLUSIVE
            </Badge>
          </div>
        )}

        {/* Gradient Overlay for Hero Cards */}
        {variant === 'hero' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <h3 className={`font-display font-semibold text-headline mb-2 line-clamp-2 group-hover:text-primary transition-colors ${
          variant === 'hero' ? 'text-xl md:text-2xl' : 
          variant === 'large' ? 'text-lg md:text-xl' : 
          variant === 'small' ? 'text-sm md:text-base' : 'text-base md:text-lg'
        }`}>
          {title}
        </h3>

        {(variant === 'hero' || variant === 'large') && (
          <p className="text-body text-sm md:text-base mb-3 line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {variant === 'medium' && (
          <p className="text-body text-sm mb-3 line-clamp-2 flex-1">
            {description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-metadata text-xs md:text-sm mt-auto">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{source}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{timeAgo}</span>
            </div>
          </div>
          
          <ExternalLink size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </article>
  );
};