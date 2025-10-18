# Troubleshooting Guide

Common issues and solutions for Dream Machine app.

## Build/Runtime Errors

### ❌ "Unable to resolve 'expo-linking'"

**Error:**
```
Unable to resolve "expo-linking" from "node_modules/expo-router/build/views/Unmatched.js"
```

**Solution:**
```bash
npx expo install expo-linking
npx expo start --clear
```

**Cause:** Expo Router requires `expo-linking` as a peer dependency but it wasn't installed initially.

---

### ❌ "Unable to resolve module"

**Generic module resolution error**

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

---

### ❌ "Layout children must be of type Screen"

**Error:** Warning about layout children in `app/(tabs)/_layout`

**Cause:** `expo-router/unstable-native-tabs` is not available in SDK 54

**Solution:**
Use regular `Tabs` from `expo-router` with `BlurView` for glass effect (already implemented):

```tsx
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';

<Tabs
  screenOptions={{
    tabBarBackground: () => (
      <BlurView intensity={80} tint="dark" />
    ),
  }}
/>
```

See `/plan/LIQUID_GLASS_IMPLEMENTATION.md` for details.

---

### ❌ Port Already in Use

**Error:** "Port 8081 is running this app in another window"

**Solution:**
```bash
# Kill existing Metro bundler
lsof -ti:8081 | xargs kill -9

# Or use different port
npx expo start --port 8082
```

---

### ❌ "Cannot find module 'expo-blur'"

**Solution:**
```bash
npx expo install expo-blur
```

---

### ❌ SF Symbols Not Showing

**Problem:** Icons not displaying in native tabs

**Checks:**
1. Are you testing on iOS? (SF Symbols are iOS-only)
2. Is the symbol name correct? Check: https://developer.apple.com/sf-symbols/
3. Format should be: `{ sfSymbol: 'icon.name.fill' }`

**Example:**
```tsx
tabBarIcon: () => ({ sfSymbol: 'moon.fill' })
```

---

## Development Issues

### ❌ Metro Bundler Stuck

**Problem:** Metro bundler not responding or stuck

**Solution:**
```bash
# Kill any existing Metro processes
pkill -f "metro" || killall node

# Start fresh
npx expo start --clear
```

---

### ❌ Simulator Not Opening

**Problem:** iOS simulator doesn't launch when pressing 'i'

**Solutions:**

1. **Check Xcode is installed:**
   ```bash
   xcode-select --install
   ```

2. **Open simulator manually first:**
   ```bash
   open -a Simulator
   ```

3. **Then run:**
   ```bash
   npm run ios
   ```

---

### ❌ "No bundle URL present"

**Problem:** App loads but shows "No bundle URL present" error

**Solution:**
```bash
# Clear everything
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

---

## TypeScript Issues

### ❌ TypeScript Errors in IDE

**Problem:** Red squiggles everywhere, types not resolving

**Solution:**
1. Restart TypeScript server in VS Code:
   - Cmd+Shift+P → "TypeScript: Restart TS Server"

2. Check tsconfig.json exists and is valid

3. Rebuild:
   ```bash
   npx tsc --noEmit
   ```

---

### ❌ "Property does not exist on type"

**For context hooks:**

Make sure you're using the hook inside the provider:
```tsx
// ✅ Correct
<HealthDataProvider>
  <YourComponent /> {/* Can use useHealthData() */}
</HealthDataProvider>

// ❌ Wrong
<YourComponent /> {/* No provider = error */}
```

---

## iOS Specific Issues

### ❌ Glass Effects Not Showing

**Problem:** Cards look solid instead of translucent

**Checks:**
1. Testing on iOS? (BlurView only works on iOS)
2. iOS 15+? (Older versions have limited blur support)
3. Using development build or Expo Go?
   - Development build: Full native features
   - Expo Go: Limited native features

**Test on iOS simulator for best results:**
```bash
npm run ios
```

---

### ❌ Safe Area Issues

**Problem:** Content hidden behind notch/home indicator

**Solution:**
Ensure screens use SafeAreaView:
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container} edges={['top']}>
  {/* content */}
</SafeAreaView>
```

---

## Package/Dependency Issues

### ❌ Peer Dependency Warnings

**Problem:** npm warns about peer dependencies

**Solution:**
Use Expo's install command (handles compatibility):
```bash
npx expo install [package-name]
```

Or if needed:
```bash
npm install --legacy-peer-deps
```

---

### ❌ Version Conflicts

**Problem:** Package versions incompatible with Expo SDK

**Solution:**
```bash
# Check compatibility
npx expo doctor

# Fix issues
npx expo install --fix
```

---

## Performance Issues

### ❌ App Running Slowly

**Solutions:**

1. **Enable Hermes (if not already):**
   Check `app.json` has:
   ```json
   "jsEngine": "hermes"
   ```

2. **Clear caches:**
   ```bash
   npx expo start --clear
   ```

3. **Check for heavy renders:**
   - Use React DevTools
   - Add `console.log` in components
   - Check for unnecessary re-renders

---

## Build/Export Issues

### ❌ Export Fails

**Problem:** `npx expo export` fails

**Solution:**
```bash
# Check for errors first
npx expo doctor

# Export with verbose logging
npx expo export --platform ios --output-dir dist
```

---

## Common Fixes Checklist

When something breaks, try these in order:

1. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Clean everything:**
   ```bash
   rm -rf node_modules .expo dist
   npm install
   ```

4. **Check for issues:**
   ```bash
   npx expo doctor
   ```

5. **Update packages:**
   ```bash
   npx expo install --fix
   ```

---

## Getting Help

### Check Documentation
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

### Project Documentation
- `/plan/QUICK_START.md` - Basic setup and running
- `/plan/LIQUID_GLASS_TABS.md` - Native tabs implementation
- `README.md` - Project overview

### Verify Installation
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check Expo CLI
npx expo --version

# Check for issues
npx expo doctor
```

---

## Still Having Issues?

1. Check if error message matches anything above
2. Search error message in Expo docs
3. Clear all caches and restart
4. Check `.cursorrules` for project guidelines
5. Review recent changes in git history

---

**Last Updated:** October 18, 2025

