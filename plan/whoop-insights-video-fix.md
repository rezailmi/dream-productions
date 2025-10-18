# WHOOP Dream Insights & Video Display Fix

**Date:** October 18, 2025  
**Status:** ✅ Complete

## Problem

When generating dreams from WHOOP data, the Insights tab and Video were not displaying properly. The component was using mock/placeholder data instead of the actual oneiromancy prediction data returned by the backend.

## Root Cause

The `DreamInsightsView` component was hardcoded to show:
- `dream.title` as the category
- `dream.narrative` as the content
- A static career.png image

It was **not using** the `dream.prediction` (oneiromancy) data that contains:
- Category (with corresponding image)
- Summary
- Themes
- Symbols  
- Advice

## Solution

Updated `DreamInsightsView.tsx` to:
1. Read from `dream.prediction` instead of mock data
2. Display all oneiromancy fields (summary, themes, symbols, advice)
3. Map the category to the correct image from `/assets/oneiromancy/`
4. Show organized sections with proper styling
5. Gracefully fall back to dream.narrative if prediction is missing

## Changes Made

### 1. `components/DreamInsightsView.tsx`

**Lines 13-47** - Read actual prediction data and map category to image
```typescript
// Get oneiromancy prediction data or use fallback
const prediction = dream.prediction || {
  summary: dream.narrative || 'Your dream holds unique meanings...',
  themes: [],
  symbols: [],
  advice: 'Reflect on the emotions and imagery from your dream.',
  category: '',
  confidence: 0.5,
};

// Map category to correct image
const getCategoryImage = (category: string) => {
  const categoryMap: { [key: string]: any } = {
    'Wealth': require('../assets/oneiromancy/wealth.png'),
    'Love': require('../assets/oneiromancy/love.png'),
    'Career': require('../assets/oneiromancy/career.png'),
    'Danger': require('../assets/oneiromancy/danger.png'),
    'Health': require('../assets/oneiromancy/health.png'),
    'Family': require('../assets/oneiromancy/family.png'),
    'Animals': require('../assets/oneiromancy/animals.png'),
    'Water': require('../assets/oneiromancy/water.png'),
    'Food': require('../assets/oneiromancy/food.png'),
    'Travel': require('../assets/oneiromancy/travel.png'),
    'Spiritual': require('../assets/oneiromancy/spritual.png'),
    'Death': require('../assets/oneiromancy/transformation.png'),
  };
  return categoryMap[category] || require('../assets/oneiromancy/health.png');
};
```

**Lines 144-190** - Display structured oneiromancy data
- Show category title
- Summary section
- Themes as tags (if present)
- Symbols as tags (if present)
- Guidance/advice (if present)

**Lines 266-305** - Added new styles
- `sectionLabel` - Uppercase labels for each section
- `tagContainer` - Flex wrap container for theme/symbol tags
- `tag` & `tagText` - Styled tag pills
- `adviceText` - Italic styling for guidance text

### 2. `contexts/HealthDataContext.tsx`

**Lines 172-194** - Added debug logging
- Log when dream result is received
- Show whether video and prediction are present
- Log the final completed dream object
- Helps debug any data flow issues

## Category → Image Mapping

| Category | Image File | Notes |
|----------|-----------|-------|
| Wealth | wealth.png | Money, finances |
| Love | love.png | Relationships, romance |
| Career | career.png | Work, ambition |
| Danger | danger.png | Threats, anxiety |
| Health | health.png | Wellness, body |
| Family | family.png | Relatives, home |
| Animals | animals.png | Creatures, nature |
| Water | water.png | Emotions, flow |
| Food | food.png | Nourishment, desires |
| Travel | travel.png | Journey, exploration |
| Spiritual | spritual.png | ⚠️ Note typo in filename |
| Death | transformation.png | Endings, change |

## UI Layout (Insights Card - Back Side)

```
┌─────────────────────────────────┐
│  [Category Title]               │  32px, serif-style
│                                 │
│  SUMMARY                        │  14px uppercase label
│  [Summary text 2-3 sentences]   │  16px body text
│                                 │
│  THEMES                         │  14px uppercase label
│  [Theme 1] [Theme 2] [Theme 3]  │  Tag pills
│                                 │
│  SYMBOLS                        │  14px uppercase label
│  [Symbol 1] [Symbol 2]          │  Tag pills
│                                 │
│  GUIDANCE                       │  14px uppercase label
│  [Advice text in italics]       │  16px italic text
│                                 │
└─────────────────────────────────┘
```

## Video Display

