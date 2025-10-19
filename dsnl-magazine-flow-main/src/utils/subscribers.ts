export interface Subscriber {
  email: string;
  subscriptionDate: string;
  preferences: string[];
  status: 'active' | 'inactive' | 'unsubscribed';
  id?: string;
}

export interface NewsletterData {
  id: string;
  title: string;
  content: string;
  scheduledDate: string;
  sentDate?: string;
  status: 'draft' | 'scheduled' | 'sent';
  stories: any[];
}

// Get all subscribers from localStorage (for development)
export const getSubscribers = (): Subscriber[] => {
  try {
    const subscribers = localStorage.getItem('newsletter-subscribers');
    return subscribers ? JSON.parse(subscribers) : [];
  } catch (error) {
    console.error('Error getting subscribers:', error);
    return [];
  }
};

// Add new subscriber
export const addSubscriber = (email: string): boolean => {
  try {
    const subscribers = getSubscribers();
    
    // Check if email already exists
    if (subscribers.some(sub => sub.email === email)) {
      return false;
    }

    const newSubscriber: Subscriber = {
      email,
      subscriptionDate: new Date().toISOString(),
      preferences: ['weekly'],
      status: 'active',
      id: generateId()
    };

    subscribers.push(newSubscriber);
    localStorage.setItem('newsletter-subscribers', JSON.stringify(subscribers));
    return true;
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return false;
  }
};

// Remove subscriber (unsubscribe)
export const removeSubscriber = (email: string): boolean => {
  try {
    const subscribers = getSubscribers();
    const updatedSubscribers = subscribers.filter(sub => sub.email !== email);
    localStorage.setItem('newsletter-subscribers', JSON.stringify(updatedSubscribers));
    return true;
  } catch (error) {
    console.error('Error removing subscriber:', error);
    return false;
  }
};

// Get active subscribers count
export const getActiveSubscribersCount = (): number => {
  return getSubscribers().filter(sub => sub.status === 'active').length;
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Newsletter content management
export const getStoredNewsletters = (): NewsletterData[] => {
  try {
    const newsletters = localStorage.getItem('newsletter-archives');
    return newsletters ? JSON.parse(newsletters) : [];
  } catch (error) {
    console.error('Error getting newsletters:', error);
    return [];
  }
};

export const saveNewsletter = (newsletter: NewsletterData): boolean => {
  try {
    const newsletters = getStoredNewsletters();
    const existingIndex = newsletters.findIndex(n => n.id === newsletter.id);
    
    if (existingIndex >= 0) {
      newsletters[existingIndex] = newsletter;
    } else {
      newsletters.push(newsletter);
    }
    
    localStorage.setItem('newsletter-archives', JSON.stringify(newsletters));
    return true;
  } catch (error) {
    console.error('Error saving newsletter:', error);
    return false;
  }
};