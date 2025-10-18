# Dream Machine

An AI-powered dream journal that reconstructs sleep memories from biometric data.

## Features

- ✨ **Native iOS Liquid Glass Tab Bar** using `unstable-native-tabs`
- 📱 iOS-optimized with SF Symbols and native UITabBarController
- 🌙 Beautiful dark mode UI with Radix color palette
- 📊 Multiple data source support (Apple Health, Whoop, Demo)
- 🎨 Modern liquid glass design with native iOS blur effects
- 📈 Detailed sleep tracking with REM cycles and heart rate data

## Tech Stack

- **Framework**: Expo (SDK 54)
- **Language**: TypeScript
- **Platform**: iOS (18.0+)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context
- **UI**: React Native with expo-blur for native effects
- **Icons**: @expo/vector-icons (Ionicons)
- **Design**: Radix Colors + Native iOS blur effects

## Project Structure

```
dream-machine/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen (empty state)
│   │   ├── journal.tsx        # Dream journal/archive (empty state)
│   │   └── profile.tsx        # Profile/Settings screen with data source selection
│   └── _layout.tsx            # Root layout with tab navigation
├── components/
│   ├── SettingsCard.tsx       # Reusable settings card with glass effect
│   └── ConnectionButton.tsx   # Button for health data connections
├── constants/
│   ├── Colors.ts              # Radix-based color palette
│   └── Types.ts               # TypeScript interfaces
├── contexts/
│   └── HealthDataContext.tsx  # Health data state management
├── services/
│   └── demoData.ts            # Demo/mock sleep data
├── app.json
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for testing on device) or Xcode (for iOS simulator)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dream-productions
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

Or scan the QR code with Expo Go on your iOS device.

## Features by Screen

### Home Tab
- Empty state placeholder for future dream reconstructions
- Moon icon with dreamy messaging
- Ready for AI-generated dream content

### Journal Tab
- Empty state for dream archive
- Will display historical reconstructed dreams
- Sortable and filterable dream entries (coming soon)

### Profile Tab
- **Data Source Selection**:
  - Apple Health (coming soon)
  - Whoop (coming soon)
  - Demo Data (active by default)
- Each option displayed as a glass-morphic card
- Visual feedback for active/inactive states
- Status badges with color-coded indicators

## Demo Data

The app includes 3 sample sleep sessions with:
- Date and time information
- Total sleep duration
- Sleep quality ratings
- Wake-up counts
- REM cycles with interruption flags
- Sleep stages (Core, Deep, REM, Awake)
- Heart rate data with contextual spikes

## Design System

### Colors (Radix-based)
- **Primary**: Violet scale (#6e56cf)
- **Secondary**: Blue scale (#0090ff)
- **Success**: Green scale (#30a46c)
- **Background**: Deep violet (#14121f)
- **Glass effects**: Semi-transparent whites with native blur

### Typography
- Headers: 18-32px, bold (600-700 weight)
- Body: 14-16px, regular
- Captions: 12-14px, medium

### Components
- Border radius: 12-16px
- Padding: 16-20px
- Card spacing: 12px
- Icons: 24-32px

## Future Integrations

### Apple Health
- HealthKit integration for sleep data
- Heart rate variability analysis
- Sleep stage detection
- REM cycle tracking

### Whoop
- OAuth authentication
- Sleep performance metrics
- Recovery scores
- Strain data correlation

### AI Dream Reconstruction
- Natural language processing of sleep patterns
- Heart rate spike analysis for emotional content
- REM cycle mapping to dream sequences
- Personalized dream narrative generation

## Development

### Type Safety
- Strict TypeScript mode enabled
- No `any` types (except where absolutely necessary)
- Full type coverage for sleep data structures

### Code Style
- Functional components with hooks
- Clean component separation
- Meaningful variable names
- Comments for future integration points

### iOS Optimization
- Native blur views for glass morphism
- Safe area handling for notch/home indicator
- iOS 18.0+ deployment target
- HealthKit permissions pre-configured

## Contributing

This is a hackathon MVP. Future contributions welcome for:
- HealthKit integration
- Whoop API integration
- AI/ML dream reconstruction engine
- Dream visualization components
- User authentication
- Cloud sync

## License

MIT

## Version

1.0.0 - Initial MVP Release

