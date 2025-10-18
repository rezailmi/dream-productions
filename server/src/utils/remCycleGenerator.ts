import { REMCycle } from '../types';

/**
 * Generates realistic REM cycles from WHOOP aggregate data
 *
 * WHOOP provides only aggregate data:
 * - total_rem_sleep_time_milli: Total REM sleep in milliseconds
 * - sleep_cycle_count: Number of sleep cycles
 * - disturbance_count: Total number of disturbances
 *
 * This function creates synthetic individual REM cycles that:
 * - Follow realistic sleep architecture (REM increases in duration as night progresses)
 * - Distribute disturbances across cycles realistically
 * - Mark likely primary dream cycles (typically cycle 2 or 3)
 * - Generate plausible start times based on typical 90-minute cycle patterns
 */
export function generateREMCyclesFromAggregate(
  totalRemMilli: number,
  cycleCount: number,
  disturbanceCount: number,
  sleepStartTime: string
): REMCycle[] {
  if (cycleCount === 0) {
    return [];
  }

  const remCycles: REMCycle[] = [];
  const totalRemMinutes = totalRemMilli / 60000;

  // Calculate start time in minutes from midnight for easier calculation
  const [hours, minutes] = sleepStartTime.split(':').map(Number);
  let currentMinutesFromMidnight = hours * 60 + minutes;

  // Realistic REM distribution weights (REM periods get longer as night progresses)
  // First cycle: 10-15% of total, second: 20-25%, third: 25-30%, fourth: 30-40%
  const distributionWeights = calculateREMDistribution(cycleCount);

  // Distribute disturbances across cycles (more likely in later cycles)
  const disturbedCycles = distributeDisturbances(cycleCount, disturbanceCount);

  // Identify primary dream cycle(s) - typically cycles 2-3 have most vivid dreams
  const primaryDreamCycles = identifyPrimaryDreamCycles(cycleCount);

  for (let i = 0; i < cycleCount; i++) {
    // Calculate REM start time (REM typically occurs after 60-90 min into each cycle)
    // First cycle: ~70-90 min after sleep onset
    // Subsequent cycles: ~90 min intervals with some variation
    if (i === 0) {
      currentMinutesFromMidnight += 75 + Math.floor(Math.random() * 15); // 75-90 min
    } else {
      currentMinutesFromMidnight += 90 + Math.floor(Math.random() * 10) - 5; // 85-95 min
    }

    // Handle midnight wrap-around
    const adjustedMinutes = currentMinutesFromMidnight % 1440; // 1440 = 24 hours
    const startHours = Math.floor(adjustedMinutes / 60);
    const startMins = adjustedMinutes % 60;
    const startTime = `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}:00`;

    // Calculate duration based on distribution weight
    const durationMinutes = Math.round(totalRemMinutes * distributionWeights[i]);

    remCycles.push({
      cycleNumber: i + 1,
      startTime,
      durationMinutes,
      isInterrupted: disturbedCycles.includes(i),
      isPrimaryDream: primaryDreamCycles.includes(i),
    });
  }

  return remCycles;
}

/**
 * Calculate realistic REM distribution weights
 * REM periods naturally increase in duration as the night progresses
 */
function calculateREMDistribution(cycleCount: number): number[] {
  const weights: number[] = [];

  switch (cycleCount) {
    case 1:
      weights.push(1.0);
      break;
    case 2:
      weights.push(0.4, 0.6);
      break;
    case 3:
      weights.push(0.25, 0.35, 0.4);
      break;
    case 4:
      weights.push(0.15, 0.25, 0.3, 0.3);
      break;
    case 5:
      weights.push(0.12, 0.2, 0.25, 0.25, 0.18);
      break;
    default:
      // For 6+ cycles, use a gradual increase then slight decrease pattern
      for (let i = 0; i < cycleCount; i++) {
        if (i < cycleCount * 0.6) {
          // Gradual increase for first 60% of cycles
          weights.push(0.1 + (i / cycleCount) * 0.3);
        } else {
          // Slight decrease for final cycles
          weights.push(0.25 - ((i - cycleCount * 0.6) / cycleCount) * 0.1);
        }
      }
      break;
  }

  // Normalize weights to sum to 1.0
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return weights.map(w => w / sum);
}

/**
 * Distribute disturbances across cycles
 * Later cycles (especially 3-4) are more likely to be disturbed
 */
function distributeDisturbances(cycleCount: number, disturbanceCount: number): number[] {
  if (disturbanceCount === 0) {
    return [];
  }

  const disturbedCycles: number[] = [];
  const availableCycles = Array.from({ length: cycleCount }, (_, i) => i);

  // Weight later cycles as more likely to be disturbed
  const weights = availableCycles.map((_, i) => {
    if (i === 0) return 0.1; // First cycle rarely disturbed
    if (i === 1) return 0.2;
    return 0.7 / (cycleCount - 2); // Remaining probability distributed across later cycles
  });

  // Randomly select cycles to disturb based on weights
  for (let d = 0; d < Math.min(disturbanceCount, cycleCount); d++) {
    // Weighted random selection
    let random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < availableCycles.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative && !disturbedCycles.includes(availableCycles[i])) {
        disturbedCycles.push(availableCycles[i]);
        break;
      }
    }
  }

  return disturbedCycles;
}

/**
 * Identify which cycle(s) likely contain primary dreams
 * Research shows cycles 2-3 typically have most vivid, memorable dreams
 */
function identifyPrimaryDreamCycles(cycleCount: number): number[] {
  const primaryCycles: number[] = [];

  if (cycleCount === 1) {
    primaryCycles.push(0);
  } else if (cycleCount === 2) {
    primaryCycles.push(1); // Second cycle
  } else if (cycleCount === 3) {
    primaryCycles.push(1, 2); // Cycles 2 and 3
  } else if (cycleCount >= 4) {
    primaryCycles.push(1, 2); // Cycles 2 and 3 are typically most vivid
  }

  return primaryCycles;
}
