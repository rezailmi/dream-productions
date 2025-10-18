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
  sleepSessions: SleepSession[];
  dreams: Dream[];
  whoopAccessToken: string | null;
  setDataSource: (source: DataSource) => void;
  setWhoopAccessToken: (token: string | null) => void;
  fetchSleepData: () => Promise<void>;
  generateDream: (sleepSessionId: string) => Promise<void>;
  isGeneratingDream: boolean;
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

