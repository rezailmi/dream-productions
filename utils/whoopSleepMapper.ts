import {
  SleepQuality,
  SleepSession,
  SleepStage,
  WhoopSleepRecord,
  WhoopStageSummary,
} from '../constants/Types';
import { generateRemCyclesFromAggregate } from './remCycleGenerator';

const MILLIS_PER_MINUTE = 60000;
const MINUTES_PER_DAY = 24 * 60;

type ParsedDate = {
  date: string;
  time: string;
  minutesFromMidnight: number;
};

type StageAccumulator = {
  stages: SleepStage[];
  currentMinutesFromMidnight: number;
};

const clampCycleCount = (cycleCount?: number): number => {
  if (!cycleCount || cycleCount <= 0) {
    return 0;
  }
  if (cycleCount > 12) {
    return 12;
  }
  return cycleCount;
};

const minutesFromMilliseconds = (milliseconds?: number): number => {
  if (!milliseconds || milliseconds <= 0) {
    return 0;
  }
  return Math.round(milliseconds / MILLIS_PER_MINUTE);
};

const parseIsoDateWithOffset = (
  isoString: string,
  timezoneOffset?: string,
): ParsedDate | null => {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    if (!timezoneOffset) {
      const iso = date.toISOString();
      const [datePart, timePart] = iso.split('T');
      const time = timePart.substring(0, 8);
      const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10));

      return {
        date: datePart,
        time,
        minutesFromMidnight: hours * 60 + minutes,
      };
    }

    const offsetMatch = timezoneOffset.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!offsetMatch) {
      return null;
    }

    const sign = offsetMatch[1] === '-' ? -1 : 1;
    const offsetHours = Number.parseInt(offsetMatch[2], 10);
    const offsetMinutes = Number.parseInt(offsetMatch[3], 10);
    const totalOffsetMinutes = sign * (offsetHours * 60 + offsetMinutes);

    const localMillis = date.getTime() + totalOffsetMinutes * MILLIS_PER_MINUTE;
    const localDate = new Date(localMillis);
    const iso = localDate.toISOString();
    const [datePart, timePart] = iso.split('T');
    const time = timePart.substring(0, 8);
    const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10));

    return {
      date: datePart,
      time,
      minutesFromMidnight: hours * 60 + minutes,
    };
  } catch (error) {
    console.warn('Failed to parse ISO date with offset', error);
    return null;
  }
};

const advanceMinutes = (minutesFromMidnight: number, delta: number): { time: string; minutes: number } => {
  const total = (minutesFromMidnight + delta + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return {
    time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
    minutes: total,
  };
};

const pushStage = (
  accumulator: StageAccumulator,
  type: SleepStage['type'],
  durationMinutes: number,
) => {
  if (durationMinutes <= 0) {
    return;
  }

  const { time, minutes } = advanceMinutes(accumulator.currentMinutesFromMidnight, 0);

  accumulator.stages.push({
    type,
    startTime: time,
    durationMinutes,
  });

  accumulator.currentMinutesFromMidnight = minutes + durationMinutes;
};

const buildStagesFromSummary = (
  summary: WhoopStageSummary | undefined,
  sleepStartMinutes: number,
): SleepStage[] => {
  if (!summary) {
    return [];
  }

  const accumulator: StageAccumulator = {
    stages: [],
    currentMinutesFromMidnight: sleepStartMinutes,
  };

  pushStage(accumulator, 'Awake', minutesFromMilliseconds(summary.total_awake_time_milli));
  pushStage(accumulator, 'Core', minutesFromMilliseconds(summary.total_light_sleep_time_milli));
  pushStage(accumulator, 'Deep', minutesFromMilliseconds(summary.total_slow_wave_sleep_time_milli));
  pushStage(accumulator, 'REM', minutesFromMilliseconds(summary.total_rem_sleep_time_milli));

  return accumulator.stages;
};

const inferSleepQuality = (performance?: number): SleepQuality => {
  if (performance == null) {
    return 'fair';
  }

  if (performance >= 90) {
    return 'excellent';
  }

  if (performance >= 75) {
    return 'good';
  }

  if (performance >= 50) {
    return 'fair';
  }

  return 'poor';
};

const deriveHeartRate = (efficiency?: number) => {
  if (!efficiency || efficiency <= 0) {
    return {
      restingBPM: 60,
      averageBPM: 56,
      minBPM: 52,
      maxBPM: 70,
    };
  }

  const resting = Math.max(Math.round(efficiency / 1.6), 48);

  return {
    restingBPM: resting,
    averageBPM: Math.max(resting - 5, 50),
    minBPM: Math.max(resting - 10, 45),
    maxBPM: resting + 12,
  };
};

export const mapWhoopRecordToSleepSession = (record: WhoopSleepRecord): SleepSession => {
  const stageSummary = record.score?.stage_summary;

  const startParsed = parseIsoDateWithOffset(record.start, record.timezone_offset);
  const endParsed = parseIsoDateWithOffset(record.end, record.timezone_offset);

  if (!startParsed || !endParsed) {
    throw new Error('Unable to parse WHOOP sleep timestamps');
  }

  const totalDurationMinutes = stageSummary
    ? minutesFromMilliseconds(stageSummary.total_in_bed_time_milli)
    : Math.max(minutesFromMilliseconds(new Date(record.end).getTime() - new Date(record.start).getTime()), 0);

  const cycleCount = clampCycleCount(stageSummary?.sleep_cycle_count);
  const disturbanceCount = stageSummary?.disturbance_count ?? 0;
  const totalRemMilli = stageSummary?.total_rem_sleep_time_milli ?? 0;

  const remCycles = generateRemCyclesFromAggregate(
    totalRemMilli,
    cycleCount,
    disturbanceCount,
    startParsed.time,
  );

  const stages = buildStagesFromSummary(stageSummary, startParsed.minutesFromMidnight);
  const sleepQuality = inferSleepQuality(record.score?.sleep_performance_percentage);
  const heartRate = deriveHeartRate(record.score?.sleep_efficiency_percentage);

  return {
    id: record.id,
    date: startParsed.date,
    startTime: startParsed.time,
    endTime: endParsed.time,
    totalDurationMinutes,
    sleepQuality,
    wakeUps: disturbanceCount,
    remCycles,
    stages,
    heartRateData: {
      ...heartRate,
      spikes: [],
    },
  };
};
