import { Search, User, Menu, Mail, Edit3, FileText, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewsletterModal } from "./NewsletterModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dsnlLogo from "@/assets/dsnl-logo.png";

export const Header = () => {
  const navigate = useNavigate();
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNewsletterClick = () => {
    setIsNewsletterModalOpen(true);
  };

  const handleCloseNewsletterModal = () => {
    setIsNewsletterModalOpen(false);
  };

  const handleFounderClick = () => {
    navigate('/founder');
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const handleArticlesClick = () => {
    navigate('/articles');
    setIsMobileMenuOpen(false);
  };

  const handleEditorialSpeaksClick = () => {
    navigate('/editorial-speaks');
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNewsletterClick = () => {
    handleNewsletterClick();
    setIsMobileMenuOpen(false); // Close mobile menu
  };

  // Close mobile menu on escape key or when clicking outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleResize = () => {
      // Close mobile menu on desktop resize
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* DSNL Media Network Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src={dsnlLogo} 
                alt="DSNL Media Network" 
                className="h-10 w-auto mr-3 object-contain rounded-lg" 
              />
              <h1 className="font-display text-xl font-semibold text-headline">
                DSNL Media Network
              </h1>
            </div>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Founder's Vision Button - Premium Magazine Style */}
            <Button 
              variant="ghost" 
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-sm font-semibold text-body hover:text-headline hover:bg-accent/30 transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-sm"
              onClick={handleFounderClick}
            >
              <UserCheck size={16} className="text-primary" />
              <span className="tracking-wide">Founder's Vision</span>
            </Button>
            
            {/* Editor Speaks Button - Premium Magazine Style */}
            <Button 
              variant="ghost" 
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-sm font-semibold text-body hover:text-headline hover:bg-accent/30 transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-sm"
              onClick={handleEditorialSpeaksClick}
            >
              <Edit3 size={16} className="text-primary" />
              <span className="tracking-wide">Editor Speaks</span>
            </Button>
            
            {/* Articles Button - Premium Magazine Style */}
            <Button 
              variant="ghost" 
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-sm font-semibold text-body hover:text-headline hover:bg-accent/30 transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-sm"
              onClick={handleArticlesClick}
            >
              <FileText size={16} className="text-primary" />
              <span className="tracking-wide">Articles</span>
            </Button>
            
            {/* Newsletters Button - Premium Magazine Style */}
            <Button 
              variant="ghost" 
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-sm font-semibold text-body hover:text-headline hover:bg-accent/30 transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-sm"
              onClick={handleNewsletterClick}
            >
              <Mail size={16} className="text-primary" />
              <span className="tracking-wide">Newsletters</span>
            </Button>
            
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search news..."
                className="pl-10 w-64 bg-muted/30 border-border text-body placeholder:text-metadata"
              />
            </div>

            {/* User Profile */}
            <Button variant="ghost" size="icon" className="text-body hover:text-headline">
              <User size={18} />
            </Button>

            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-body hover:text-headline"
              onClick={handleMobileMenuToggle}
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm backdrop-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Drawer */}
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border/30 shadow-2xl mobile-menu-enter">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h2 className="font-display text-lg font-semibold text-headline">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-body hover:text-headline"
              >
                <X size={18} />
              </Button>
            </div>
            
            {/* Menu Content */}
            <div className="p-4 space-y-2">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search news..."
                    className="pl-10 bg-muted/30 border-border text-body placeholder:text-metadata"
                  />
                </div>
              </div>
              
              {/* Navigation Items */}
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left p-4 h-auto text-body hover:text-headline hover:bg-accent/50"
                  onClick={handleFounderClick}
                >
                  <UserCheck size={18} className="mr-3 text-primary" />
                  <span className="text-base">Founder's Vision</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left p-4 h-auto text-body hover:text-headline hover:bg-accent/50"
                  onClick={handleEditorialSpeaksClick}
                >
                  <Edit3 size={18} className="mr-3 text-primary" />
                  <span className="text-base">Editor Speaks</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left p-4 h-auto text-body hover:text-headline hover:bg-accent/50"
                  onClick={handleArticlesClick}
                >
                  <FileText size={18} className="mr-3 text-primary" />
                  <span className="text-base">Articles</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left p-4 h-auto text-body hover:text-headline hover:bg-accent/50"
                  onClick={handleMobileNewsletterClick}
                >
                  <Mail size={18} className="mr-3 text-primary" />
                  <span className="text-base">Newsletters</span>
                </Button>
              </div>
              
              {/* Divider */}
              <div className="border-t border-border/30 my-4" />
              
              {/* User Profile */}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left p-4 h-auto text-body hover:text-headline hover:bg-accent/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} className="mr-3" />
                <span className="text-base">Profile</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Newsletter Subscription Modal */}
      <NewsletterModal 
        isOpen={isNewsletterModalOpen}
        onClose={handleCloseNewsletterModal}
      />
    </header>
  );
};
