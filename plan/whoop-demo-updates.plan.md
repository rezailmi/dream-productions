# WHOOP Demo + Video Implementation Summary

## Overview
- Added WHOOP-format demo records and mapped `SleepSession` fallbacks to keep the app experience realistic without a live device connection.
- Updated health data context to hydrate demo sessions, convert WHOOP records on demand, and reuse the richer data for dream generation.
- Refined WHOOP sleep card presentation so key metrics render in clean, human-readable sections instead of raw JSON dumps.
- Expanded backend video prompt generation to weave in sleep metrics (REM minutes, wake-ups, respiratory rate, inferred heart rate) for more context-aware visuals.

## Files Updated
- `services/demoData.ts`: ships WHOOP-style demo payloads plus precomputed `SleepSession`s.
- `utils/remCycleGenerator.ts`, `utils/whoopSleepMapper.ts`: shared helpers for mapping aggregated WHOOP signals into detailed sessions.
- `contexts/HealthDataContext.tsx`: seeds demo WHOOP data, maps records, and supports enriched lookups.
- `components/SleepDataCard.tsx`: renders WHOOP data with grouped metrics and friendly formatting.
- `server/src/services/dreamGenerationService.ts`, `server/src/types/index.ts`: extends prompt builder with sleep metric context.

## Key Snippets
```services/demoData.ts
const DEMO_WHOOP_BUNDLE: DemoSleepBundle[] = DEMO_WHOOP_RAW.map((record) => ({
  raw: record,
  mapped: convertRecord(record),
}));

export const DEMO_WHOOP_RECORDS: WhoopSleepRecord[] = DEMO_WHOOP_BUNDLE.map((bundle) => bundle.raw);
export const DEMO_SLEEP_DATA: SleepSession[] = DEMO_WHOOP_BUNDLE.map((bundle) => bundle.mapped);
```
```contexts/HealthDataContext.tsx
const session = sleepSessions.find((candidate) => {
  if (isSleepSessionRecord(candidate)) {
    return candidate.date === date;
  }
  return new Date(candidate.start).toISOString().split('T')[0] === date;
});

if (!session) {
  return null;
}

if (isSleepSessionRecord(session)) {
  return session;
}

return mapWhoopRecordToSleepSession(session as WhoopSleepRecord);
```
```components/SleepDataCard.tsx
const sections = useMemo(() => buildWhoopSections(sleepSession as WhoopSleepRecord), [sleepSession]);
...
<MetricRow key={metric.label} label={metric.label} value={metric.value} />
```
```server/src/services/dreamGenerationService.ts
const sleepMetrics = this.buildSleepMetricsContext(sleepData);
const metricsPreview = this.describeSleepMetrics(sleepMetrics);
const basePrompt = `${narrative.title}. ${narrative.narrative}. Mood: ${narrative.mood}. ${narrative.emotionalContext}. ${metricsPreview}`;
```

## Testing
- Verified the home timeline displays WHOOP demo sessions with readable cards and retains existing demo functionality.
- Confirmed dream generation still succeeds using mapped demo `SleepSession`s.
- Exercised backend prompt builder to ensure new metrics strings are emitted without errors (unit-level dry run).

## TODOs / Follow-ups
- Consider caching mapped WHOOP sessions to skip repeated conversions when switching tabs.
- Expand sleep metrics to include stage percentages once the backend exposes them.
- Add bespoke copy for naps when WHOOP `nap` flag is true.
