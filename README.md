# Dream Machine

An AI-powered dream journal that reconstructs sleep memories from biometric data and generates cinematic dream videos using AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- iOS Simulator (Xcode) or Expo Go app

### Running the App

**1. Start the backend server:**
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:3000`

**2. Start the mobile app (in a new terminal):**
```bash
# From project root
npm install
npm start

# Then run on iOS:
npm run ios
```

**3. Setup API keys (optional for full features):**
- Create `server/.env` from `server/.env.example`
- Add your WHOOP, Groq, and Fal.ai API keys
- See [Setup Guide](plan/SETUP.md) for detailed instructions

**Demo Mode:** The app works with demo data without any API keys!

---

## ✨ Features

### 🎬 AI Dream Generation
- Generate cinematic dream videos from sleep data
- AI-powered narrative generation using Groq (Mixtral-8x7b)
- Video generation using Google Veo3 (via Fal.ai)
- Full-screen vertical scrolling experience (TikTok-style)

### 🔮 Oneiromancy Predictions
- 12 collectible dream categories (Love, Wealth, Career, etc.)
- Detailed dream interpretations with themes, symbols, and advice
- Gamified collection system in profile
- Beautiful flip card animations

### 📊 Multi-Source Sleep Data
- **WHOOP Integration**: Full OAuth 2.0 with real sleep data
- **Apple Health**: Coming soon
- **Demo Data**: Pre-loaded sample sessions for testing

### 🎨 Native iOS Design
- Liquid glass tab bar using `unstable-native-tabs`
- SF Symbols for icons
- Dark mode optimized UI with Radix color palette
- Native blur effects with expo-blur

### 📱 Smart UI Components
- Full-screen day cards with sleep metrics
- Dream video player with expo-video
- Interactive oneiromancy cards
- Dream ready notification sheet
- Loading and error states

## 🛠 Tech Stack

### Mobile App
- **Framework**: Expo (SDK 54)
- **Language**: TypeScript
- **Platform**: iOS (18.0+)
- **Navigation**: Expo Router (file-based)
- **State**: React Context + AsyncStorage
- **UI**: React Native + expo-blur + expo-video
- **Icons**: SF Symbols via @expo/vector-icons

### Backend Server
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **APIs**: 
  - WHOOP API (OAuth 2.0)
  - Groq AI (narrative generation)
  - Fal.ai Veo3 (video generation)
- **Storage**: Client-side AsyncStorage

## 📁 Project Structure

```
dream-productions/
├── server/                          # Backend API
│   ├── src/
│   │   ├── index.ts                # Express server entry
│   │   ├── routes/
│   │   │   ├── auth.ts             # WHOOP OAuth handlers
│   │   │   ├── dreams.ts           # Dream generation endpoints
│   │   │   └── whoop.ts            # WHOOP data endpoints
│   │   ├── services/
│   │   │   ├── whoopService.ts     # WHOOP API client
│   │   │   ├── groqService.ts      # Groq AI narrative generation
│   │   │   ├── veoService.ts       # Fal.ai Veo3 video generation
│   │   │   └── dreamGenerationService.ts  # Dream pipeline orchestrator
│   │   ├── utils/
│   │   │   └── remCycleGenerator.ts  # Synthetic REM cycle generation
│   │   └── types/
│   │       └── index.ts            # Backend type definitions
│   ├── .env.example                # Environment variables template
│   ├── package.json
│   └── tsconfig.json
│
├── app/                             # Mobile app screens
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Native tab bar configuration
│   │   ├── index.tsx               # Home: vertical scrolling dream feed
│   │   └── profile.tsx             # Profile: collection & data sources
│   └── _layout.tsx                 # Root layout with providers
│
├── components/                      # Reusable UI components
│   ├── DayCard.tsx                 # Full-screen sleep day card
│   ├── DreamCard.tsx               # Dream display with video
│   ├── DreamVideoView.tsx          # Video player container
│   ├── DreamInsightsView.tsx       # Oneiromancy prediction display
│   ├── DreamReadySheet.tsx         # Dream completion notification
│   ├── CollectionView.tsx          # Oneiromancy collection grid
│   ├── OneiromancyCard.tsx         # Collectible category card
│   ├── SleepDataCard.tsx           # Sleep metrics display
│   ├── GeneratingDreamView.tsx     # Loading state
│   ├── FailedDreamView.tsx         # Error state
│   ├── SettingsCard.tsx            # Settings option card
│   ├── DateHeader.tsx              # Date display header
│   ├── DayPageIndicator.tsx        # Vertical scroll indicator
│   └── VideoPlayer.tsx             # expo-video wrapper
│
├── contexts/
│   └── HealthDataContext.tsx       # Global state: dreams, sleep, WHOOP
│
├── services/
│   ├── apiClient.ts                # Backend HTTP client (axios)
│   ├── demoData.ts                 # Sample sleep sessions
│   └── dreamStorage.ts             # AsyncStorage wrapper
│
├── constants/
│   ├── Colors.ts                   # Radix color palette
│   └── Types.ts                    # TypeScript interfaces
│
├── utils/
│   ├── dateHelpers.ts              # Date formatting utilities
│   ├── remCycleGenerator.ts        # REM cycle synthesis
│   └── whoopSleepMapper.ts         # WHOOP to SleepSession mapper
│
├── plan/                            # Documentation
│   ├── SETUP.md                    # Complete setup guide
│   ├── IMPLEMENTATION_SUMMARY.md   # Technical architecture
│   ├── ONEIROMANCY.md              # Prediction system docs
│   ├── WHOOP_DATA_STRUCTURE.md     # WHOOP API details
│   └── *.md                        # Feature implementation docs
│
├── assets/                          # Images, icons, splash
│   └── oneiromancy/                # Category illustrations
│
├── package.json
└── tsconfig.json
```

## 📖 Documentation

- **[Setup Guide](plan/SETUP.md)** - Complete setup with API keys
- **[Implementation Summary](plan/IMPLEMENTATION_SUMMARY.md)** - Technical architecture
- **[WHOOP Data Structure](plan/WHOOP_DATA_STRUCTURE.md)** - WHOOP API integration details
- **[Oneiromancy System](plan/ONEIROMANCY.md)** - Dream prediction schema
- **[Migration to Fal.ai](plan/MIGRATION_TO_FALAI.md)** - Video generation migration

## 🎯 Current Features

### 🏠 Home Screen (Dreams Tab)
- **Vertical Scrolling Feed**: Full-screen day cards (TikTok-style)
- **Sleep Data Cards**: Displays sleep metrics, REM cycles, heart rate
- **Dream Generation**: Tap to generate AI dreams from sleep data
- **Dream Playback**: Watch generated dream videos with narrative
- **Loading States**: Beautiful generating animation
- **Error Handling**: Graceful failure states with retry
- **Date Navigation**: Scroll through 30 days of sleep history
- **Dream Ready Notifications**: Bottom sheet when dream completes

### 👤 Profile Screen (Me Tab)
Two-tab interface with segmented control:

**Collection Tab:**
- 12 collectible oneiromancy cards (Love, Wealth, Career, etc.)
- Gamified progression system
- Beautiful illustrations for each category
- Shows collected vs. total count
- Disabled state for uncollected cards

**My Data Tab:**
- **Data Source Selection**:
  - 🏃 WHOOP (fully functional with OAuth)
  - 💪 Apple Health (coming soon)
  - ✨ Demo Data (active by default)
- **WHOOP OAuth**: Full authentication flow
- **Data Management**: Clear all dreams and reset
- Connection status badges
- Visual feedback for active sources

## 🎬 Dream Generation Pipeline

```
Sleep Data → Backend API
  ↓
