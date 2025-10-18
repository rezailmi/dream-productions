# Dream Machine - Documentation Index

Welcome to the Dream Machine documentation! All project documentation, plans, and guides are organized in this folder.

## 📚 Documentation Files

### Getting Started
- **[README.md](../README.md)** - Main project overview (in root directory)
- **[QUICK_START.md](QUICK_START.md)** - Quick reference guide to run and test the app

### Implementation Guides
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation summary with success metrics
- **[LIQUID_GLASS_IMPLEMENTATION.md](LIQUID_GLASS_IMPLEMENTATION.md)** - ✨ Current working glass effect with BlurView
- **[LIQUID_GLASS_TABS.md](LIQUID_GLASS_TABS.md)** - Native tabs guide (for future SDK 55+)
- **[NATIVE_TABS_UPDATE.md](NATIVE_TABS_UPDATE.md)** - Technical migration details
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

### Original Plan
- **[expo-dream-app-init.plan.md](expo-dream-app-init.plan.md)** - Original implementation plan with all requirements

## 📋 Quick Navigation

### Need to...

**Run the app?**
→ See [QUICK_START.md](QUICK_START.md) - Section: "Running the App"

**Understand the project structure?**
→ See [README.md](README.md) - Section: "Project Structure"

**Learn about native tabs?**
→ See [LIQUID_GLASS_TABS.md](LIQUID_GLASS_TABS.md) - Complete guide with customization

**Review what was built?**
→ See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Full feature list

**Troubleshoot issues?**
→ See [LIQUID_GLASS_TABS.md](LIQUID_GLASS_TABS.md) - Section: "Troubleshooting"

**Customize colors or styling?**
→ See [README.md](README.md) - Section: "Design System"

## 🎯 Key Features

- ✨ Native iOS liquid glass tab bar
- 🎨 Radix color palette (dark mode)
- 📱 SF Symbols for icons
- 💾 Demo sleep data with 3 sessions
- 🔄 Health data context management
- 🎴 Reusable glass-morphic cards

## 🚀 Quick Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Clear cache and restart
npx expo start --clear
```

## 📁 Project Structure

```
dream-productions/
├── plan/                    # 📍 You are here!
│   ├── INDEX.md            # This file
│   ├── README.md           # Main documentation
│   ├── QUICK_START.md      # Quick reference
│   └── *.md                # Other guides
├── app/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx     # Native tabs config
│       ├── index.tsx       # Home screen
│       ├── journal.tsx     # Journal screen
│       └── profile.tsx     # Profile screen
├── components/
│   ├── SettingsCard.tsx
│   └── ConnectionButton.tsx
├── constants/
│   ├── Colors.ts           # Radix color palette
│   └── Types.ts            # TypeScript interfaces
├── contexts/
│   └── HealthDataContext.tsx
├── services/
│   └── demoData.ts         # 3 sample sleep sessions
└── ...
```

## 🔧 Configuration Files

- `.cursorrules` - AI assistant guidelines and project rules
- `app.json` - Expo configuration
- `tsconfig.json` - TypeScript configuration (strict mode)
- `package.json` - Dependencies and scripts

## 🎨 Design System

**Colors:** Radix-based (Violet primary, Blue secondary, Green success)
**Typography:** System fonts, 12-32px range
**Spacing:** 4/8px grid system
**Radius:** 12-16px for cards
**Icons:** SF Symbols (iOS native)

## 🛠️ Tech Stack

- Expo SDK 54
- React Native 0.81
- TypeScript (strict mode)
- Expo Router (file-based routing)
- Native Tabs (unstable-native-tabs)
- React Context (state management)

## 📱 Platform Support

**Primary:** iOS 18.0+
**Secondary:** Android (fallback styling)
**Focus:** Native iOS experience

## 🔮 Future Features

- Apple Health integration
- Whoop API integration  
- AI dream reconstruction
- Dream visualization
- User authentication
- Cloud sync

## 📞 Support

For questions or issues:
1. Check relevant documentation file above
2. Review `.cursorrules` in root for guidelines
3. Check Expo documentation: https://docs.expo.dev

---

**Last Updated:** October 18, 2025
**Version:** 1.0.0

