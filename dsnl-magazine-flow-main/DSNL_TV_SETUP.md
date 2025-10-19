# DSNL TV YouTube Integration Setup Guide

## Overview
This guide helps you set up the DSNL TV section to display videos from your DSNL YouTube channel. The integration fetches videos using the YouTube Data API v3 and displays them in a responsive, user-friendly interface.

## Prerequisites
1. A DSNL YouTube channel with uploaded videos
2. Google Cloud Console account
3. YouTube Data API v3 enabled

## Setup Instructions

### Step 1: Create YouTube Data API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

4. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. (Optional but recommended) Restrict the API key:
   - Click on your API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Under "Website restrictions", add your domain

### Step 2: Get Your YouTube Channel ID

You can find your YouTube Channel ID in several ways:

**Method 1: From YouTube Studio**
1. Go to [YouTube Studio](https://studio.youtube.com/)
2. In the left sidebar, click "Settings"
3. Click "Channel" > "Basic info"
4. Your Channel ID is shown in the "Channel ID" field

**Method 2: From Channel URL**
1. Go to your YouTube channel
2. Look at the URL - if it contains `/channel/`, the part after is your Channel ID
3. If it shows a custom name, click "View channel" and check the URL

**Method 3: Using YouTube URL**
1. Go to your channel page
2. Right-click and "View page source"
3. Search for "channelId" in the source code

### Step 3: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
# YouTube Data API v3 Key
VITE_YOUTUBE_API_KEY=your_actual_api_key_here

# YouTube Channel ID for DSNL
VITE_YOUTUBE_CHANNEL_ID=your_actual_channel_id_here
```

**Important**: Never commit your actual API key to version control. Keep the `.env` file in your `.gitignore`.

### Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your website and click on "DSNL TV" or visit `/dsnl-tv` directly

3. You should see:
   - Your channel information at the top
   - A grid of your latest videos
   - Search functionality to find specific videos
   - Video playback when clicking on video cards

## Features Included

### Video Display
- Responsive grid layout for video cards
- Video thumbnails with duration overlays
- View counts and like counts
- Publication dates
- Video descriptions

### Video Playback
- In-site video player using YouTube embed
- Full-screen video modal
- Direct links to YouTube for external viewing
- Mobile-responsive player

### Search & Navigation
- Search videos within your channel
- Pagination support (configurable in code)
- Error handling for API issues
- Loading states and skeletons

### Responsive Design
- Mobile-first responsive design
- Touch-friendly interface
- Optimized for different screen sizes
- Smooth animations and transitions

## Customization Options

### Modify Video Display Count
In `src/hooks/useYoutube.ts`, you can change the default number of videos fetched:

```typescript
export const useChannelVideos = (maxResults: number = 20) => {
  // Change the default value as needed
}
```

### Customize Styling
The video components use Tailwind CSS classes. You can modify:
- `src/components/VideoCard.tsx` for individual video card styling
- `src/components/DSNLTVPage.tsx` for page layout
- `src/index.css` for global video-related styles

### API Configuration
Modify `src/services/youtubeService.ts` to:
- Change API request parameters
- Add additional video metadata
- Implement caching strategies
- Handle rate limiting

## Troubleshooting

### API Key Issues
- **Error: "API key not configured"**
  - Check that your `.env` file exists and contains the correct API key
  - Ensure the environment variable starts with `VITE_`
  - Restart your development server after changing `.env`

### Channel ID Issues
- **Error: "Could not find uploads playlist"**
  - Verify your Channel ID is correct
  - Ensure your channel has uploaded videos
  - Check that your channel is public

### Quota Exceeded
- YouTube Data API has daily quotas
- Each video fetch uses quota units
- Consider implementing caching for production
- Monitor usage in Google Cloud Console

### CORS Issues
- YouTube API requests should work from localhost
- For production, ensure your domain is added to API key restrictions

## Production Deployment

1. Set up environment variables in your production environment
2. Consider implementing server-side caching to reduce API calls
3. Monitor API usage and quotas
4. Implement error boundaries for better user experience
5. Add analytics tracking for video views

## API Usage and Costs

The YouTube Data API v3 is free but has quotas:
- Default quota: 10,000 units per day
- Each video list request: ~1-3 units
- Each search request: ~100 units
- Each channel info request: ~1 unit

For high-traffic sites, consider:
- Implementing caching
- Reducing API calls
- Requesting quota increases from Google

## Support

For issues related to:
- YouTube API: Check [YouTube API documentation](https://developers.google.com/youtube/v3)
- React/TypeScript: Refer to the respective documentation
- DSNL TV integration: Review the component code and this guide

## File Structure

```
src/
├── components/
│   ├── VideoCard.tsx          # Individual video display component
│   ├── VideoPlayerModal.tsx   # Video playback modal
│   └── DSNLTVPage.tsx         # Main DSNL TV page
├── hooks/
│   └── useYoutube.ts          # React Query hooks for YouTube API
├── services/
│   └── youtubeService.ts      # YouTube API service layer
└── index.css                  # Video-specific styling
```

This integration provides a professional, feature-rich video experience that seamlessly integrates your YouTube content into your DSNL website.