Groq AI (Mixtral-8x7b)
  ↓
Dream Narrative + Oneiromancy Prediction
  ↓
Fal.ai Veo3
  ↓
Cinematic Video (8 seconds, 1080p)
  ↓
Complete Dream Saved
  ↓
Display in App
```

**Generation Time**: ~40-150 seconds total
- Narrative: 10-30 seconds
- Video: 30-120 seconds

## 🔮 Oneiromancy Categories

12 dream interpretation categories with unique illustrations:

1. 💰 **Wealth** - Prosperity and abundance
2. 💕 **Love** - Romance and relationships  
3. 💼 **Career** - Professional growth
4. ⚠️ **Danger** - Warnings and caution
5. 💪 **Health & Vitality** - Physical wellness
6. 👨‍👩‍👧 **Family** - Familial bonds
7. 🦁 **Animals** - Nature and instinct
8. 🌊 **Water** - Emotions and flow
9. 🍎 **Food** - Nourishment and satisfaction
10. ✈️ **Travel** - Journey and adventure
11. 🙏 **Spiritual Growth** - Inner development
12. 🦋 **Transformation** - Change and rebirth

Each dream includes: summary, themes, symbols, advice, and confidence score.

## 🎨 Design System

### Colors (Radix-based)
- **Primary**: Violet (#6e56cf) - Buttons, active states
- **Background**: Deep violet (#14121f) - App background
- **Text**: White (#FFFFFF) - Primary text
- **Text Muted**: Gray (#848a96) - Secondary text
- **Text Subtle**: Darker gray (#60646c) - Tertiary text
- **Success**: Green (#30a46c) - Success states, active badges
- **Error**: Red (#e54d2e) - Error states, danger actions
- **Border**: Semi-transparent (#ffffff1a) - Dividers, borders

### Typography
- **Headers**: 20-32px, bold (600-700 weight)
- **Body**: 14-16px, regular (400 weight)
- **Captions**: 12-14px, medium (500-600 weight)
- **iOS Native**: System font with -0.25 letter spacing

### Components
- **Border radius**: 12-16px for cards, 100px for pills
- **Padding**: 16-20px for containers
- **Spacing**: 12px between elements
- **Icons**: 20-24px for UI, 32-48px for empty states
- **Glass blur**: expo-blur with intensity 10-20

## ✅ Implementation Status

### ✨ Completed Features
- [x] Full WHOOP OAuth 2.0 integration
- [x] WHOOP sleep data fetching and mapping
- [x] Groq AI narrative generation (Mixtral-8x7b)
- [x] Fal.ai Veo3 video generation
- [x] Complete dream generation pipeline
- [x] Oneiromancy prediction system (12 categories)
- [x] Collection view with gamification
- [x] AsyncStorage persistence
- [x] Vertical scrolling day cards (TikTok-style)
- [x] Dream video playback with expo-video
- [x] Native iOS liquid glass tab bar
- [x] Loading and error states
- [x] Dream ready notification sheet
- [x] Date change detection
- [x] Clear data functionality
- [x] Backend Express.js server
- [x] REM cycle synthesis algorithm

### 🚧 In Progress / Coming Soon
- [ ] **Apple Health Integration**: HealthKit for Apple Watch sleep data
- [ ] **Dream Sharing**: Export dreams as videos or images
- [ ] **Dream Journal Search**: Find dreams by category, date, or content
- [ ] **Multiple Scene Videos**: Generate videos for all scenes, not just primary
- [ ] **Push Notifications**: Notify when dream generation completes
- [ ] **Dream Editing**: Regenerate or customize dream narratives
- [ ] **User Accounts**: Authentication and cloud sync
- [ ] **Advanced Analytics**: Track generation success rates, usage patterns
- [ ] **Dream Themes**: Identify recurring patterns across dreams
- [ ] **Social Features**: Share and discover dreams with community

## 🔧 Development

### Type Safety
- **Strict TypeScript**: No `any` types, full type coverage
- **Shared Types**: Types synced between frontend and backend
- **Type Guards**: Runtime validation for API responses

### Code Quality
- **Functional Components**: Hooks-based architecture
- **Context Pattern**: Clean global state management
- **Separation of Concerns**: UI, logic, and data layers separated
- **Error Boundaries**: Graceful failure handling
- **Comments**: Future integration points marked with TODO

### iOS Optimization
- **Native Tabs**: Using `unstable-native-tabs` for liquid glass effect
- **SF Symbols**: Native iOS icons
- **Safe Area**: Proper inset handling for notch/home indicator
- **Blur Effects**: Native expo-blur for glass morphism
- **Performance**: Optimized FlatList with pagination
- **Dark Mode**: Fully optimized for iOS dark appearance

### Backend Architecture
- **Express.js**: RESTful API with TypeScript
- **Service Layer**: Modular services (WHOOP, Groq, Veo)
- **Error Handling**: Consistent error responses
- **Environment Config**: dotenv for secure key management
- **CORS**: Configured for mobile app requests

## 🧪 Testing

### Quick Test (No API Keys)
1. Start backend: `cd server && npm run dev`
2. Start app: `npm start && npm run ios`
3. App loads with demo data
4. Navigate between tabs
5. View sleep data cards

### Test Dream Generation (Requires API Keys)
1. Setup `.env` in server folder with API keys
2. Restart backend server
3. In app, scroll to a day with sleep data
4. Tap "Generate Dream" button
5. Wait ~40-150 seconds
6. Dream video appears with narrative

### Test WHOOP Integration (Requires WHOOP Account)
1. Get WHOOP credentials from developer.whoop.com
2. Add to server `.env`
3. In app: Profile → My Data → Connect WHOOP
4. Complete OAuth flow
5. Return to app, sleep data loads automatically

## 🐛 Troubleshooting

### Backend won't start
- Check Node.js version (18+)
- Install dependencies: `cd server && npm install`
- Check port 3000 is available

### App can't connect to backend
- Verify backend is running: `curl http://localhost:3000/health`
- Check `API_BASE_URL` in `app/(tabs)/profile.tsx`
- For iOS simulator, use `localhost`
- For physical device, use your computer's IP

