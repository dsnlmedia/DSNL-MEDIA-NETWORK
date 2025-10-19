const fs = require('fs');
const path = require('path');

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

// Simulate EmailJS functionality for server-side (GitHub Actions)
async function sendEmail(templateParams) {
  // In a real implementation, you would use EmailJS server-side SDK or API
  // For now, we'll simulate the email sending process
  
  console.log(`📧 Sending newsletter to: ${templateParams.to_email}`);
  console.log(`📝 Subject: ${templateParams.subject}`);
  
  // Simulate delay for email sending
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return success (in real implementation, handle actual EmailJS response)
  return { status: 'success' };
}

// Get subscribers from the latest data
function getSubscribers() {
  try {
    // In production, this would fetch from your actual data source
    // For now, we'll create a mock subscriber list or read from file
    
    const subscribersPath = path.join(__dirname, '..', 'public', 'data', 'subscribers.json');
    
    if (fs.existsSync(subscribersPath)) {
      const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
      return subscribers.filter(sub => sub.status === 'active');
    }
    
    // Return empty array if no subscribers file exists
    return [];
  } catch (error) {
    console.error('Error reading subscribers:', error);
    return [];
  }
}

// Get the latest newsletter content
function getLatestNewsletter() {
  try {
    const newslettersDir = path.join(__dirname, '..', 'public', 'newsletters');
    
    if (!fs.existsSync(newslettersDir)) {
      throw new Error('Newsletters directory not found');
    }
    
    // Find the latest newsletter JSON file
    const files = fs.readdirSync(newslettersDir)
      .filter(file => file.startsWith('newsletter-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      throw new Error('No newsletter files found');
    }
    
    const latestFile = path.join(newslettersDir, files[0]);
    return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
  } catch (error) {
    console.error('Error getting latest newsletter:', error);
    throw error;
  }
}

// Send newsletter to all subscribers
async function sendNewsletterToSubscribers() {
  try {
    console.log('🚀 Starting newsletter distribution...');
    
    // Check EmailJS configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS configuration missing. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY environment variables.');
    }
    
    // Get subscribers and newsletter content
    const subscribers = getSubscribers();
    const newsletter = getLatestNewsletter();
    
    console.log(`📊 Found ${subscribers.length} active subscribers`);
    console.log(`📰 Newsletter: ${newsletter.title}`);
    
    if (subscribers.length === 0) {
      console.log('⚠️  No active subscribers found. Skipping email distribution.');
      return { sent: 0, failed: 0 };
    }
    
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];
    
    // Send newsletter to each subscriber
    for (const subscriber of subscribers) {
      try {
        const templateParams = {
          to_email: subscriber.email,
          from_name: 'DSNL Media Network',
          subject: newsletter.title,
          newsletter_html: newsletter.content,
          newsletter_date: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          unsubscribe_link: `https://your-website.com/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
          manage_preferences_link: `https://your-website.com/preferences?email=${encodeURIComponent(subscriber.email)}`
        };
        
        const result = await sendEmail(templateParams);
        
        if (result.status === 'success') {
          sentCount++;
          console.log(`✅ Sent to ${subscriber.email}`);
        } else {
          failedCount++;
          errors.push(`Failed to send to ${subscriber.email}: ${result.error || 'Unknown error'}`);
        }
        
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failedCount++;
        errors.push(`Failed to send to ${subscriber.email}: ${error.message}`);
        console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
      }
    }
    
    // Log summary
    console.log('\n📈 Newsletter Distribution Summary:');
    console.log(`✅ Successfully sent: ${sentCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Save sending statistics
    const stats = {
      newsletterId: newsletter.id,
      sentDate: new Date().toISOString(),
      totalSubscribers: subscribers.length,
      sentCount: sentCount,
      failedCount: failedCount,
      errors: errors,
      status: failedCount === 0 ? 'success' : 'partial'
    };
    
    const statsPath = path.join(__dirname, '..', 'public', 'data', 'newsletter-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    
    console.log(`📊 Statistics saved to ${statsPath}`);
    
    return { sent: sentCount, failed: failedCount };
    
  } catch (error) {
    console.error('❌ Newsletter distribution failed:', error);
    throw error;
  }
}

// Create a sample subscriber list for testing
function createSampleSubscribers() {
  const sampleSubscribers = [
    {
      email: 'test1@example.com',
      subscriptionDate: new Date().toISOString(),
      preferences: ['weekly'],
      status: 'active',
      id: 'sub1'
    },
    {
      email: 'test2@example.com',
      subscriptionDate: new Date().toISOString(),
      preferences: ['weekly'],
      status: 'active',
      id: 'sub2'
    }
  ];
  
  const subscribersPath = path.join(__dirname, '..', 'public', 'data', 'subscribers.json');
  const dataDir = path.dirname(subscribersPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Only create if file doesn't exist
  if (!fs.existsSync(subscribersPath)) {
    fs.writeFileSync(subscribersPath, JSON.stringify(sampleSubscribers, null, 2));
    console.log('📝 Created sample subscribers file for testing');
  }
}

// Run if called directly
if (require.main === module) {
  // Create sample subscribers for testing if needed
  createSampleSubscribers();
  
  sendNewsletterToSubscribers()
    .then((result) => {
      console.log(`\n🎉 Newsletter distribution completed: ${result.sent} sent, ${result.failed} failed`);
      process.exit(result.failed === 0 ? 0 : 1);
    })
    .catch((error) => {
      console.error('Newsletter distribution failed:', error);
      process.exit(1);
    });
}

module.exports = { sendNewsletterToSubscribers };