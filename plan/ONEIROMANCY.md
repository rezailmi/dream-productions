# Oneiromancy Prediction (Plan)

## Purpose
Provide a concise interpretation layer for each generated dream, surfacing category, themes, symbols, advice, and confidence for display in the app.

## Schema (backend)
```json
{
  "summary": "2-3 sentences",
  "themes": ["theme1", "theme2"],
  "symbols": ["symbol1", "symbol2"],
  "advice": "short actionable guidance",
  "category": "Wealth|Love|Career|Danger|Health|Family|Animals|Water|Food|Travel|Spiritual|Death",
  "confidence": 0.0
}
```

## Generation
- Requested from Groq alongside the narrative (single response, strict JSON)
- Parsed in `server/src/services/groqService.ts` and attached to `DreamNarrative`
- Stored client-side as `dream.prediction`

## UI Guidelines
- Narrative tab shows Oneiromancy content instead of raw narrative
- Layout: category/title → summary → themes/symbols → advice
- Keep tone compassionate and non-prescriptive

## Testing
- Validate JSON presence and types
- Ensure graceful fallback when fields are missing
- Confirm rendering on small screens and dark mode
