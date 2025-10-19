import { Header } from "./Header";
import { DSNLOriginalsSection } from "./DSNLOriginalsSection";
import { FounderSection } from "./FounderSection";
import { StoryCard } from "./StoryCard";
import { StoryModal } from "./StoryModal";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Globe, Briefcase, Smartphone, Users, ChevronRight, Zap, MapPin, Tv, Monitor, BarChart3, Building, Gamepad2, Heart, Loader2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrendingStories, useNewsByCategory } from "@/hooks/useNews";
import heroTechImage from "@/assets/hero-tech.jpg";
import heroBusinessImage from "@/assets/hero-business.jpg";
import heroWorldImage from "@/assets/hero-world.jpg";
import dsnlOriginalImage from "@/assets/dsnl-original.jpg";

export const HomePage = () => {
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
  
  // Fetch real news data
  const { data: trendingStories, isLoading: trendingLoading, error: trendingError } = useTrendingStories();
  const { data: moreStories, isLoading: moreLoading } = useNewsByCategory('World News');
  const { data: businessStories } = useNewsByCategory('Business');
  const { data: techStories } = useNewsByCategory('Technology');

  useEffect(() => {
    let ticking = false;
    let isCompact = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const categoriesSection = document.getElementById('categories-section');
          const categoriesTitle = document.getElementById('categories-title');
          const categoriesGrid = document.getElementById('categories-grid');
          const categoryCounts = document.querySelectorAll('.category-count');
          const categoryCards = document.querySelectorAll('.category-card');
          
          if (!categoriesSection) {
            ticking = false;
            return;
          }
          
          const scrollY = window.scrollY;
          const bannerHeight = 350; // Slightly reduced for earlier transition
          const shouldBeCompact = scrollY > bannerHeight;
          
          // Only apply changes if state actually changed
          if (shouldBeCompact !== isCompact) {
            isCompact = shouldBeCompact;
            const isMobile = window.innerWidth < 768;
            
            if (shouldBeCompact) {
              // Compact mode - add CSS classes instead of inline styles for smoother transitions
              categoriesSection.classList.add('compact-mode');
              categoriesSection.style.cssText = `
                background: hsl(var(--card));
                padding: ${isMobile ? '8px 0' : '10px 0'};
                min-height: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              `;
              
              if (categoriesTitle) {
                categoriesTitle.style.cssText = `
                  opacity: 0;
                  transform: translateY(-10px);
                  transition: all 0.2s ease-out;
                  pointer-events: none;
                `;
                setTimeout(() => {
                  if (categoriesTitle && isCompact) {
                    categoriesTitle.style.display = 'none';
                  }
                }, 200);
              }
              
              if (categoriesGrid) {
                categoriesGrid.style.cssText = `
                  display: flex;
                  justify-content: ${isMobile ? 'flex-start' : 'center'};
                  gap: ${isMobile ? '8px' : '16px'};
                  flex-wrap: ${isMobile ? 'nowrap' : 'wrap'};
                  overflow-x: ${isMobile ? 'auto' : 'visible'};
                  align-items: center;
                  padding-bottom: ${isMobile ? '4px' : '0'};
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  scroll-behavior: smooth;
                  -webkit-overflow-scrolling: touch;
                `;
              }
              
              categoryCards.forEach((card, index) => {
                setTimeout(() => {
                  if (!isCompact) return; // Check if still should be compact
                  card.style.cssText = `
                    padding: ${isMobile ? '6px 12px' : '8px 16px'};
                    background: transparent;
                    box-shadow: none;
                    border: none;
                    border-radius: ${isMobile ? '16px' : '8px'};
                    min-height: 0;
                    min-width: ${isMobile ? 'max-content' : 'auto'};
                    white-space: ${isMobile ? 'nowrap' : 'normal'};
                    transition: all 0.2s ease-out;
                    transform: scale(1);
                  `;
                }, index * 20); // Stagger the animation
              });
              
              categoryCounts.forEach((count, index) => {
                setTimeout(() => {
                  count.style.cssText = `
                    opacity: 0;
                    transform: scale(0.8);
                    transition: all 0.15s ease-out;
                  `;
                  setTimeout(() => {
                    if (isCompact) count.style.display = 'none';
                  }, 150);
                }, index * 10);
              });
              
              const categoryNames = document.querySelectorAll('.category-name');
              categoryNames.forEach((name, index) => {
                setTimeout(() => {
                  if (!isCompact) return;
                  name.style.cssText = `
                    font-size: ${isMobile ? '12px' : '13px'};
                    margin-bottom: 0;
                    font-weight: 500;
                    line-height: ${isMobile ? '1.3' : '1.4'};
                    transition: all 0.2s ease-out;
                  `;
                }, index * 15);
              });
            } else {
              // Original mode - reset to default with smooth transition
              categoriesSection.classList.remove('compact-mode');
              categoriesSection.style.cssText = `
                background: hsl(var(--background));
                padding: 24px 0;
                min-height: auto;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              `;
              
              if (categoriesTitle) {
                categoriesTitle.style.display = 'block';
                setTimeout(() => {
                  if (!isCompact && categoriesTitle) {
                    categoriesTitle.style.cssText = `
                      opacity: 1;
                      transform: translateY(0);
                      transition: all 0.3s ease-out;
                      pointer-events: auto;
                    `;
                  }
                }, 50);
              }
              
              if (categoriesGrid) {
                categoriesGrid.style.cssText = `
                  display: grid;
                  justify-content: stretch;
                  gap: 12px;
                  flex-wrap: wrap;
                  overflow-x: visible;
                  align-items: stretch;
                  padding-bottom: 0;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                `;
              }
              
              categoryCards.forEach((card, index) => {
                setTimeout(() => {
                  if (isCompact) return;
                  card.style.cssText = `
                    transition: all 0.2s ease-out;
                  `;
                  // Reset to default after transition
                  setTimeout(() => {
                    if (!isCompact) {
                      card.removeAttribute('style');
                    }
                  }, 200);
                }, index * 15);
              });
              
              categoryCounts.forEach((count, index) => {
                setTimeout(() => {
                  if (isCompact) return;
                  count.style.cssText = `
                    display: block;
                    opacity: 1;
                    transform: scale(1);
                    transition: all 0.2s ease-out;
                  `;
                  setTimeout(() => {
                    if (!isCompact) count.removeAttribute('style');
                  }, 200);
                }, index * 10);
              });
              
              const categoryNames = document.querySelectorAll('.category-name');
              categoryNames.forEach((name, index) => {
                setTimeout(() => {
                  if (isCompact) return;
                  name.style.cssText = `
                    transition: all 0.2s ease-out;
                  `;
                  setTimeout(() => {
                    if (!isCompact) name.removeAttribute('style');
                  }, 200);
                }, index * 10);
              });
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run once on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transform news data for StoryCard components
  const featuredStories = (trendingStories || []).slice(0, 6).map((story: any) => ({
    title: story.title,
    description: story.description,
    category: story.category || 'General',
    source: story.source,
    timeAgo: story.timeAgo,
    imageUrl: story.imageUrl || heroTechImage,
    link: story.link
  }));

  // Combine different categories for More Stories section
  const combinedMoreStories = [
    ...(moreStories || []).slice(0, 3),
    ...(businessStories || []).slice(0, 2),
    ...(techStories || []).slice(0, 1)
  ];

  const exploreCategories = [
    { name: "Trending Stories", icon: TrendingUp, count: trendingStories?.length || 0, color: "bg-red-500" },
    { name: "World News", icon: Globe, count: 856, color: "bg-blue-500" },
    { name: "India", icon: MapPin, count: 743, color: "bg-orange-500" },
    { name: "Technology", icon: Monitor, count: 624, color: "bg-purple-500" },
    { name: "Business", icon: Building, count: 489, color: "bg-green-500" },
    { name: "Politics", icon: Users, count: 567, color: "bg-pink-500" },
    { name: "Entertainment", icon: Gamepad2, count: 432, color: "bg-indigo-500" },
    { name: "Sports", icon: Trophy, count: 389, color: "bg-yellow-500" },
    { name: "DSNL TV", icon: Tv, count: 298, color: "bg-teal-500" }
  ];

  const categories = [
    { name: "Technology", icon: Smartphone, count: 24, color: "bg-blue-500" },
    { name: "Business", icon: Briefcase, count: 18, color: "bg-green-500" },
    { name: "World News", icon: Globe, count: 32, color: "bg-purple-500" },
    { name: "Politics", icon: Users, count: 15, color: "bg-red-500" }
  ];

  // Handle category navigation
  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === 'DSNL TV') {
      navigate('/dsnl-tv');
      return;
    }
    
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categorySlug}`);
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
      
      {/* Inspirational Banner */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24 text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-headline mb-4">
            TELLING STORIES
          </h1>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-headline mb-8">
            THAT MATTER
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8"></div>
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-body font-medium tracking-wide">
            Empowering Minds, Shaping Stories, Transforming Society
          </p>
        </div>
      </section>
      
      {/* Explore by Category Section */}
      <section id="categories-section" className="sticky top-16 z-40 bg-background py-6 border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-4">
          <h2 id="categories-title" className="font-display text-xl md:text-2xl font-bold text-headline mb-6 transition-all duration-300">
            Explore by Category
          </h2>
          
          <div id="categories-grid" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 transition-all duration-300">
            {exploreCategories.map((category) => (
              <div 
                key={category.name} 
                className="magazine-card p-4 cursor-pointer text-center category-card hover:bg-accent/50 transition-colors"
                onClick={() => handleCategoryClick(category.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(category.name);
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <h3 className="font-medium text-headline text-sm mb-1 category-name">{category.name}</h3>
                  <p className="text-metadata text-xs category-count">{category.count} stories</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="bg-card">
        <div className="container mx-auto px-4 py-8">
          {/* Trending Badge */}
          <div className="flex items-center space-x-2 mb-6">
            <Badge className="flex items-center space-x-2 bg-primary/10 text-primary border-primary/20">
              <TrendingUp size={14} />
              <span>Trending Stories</span>
            </Badge>
            <span className="text-metadata text-sm">Updated every 30 minutes</span>
          </div>

          {/* Main Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {trendingLoading ? (
              // Loading skeleton
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-body">Loading latest news...</span>
              </div>
            ) : trendingError ? (
              // Error state
              <div className="col-span-full text-center py-12">
                <p className="text-body mb-4">Unable to load latest news. Please try again later.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : featuredStories.length > 0 ? (
              // Success state with real news
              featuredStories.map((story, index) => (
                <StoryCard
                  key={`${story.source}-${index}`}
                  {...story}
                  variant={
                    index === 0 ? 'hero' : 
                    index === 1 ? 'large' :
                    'medium'
                  }
                  onStoryClick={handleStoryClick}
                />
              ))
            ) : (
              // No data state
              <div className="col-span-full text-center py-12">
                <p className="text-body">No trending stories available at the moment.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* DSNL Originals Section */}
      <DSNLOriginalsSection />

      {/* Additional News Sections - Magazine Style Layout */}
      <section className="bg-card py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-headline mb-8">
            More Stories
          </h2>
          
          {/* Desktop: Two-column layout with main content and sidebar */}
          <div className="lg:flex lg:gap-8">
            {/* Main Content Area - Desktop */}
            <div className="lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {moreLoading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-body text-sm">Loading more stories...</span>
                  </div>
                ) : combinedMoreStories.slice(0, 4).map((story: any, index) => (
                  <StoryCard
                    key={`main-${story.source}-${index}`}
                    title={story.title}
                    description={story.description}
                    category={story.category || 'General'}
                    source={story.source}
                    timeAgo={story.timeAgo}
                    imageUrl={story.imageUrl || heroWorldImage}
                    link={story.link}
                    variant="large"
                    onStoryClick={handleStoryClick}
                  />
                ))}
              </div>
            </div>
            
            {/* Sidebar - Desktop Only */}
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                {/* Founder's Vision Section */}
                <FounderSection />
                
                <h3 className="font-display text-lg font-bold text-headline mb-4 border-b border-border pb-2">
                  Latest Updates
                </h3>
                <div className="space-y-4">
                  {combinedMoreStories.slice(4, 8).map((story: any, index) => (
                    <div 
                      key={`sidebar-${story.source}-${index}`}
                      className="flex gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleStoryClick({
                        title: story.title,
                        description: story.description,
                        category: story.category || 'General',
                        source: story.source,
                        timeAgo: story.timeAgo,
                        imageUrl: story.imageUrl || heroWorldImage,
                        link: story.link
                      })}
                    >
                      <img 
                        src={story.imageUrl || heroWorldImage} 
                        alt={story.title}
                        className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-headline text-sm leading-tight mb-1 line-clamp-2">
                          {story.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-metadata">
                          <span className="bg-accent px-2 py-0.5 rounded text-xs">
                            {story.category}
                          </span>
                          <span>{story.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Trending Topics Widget */}
                <div className="mt-8 p-4 bg-accent/20 rounded-lg">
                  <h4 className="font-display text-md font-bold text-headline mb-3">
                    Trending Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Breaking News', 'AI Technology', 'Global Markets', 'Climate Change', 'Elections'].map((topic, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors">
                        #{topic.toLowerCase().replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile: Single column layout */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {combinedMoreStories.slice(4).map((story: any, index) => (
              <StoryCard
                key={`mobile-${story.source}-${index}`}
                title={story.title}
                description={story.description}
                category={story.category || 'General'}
                source={story.source}
                timeAgo={story.timeAgo}
                imageUrl={story.imageUrl || heroWorldImage}
                link={story.link}
                variant="medium"
                onStoryClick={handleStoryClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* DSNL Media Network */}
            <div>
              <h3 className="font-display text-xl font-bold text-headline mb-4">
                DSNL Media Network
              </h3>
              <p className="text-body text-sm leading-relaxed">
                Premium news and magazine-style content for the modern reader.
                Experience journalism reimagined.
              </p>
            </div>
            
            {/* Content */}
            <div>
              <h4 className="font-semibold text-headline mb-4">Content</h4>
              <ul className="space-y-2 text-sm text-body">
                <li><a href="#" className="hover:text-primary transition-colors">World News</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Technology</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Business</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">India</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Politics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sports</a></li>
                <li><a href="/dsnl-tv" className="hover:text-primary transition-colors">DSNL TV</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold text-headline mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-body">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            {/* Subscribe */}
            <div>
              <h4 className="font-semibold text-headline mb-4">Subscribe</h4>
              <p className="text-sm text-body mb-4">
                Get the best stories delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-metadata text-sm mb-4 md:mb-0">
                © 2024 DSNL Media Network. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-metadata">
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Story Detail Modal */}
      <StoryModal 
        isOpen={isStoryModalOpen}
        onClose={handleCloseStoryModal}
        story={selectedStory}
      />
    </div>
  );
};
