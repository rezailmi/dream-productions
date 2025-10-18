# WHOOP Data Structure and REM Cycle Generation

## Overview

This document explains the difference between WHOOP's actual API data structure and how we generate detailed REM cycle information for dream generation.

## WHOOP API Reality

### What WHOOP Provides

WHOOP API v2 provides **aggregate sleep data only**:

```typescript
{
  score: {
    stage_summary: {
      total_rem_sleep_time_milli: 5400000,  // Total REM: 90 minutes
      sleep_cycle_count: 4,                  // Number of cycles
      disturbance_count: 2,                  // Total disturbances
      total_light_sleep_time_milli: ...,    // Total light sleep
      total_slow_wave_sleep_time_milli: ..., // Total deep sleep
      total_awake_time_milli: ...            // Total awake time
    }
  }
}
```

### What WHOOP Does NOT Provide

- Individual REM cycle start times
- Duration of each REM cycle
- Which specific cycles were interrupted
- Timing of disturbances
- Granular sleep stage transitions
- Detailed heart rate spikes with context

## Our Solution: Synthetic REM Cycle Generation

### The Challenge

Our app's `SleepSession` type requires detailed REM cycle information:

```typescript
interface REMCycle {
  cycleNumber: number;
  startTime: string;        // ❌ WHOOP doesn't have this
  durationMinutes: number;  // ❌ WHOOP only has total
  isInterrupted: boolean;   // ❌ WHOOP doesn't track per-cycle
  isPrimaryDream: boolean;  // ❌ Not in WHOOP data
}
```

### The Solution

We created a smart algorithm (`server/src/utils/remCycleGenerator.ts`) that generates realistic REM cycles from WHOOP's aggregate data.

#### Algorithm Features

1. **Realistic REM Distribution**
   - REM periods naturally increase in duration as the night progresses
   - First cycle: ~15% of total REM time
   - Second cycle: ~25% of total REM time
   - Third cycle: ~30% of total REM time
   - Fourth cycle: ~30% of total REM time

2. **Smart Start Time Estimation**
   - First REM cycle: 75-90 minutes after sleep onset (research-backed)
   - Subsequent cycles: ~90-minute intervals with natural variation
   - Handles midnight wrap-around correctly

3. **Intelligent Disturbance Distribution**
   - Later cycles (3-4) are more likely to be disturbed (matches sleep research)
   - First cycle rarely disturbed
   - Weighted random distribution based on sleep physiology

4. **Primary Dream Identification**
   - Cycles 2 and 3 typically contain most vivid, memorable dreams
   - Based on sleep research showing longer REM periods = more vivid dreams

### Example Output

**Input (from WHOOP):**
```typescript
{
  totalRemMilli: 5400000,    // 90 minutes total
  cycleCount: 4,
  disturbanceCount: 2,
  sleepStartTime: '23:30:00'
}
```

**Output (generated):**
```typescript
[
  {
    cycleNumber: 1,
    startTime: '00:47:00',      // 77 min after sleep onset
    durationMinutes: 14,        // 15% of total
    isInterrupted: false,
    isPrimaryDream: false
  },
  {
    cycleNumber: 2,
    startTime: '02:12:00',      // ~85 min later
    durationMinutes: 23,        // 25% of total
    isInterrupted: true,        // One of 2 disturbances
    isPrimaryDream: true        // Peak dream cycle
  },
  {
    cycleNumber: 3,
    startTime: '03:43:00',      // ~91 min later
    durationMinutes: 27,        // 30% of total
    isInterrupted: true,        // Second disturbance
    isPrimaryDream: true        // Peak dream cycle
  },
  {
    cycleNumber: 4,
    startTime: '05:12:00',      // ~89 min later
    durationMinutes: 27,        // 30% of total
    isInterrupted: false,
    isPrimaryDream: false
  }
]
```

## Demo Data vs Real WHOOP Data

### Demo Data (`services/demoData.ts`)

- Contains **rich, detailed** REM cycle information
- Purpose: Demonstrate app capabilities and provide good UX during demos
- **Not representative** of WHOOP API's actual data format
- Should remain detailed for demonstration purposes

### Real WHOOP Data (`server/src/services/whoopService.ts`)

- Maps WHOOP's aggregate data to app's `SleepSession` format
- Uses `generateREMCyclesFromAggregate()` to create synthetic cycles
- Generates realistic timing and distribution from limited data
- Best-effort approximation based on sleep research

## Benefits of This Approach

1. **Maintains UX**: Users get detailed, meaningful dream narratives
2. **Research-Backed**: Based on actual sleep cycle physiology
3. **Transparent**: Documented as synthetic data, not claiming to be precise
4. **Flexible**: Can be improved with better algorithms or additional WHOOP data
5. **Realistic**: Distribution and timing match typical sleep patterns

## Limitations

1. **Approximation**: Generated cycles are educated guesses, not exact measurements
2. **No Ground Truth**: Can't verify against actual sleep lab data
3. **Individual Variation**: Algorithm uses population averages, not personal patterns
4. **Timing Precision**: Start times are estimates based on typical 90-min cycles

## Future Improvements

1. **Machine Learning**: Train model on sleep lab data to improve accuracy
2. **User Calibration**: Learn individual's sleep patterns over time
3. **Additional Sensors**: Integrate with Apple Health or other wearables for more data
4. **WHOOP Updates**: If WHOOP adds detailed cycle data, use that instead

## For Developers

When working with WHOOP data:

1. ✅ **Do**: Use the utility function for consistent REM cycle generation
2. ✅ **Do**: Document that cycles are synthetic/estimated
3. ✅ **Do**: Keep demo data rich for good UX
4. ❌ **Don't**: Claim synthetic cycles are precise measurements
5. ❌ **Don't**: Mix demo data structure expectations with WHOOP data reality

## References

- WHOOP API v2 Documentation: https://developer.whoop.com/api
- Sleep Cycle Research: REM periods increase in duration across the night
- Typical Sleep Architecture: ~90-minute cycles with REM starting 60-90 min into each cycle

---

**Summary**: WHOOP provides aggregate sleep data. We generate realistic individual REM cycles using a research-backed algorithm to enable rich dream narratives while being transparent about the synthetic nature of the detailed timing.
