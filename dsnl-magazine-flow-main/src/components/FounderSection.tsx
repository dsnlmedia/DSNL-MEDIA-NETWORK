import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, User, Calendar, Award, BookOpen, Leaf, Heart } from 'lucide-react';
import founderImage from '@/assets/founder-dr-sn-lal.jpg';

interface FounderSectionProps {
  isOpen?: boolean;
  onClose?: () => void;
  showButton?: boolean;
}

export const FounderSection: React.FC<FounderSectionProps> = ({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose, 
  showButton = true 
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsModalOpen = externalOnClose ? externalOnClose : setInternalIsOpen;

  const achievements = [
    {
      year: "1971-1980",
      title: "Academic Excellence",
      description: "Completed M.Sc. and Ph.D. in Chemistry (Non-Equilibrium Thermodynamics) from D.D.U. Gorakhpur University.",
      icon: Award
    },
    {
      year: "1971-2012",
      title: "41 Years in Academia", 
      description: "Served from Lecturer to Reader, and later Principal at M.G. P.G. College, Gorakhpur.",
      icon: BookOpen
    },
    {
      year: "1981-1996",
      title: "Administrative Leadership",
      description: "Held significant roles including Proctor, Chief Proctor, Assistant Superintendent of Examinations, and NSS Program Officer.",
      icon: User
    },
    {
      year: "1990s-2000s",
      title: "Author & Educator",
      description: "Authored 11 academic books in Chemistry, Environmental Science, and related fields.",
      icon: BookOpen
    },
    {
      year: "1994 onwards",
      title: "Environmental Advocate",
      description: "Organized National Seminars and Environmental Conferences, strengthening public awareness on climate change.",
      icon: Leaf
    },
    {
      year: "2006-2011",
      title: "Institution Builder",
      description: "Served as Principal of M.G. P.G. College, expanding academic programs and achieving NAAC accreditation.",
      icon: Award
    },
    {
      year: "Post-2012",
      title: "DSNL Media Network Founder",
      description: "Founded DSNL Media Network to harness the power of information and media for community upliftment.",
      icon: Heart
    }
  ];

  const handleOpenModal = () => {
    if (externalOnClose) {
      // If controlled externally, this shouldn't be called
      return;
    }
    setInternalIsOpen(true);
  };
  
  const handleCloseModal = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <>
      {/* Founder Vision Button - only show if showButton is true */}
      {showButton && (
        <div className="mb-6">
          <Button
            onClick={handleOpenModal}
            variant="ghost"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-display text-sm font-semibold text-body hover:text-headline hover:bg-accent/30 transition-all duration-300 border border-transparent hover:border-primary/20 hover:shadow-sm"
          >
            <User className="h-4 w-4 text-primary" />
            <span className="tracking-wide">Founder's Vision</span>
          </Button>
        </div>
      )}

      {/* Founder Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Founder's Vision - Dr. S. N. Lal</DialogTitle>
          </DialogHeader>
          
          {/* Close button */}
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-2 z-50 bg-white/90 hover:bg-white rounded-full shadow-md"
              onClick={handleCloseModal}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>

          <div className="overflow-y-auto max-h-[95vh]">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-8 border-b">
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-headline mb-2">
                  TELLING STORIES THAT MATTER
                </h1>
                <p className="text-lg italic text-body">
                  "Empowering Minds, Shaping Stories, Transforming Society."
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3">
                  <img 
                    src={founderImage}
                    alt="Dr. S. N. Lal - Founder Chairman"
                    className="w-64 h-80 object-cover rounded-lg shadow-lg mx-auto border-4 border-white"
                  />
                </div>
                
                <div className="md:w-2/3 text-center md:text-left">
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                    Founder Chairman
                  </Badge>
                  
                  <h2 className="font-display text-xl md:text-2xl font-bold text-headline mb-4">
                    Dr. S. N. Lal (1949 – 2016)
                  </h2>
                  
                  <p className="text-body italic text-lg mb-4">
                    "A Visionary whose legacy of knowledge and service continues to inspire generations."
                  </p>
                  
                  <p className="text-body leading-relaxed">
                    Dr. S. N. Lal was a visionary academician, environmentalist, and social reformer who 
                    dedicated his life to spreading knowledge and creating awareness for the welfare of society. 
                    With over four decades in academia, he served as Principal of{' '}
                    <span className="font-semibold">Mahatma Gandhi P.G. College, Gorakhpur</span>, 
                    authored numerous books in Chemistry and Environmental Studies, and guided countless 
                    students and scholars.
                  </p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-display text-xl font-bold text-headline mb-4">
                    Environmental Pioneer
                  </h3>
                  <p className="text-body leading-relaxed mb-4">
                    Beyond academics, Dr. Lal was a celebrated <span className="font-semibold">environmentalist</span> and 
                    founder of the <span className="font-semibold">Environmental Protection Society</span>, working 
                    tirelessly to raise awareness about pollution, sustainability, and environmental conservation.
                  </p>
                  <p className="text-body leading-relaxed">
                    After his retirement, he conceptualized the <span className="font-semibold">DSNL Media Network</span> as 
                    a powerful platform to empower communities through knowledge and information. Though he left for his 
                    heavenly abode in <span className="font-semibold">November 2016</span>, his vision continues to guide 
                    DSNL in its mission to inspire change, foster awareness, and build a society driven by knowledge and responsibility.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-display text-xl font-bold text-headline mb-4">
                    DSNL Media Network Vision
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-headline mb-2">Our Vision</h4>
                      <p className="text-body text-sm leading-relaxed italic">
                        "To become a trusted and transformative voice in digital media, empowering communities 
                        through insightful storytelling, innovative reporting, and meaningful collaborations 
                        that shape a more informed, inclusive, and inspired society."
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-headline mb-2">Vision Tagline</h4>
                      <p className="text-primary font-medium italic">
                        "Empowering minds, shaping stories, transforming society."
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-headline mb-2">Our Mission</h4>
                      <p className="text-body text-sm leading-relaxed">
                        At DSNL Media Network, our mission is to inform, engage, and uplift our audience by 
                        producing high-quality content across news, technology, social welfare, public policy, 
                        and entertainment. We are committed to journalistic integrity, creative excellence, 
                        and impactful storytelling.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-headline mb-2">Mission Tagline</h4>
                      <p className="text-primary font-medium italic">
                        "Telling real stories. Driving real change. Together."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements Timeline */}
              <div>
                <h3 className="font-display text-xl font-bold text-headline mb-6 text-center">
                  Milestones & Achievements
                </h3>
                
                <div className="grid gap-4">
                  {achievements.map((achievement, index) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={index} className="flex gap-4 p-4 bg-card rounded-lg border border-border/30 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{achievement.year}</Badge>
                            <h4 className="font-semibold text-headline text-sm">{achievement.title}</h4>
                          </div>
                          <p className="text-body text-sm leading-relaxed">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legacy Section */}
              <div className="mt-8 p-6 bg-premium-accent/20 rounded-lg border border-primary/10">
                <h3 className="font-display text-lg font-bold text-headline mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-primary mr-2" />
                  Legacy
                </h3>
                <p className="text-body leading-relaxed">
                  Dr. S. N. Lal left for his heavenly abode in <span className="font-semibold">November 2016</span>, 
                  but his legacy of <span className="font-semibold">education, environmental stewardship, and social empowerment</span> continues 
                  through the DSNL Media Network and the many lives he touched. He remains a guiding light, 
                  inspiring us to uphold his vision of a society driven by knowledge, responsibility, and collective progress.
                </p>
                
                <div className="mt-4 p-4 bg-white/50 rounded-lg">
                  <p className="text-body text-sm italic text-center">
                    "Join us on this journey—<span className="font-semibold">subscribe, share, and be part of the change.</span>"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FounderSection;