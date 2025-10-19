# Collection View Category Matching Fix

## Issue
Users reported that the profile screen's collection view was only showing 1 oneiromancy card despite having multiple dreams generated with different categories. The header correctly showed "Collected 2 of 12 oneiromancy cards" but only displayed one card.

## Root Cause
There was a category matching mismatch between:
1. **Dream categories from API**: Could be full names like "Spiritual Growth" or IDs like "spiritual"
2. **Category lookup in CollectionView**: Only checked against the short category ID (e.g., "spiritual")

### The Bug
```tsx
// Original code
dreams.forEach(dream => {
  if (dream.prediction?.category) {
    const category = dream.prediction.category.toLowerCase();
    counts[category] = (counts[category] || 0) + 1;  // Stores as "spiritual growth"
  }
});

// Later...
const dreamCount = dreamCountByCategory[category.category] || 0;  // Looks for "spiritual"
```

If a dream had category "Spiritual Growth", it would be stored as `counts['spiritual growth']`, but we were looking it up with the key `'spiritual'`, resulting in no match and the card not being displayed.

## Solution
Implemented flexible category matching that handles both full names and IDs:

```tsx
const matchedCategory = ONEIROMANCY_CATEGORIES.find(cat => {
  const categoryName = cat.title.toLowerCase();
  const categoryId = cat.category.toLowerCase();
  
  // Check if the dream category matches either the title or the ID
  return category === categoryId || 
         category === categoryName ||
         category.includes(categoryId) ||
         categoryId.includes(category);
});

if (matchedCategory) {
  const key = matchedCategory.category;
  counts[key] = (counts[key] || 0) + 1;
}
```

This ensures that categories are normalized to the short ID (e.g., "spiritual") regardless of whether the API returns:
- "spiritual"
- "Spiritual"
- "Spiritual Growth"
- "spiritual growth"

## Files Changed
- `components/CollectionView.tsx` - Updated `dreamCountByCategory` memo to use flexible category matching
- `components/CollectionView.tsx` - Now shows all 12 cards including uncollected ones
- `components/OneiromancyCard.tsx` - Added disabled styling for uncollected cards

## Additional Improvements (Update)

### Show All Cards (Including Uncollected)
The collection view now displays all 12 oneiromancy cards, even ones that haven't been collected yet.

**Uncollected cards show:**
- Image at 40% opacity (existing behavior)
- Text at 50% opacity (new)
- "Not yet collected" subtitle instead of "0 dreams captured"

**Benefits:**
- Users can see what cards are available to collect
- Creates a sense of progression and discovery
- Gamification element - users want to "collect them all"

### Enhanced Category Matching
Improved matching logic handles:
- Exact ID match: `"health"` → `"health"`
- Exact title match: `"Health & Vitality"` → `"health"`
- Partial matches: `"health & vitality"` → `"health"`
- First word matching: `"health vitality"` → `"health"`
- Debug logging to help troubleshoot category mismatches

## Testing
1. Generate multiple dreams with different categories
2. Check the profile collection view
3. Verify that all 12 cards are displayed
4. Verify collected cards appear normal, uncollected cards appear disabled
5. Verify the count header matches the number of collected cards
6. Check console logs for category matching debug info

## Impact
- ✅ All collected oneiromancy cards now display correctly
- ✅ Uncollected cards show in disabled state
- ✅ Category matching is more robust and flexible
- ✅ Better user experience with visible progression
- ✅ Debug logging helps troubleshoot category issues
- ✅ No breaking changes to existing functionality

## Date
October 18, 2025

