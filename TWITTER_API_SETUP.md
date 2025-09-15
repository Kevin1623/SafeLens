# Twitter API Setup Guide for CrimeLensChennai

This guide will help you set up real Twitter integration for the CrimeLensChennai social media analysis feature.

## Current Status
✅ **Mock Data**: Currently working with simulated social media posts  
🔧 **Real Integration**: Requires Twitter API credentials (this guide)  
📊 **NLP Analysis**: Fully functional (sentiment, hate speech, multilingual support)  

## Why You Need Twitter API Keys

Without API keys, the application uses **mock data** that simulates Twitter posts. With real API keys, you'll get:

- **Live Twitter posts** about Chennai crime, safety, and police
- **Real-time trending topics** from Chennai area
- **Authentic user sentiment** and engagement metrics
- **Actual geolocation data** for better district mapping

## Step 1: Get Twitter Developer Access

### 1.1 Apply for Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Click **"Sign up for the API"**
3. Sign in with your Twitter account
4. Fill out the application form:
   - **Use case**: Academic research / Public good projects
   - **Description**: "Crime monitoring and public safety analysis for Chennai city using social media sentiment analysis"
   - **Will you make Twitter content available to government?**: Choose based on your project scope

### 1.2 Wait for Approval
- **Basic tier**: Usually approved within a few hours
- **Elevated access**: May take 1-7 days
- Check your email for approval notifications

## Step 2: Create a Twitter App

### 2.1 Create New Project
1. In the Developer Portal, click **"Create Project"**
2. Fill in project details:
   - **Project name**: "CrimeLensChennai"
   - **Use case**: "Analyze public conversations"
   - **Description**: "Social media monitoring for public safety in Chennai"

### 2.2 Create App
1. After creating project, click **"Create App"**
2. Choose **"Production"** environment
3. App name: "CrimeLens-Chennai-Monitor" (must be unique)

## Step 3: Get Your API Credentials

### 3.1 Basic Setup (Read-only access)
Navigate to your app's **"Keys and Tokens"** tab and generate:

```bash
# Required for basic read access
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAA... (very long token)
```

### 3.2 Full Setup (Read + Write access) - Optional
If you need advanced features, also generate:

```bash
# OAuth 1.0a credentials
TWITTER_API_KEY=25_character_key
TWITTER_API_SECRET=50_character_secret
TWITTER_ACCESS_TOKEN=50_character_token
TWITTER_ACCESS_SECRET=45_character_secret
```

## Step 4: Configure Your Application

### 4.1 Create Environment File
Create a `.env` file in your project root:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env
```

### 4.2 Add Your Credentials
Edit the `.env` file with your Twitter credentials:

```bash
# Twitter API Credentials (replace with your actual values)
TWITTER_BEARER_TOKEN=your_actual_bearer_token_here
TWITTER_API_KEY=your_actual_api_key_here  
TWITTER_API_SECRET=your_actual_api_secret_here
TWITTER_ACCESS_TOKEN=your_actual_access_token_here
TWITTER_ACCESS_SECRET=your_actual_access_secret_here

# Other configurations...
DATABASE_URL=your_database_url_here
SESSION_SECRET=your_random_session_secret
```

### 4.3 Restart Your Application
```bash
npm run dev
```

## Step 5: Verify Integration

### 5.1 Check API Status
Visit: `http://localhost:5000/api/social-media/status`

You should see:
```json
{
  "twitter": {
    "available": true,
    "connected": true,
    "hasCredentials": true,
    "credentialTypes": {
      "bearerToken": true,
      "fullOAuth": true
    }
  },
  "dataSource": "real"
}
```

### 5.2 Test Real Data
Visit the Social Media Analysis page in your app. You should now see:
- ✅ Real Twitter posts about Chennai
- ✅ Actual user handles and verification badges
- ✅ Real engagement metrics (likes, retweets, etc.)
- ✅ Live trending topics from Chennai area

## Understanding API Limits

### Twitter API v2 Limits (Free Tier)
- **Tweet lookups**: 75 requests per 15 minutes
- **Search tweets**: 300 requests per 15 minutes  
- **Each request**: Up to 100 tweets

### For CrimeLensChennai Usage
- **Default queries**: 50 tweets per request
- **Refresh rate**: Every 30 seconds (if real-time enabled)
- **Estimated capacity**: ~600 tweets per hour

### Rate Limit Handling
The application automatically:
- Falls back to cached data when limits hit
- Shows mock data if API is unavailable
- Displays API status in the interface

## Troubleshooting

### Issue: "Twitter Bearer Token not found"
**Solution**: Make sure your `.env` file contains the correct `TWITTER_BEARER_TOKEN`

### Issue: "Unauthorized" or "Forbidden" errors
**Solutions**:
1. Double-check your API credentials are correct
2. Ensure your Twitter app has the right permissions
3. Check if your developer account is still active

### Issue: "No tweets found"
**Possible causes**:
1. Your search terms are too specific
2. Not many tweets in Chennai area at the time
3. Language filters are too restrictive

**Solutions**:
1. The app automatically falls back to mock data
2. Try different search terms in the frontend
3. Check different time periods

### Issue: Rate limit exceeded
**Solutions**:
1. The app automatically handles this with fallbacks
2. Wait 15 minutes for limits to reset
3. Consider upgrading to Twitter API Pro for higher limits

## Security Best Practices

### 1. Keep Credentials Secret
- ❌ Never commit `.env` file to version control
- ❌ Don't share credentials in screenshots or logs
- ✅ Use environment variables in production
- ✅ Rotate keys periodically

### 2. Monitor Usage
- Check Twitter Developer Portal for usage statistics
- Set up billing alerts if using paid tiers
- Monitor application logs for unusual activity

### 3. Data Privacy
- Only collect public tweets
- Anonymize sensitive data
- Comply with local privacy laws
- Implement data retention policies

## Upgrading to Pro/Enterprise

For production deployment with higher limits:

### Twitter API Pro ($100/month)
- 1M tweets per month
- Advanced search operators
- Higher rate limits

### Twitter API Enterprise (Custom pricing)
- Full historical search
- Real-time streaming
- Custom rate limits

## Getting Help

### Resources
- [Twitter Developer Documentation](https://developer.twitter.com/en/docs)
- [Twitter API v2 Guide](https://developer.twitter.com/en/docs/api-reference-index#v2)
- [Rate Limits Reference](https://developer.twitter.com/en/docs/rate-limits)

### Support Channels
- [Twitter Developer Community](https://twittercommunity.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/twitter-api-v2)
- GitHub Issues for this project

## What's Next?

Once Twitter integration is working:

1. **Monitor Performance**: Check API usage and costs
2. **Add More Sources**: Consider Facebook, Instagram APIs
3. **Enhance Analysis**: Add more NLP features
4. **Scale Up**: Move to higher API tiers as needed

---

**Note**: This integration provides real social media monitoring capabilities for public safety analysis. Always use responsibly and in compliance with platform terms of service and local regulations.