### Dream generation fails
- Check backend logs for errors
- Verify API keys in server `.env`
- Ensure all dependencies installed
- Check API quota limits (Groq, Fal.ai)

### Video won't play
- Verify video URL in dream object
- Check expo-video is installed
- Look for errors in console

## 🚀 Performance Notes

- **Groq AI**: ~10-30 seconds (narrative generation)
- **Fal.ai Veo3**: ~30-120 seconds (video generation)
- **Total Generation**: ~40-150 seconds per dream
- **App Launch**: <2 seconds (loads from AsyncStorage)
- **Video Playback**: Depends on network/video size
- **WHOOP Sync**: ~2-5 seconds (fetches 30 days of data)

## 📝 Recent Updates

### October 19, 2025
- ✅ Updated README with complete current state
- ✅ Added clear setup instructions
- ✅ Documented all implemented features

### October 18, 2025
- ✅ Fixed collection category matching bug
- ✅ Show all 12 oneiromancy cards (including uncollected)
- ✅ Enhanced category matching algorithm

### Previous Updates
- ✅ Migrated to Fal.ai Veo3 for video generation
- ✅ Implemented oneiromancy prediction system
- ✅ Added profile collection view
- ✅ Built vertical scrolling day cards
- ✅ Integrated WHOOP OAuth 2.0
- ✅ Created Express backend server

## 📄 License

MIT

## 📦 Version

**1.0.0** - Full-featured MVP with AI dream generation

---

Built with ❤️ using Expo, React Native, TypeScript, Groq AI, and Fal.ai Veo3.
