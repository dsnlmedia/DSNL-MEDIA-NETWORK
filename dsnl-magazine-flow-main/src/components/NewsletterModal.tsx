import { useState } from "react";
import { X, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import emailjs from '@emailjs/browser';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsletterModal = ({ isOpen, onClose }: NewsletterModalProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      // Store subscriber in JSON file (via GitHub API or local storage for now)
      const subscriber = {
        email: email,
        subscriptionDate: new Date().toISOString(),
        preferences: ['weekly'],
        status: 'active'
      };

      // For now, store in localStorage until we set up GitHub API
      const existingSubscribers = JSON.parse(localStorage.getItem('newsletter-subscribers') || '[]');
      
      // Check if email already exists
      if (existingSubscribers.some((sub: any) => sub.email === email)) {
        setStatus('error');
        setMessage('This email is already subscribed to our newsletter');
        setIsLoading(false);
        return;
      }

      existingSubscribers.push(subscriber);
      localStorage.setItem('newsletter-subscribers', JSON.stringify(existingSubscribers));

      // Send welcome email using EmailJS
      const templateParams = {
        to_email: email,
        from_name: 'DSNL Media Network',
        message: `Welcome to DSNL Media Network newsletter! You'll receive our weekly digest every Sunday with the top stories of the week.`
      };

      // Note: You'll need to configure these values in EmailJS dashboard
      await emailjs.send(
        'service_dsnl_news', // Service ID (to be configured)
        'template_welcome', // Template ID (to be configured)
        templateParams,
        'your_public_key' // Public key (to be configured)
      );

      setStatus('success');
      setMessage('Successfully subscribed! Check your email for confirmation.');
      setEmail('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setMessage('Failed to subscribe. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-xl border border-border max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-headline">
              Newsletter Subscription
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-metadata hover:text-headline"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="font-display text-lg font-semibold text-headline mb-2">
              Stay Informed
            </h3>
            <p className="text-body text-sm">
              Get our weekly digest with the most important stories, delivered every Sunday to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            {/* Status Messages */}
            {status !== 'idle' && (
              <div className={`flex items-center space-x-2 p-3 rounded-md ${
                status === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {status === 'success' ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span className="text-sm">{message}</span>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || status === 'success'}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-metadata">
                  By subscribing, you agree to receive our weekly newsletter. 
                  You can unsubscribe at any time.
                </p>
              </div>
            </div>
          </form>

          {/* Features */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="font-medium text-headline mb-2 text-sm">What you'll get:</h4>
            <ul className="space-y-1 text-sm text-body">
              <li>• Weekly digest of top stories</li>
              <li>• Breaking news updates</li>
              <li>• Exclusive editorial content</li>
              <li>• No spam, unsubscribe anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};