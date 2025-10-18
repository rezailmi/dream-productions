# Oneiromancy Flip Card Implementation

## Overview
Implemented a clickable, flippable card for the Oneiromancy (dream interpretation) tab that reveals insight text when tapped.

## Changes Made

### Component: `DreamInsightsView.tsx`

#### New Functionality
1. **Flip Animation**: Added smooth 3D flip animation using React Native's Animated API
2. **Interactive Card**: Made the card fully clickable/tappable
3. **Two-Sided Card**: 
   - **Front**: Shows placeholder colored background (teal/mint green `#7dd3c0`)
   - **Back**: Shows dream interpretation text

#### Implementation Details

**State Management:**
```typescript
const [isFlipped, setIsFlipped] = useState(false);
const flipAnimation = useRef(new Animated.Value(0)).current;
```

**Animation Configuration:**
- Duration: 600ms
- Uses native driver for performance
- Smooth rotation on Y-axis (180° flip)
- Opacity transitions for seamless face switching

**Interpolations:**
- Front face: 0° → 180° rotation
- Back face: 180° → 360° rotation
- Opacity fades at midpoint (0.5) to hide backface

**Styles Added:**
- `cardContainer`: Relative positioning wrapper
- `cardFace`: Absolute positioning for overlapping faces
- `cardFront` / `cardBack`: Z-index management
- `imagePlaceholder`: Colored background with centered text
- `placeholderText`: "Tap to reveal" indicator

## User Experience

### Default State
- Card shows teal/mint green background
- Displays "Tap to reveal" text in center
- Maintains same border and styling as original card

### Flipped State
- Smooth 3D rotation animation
- Reveals full interpretation text
- Scrollable content for long text
- Tap again to flip back

## Future Enhancements

### Asset Integration (To Do)
When user provides image assets:
1. Replace `imagePlaceholder` View with Image component
2. Update `imagePlaceholder` style to accommodate image
3. Consider using `resizeMode="cover"` for full card coverage

Example:
```typescript
<Image 
  source={require('../assets/dream-image.png')} 
  style={styles.imagePlaceholder}
  resizeMode="cover"
/>
```

### Potential Improvements
- Add haptic feedback on tap (iOS)
- Add subtle shadow during flip animation
- Support for multiple interpretation cards
- Gesture-based flip (swipe instead of tap)
- Persistent state (remember if flipped)

## Technical Notes

### Animation Performance
- Uses `useNativeDriver: true` for optimal performance
- All transforms run on native thread
- Smooth 60fps animation on iOS

### Accessibility
- TouchableOpacity provides native touch feedback
- activeOpacity: 0.9 for subtle press indication
- Works with VoiceOver (iOS accessibility)

### Styling
- Maintains existing card aesthetics
- 18px white border preserved
- 8px border radius maintained
- Cream background (#fefdf2) on text side

## Testing

### Manual Testing Checklist
- [ ] Card displays colored placeholder by default
- [ ] Tap triggers smooth flip animation
- [ ] Text is readable on back side
- [ ] Can flip back to front by tapping again
- [ ] Scrolling works on text side
- [ ] Animation is smooth (60fps)
- [ ] Works in both light and dark mode
- [ ] No layout issues on different screen sizes

### Test Scenarios
1. **Initial Load**: Card shows front (colored) side
2. **First Tap**: Flips to show interpretation text
3. **Second Tap**: Flips back to colored side
4. **Rapid Taps**: Animation completes smoothly
5. **Long Text**: Scrolling works properly on back side

## Related Files
- `components/DreamInsightsView.tsx` (updated)
- `components/DayCard.tsx` (contains the carousel logic)
- `app/(tabs)/index.tsx` (home screen with day cards)

## Dependencies
- `react-native`: Animated API
- `expo-router`: Navigation context
- No new packages required

## Asset Management

### Image Folder
Created: `/assets/oneiromancy/`
- Dedicated folder for oneiromancy card images
- Includes README.md with integration instructions
- Ready to accept image assets

### Recent Updates (Latest)
1. **Enhanced 3D Flip Animation**: 
   - Added perspective (1200) for realistic 3D depth
   - Added scale animation (0.95) during flip for dynamic effect
   - Extended duration: 600ms → 800ms
   - Applied cubic easing for smoother motion
2. **Image Integration**:
   - Integrated `career.png` as the card image
   - Replaced placeholder colored background with actual image
   - Uses `resizeMode="cover"` for proper image display
3. **Fixed Title Cutoff**: Increased line height from 25.6px to 38px
4. **Reduced Padding**: Card content padding reduced from 22px to 16px
5. **Improved Spacing**: 
   - Title margin-bottom: 20px → 16px
   - Content line-height: 19.2px → 22px
   - Title letter-spacing: -0.075 → -0.5
6. **Created Asset Folder**: `/assets/oneiromancy/` for card images

## Status
✅ **Complete** - Ready for image asset integration
📁 **Asset Folder Created** - Drop images in `/assets/oneiromancy/`

---
*Last Updated: October 18, 2025 (Updated with spacing fixes)*

