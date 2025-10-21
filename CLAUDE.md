# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dream Machine is an AI-powered dream journal app built with Expo/React Native that reconstructs sleep memories from biometric data (Apple Health, Whoop). This is an iOS-first MVP focusing on native design patterns and glass morphism aesthetics.

## Core Development Principles

### DRY (Don't Repeat Yourself)

**DRY is a fundamental principle for this codebase.** Code duplication should be eliminated whenever possible by extracting common patterns into reusable components, utilities, and hooks.

**When to refactor for DRY:**
- When you find yourself copying and pasting code
- When similar UI patterns appear in multiple places
- When the same logic is duplicated across components
- When error handling or data processing is repeated
- When constants or configuration values are hardcoded in multiple files

**How to apply DRY:**

1. **Shared Components**
   - Extract duplicate UI patterns into reusable components (e.g., `SegmentedControl`, `EmptyState`)
   - Components should be generic and configurable via props
   - Place in `components/` directory

2. **Utility Functions**
   - Extract duplicate logic into utility functions
   - Group related utilities in files (e.g., `dateUtils.ts`, `errorHandler.ts`)
   - Place in `utils/` directory

3. **Constants**
   - Replace magic strings/numbers with named constants
   - Use const assertions for type safety: `as const`
   - Place in `constants/` directory (e.g., `StatusConstants.ts`)

4. **Custom Hooks**
   - Extract duplicate React logic into custom hooks
   - Follow naming convention: `use[Name]` (e.g., `useHealthData`)
   - Place in `hooks/` directory

**Example: Before DRY**
```tsx
// ❌ Duplicated in multiple files
<View style={styles.segmentedControl}>
  <TouchableOpacity onPress={() => setTab(0)}>
    <Ionicons name="videocam" size={20} />
  </TouchableOpacity>
  <View style={styles.separator} />
  <TouchableOpacity onPress={() => setTab(1)}>
    <Ionicons name="bulb" size={20} />
  </TouchableOpacity>
</View>
```

**Example: After DRY**
```tsx
// ✅ Reusable component
<SegmentedControl
  items={SEGMENT_ITEMS}
  selectedIndex={currentTab}
  onIndexChange={setTab}
/>
```

**Benefits of DRY:**
- ✅ Single source of truth - fix bugs in one place
- ✅ Easier to maintain and update
- ✅ Improved code readability
- ✅ Better performance (when combined with memoization)
- ✅ Reduced bundle size

**See also:** `plan/DRY_AND_PERFORMANCE_IMPROVEMENTS.md` for comprehensive DRY refactoring examples.

## Common Commands

```bash
# Development
npm start                  # Start Expo dev server
npm run ios                # Launch iOS simulator
npm run android            # Launch Android emulator
npm run web                # Run in web browser

# Maintenance
npx expo install           # Install Expo-compatible versions
npx expo start --clear     # Clear Metro bundler cache
npx expo doctor            # Diagnose project issues

# Build
npx expo prebuild          # Generate native iOS/Android projects
npx expo export            # Export production build
```

## Architecture

### File-Based Routing (Expo Router)

The app uses Expo Router for navigation with a tab-based structure:

- `app/_layout.tsx` - Root layout, wraps app with HealthDataProvider
- `app/(tabs)/_layout.tsx` - Tab navigation configuration with native iOS blur effects
- `app/(tabs)/index.tsx` - Home screen (dream reconstruction, currently empty state)
- `app/(tabs)/journal.tsx` - Dream archive/history (currently empty state)
- `app/(tabs)/profile.tsx` - Settings and data source selection

Routes are automatically created from file structure. Files in `(tabs)` folder become tab screens.

### State Management with React Context

Global state is managed via React Context pattern in `contexts/`:

- **HealthDataContext** (`contexts/HealthDataContext.tsx`) - Central state for:
  - `dataSource`: Current data source ('demo' | 'apple-health' | 'whoop')
  - `sleepSessions`: Array of SleepSession objects
  - `setDataSource()`: Switch between data sources
  - `fetchSleepData()`: Load data based on selected source

Access via custom hook: `const { dataSource, sleepSessions } = useHealthData()`

