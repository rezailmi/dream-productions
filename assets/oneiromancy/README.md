# Oneiromancy Card Images

This folder contains the image assets for the oneiromancy flip cards.

## Usage

Place your dream interpretation card images in this folder. The images will be displayed on the front side of the flippable card before the user taps to reveal the interpretation text.

## Image Specifications

### Recommended Format
- **Format**: PNG or JPG
- **Aspect Ratio**: Match the card dimensions (approximately 3:4 portrait)
- **Resolution**: 1080x1440px or higher for best quality
- **File Size**: Optimize for mobile (<500KB per image)

### Naming Convention
Use descriptive names that match the dream categories:
- `travel-journey.png`
- `fractured-moonlight.png`
- `water-dreams.png`
- etc.

## Integration

To integrate an image into the card:

1. Add your image file to this folder
2. Update `DreamInsightsView.tsx` component
3. Replace the placeholder View with an Image component:

```typescript
// Replace this:
<View style={styles.imagePlaceholder}>
  <Text style={styles.placeholderText}>Tap to reveal</Text>
</View>

// With this:
<Image 
  source={require('../../assets/oneiromancy/your-image.png')} 
  style={styles.imagePlaceholder}
  resizeMode="cover"
/>
```

## Dynamic Images (Future)

For dynamic image selection based on dream content:

```typescript
const getImageSource = (dreamTitle: string) => {
  const imageMap = {
    'Fractured Moonlight Serenade': require('../../assets/oneiromancy/fractured-moonlight.png'),
    'Travel & Journey': require('../../assets/oneiromancy/travel-journey.png'),
    // Add more mappings...
  };
  return imageMap[dreamTitle] || require('../../assets/oneiromancy/default.png');
};
```

## Current State
🎨 **Using placeholder color**: Teal/mint green (#7dd3c0)
✅ **Ready for images**: Drop your assets here and update the component

