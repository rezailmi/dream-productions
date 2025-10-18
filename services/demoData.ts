import {
  SleepSession,
  WhoopSleepRecord,
  WhoopSleepScore,
  WhoopStageSummary,
} from '../constants/Types';
import { generateRemCyclesFromAggregate } from '../utils/remCycleGenerator';

type DemoWhoopRecord = WhoopSleepRecord & { score: WhoopSleepScore };

type DemoSleepBundle = {
  raw: DemoWhoopRecord;
  mapped: SleepSession;
};

const minutesFromMilliseconds = (value: number): number => Math.round(value / 60000);

const buildStages = (summary: WhoopStageSummary, sleepStart: string) => {
  const stages = [] as SleepSession['stages'];

  const startParts = sleepStart.split(':');
  const baseMinutes = Number.parseInt(startParts[0], 10) * 60 + Number.parseInt(startParts[1], 10);

  const pushStage = (type: SleepSession['stages'][number]['type'], durationMinutes: number, offsetMinutes: number) => {
    const total = baseMinutes + offsetMinutes;
    const hours = Math.floor(total / 60) % 24;
    const minutes = total % 60;
    stages.push({
      type,
      startTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
      durationMinutes,
    });
  };

  let offset = 0;

  const pushIfPositive = (
    type: SleepSession['stages'][number]['type'],
    duration: number,
  ) => {
    if (duration > 0) {
      pushStage(type, duration, offset);
      offset += duration;
    }
  };

  pushIfPositive('Awake', minutesFromMilliseconds(summary.total_awake_time_milli ?? 0));
  pushIfPositive('Core', minutesFromMilliseconds(summary.total_light_sleep_time_milli ?? 0));
  pushIfPositive('Deep', minutesFromMilliseconds(summary.total_slow_wave_sleep_time_milli ?? 0));
  pushIfPositive('REM', minutesFromMilliseconds(summary.total_rem_sleep_time_milli ?? 0));

  return stages;
};

const inferQuality = (percentage?: number) => {
  if (!percentage) return 'fair';
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 50) return 'fair';
  return 'poor';
};

const convertRecord = (record: DemoWhoopRecord): SleepSession => {
  const { score } = record;
  const summary = score.stage_summary ?? {};

  const start = new Date(record.start);
  const end = new Date(record.end);
  const date = start.toISOString().split('T')[0];
  const startTime = start.toISOString().split('T')[1].substring(0, 8);
  const endTime = end.toISOString().split('T')[1].substring(0, 8);

  const remCycles = generateRemCyclesFromAggregate(
    summary.total_rem_sleep_time_milli ?? 0,
    summary.sleep_cycle_count ?? 0,
    summary.disturbance_count ?? 0,
    startTime,
  );

  const stages = buildStages(summary, startTime);

  const sleepQuality = inferQuality(score.sleep_performance_percentage);

  const resting = score.sleep_efficiency_percentage
    ? Math.max(Math.round(score.sleep_efficiency_percentage / 1.5), 48)
    : 58;

  return {
    id: record.id,
    date,
    startTime,
    endTime,
    totalDurationMinutes: minutesFromMilliseconds(summary.total_in_bed_time_milli ?? (end.getTime() - start.getTime())),
    sleepQuality,
    wakeUps: summary.disturbance_count ?? 0,
    remCycles,
    stages,
    heartRateData: {
      restingBPM: resting,
      averageBPM: Math.max(resting - 4, 50),
      minBPM: Math.max(resting - 8, 45),
      maxBPM: resting + 12,
      spikes: [],
    },
  };
};

