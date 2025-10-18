# Dream Machine Setup Guide

Complete setup guide for the Dream Machine app with WHOOP integration, Groq AI narrative generation, and Google Veo video generation.

## Overview

Dream Machine consists of two parts:
1. **React Native Mobile App** - iOS app for viewing dreams
2. **Node.js Backend Server** - Handles OAuth, API integrations, and dream generation

## Prerequisites

- Node.js 18+
- iOS 18.0+ (for mobile app)
- Xcode (for iOS development)
- WHOOP account
- Groq API account
- Fal.ai account

---

## Part 1: Backend Server Setup

### Step 1: Install Server Dependencies

```bash
cd server
npm install
```

### Step 2: Get API Credentials

#### WHOOP Developer Account

1. Visit https://developer.whoop.com/
2. Click "Create App"
3. Fill in app details:
   - **Name**: Dream Machine
   - **Redirect URI**: `http://localhost:3000/auth/whoop/callback`
   - **Scopes**: `read:sleep`, `read:recovery`, `read:cycles`
4. Copy your **Client ID** and **Client Secret**

#### Groq API Key

1. Visit https://console.groq.com/
2. Create account and navigate to API Keys
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

#### Fal.ai Setup (Video Generation)

1. Visit https://fal.ai
2. Create an account or sign in
3. Navigate to Dashboard → API Keys: https://fal.ai/dashboard/keys
4. Click "Add Key"
5. Name your key (e.g., "Dream Machine")
6. Select scope: "API" (not ADMIN)
7. Click "Create Key"
8. Copy the API key (starts with `fal_...`)
9. Add credits to your account if needed (Veo costs ~$3.20 per 8-second video)

### Step 3: Configure Environment

Create `server/.env`:

```bash
cd server
cp .env.example .env
```

Edit `.env` and fill in:

```env
# WHOOP OAuth
WHOOP_CLIENT_ID=your_whoop_client_id
WHOOP_CLIENT_SECRET=your_whoop_client_secret
WHOOP_CALLBACK_URL=http://localhost:3000/auth/whoop/callback

# Groq API
GROQ_API_KEY=gsk_your_groq_key_here

# Fal.ai (Video Generation)
FAL_API_KEY=fal_your_api_key_here

# Server
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_random_secret_here_generate_with_openssl_rand_base64_32
FRONTEND_URL=http://localhost:8081
```

### Step 4: Start Backend Server

```bash
npm run dev
```

Server will start on http://localhost:3000

Test it: http://localhost:3000/health

---

## Part 2: Mobile App Setup

### Step 1: Install App Dependencies

```bash
# In project root
npm install
```

### Step 2: Start Metro Bundler

```bash
npm start
```

### Step 3: Run on iOS

In a new terminal:

```bash
npm run ios
```

This will launch the iOS simulator with the app.

---

## Usage Guide

### 1. Using Demo Data (No Setup Required)

1. Open the app
2. Go to Profile tab
3. Tap "Use Demo Data"
4. Go back to Home tab
5. Tap "Generate Demo Dream"
6. Wait 30-60 seconds for dream generation

This uses the demo sleep data and generates a dream with narrative + video.

### 2. Connecting WHOOP

1. Ensure backend server is running (`cd server && npm run dev`)
2. In the app, go to Profile tab
3. Tap "Connect Whoop"
4. This will open a browser for WHOOP OAuth
5. Log in to WHOOP and authorize the app
6. You'll be redirected back to the app
7. WHOOP is now connected!

### 3. Fetching WHOOP Sleep Data

1. After connecting WHOOP, the app will automatically fetch sleep data
2. Or manually refresh by toggling the data source

### 4. Generating Dreams from WHOOP Data

1. Ensure you have WHOOP sleep data loaded
2. Go to Home tab
3. Tap "Generate Dream"
4. The backend will:
   - Analyze your sleep data (REM cycles, quality, disturbances)
   - Generate a narrative using Groq AI
   - Create a video using Google Veo
   - Return the complete dream (30-120 seconds)

---

## Troubleshooting

### Backend Issues

**Server won't start**
- Check all environment variables are set in `server/.env`
- Ensure port 3000 is not already in use: `lsof -i :3000`
- Check Node.js version: `node --version` (should be 18+)

**WHOOP OAuth fails**
- Verify `WHOOP_CALLBACK_URL` matches exactly in WHOOP developer console
- Check that client ID and secret are correct
- Ensure server is running when initiating OAuth

**Groq API errors**
- Verify API key is valid and has credits
- Check model availability (mixtral-8x7b-32768)
- Review Groq console for quota/limits

**Fal.ai errors**
- Verify API key is valid at https://fal.ai/dashboard/keys
- Ensure account has sufficient credits
- Check API key scope is set to "API"
- Review usage limits in dashboard

### Mobile App Issues

**App won't start**
- Run `npm install` to ensure dependencies are installed
- Clear Metro cache: `npm start -- --reset-cache`
- Check Expo/React Native versions match package.json

**WHOOP OAuth redirect fails**
- Ensure deep linking is configured in app.json
- Check that backend is accessible from your device/simulator
- For physical iOS device, backend must be on same network

**Dreams not generating**
- Check backend server is running and accessible
- Review backend logs for errors
- Verify all API keys are configured correctly
- Check network connectivity

**Video player not working**
- Video generation can take 60-120 seconds
- Check backend logs for Veo operation status
- Ensure video URL is being returned from backend

---

## Development Tips

### Testing Without Real APIs

1. **Mock Dream Generation**: Edit `contexts/HealthDataContext.tsx` to return mock dream data
2. **Skip Video Generation**: Comment out Veo call in `server/src/services/dreamGenerationService.ts`
3. **Use Demo Data**: Always available without any API setup

### Monitoring

- **Backend logs**: Watch terminal running `npm run dev`
- **React Native logs**: Check Metro bundler terminal
- **iOS logs**: Use Xcode console or React Native Debugger

### Deployment

For production deployment:

1. **Backend**: Deploy to service like Railway, Render, or AWS
2. **Update URLs**: Change `API_BASE_URL` in app and OAuth redirect URIs
3. **Environment**: Set production environment variables
4. **Security**: Use secure session secrets and HTTPS only

---

## Architecture

```
┌─────────────────┐
│   React Native  │
│   Mobile App    │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Server │
│  (Node.js/TS)   │
└────┬─────┬──────┘
     │     │
     │     │
     ▼     ▼     ▼
  WHOOP  Groq  Veo
```

## Next Steps

- ✅ Generate your first dream!
- ⬜ Connect real WHOOP data
- ⬜ Explore dream scenes and narratives
- ⬜ Customize dream generation parameters
- ⬜ Share dreams (future feature)

## Support

For issues, check:
1. GitHub Issues
2. Backend logs (`server/` directory)
3. React Native debugger
4. API provider status pages (WHOOP, Groq, Google Cloud)

Enjoy reconstructing your dreams! 🌙✨
