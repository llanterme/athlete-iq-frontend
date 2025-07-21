# AWS Amplify Deployment Guide

## Required Environment Variables

The following environment variables must be set in AWS Amplify Console:

### Authentication
- `NEXTAUTH_URL` - The full URL of your Amplify app (e.g., `https://main.d123abc456.amplifyapp.com`)
- `NEXTAUTH_SECRET` - A secure random string (generate with `openssl rand -base64 32`)

### Strava Integration
- `STRAVA_CLIENT_ID` - Your Strava app's Client ID
- `STRAVA_CLIENT_SECRET` - Your Strava app's Client Secret

### Backend API
- `NEXT_PUBLIC_API_URL` - URL of your Python FastAPI backend (defaults to `http://localhost:8000` for local dev)

## Pre-deployment Steps

1. **Test the build locally:**
   ```bash
   cd frontend
   npm run build
   npm run start
   ```

2. **Update Strava OAuth redirect URLs:**
   - Go to your [Strava API application](https://www.strava.com/settings/api)
   - Add your Amplify URL to Authorization Callback Domain
   - Format: `https://your-app-name.amplifyapp.com/api/auth/callback/strava`

## AWS Amplify Setup

1. **Connect Repository:**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" > "Host web app"
   - Connect your GitHub repository
   - Select branch (usually `main`)

2. **Configure Build Settings:**
   - App name: `athlete-iq-frontend`
   - Environment: `production`
   - The `amplify.yml` file will automatically configure the build

3. **Set Environment Variables:**
   - In Amplify Console, go to "Environment variables"
   - Add all variables listed above
   - Ensure no trailing spaces or quotes

4. **Deploy:**
   - Save and deploy
   - Monitor build logs for any issues
   - Test the deployed application

## Post-deployment

1. **Update OAuth URLs:**
   - Update Strava app settings with new Amplify domain
   - Test OAuth login flow

2. **Configure Custom Domain (Optional):**
   - In Amplify Console, go to "Domain management"
   - Add your custom domain
   - Configure DNS settings

## Troubleshooting

- **Build fails:** Check environment variables are set correctly
- **OAuth errors:** Verify Strava redirect URLs include your Amplify domain
- **API calls fail:** Ensure `NEXT_PUBLIC_API_URL` points to your deployed backend