The video display was already working correctly via `DreamVideoView.tsx`:
- Checks if `dream.videoUrl` exists
- If present: Shows VideoPlayer component
- If missing: Shows error state with retry suggestion

No changes needed for video - it just needs the backend to return `videoUrl` in the response.

## Data Flow

```
Backend generates dream
    ↓
{
  id: "dream_123",
  narrative: {
    title: "The Empty Office",
    narrative: "Full dream text...",
    mood: "Detached",
    emotionalContext: "...",
    scenes: [...],
    oneiromancy: {                    ← This is the key!
      summary: "...",
      themes: ["isolation", "work"],
      symbols: ["office", "elevator"],
      advice: "Consider work-life balance",
      category: "Career",
      confidence: 0.85
    }
  },
  videoUrl: "https://fal.ai/files/...",
  status: "complete"
}
    ↓
Frontend maps to Dream object
    ↓
dream.prediction = result.narrative.oneiromancy
dream.videoUrl = result.videoUrl
    ↓
DreamInsightsView reads dream.prediction
    ↓
Shows category, summary, themes, symbols, advice
```

## Testing Checklist

### Video Tab
- [x] Generate dream from WHOOP data
- [x] Video appears after generation completes
- [x] Title shows below video
- [x] Video plays when tapped
- [x] Shows error state if video generation failed

### Insights Tab  
- [x] Card shows correct category image on front
- [x] Flip animation works smoothly
- [x] Back side shows all sections:
  - [x] Category title
  - [x] Summary text
  - [x] Theme tags
  - [x] Symbol tags
  - [x] Guidance text
- [x] Scrolls properly when content is long
- [x] Looks good in dark mode

### Demo Data (Regression Test)
- [x] Demo data still works as before
- [x] Falls back gracefully if prediction is missing

## Debug Commands

If video or insights don't appear:

1. **Check the backend logs:**
   ```bash
   cd server
   npm run dev
   # Look for: "Video URL:", "Oneiromancy present"
   ```

2. **Check the frontend console:**
   ```javascript
   // Should see:
   📦 Dream generation result received: {
     hasVideo: true,
     videoUrl: "https://...",
     hasPrediction: true,
     status: "complete"
   }
   
   💾 Completed dream object: {
     hasVideo: true,
     hasPrediction: true,
     status: "complete"
   }
   ```

3. **Inspect the dream object:**
   ```javascript
   console.log(dream.videoUrl);      // Should be a URL string
   console.log(dream.prediction);    // Should be an object with summary, themes, etc.
   console.log(dream.status);        // Should be "complete"
   ```

## Known Issues & Workarounds

### Video Not Showing
- **Cause:** Backend video generation failed (Google Veo timeout, quota exceeded)
- **Workaround:** Dream still shows with narrative; user can see insights
- **Fix:** Check backend logs, verify Veo API credentials

### Prediction Missing
- **Cause:** Groq AI didn't return valid JSON
- **Workaround:** Falls back to dream.narrative in summary
- **Fix:** Check Groq prompt, ensure it requests strict JSON

### Wrong Category Image
- **Cause:** Category name doesn't match expected values
- **Workaround:** Falls back to health.png
- **Fix:** Update category mapping or fix Groq prompt

## Files Changed

```
components/
  └── DreamInsightsView.tsx   [Modified] Use real prediction data

contexts/
  └── HealthDataContext.tsx   [Modified] Add debug logging

plan/
  └── whoop-insights-video-fix.md [New] This document
```

## Related Documentation

- `/plan/ONEIROMANCY.md` - Oneiromancy schema and guidelines
- `/plan/whoop-dream-generation-fix.md` - Initial WHOOP generation fix
- `/plan/veo-dream-video-template.md` - Video generation template
- `/plan/oneiromancy-flip-card.md` - Original flip card design

## Future Improvements

- [ ] Add confidence indicator (visual progress bar or stars)
- [ ] Show category icon/emoji alongside text
- [ ] Add "Share Insight" button to share interpretation
- [ ] Animate theme/symbol tags on flip
- [ ] Add audio narration of the guidance
- [ ] Let user flag incorrect interpretations for improvement

## Success Criteria

✅ Insights tab shows actual oneiromancy data, not mock data  
✅ Category image matches the predicted category  
✅ Summary, themes, symbols, and advice all display  
✅ Video tab shows generated video when available  
✅ Works identically for WHOOP data and demo data  
✅ Graceful fallbacks when data is missing  
✅ No linter errors  
✅ Flip card animation still smooth  

---

**Implementation Complete** - WHOOP-generated dreams now show proper insights and video, exactly like demo data! 🎉

