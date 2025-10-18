import axios, { AxiosInstance } from 'axios';
import { WhoopSleepData, WhoopRecoveryData } from '../types';
import { generateREMCyclesFromAggregate } from '../utils/remCycleGenerator';

export class WhoopService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.prod.whoop.com/developer/v2',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get all sleep data for a user with pagination
   */
  async getSleepData(
    accessToken: string,
    params?: {
      limit?: number;
      start?: string;
      end?: string;
      nextToken?: string;
    }
  ): Promise<{ records: WhoopSleepData[]; next_token?: string }> {
    try {
      const response = await this.client.get('/activity/sleep', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit: params?.limit || 10,
          start: params?.start,
          end: params?.end,
          nextToken: params?.nextToken,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('WHOOP API Error (getSleepData):', error.response?.data || error.message);
      throw new Error(`Failed to fetch sleep data: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get specific sleep session by ID
   */
  async getSleepById(accessToken: string, sleepId: string): Promise<WhoopSleepData> {
    try {
      const response = await this.client.get(`/activity/sleep/${sleepId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('WHOOP API Error (getSleepById):', error.response?.data || error.message);
      throw new Error(`Failed to fetch sleep by ID: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get recovery data for a specific cycle
   */
  async getRecoveryByCycle(accessToken: string, cycleId: number): Promise<WhoopRecoveryData> {
    try {
      const response = await this.client.get(`/cycle/${cycleId}/recovery`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('WHOOP API Error (getRecoveryByCycle):', error.response?.data || error.message);
      throw new Error(`Failed to fetch recovery data: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Map WHOOP sleep data to app's SleepSession format
   */
  mapWhoopToSleepSession(whoopData: WhoopSleepData, recoveryData?: WhoopRecoveryData): any {
    const score = whoopData.score;
    if (!score) {
      throw new Error('Sleep data is not scored yet');
    }

    // Generate realistic REM cycles from WHOOP aggregate data
    // WHOOP only provides totals, not individual cycle timing
    const totalRemMilli = score.stage_summary.total_rem_sleep_time_milli;
    const cycleCount = score.stage_summary.sleep_cycle_count;
    const disturbanceCount = score.stage_summary.disturbance_count;
    const sleepStartTime = whoopData.start.split('T')[1].substring(0, 8);

    const remCycles = generateREMCyclesFromAggregate(
      totalRemMilli,
      cycleCount,
      disturbanceCount,
      sleepStartTime
    );

    // Map sleep stages
    const stages = [
      {
        type: 'Awake' as const,
        startTime: whoopData.start,
        durationMinutes: Math.round(score.stage_summary.total_awake_time_milli / 60000),
      },
      {
        type: 'Core' as const, // Map light sleep to Core
        startTime: whoopData.start,
        durationMinutes: Math.round(score.stage_summary.total_light_sleep_time_milli / 60000),
      },
      {
        type: 'Deep' as const,
        startTime: whoopData.start,
        durationMinutes: Math.round(score.stage_summary.total_slow_wave_sleep_time_milli / 60000),
      },
      {
        type: 'REM' as const,
        startTime: whoopData.start,
        durationMinutes: Math.round(score.stage_summary.total_rem_sleep_time_milli / 60000),
      },
    ];

    // Calculate sleep quality based on WHOOP metrics
    let sleepQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'fair';
    if (score.sleep_performance_percentage >= 90) sleepQuality = 'excellent';
    else if (score.sleep_performance_percentage >= 75) sleepQuality = 'good';
    else if (score.sleep_performance_percentage < 50) sleepQuality = 'poor';

    return {
      id: whoopData.id,
      date: whoopData.start.split('T')[0],
      startTime: whoopData.start.split('T')[1].substring(0, 8),
      endTime: whoopData.end.split('T')[1].substring(0, 8),
      totalDurationMinutes: Math.round(score.stage_summary.total_in_bed_time_milli / 60000),
      sleepQuality,
      wakeUps: score.stage_summary.disturbance_count,
      remCycles,
      stages,
      heartRateData: {
        restingBPM: recoveryData?.score?.resting_heart_rate || 60,
        averageBPM: recoveryData?.score?.resting_heart_rate || 60,
        minBPM: (recoveryData?.score?.resting_heart_rate || 60) - 10,
        maxBPM: (recoveryData?.score?.resting_heart_rate || 60) + 20,
        spikes: [], // WHOOP doesn't provide granular heart rate spikes
      },
    };
  }
}
