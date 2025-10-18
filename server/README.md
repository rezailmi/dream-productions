# Dream Machine Backend Server

Backend API server for Dream Machine app that handles WHOOP OAuth, dream narrative generation via Groq, and video generation via Google Veo.

## Prerequisites

- Node.js 18+
- npm or yarn
- WHOOP Developer Account
- Groq API Key
- Google Cloud Project with Veo API enabled

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```
# WHOOP OAuth
WHOOP_CLIENT_ID=your_client_id
WHOOP_CLIENT_SECRET=your_client_secret
WHOOP_CALLBACK_URL=http://localhost:3000/auth/whoop/callback

# Groq API
GROQ_API_KEY=your_groq_api_key

# Fal.ai (Video Generation)
FAL_API_KEY=your_fal_api_key

# Server
PORT=3000
SESSION_SECRET=generate_a_random_secret
FRONTEND_URL=http://localhost:8081
```

### 3. Set Up WHOOP Developer Account

1. Go to https://developer.whoop.com/
2. Create an app
3. Set redirect URI to `http://localhost:3000/auth/whoop/callback`
4. Copy Client ID and Client Secret to `.env`

### 4. Set Up Groq API

1. Go to https://console.groq.com/
2. Create an API key
3. Copy to `.env` as `GROQ_API_KEY`

### 5. Set Up Fal.ai for Video Generation

1. Visit https://fal.ai
2. Create an account or sign in
3. Go to Dashboard → API Keys (https://fal.ai/dashboard/keys)
4. Click "Add Key" and create a new API key
5. Copy the API key and add to `.env` as `FAL_API_KEY`

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `GET /auth/whoop` - Initiate WHOOP OAuth flow
- `GET /auth/whoop/callback` - OAuth callback handler

### WHOOP Data

- `GET /api/whoop/sleep` - Get user sleep data (requires Authorization header)
- `GET /api/whoop/sleep/:sleepId` - Get specific sleep session
- `GET /api/whoop/recovery/:cycleId` - Get recovery data for cycle

### Dream Generation

- `POST /api/dreams/generate` - Generate dream from sleep data
- `POST /api/dreams/narrative` - Generate narrative only (testing)
- `POST /api/dreams/video` - Generate video only (testing)
- `GET /api/dreams/video/status/:operationId` - Check video status

## Production Build

```bash
npm run build
npm start
```

## Architecture

- **Express.js** - Web framework
- **Passport** - OAuth 2.0 authentication
- **Groq** - Dream narrative generation via OpenAI-compatible API
- **Fal.ai Veo3** - Video generation (Veo powered by Fal.ai)
- **TypeScript** - Type safety

## Troubleshooting

### WHOOP OAuth not working

- Ensure redirect URI matches exactly in WHOOP developer console
- Check that server is running on port 3000
- Verify client ID and secret are correct

### Groq API errors

- Check API key is valid
- Ensure you have credits/quota remaining
- Model `mixtral-8x7b-32768` must be available

### Fal.ai errors

- Verify API key is valid (check https://fal.ai/dashboard/keys)
- Ensure you have credits in your Fal.ai account
- Check API key has correct scopes (should be "API" scope)
- Review Fal.ai dashboard for quota/usage limits

### Video generation timing out

- Veo can take 30-120 seconds to generate videos
- Increase timeout in client if needed
- Check operation status endpoint for progress

## License

MIT
