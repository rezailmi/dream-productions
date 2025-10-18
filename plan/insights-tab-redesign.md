# Insights Tab Redesign

## Overview
Updated the Dream Insights view to match the new Figma design, creating a cleaner, more focused interface for dream interpretation content.

## Changes Made

### Component: `DreamInsightsView.tsx`

#### Visual Design Updates
1. **Title Section**
   - Centered "Oneiromancy" title
   - Subtitle: "Dream interpretation for you."
   - Clean, centered layout with proper spacing

2. **Interpretation Card**
   - Cream/beige background (#fefdf2)
   - Thick white border (18px)
   - Rounded corners (8px)
   - Contains:
     - Large title (32px, derived from dream title)
     - Interpretation content (16px, derived from dream narrative)

#### Technical Changes
- Removed BlurView dependency (simplified to View)
- Removed duplicate header/navigation (handled by parent DayCard component)
- Simplified props usage (kept onDelete for future use)
- **Moved scrolling inside the card** - Page-level scroll removed, now only the card content scrolls
- Card uses `flex: 1` to fill available space
- Reduced margins to ensure card is fully visible without page scrolling
- Updated all styles to match Figma specifications:
  - Typography sizes and weights
  - Colors and backgrounds
  - Spacing and padding
  - Border styles

#### Style Specifications
- Container padding: 45px horizontal, 20px vertical
- Title section margin bottom: 20px
- Card background: #fefdf2 (warm cream)
- Card border: 18px white
- Card expands to fill available space (flex: 1)
- Scroll is inside the card, not on the page
- Title font: 32px, weight 400, line height 25.6px
- Content font: 16px, line height 19.2px
- Card internal padding: 22px

## Integration
The component is used in `DayCard.tsx` within a horizontal carousel:
- Page 0: Dream Video
- Page 1: Dream Insights (this component)
- Page 2: Sleep Data

## Future Enhancements
1. **Tab Functionality**: Wire up the three tabs (video, insights, analytics) to switch between different views
2. **AI Integration**: Connect to actual dream interpretation API for rich insights
3. **Multiple Interpretations**: Support different interpretation frameworks (Jungian, Freudian, cultural, etc.)
4. **Personalization**: Learn user preferences for interpretation style

## Design Assets
Figma source: `https://www.figma.com/design/dPcppCyKltclgSgdTiPYhF/Playground-with-Reza?node-id=54-2035`

## Files Modified
- `components/DreamInsightsView.tsx` - Complete redesign to match Figma

## Testing Notes
- Component maintains same props interface
- Works with existing carousel navigation in DayCard
- Displays gracefully with or without dream data
- Responsive to screen width (uses SCREEN_WIDTH constant)

