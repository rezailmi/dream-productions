<!-- a2f55d4b-cf60-4dbb-99f1-bcace696f6bf b9cde930-be7e-4940-b048-f7d65536df78 -->
# Initialize Dream Machine Expo App

## 1. Project Setup

Init Expo project with TypeScript:

- Create new Expo app (TypeScript template)
- Install: Expo Router, @expo/vector-icons, expo-status-bar, react-native-safe-area-context, react-native-screens, expo-blur
- Fetch iOS 26 native component docs via context7
- Configure `app.json`: iOS bundle identifier, app name, HealthKit permission placeholder, iOS 18.0+ deployment target

## 2. Constants

`constants/Colors.ts`:

- Install @radix-ui/colors
- Import Radix color scales (violet, blue, green, gray for dark mode)
- Export semantic color tokens (primary, secondary, success, inactive)

`constants/Types.ts`:

- Interfaces: SleepSession, REMCycle, SleepStage, HeartRateData, HeartRateSpike
- DataSource type: 'demo' | 'apple-health' | 'whoop' | null

## 3. Demo Data

`services/demoData.ts`:

- 2-3 sample sleep sessions with date, times, duration
- Sleep quality, wake-ups, REM cycles, sleep stages
- Heart rate: resting/avg/min/max BPM, spikes with context

## 4. State Management

`contexts/HealthDataContext.tsx`:

- Store data source (default: 'demo')
- Store sleep sessions (init with demo data)
- Methods: switch source, fetch data

## 5. Components

`components/SettingsCard.tsx`:

- Props: title, description, icon, status badge, onPress
- Style: 12-16px radius, 16-20px padding, semi-transparent bg

`components/ConnectionButton.tsx`:

- Health data connection button with loading states

## 6. Navigation

`app/_layout.tsx`:

- Tab navigator with 3 tabs:
- Home (moon icon)
- Journal (book icon)
- Profile (person icon)
- Apply color scheme, SafeAreaView

## 7. Screens

`app/(tabs)/index.tsx` - Home:

- Empty state: "Your dreams will appear here"

`app/(tabs)/journal.tsx` - Journal:

- Empty state: "Dream archive coming soon"

`app/(tabs)/profile.tsx` - Profile:

- Header: "Choose Your Data Source"
- 3 SettingsCards:

1. Apple Health: Not Connected, shows "Coming Soon" alert
2. Whoop: Not Connected, shows "Coming Soon" alert
3. Demo Data: Active (default), green badge

- App version at bottom
- ScrollView, 12px spacing

## 8. Styling

- Dark mode, purple/blue gradients
- Headers: 18-20px bold, Body: 14-16px regular
- Icons: 24-32px from @expo/vector-icons
- iOS responsive

## 9. TypeScript Config

`tsconfig.json`:

- Strict mode, proper module resolution

## 10. Verify

- Runs on iOS without errors
- Smooth tab transitions
- Cards respond to taps
- Demo data initialized
- Clean code, proper types, comments for future integrations

### To-dos

- [x] Initialize Expo project with TypeScript and install all required dependencies
- [x] Create Colors.ts and Types.ts with color palette and TypeScript interfaces
- [x] Create demoData.ts service with 2-3 sample sleep sessions
- [x] Create HealthDataContext for state management with demo data integration
- [x] Build SettingsCard and ConnectionButton reusable components
- [x] Set up Expo Router with tab navigation and root layout
- [x] Implement Home (empty), Journal (empty), and Profile (with data source cards) screens
- [x] Apply styling, dark mode theme, and verify iOS responsiveness

## Implementation Complete ✅

All tasks completed successfully. See `/plan/IMPLEMENTATION_SUMMARY.md` for details.

