// TypeScript interfaces for Dream Machine

export type DataSource = 'demo' | 'apple-health' | 'whoop' | null;

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type SleepStageType = 'Core' | 'Deep' | 'REM' | 'Awake';

export interface SleepSession {
  id: string;
  date: string; // ISO format
  startTime: string; // "23:47:00"
  endTime: string; // "07:23:00"
  totalDurationMinutes: number;
  sleepQuality: SleepQuality;
  wakeUps: number;
  remCycles: REMCycle[];
  stages: SleepStage[];
  heartRateData: HeartRateData;
}

export interface WhoopStageSummary {
  total_in_bed_time_milli?: number;
  total_awake_time_milli?: number;
  total_no_data_time_milli?: number;
  total_light_sleep_time_milli?: number;
  total_slow_wave_sleep_time_milli?: number;
  total_rem_sleep_time_milli?: number;
  sleep_cycle_count?: number;
  disturbance_count?: number;
}

export interface WhoopSleepNeeded {
  baseline_milli?: number;
  need_from_sleep_debt_milli?: number;
  need_from_recent_strain_milli?: number;
  need_from_recent_nap_milli?: number;
}

export interface WhoopSleepScore {
  stage_summary?: WhoopStageSummary;
  sleep_needed?: WhoopSleepNeeded;
  respiratory_rate?: number;
  sleep_performance_percentage?: number;
  sleep_consistency_percentage?: number;
  sleep_efficiency_percentage?: number;
  [key: string]: unknown;
}

export interface WhoopSleepRecord {
  id: string;
  cycle_id?: number;
  v1_id?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  start: string;
  end: string;
  timezone_offset?: string;
  nap?: boolean;
  score_state?: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: WhoopSleepScore;
  [key: string]: unknown;
}

export interface REMCycle {
  cycleNumber: number;
  startTime: string;
  durationMinutes: number;
  isInterrupted: boolean;
  isPrimaryDream: boolean;
}

export interface SleepStage {
  type: SleepStageType;
  startTime: string;
  durationMinutes: number;
}

export interface HeartRateData {
  restingBPM: number;
  averageBPM: number;
  minBPM: number;
  maxBPM: number;
  spikes: HeartRateSpike[];
}

export interface HeartRateSpike {
  time: string;
  bpm: number;
  percentageAboveBaseline: number;
  context: string;
}

export interface HealthDataContextType {
  dataSource: DataSource;
  sleepSessions: (SleepSession | WhoopSleepRecord)[];
  dreams: Dream[];
  whoopAccessToken: string | null;
  setDataSource: (source: DataSource) => void;
  setWhoopAccessToken: (token: string | null) => void;
  fetchSleepData: () => Promise<void>;
  generateDream: (sleepSessionId: string) => Promise<void>;
  deleteDream: (dreamId: string) => Promise<void>;
  isGeneratingDream: boolean;
  getSleepSessionByDate: (date: string) => SleepSession | WhoopSleepRecord | null;
  getDreamByDate: (date: string) => Dream | null;
  fetchWhoopSleepData: (startDate: string, endDate: string) => Promise<void>;
}

export interface DayCardData {
  date: string;
  dateLabel: string;
  sleepSession: SleepSession | WhoopSleepRecord | null;
  dream: Dream | null;
  isToday: boolean;
}

export interface Dream {
  id: string;
  sleepSessionId: string;
  title: string;
  narrative: string;
  mood: string;
  emotionalContext: string;
  scenes: DreamScene[];
  videoUrl?: string;
  status: 'generating' | 'complete' | 'failed';
  generatedAt: string;
  error?: string;
}

export interface DreamScene {
  sceneNumber: number;
  description: string;
  prompt: string;
  duration: number;
}