### Type System

All types defined in `constants/Types.ts`:

- **SleepSession** - Complete sleep data structure with:
  - Basic info: date, start/end times, duration, quality
  - REM cycles with interruption flags
  - Sleep stages (Core, Deep, REM, Awake)
  - Heart rate data including contextual spikes
- **DataSource** - Union type for data source selection
- **HealthDataContextType** - Context interface

### Demo Data

`services/demoData.ts` contains 3 complete mock sleep sessions with:
- Realistic sleep stage progressions
- Multiple REM cycles per night
- Heart rate spikes correlated with dream activity
- Metadata for AI dream reconstruction

### UI Components

Reusable components in `components/`:

- **SettingsCard** - Glass-morphic card for settings options with status badges
- **SegmentedControl** - Reusable iOS-style segmented control component
- **EmptyState** - Reusable empty state component with icon and optional action button
- **DreamCard** - Card component for displaying generated dreams
- **VideoPlayer** - Video playback component with playback controls
- **DreamInsightsView** - Flippable card view for oneiromancy predictions
- **SleepDataCard** - Card component for displaying sleep metrics

### Design System

Colors defined in `constants/Colors.ts` using Radix UI color scales:

- **Primary**: Violet (`violet9: #6e56cf`)
- **Secondary**: Blue (`blue9: #0090ff`)
- **Success**: Green (`green9: #30a46c`)
- **Glass effects**: Semi-transparent whites with native blur

Glass morphism achieved via `expo-blur` BlurView component on iOS.

## Code Style

### TypeScript

- Strict mode enabled in `tsconfig.json`
- Prefer interfaces over types for object shapes
- No `any` types unless absolutely necessary
- Use type inference where possible

### React Native Patterns

- Functional components with hooks only
- Use SafeAreaView for all screens
- Platform-specific code via `Platform.select()` or `Platform.OS === 'ios'`
- Follow iOS Human Interface Guidelines

### Performance Best Practices

**Always consider performance when writing React components:**

1. **Use React.memo for presentational components**
   - Wrap components that receive the same props frequently
   - Add `displayName` for better debugging
   ```tsx
   export const MyComponent = React.memo<Props>(({ ... }) => {
     // component code
   });
   MyComponent.displayName = 'MyComponent';
   ```

2. **Use useCallback for function props**
   - Prevents recreation of functions on every render
   - Critical for functions passed to memoized child components
   ```tsx
   const handlePress = useCallback(() => {
     // logic here
   }, [dependencies]);
   ```

3. **Use useMemo for expensive computations**
   - Cache calculated values that don't change often
   - Particularly important for Context values
   ```tsx
   const contextValue = useMemo(() => ({
     // context values
   }), [dependencies]);
   ```

4. **Memoize constants outside components**
   - Move arrays/objects that don't change outside the component
   ```tsx
   const SEGMENT_ITEMS = [{ icon: 'home' }, { icon: 'settings' }];

   export const MyComponent = () => {
     // component code
   };
   ```

5. **Optimize Context to prevent cascading re-renders**
   - Always memoize Context Provider values
   - Use useCallback for Context functions
   - Split contexts if they update at different rates

### File Naming

- Components: PascalCase (`SettingsCard.tsx`)
- Screens: camelCase (`index.tsx`, `profile.tsx`)
- Services/Utils: camelCase (`demoData.ts`)
- Constants: PascalCase (`Colors.ts`, `Types.ts`)

### Documentation Organization

- **Planning/Design Documents**: Store all generated markdown files in the `plan/` folder
  - Examples: architecture plans, feature specifications, implementation guides, migration guides
  - Includes: `SETUP.md`, `IMPLEMENTATION_SUMMARY.md`, `MIGRATION_TO_FALAI.md`, `WHOOP_DATA_STRUCTURE.md`
  - Exception: Only root-level docs like `README.md`, `CLAUDE.md` stay at root
- **Naming Convention**: Use SCREAMING_SNAKE_CASE for documentation files (`FEATURE_PLAN.md`, `API_DESIGN.md`)

### Component Structure

```tsx
// 1. Imports (React, React Native, third-party, local)
// 2. Type/interface definitions
// 3. Component definition
// 4. Styles (using StyleSheet.create)
```