const DEMO_WHOOP_RAW: DemoWhoopRecord[] = [
  {
    id: 'whoop-demo-0',
    cycle_id: 123456,
    v1_id: 789012,
    user_id: 24680,
    created_at: '2025-10-19T08:00:00.000Z',
    updated_at: '2025-10-19T08:00:00.000Z',
    start: '2025-10-18T23:30:00.000Z',
    end: '2025-10-19T07:45:00.000Z',
    timezone_offset: '-04:00',
    nap: false,
    score_state: 'SCORED',
    score: {
      stage_summary: {
        total_in_bed_time_milli: 495 * 60000,
        total_awake_time_milli: 26 * 60000,
        total_no_data_time_milli: 0,
        total_light_sleep_time_milli: 210 * 60000,
        total_slow_wave_sleep_time_milli: 130 * 60000,
        total_rem_sleep_time_milli: 105 * 60000,
        sleep_cycle_count: 4,
        disturbance_count: 1,
      },
      sleep_needed: {
        baseline_milli: 8 * 3600000,
        need_from_sleep_debt_milli: 15 * 60000,
        need_from_recent_strain_milli: 25 * 60000,
        need_from_recent_nap_milli: 0,
      },
      respiratory_rate: 14.6,
      sleep_performance_percentage: 92,
      sleep_consistency_percentage: 88,
      sleep_efficiency_percentage: 94,
    },
  },
  {
    id: 'whoop-demo-1',
    cycle_id: 123457,
    v1_id: 789013,
    user_id: 24680,
    created_at: '2025-10-18T08:00:00.000Z',
    updated_at: '2025-10-18T08:00:00.000Z',
    start: '2025-10-17T23:45:00.000Z',
    end: '2025-10-18T07:10:00.000Z',
    timezone_offset: '-04:00',
    nap: false,
    score_state: 'SCORED',
    score: {
      stage_summary: {
        total_in_bed_time_milli: 445 * 60000,
        total_awake_time_milli: 35 * 60000,
        total_no_data_time_milli: 0,
        total_light_sleep_time_milli: 185 * 60000,
        total_slow_wave_sleep_time_milli: 118 * 60000,
        total_rem_sleep_time_milli: 90 * 60000,
        sleep_cycle_count: 4,
        disturbance_count: 2,
      },
      sleep_needed: {
        baseline_milli: 7.8 * 3600000,
        need_from_sleep_debt_milli: 45 * 60000,
        need_from_recent_strain_milli: 30 * 60000,
        need_from_recent_nap_milli: 0,
      },
      respiratory_rate: 14.9,
      sleep_performance_percentage: 83,
      sleep_consistency_percentage: 79,
      sleep_efficiency_percentage: 88,
    },
  },
  {
    id: 'whoop-demo-2',
    cycle_id: 123458,
    v1_id: 789014,
    user_id: 24680,
    created_at: '2025-10-17T08:00:00.000Z',
    updated_at: '2025-10-17T08:00:00.000Z',
    start: '2025-10-16T23:20:00.000Z',
    end: '2025-10-17T06:50:00.000Z',
    timezone_offset: '-04:00',
    nap: false,
    score_state: 'SCORED',
    score: {
      stage_summary: {
        total_in_bed_time_milli: 450 * 60000,
        total_awake_time_milli: 28 * 60000,
        total_no_data_time_milli: 0,
        total_light_sleep_time_milli: 200 * 60000,
        total_slow_wave_sleep_time_milli: 120 * 60000,
        total_rem_sleep_time_milli: 100 * 60000,
        sleep_cycle_count: 4,
        disturbance_count: 1,
      },
      sleep_needed: {
        baseline_milli: 7.6 * 3600000,
        need_from_sleep_debt_milli: 30 * 60000,
        need_from_recent_strain_milli: 20 * 60000,
        need_from_recent_nap_milli: 0,
      },
      respiratory_rate: 14.3,
      sleep_performance_percentage: 87,
      sleep_consistency_percentage: 84,
      sleep_efficiency_percentage: 91,
    },
  },
  {
    id: 'whoop-demo-3',
    cycle_id: 123459,
    v1_id: 789015,
    user_id: 24680,
    created_at: '2025-10-16T08:00:00.000Z',
    updated_at: '2025-10-16T08:00:00.000Z',
    start: '2025-10-15T23:50:00.000Z',
    end: '2025-10-16T07:30:00.000Z',
    timezone_offset: '-04:00',
    nap: false,
    score_state: 'SCORED',
    score: {
      stage_summary: {
        total_in_bed_time_milli: 460 * 60000,
        total_awake_time_milli: 45 * 60000,
        total_no_data_time_milli: 0,
        total_light_sleep_time_milli: 205 * 60000,
        total_slow_wave_sleep_time_milli: 110 * 60000,
        total_rem_sleep_time_milli: 95 * 60000,
        sleep_cycle_count: 4,
        disturbance_count: 3,
      },
      sleep_needed: {
        baseline_milli: 7.9 * 3600000,
        need_from_sleep_debt_milli: 55 * 60000,
        need_from_recent_strain_milli: 18 * 60000,
        need_from_recent_nap_milli: 0,
      },
      respiratory_rate: 15.2,
      sleep_performance_percentage: 74,
      sleep_consistency_percentage: 72,
      sleep_efficiency_percentage: 85,
    },
  },
];

const DEMO_WHOOP_BUNDLE: DemoSleepBundle[] = DEMO_WHOOP_RAW.map((record) => ({
  raw: record,
  mapped: convertRecord(record),
}));

export const DEMO_WHOOP_RECORDS: WhoopSleepRecord[] = DEMO_WHOOP_BUNDLE.map((bundle) => bundle.raw);
export const DEMO_SLEEP_DATA: SleepSession[] = DEMO_WHOOP_BUNDLE.map((bundle) => bundle.mapped);

