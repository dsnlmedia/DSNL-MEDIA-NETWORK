import React from 'react';
import { Header } from './Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, BookOpen, Leaf, Heart, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import founderImage from '@/assets/founder-dr-sn-lal.jpg';

export const FounderPage: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-12 border-b">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-body hover:text-headline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-headline mb-4">
              TELLING STORIES THAT MATTER
            </h1>
            <p className="text-xl md:text-2xl italic text-body">
              "Empowering Minds, Shaping Stories, Transforming Society."
            </p>
            <div className="w-20 h-1 bg-primary mx-auto mt-6"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="lg:w-1/3">
              <img 
                src={founderImage}
                alt="Dr. S. N. Lal - Founder Chairman"
                className="w-80 h-96 object-cover rounded-lg shadow-2xl mx-auto border-4 border-white"
              />
            </div>
            
            <div className="lg:w-2/3 text-center lg:text-left">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
                Founder Chairman
              </Badge>
              
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-headline mb-6">
                Dr. S. N. Lal (1949 – 2016)
              </h2>
              
              <p className="text-body italic text-xl md:text-2xl mb-6">
                "A Visionary whose legacy of knowledge and service continues to inspire generations."
              </p>
              
              <p className="text-body text-lg leading-relaxed">
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
      </section>

      {/* About Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-headline mb-6">
                Environmental Pioneer
              </h3>
              <p className="text-body text-lg leading-relaxed mb-6">
                Beyond academics, Dr. Lal was a celebrated <span className="font-semibold">environmentalist</span> and 
                founder of the <span className="font-semibold">Environmental Protection Society</span>, working 
                tirelessly to raise awareness about pollution, sustainability, and environmental conservation.
              </p>
              <p className="text-body text-lg leading-relaxed">
                After his retirement, he conceptualized the <span className="font-semibold">DSNL Media Network</span> as 
                a powerful platform to empower communities through knowledge and information. Though he left for his 
                heavenly abode in <span className="font-semibold">November 2016</span>, his vision continues to guide 
                DSNL in its mission to inspire change, foster awareness, and build a society driven by knowledge and responsibility.
              </p>
            </div>
            
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-headline mb-6">
                DSNL Media Network Vision
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-headline text-lg mb-3">Our Vision</h4>
                  <p className="text-body leading-relaxed italic">
                    "To become a trusted and transformative voice in digital media, empowering communities 
                    through insightful storytelling, innovative reporting, and meaningful collaborations 
                    that shape a more informed, inclusive, and inspired society."
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-headline text-lg mb-3">Vision Tagline</h4>
                  <p className="text-primary font-medium italic text-lg">
                    "Empowering minds, shaping stories, transforming society."
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-headline text-lg mb-3">Our Mission</h4>
                  <p className="text-body leading-relaxed">
                    At DSNL Media Network, our mission is to inform, engage, and uplift our audience by 
                    producing high-quality content across news, technology, social welfare, public policy, 
                    and entertainment. We are committed to journalistic integrity, creative excellence, 
                    and impactful storytelling.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-headline text-lg mb-3">Mission Tagline</h4>
                  <p className="text-primary font-medium italic text-lg">
                    "Telling real stories. Driving real change. Together."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Timeline */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-headline mb-12 text-center">
            Milestones & Achievements
          </h3>
          
          <div className="grid gap-6 max-w-4xl mx-auto">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="flex gap-6 p-6 magazine-card hover:shadow-lg transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <Badge variant="outline" className="w-fit">{achievement.year}</Badge>
                      <h4 className="font-display text-xl font-bold text-headline">{achievement.title}</h4>
                    </div>
                    <p className="text-body leading-relaxed">{achievement.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-16 bg-premium-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="magazine-card p-8">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-headline mb-6 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary mr-3" />
                Legacy
              </h3>
              <p className="text-body text-lg leading-relaxed text-center mb-8">
                Dr. S. N. Lal left for his heavenly abode in <span className="font-semibold">November 2016</span>, 
                but his legacy of <span className="font-semibold">education, environmental stewardship, and social empowerment</span> continues 
                through the DSNL Media Network and the many lives he touched. He remains a guiding light, 
                inspiring us to uphold his vision of a society driven by knowledge, responsibility, and collective progress.
              </p>
              
              <div className="bg-white/50 rounded-lg p-6 text-center">
                <p className="text-body italic text-lg">
                  "Join us on this journey—<span className="font-semibold">subscribe, share, and be part of the change.</span>"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-metadata text-sm">
            © 2024 DSNL Media Network. In memory of our founder, Dr. S. N. Lal (1949-2016).
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FounderPage;