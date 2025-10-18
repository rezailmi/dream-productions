import { REMCycle } from '../constants/Types';

const MINUTES_IN_MILLISECOND = 1000 * 60;
const MINUTES_IN_DAY = 24 * 60;

const REM_DISTRIBUTION_PRESETS: Record<number, number[]> = {
  1: [1],
  2: [0.4, 0.6],
  3: [0.25, 0.35, 0.4],
  4: [0.15, 0.25, 0.3, 0.3],
  5: [0.12, 0.2, 0.25, 0.25, 0.18],
};

const parseSleepStart = (sleepStartTime: string): number | null => {
  const match = sleepStartTime.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return null;
  }

  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
};

const calculateRemDistribution = (cycleCount: number): number[] => {
  const preset = REM_DISTRIBUTION_PRESETS[cycleCount];
  if (preset) {
    return preset;
  }

  const weights: number[] = [];
  for (let index = 0; index < cycleCount; index += 1) {
    if (index < cycleCount * 0.6) {
      weights.push(0.1 + (index / cycleCount) * 0.3);
    } else {
      weights.push(0.25 - ((index - cycleCount * 0.6) / cycleCount) * 0.1);
    }
  }

  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  return weights.map((weight) => weight / sum);
};

const distributeDisturbances = (cycleCount: number, disturbanceCount: number): number[] => {
  if (disturbanceCount <= 0) {
    return [];
  }

  const disturbed: number[] = [];
  const weights = Array.from({ length: cycleCount }, (_value, index) => {
    if (index === 0) return 0.1;
    if (index === 1) return 0.2;
    const remainingCycles = Math.max(cycleCount - 2, 1);
    return 0.7 / remainingCycles;
  });

  for (let count = 0; count < Math.min(disturbanceCount, cycleCount); count += 1) {
    let random = Math.random();
    for (let index = 0; index < weights.length; index += 1) {
      random -= weights[index];
      if (random <= 0 && !disturbed.includes(index)) {
        disturbed.push(index);
        break;
      }
    }
  }

  return disturbed;
};

const identifyPrimaryDreamCycles = (cycleCount: number): number[] => {
  if (cycleCount <= 0) {
    return [];
  }

  if (cycleCount === 1) {
    return [0];
  }

  if (cycleCount === 2) {
    return [1];
  }

  return [1, 2];
};

const computeRemCyclesFromAggregate = (
  totalRemMilli: number,
  cycleCount: number,
  disturbanceCount: number,
  sleepStartTime: string,
): REMCycle[] => {
  if (cycleCount <= 0 || totalRemMilli <= 0) {
    return [];
  }

  const cappedCycles = Math.min(cycleCount, 12);
  const sleepStartMinutes = parseSleepStart(sleepStartTime);

  if (sleepStartMinutes == null) {
    console.warn('Unable to parse sleep start time for REM cycle generation:', sleepStartTime);
    return [];
  }

  const totalRemMinutes = totalRemMilli / MINUTES_IN_MILLISECOND;
  const distribution = calculateRemDistribution(cappedCycles);
  const disturbances = distributeDisturbances(cappedCycles, disturbanceCount);
  const primaryDreamCycles = identifyPrimaryDreamCycles(cappedCycles);

  const cycles: REMCycle[] = [];
  let minutesFromMidnight = sleepStartMinutes;

  for (let index = 0; index < cappedCycles; index += 1) {
    if (index === 0) {
      minutesFromMidnight += 75 + Math.floor(Math.random() * 15);
    } else {
      minutesFromMidnight += 85 + Math.floor(Math.random() * 10);
    }

    const adjustedMinutes = minutesFromMidnight % MINUTES_IN_DAY;
    const hours = Math.floor(adjustedMinutes / 60);
    const minutes = adjustedMinutes % 60;
    const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

    cycles.push({
      cycleNumber: index + 1,
      startTime,
      durationMinutes: Math.round(totalRemMinutes * distribution[index]),
      isInterrupted: disturbances.includes(index),
      isPrimaryDream: primaryDreamCycles.includes(index),
    });
  }

  return cycles;
};

export const generateRemCyclesFromAggregate = computeRemCyclesFromAggregate;
export const generateREMCyclesFromAggregate = computeRemCyclesFromAggregate;

