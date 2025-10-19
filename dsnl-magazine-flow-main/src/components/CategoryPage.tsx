import { Header } from "./Header";
import { StoryCard } from "./StoryCard";
import { StoryModal } from "./StoryModal";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNewsByCategory } from "@/hooks/useNews";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { getNewsSourceLogo } from "@/utils/newsSourceLogos";
import heroTechImage from "@/assets/hero-tech.jpg";
import heroBusinessImage from "@/assets/hero-business.jpg";
import heroWorldImage from "@/assets/hero-world.jpg";

const categoryImages: Record<string, string> = {
  'trending-stories': heroTechImage,
  'world-news': heroWorldImage,
  'india': heroWorldImage,
  'technology': heroTechImage,
  'business': heroBusinessImage,
  'politics': heroWorldImage,
  'entertainment': heroBusinessImage,
  'sports': heroTechImage
};

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  // Modal state for story details
  const [selectedStory, setSelectedStory] = useState<{
    title: string;
    description: string;
    category: string;
    source: string;
    timeAgo: string;
    imageUrl: string;
    link: string;
  } | null>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  
  if (!category) {
    navigate('/');
    return null;
  }

  // Convert URL slug to display name
  const displayName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const { data: stories, isLoading, error } = useNewsByCategory(displayName);

  const handleBackClick = () => {
    navigate('/');
  };

  // Handle story click - open modal instead of direct link
  const handleStoryClick = (story: {
    title: string;
    description: string;
    category: string;
    source: string;
    timeAgo: string;
    imageUrl: string;
    link: string;
  }) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  // Close story modal
  const handleCloseStoryModal = () => {
    setIsStoryModalOpen(false);
    setSelectedStory(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Category Header */}
      <section className="bg-card py-8 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-body hover:text-headline transition-colors mr-4"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {displayName}
            </Badge>
            {stories && (
              <span className="text-metadata text-sm">
                {stories.length} stories available
              </span>
            )}
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl font-bold text-headline">
            {displayName} News
          </h1>
          <p className="text-body mt-2">
            Latest {displayName.toLowerCase()} news from trusted sources
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-body">Loading {displayName.toLowerCase()} news...</span>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-body mb-4">
                Unable to load {displayName.toLowerCase()} news. Please try again later.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : stories && stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story: any, index) => (
                <StoryCard
                  key={`${story.source}-${index}`}
                  title={story.title}
                  description={story.description}
                  category={story.category || displayName}
                  source={story.source}
                  timeAgo={story.timeAgo}
                  imageUrl={story.imageUrl || getNewsSourceLogo(story.source) || categoryImages[category] || heroTechImage}
                  link={story.link}
                  variant="medium"
                  onStoryClick={handleStoryClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-body">
                No {displayName.toLowerCase()} stories available at the moment.
              </p>
              <button 
                onClick={handleBackClick}
                className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </section>
      
      {/* Story Detail Modal */}
      <StoryModal 
        isOpen={isStoryModalOpen}
        onClose={handleCloseStoryModal}
        story={selectedStory}
      />
    </div>
  );
};