## iOS-Specific Optimizations

### Native Tab Bar

- Uses Expo Router's built-in tabs with native iOS blur
- Tab bar background: `<BlurView intensity={80} tint="dark" />`
- Icons via `@expo/vector-icons` (Ionicons)
- Configured in `app/(tabs)/_layout.tsx:10-43`

### Glass Morphism

- Use `expo-blur`'s BlurView for card backgrounds on iOS
- Typical intensity: 10-20 for subtle effects, 80 for tab bar
- Fall back to semi-transparent backgrounds on Android

### Safe Areas

- Wrap screens with SafeAreaView
- Tab bar handles bottom inset automatically (24px on iOS)
- Set edges: `['top']` for most screens

## Dream Generation System (IMPLEMENTED)

The app now includes full dream generation capabilities using WHOOP API, Groq AI, and Google Veo.

### Backend Server (`/server`)

Express.js/TypeScript server handling:
- **WHOOP OAuth** (`server/src/routes/auth.ts:10-71`) - OAuth 2.0 flow with passport-oauth2
- **Sleep Data Fetching** (`server/src/services/whoopService.ts`) - WHOOP API integration
- **REM Cycle Generation** (`server/src/utils/remCycleGenerator.ts`) - Creates realistic REM cycles from WHOOP aggregate data (see `plan/WHOOP_DATA_STRUCTURE.md`)
- **Dream Narratives** (`server/src/services/groqService.ts`) - Groq AI via OpenAI SDK
- **Video Generation** (`server/src/services/veoService.ts`) - Fal.ai Veo3 integration
- **Orchestration** (`server/src/services/dreamGenerationService.ts`) - Coordinates full pipeline

**Server Commands:**
```bash
cd server
npm install
npm run dev      # Development with hot reload
npm run build    # Production build
npm start        # Run production server
```

### Frontend Integration

**Services:**
- `services/apiClient.ts` - Backend API communication
- `services/dreamStorage.ts` - AsyncStorage for dreams and tokens

**HealthDataContext Updates** (`contexts/HealthDataContext.tsx:1-167`):
- `dreams: Dream[]` - Generated dreams state
- `whoopAccessToken: string | null` - WHOOP OAuth token
- `generateDream(sleepSessionId)` - Trigger dream generation
- `isGeneratingDream: boolean` - Loading state

**Components:**
- `components/DreamCard.tsx` - Display dream with video, narrative, scenes
- `components/VideoPlayer.tsx` - Video playback component

**Screens:**
- `app/(tabs)/index.tsx` - Dream feed with generation button
- `app/(tabs)/profile.tsx` - WHOOP OAuth connection via WebBrowser

### Dream Generation Flow

1. User taps "Generate Dream" on Home screen
2. App calls `generateDream(sleepSessionId)` in HealthDataContext
3. Backend processes sleep data:
   - Analyzes REM cycles, sleep quality, disturbances
   - Generates narrative via Groq (30s)
   - Generates video via Fal.ai Veo3 (60-120s)
4. Dream saved to AsyncStorage and displayed in UI

### Future Integration Points

#### Apple Health (HealthKit)

- Permissions pre-configured in `app.json:20-24`
- Implement similar to WHOOP flow in HealthDataContext
- Map native HealthKit data to `SleepSession` type structure

## Documentation Practices

### Plan Files

All documentation and planning files should be saved in `/plan` folder:
- Feature plans: `/plan/feature-name.plan.md`
- Implementation summaries: `/plan/feature-name.md`
- Update existing plan files rather than creating new ones

### Comment Guidelines

Add comments for:
- Future integration points (mark with TODO)
- Complex logic or non-obvious type choices
- Platform-specific workarounds

Example:
```tsx
// Future: Replace with Apple Health data when integrated
const [dataSource, setDataSource] = useState<DataSource>('demo');
```

## Testing Checklist

- Tab navigation transitions smoothly
- Cards show touch feedback
- "Coming soon" alerts for unimplemented features
- Demo data loads on app launch
- Glass effects visible on iOS
- Dark mode rendering correctly
