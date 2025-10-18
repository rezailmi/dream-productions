// Shared types for Dream Machine backend

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type SleepStageType = 'Core' | 'Deep' | 'REM' | 'Awake';

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

export interface HeartRateSpike {
  time: string;
  bpm: number;
  percentageAboveBaseline: number;
  context: string;
}

export interface HeartRateData {
  restingBPM: number;
  averageBPM: number;
  minBPM: number;
  maxBPM: number;
  spikes: HeartRateSpike[];
}

// Demo sleep data format (used when not connected to WHOOP)
export interface SleepSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalDurationMinutes: number;
  sleepQuality: SleepQuality;
  wakeUps: number;
  remCycles: REMCycle[];
  stages: SleepStage[];
  heartRateData: HeartRateData;
}

export interface WhoopSleepData {
  id: string;
  cycle_id: number;
  v1_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  };
}

export interface WhoopRecoveryData {
  cycle_id: number;
  sleep_id: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
  score?: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage: number;
    skin_temp_celsius: number;
  };
}

export interface DreamNarrative {
  title: string;
  scenes: DreamScene[];
  narrative: string;
  mood: string;
  emotionalContext: string;
}

export interface DreamScene {
  sceneNumber: number;
  description: string;
  prompt: string; // Optimized for video generation
  duration: number; // seconds
}

export interface VeoVideoRequest {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  durationSeconds: 4 | 6 | 8;
  resolution: '720p' | '1080p';
  generateAudio: boolean;
}

export interface SleepVideoContext {
  date?: string;
  sleepQuality?: SleepQuality;
  totalDurationMinutes?: number;
  remDurationMinutes?: number;
  deepDurationMinutes?: number;
  wakeUps?: number;
  respiratoryRate?: number;
  heartRate?: {
    resting?: number;
    average?: number;
    min?: number;
    max?: number;
  };
}

export interface VeoPromptContext {
  narrative: DreamNarrative;
  sleepMetrics?: SleepVideoContext;
}

export interface VeoVideoResponse {
  operationId: string;
  videoUrl?: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  error?: string;
}

export interface GenerateDreamRequest {
  sleepId: string;
  userId: number;
}

export interface GenerateDreamResponse {
  id: string;
  sleepId: string;
  userId: number;
  narrative: DreamNarrative;
  videoUrl?: string;
  status: 'generating' | 'complete' | 'failed';
  generatedAt: string;
  error?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// Union type for sleep data - can be either WHOOP or demo format
export type AnySleepData = WhoopSleepData | SleepSession;
