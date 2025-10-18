# Quick Start Guide

## 🎉 Now with Native iOS Liquid Glass Tab Bar!

The app uses Expo Router's **native tabs** (`unstable-native-tabs`) for true iOS 26 liquid glass effects with SF Symbols icons. See `NATIVE_TABS_UPDATE.md` for details.

## Running the App

### Option 1: iOS Simulator (Mac only)
```bash
npm run ios
```

### Option 2: Expo Go (Any Device)
```bash
npm start
```
Then scan the QR code with:
- iPhone: Camera app
- Android: Expo Go app

## What You'll See

### 1. Home Tab (Default)
- Empty state with moon icon
- Message: "Your dreams will appear here"
- Ready for dream reconstruction features

### 2. Journal Tab
- Empty state with book icon
- Message: "Dream archive coming soon"
- Ready for historical dream entries

### 3. Profile Tab (Most Interactive)
- **Three Data Source Cards**:
  - Apple Health (tap shows "Coming Soon")
  - Whoop (tap shows "Coming Soon")
  - Demo Data (active by default, green badge)
- App version at bottom

## Testing the App

### Navigation
✅ Tap tabs at bottom to switch screens
✅ All transitions should be smooth
✅ Tab icons should highlight on active screen

### Profile Screen
✅ Tap "Apple Health" → Alert: "Coming Soon"
✅ Tap "Whoop" → Alert: "Coming Soon"
✅ Tap "Demo Data" → Activates (green "Active" badge)
✅ Active card has subtle glow effect

### Visual Design
✅ Dark purple/violet background
✅ Glass-morphic cards with blur effect (iOS)
✅ Status badges colored (green/gray)
✅ Smooth touch feedback

## Demo Data Preview

The app includes 3 sleep sessions:

**Session 1 (Oct 17)**
- 7h 36m sleep
- Quality: Good
- 2 wake-ups
- 4 REM cycles
- Heart rate spikes during dreams

**Session 2 (Oct 16)**
- 7h 30m sleep
- Quality: Excellent
- 1 wake-up
- 4 REM cycles
- Smooth heart rate

**Session 3 (Oct 15)**
- 7h 55m sleep
- Quality: Fair
- 4 wake-ups
- 4 REM cycles (some interrupted)
- Elevated heart rate from nightmare

## Customization

### Change Colors
Edit `/constants/Colors.ts`:
```typescript
export const Colors = {
  primary: violet.violet9,    // Change this
  secondary: blue.blue9,      // And this
  // ... etc
};
```

### Add New Tab
1. Create file: `app/(tabs)/newtab.tsx`
2. Add to `app/_layout.tsx`:
```typescript
<Tabs.Screen
  name="(tabs)/newtab"
  options={{
    title: 'New Tab',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="icon-name" size={size} color={color} />
    ),
  }}
/>
```

### Modify Demo Data
Edit `/services/demoData.ts` to add/change sleep sessions

## Troubleshooting

### App won't start?
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npx expo start --clear
```

### TypeScript errors?
```bash
# Rebuild TypeScript
npx tsc --noEmit
```

### Blur effects not showing?
- iOS only feature
- Android shows solid backgrounds
- Test on iOS simulator or device

## Next Development Steps

### 1. Add Apple Health Integration
- Implement HealthKit SDK
- Request permissions
- Fetch sleep data
- Map to SleepSession type

### 2. Add Whoop Integration
- Set up OAuth
- Call Whoop API
- Parse response
- Store in context

### 3. Build Dream Display
- Create dream card component
- Add to home screen
- Show latest reconstructed dream
- Add dream details view

### 4. Build Journal Features
- List of past dreams
- Search and filter
- Sort by date/quality
- Export dreams

## File Structure Quick Reference

```
Need to add health data? → contexts/HealthDataContext.tsx
Need to change colors? → constants/Colors.ts
Need to add TypeScript types? → constants/Types.ts
Need to modify screens? → app/(tabs)/[screenname].tsx
Need to create components? → components/[ComponentName].tsx
Need to add services? → services/[serviceName].ts
```

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review IMPLEMENTATION_SUMMARY.md for architecture
3. Check Expo documentation: https://docs.expo.dev

## Ready to Build! 🚀

The foundation is solid and ready for:
- AI integration
- Real data sources
- Dream visualization
- User accounts
- Cloud sync
- Analytics

Happy coding!

