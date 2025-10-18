# WHOOP → Veo Template Mapping (Plan)

## Purpose
Define a clear, repeatable mapping from WHOOP (or demo) sleep metrics to the reusable 6-scene Veo video prompt variables, ensuring grounded, desaturated, first‑person output.

## Inputs
- WHOOP sleep session or demo `SleepSession`
- Optional user profile: age, nationality, gender
- Optional category; inferred if absent

## Mapping Rules
- Respiratory rate → movement subtlety
  - Elevated: slight hand/weight shifts
  - Normal: stillness, resting hands
- Sleep performance → color saturation + transition
  - Lower performance → colder palettes, stronger drain to white
- Disturbances → tone
  - 4+ wake-ups nudges category to Danger if not provided
- Time window (start) → space type preference
  - 1–3 AM: work/institutional
  - 3–5 AM: domestic/personal
  - 5–7 AM: liminal/transitional

## Category Inference
- Health if performance < 65 or respiratory > 18
- Danger if wakeUps ≥ 4
- Else: time-based fallback (Career→Family→Travel by window)

## Output Constraints
- 6 scenes over 8 seconds (with jumps per template)
- No surreal elements
- No UI overlays
- Desaturated, natural lighting
- First-person POV

## Implementation Locations
- Builder: `server/src/promptTemplates/veoPromptTemplate.ts`
- Inference: `server/src/utils/categoryInference.ts`

## Testing
- Verify consistent desaturation and movement choices across different WHOOP sessions.
- Confirm inferred categories align with expectations on edge cases (e.g., many disturbances).
