import axios, { AxiosInstance } from 'axios';
import { WhoopSleepData, WhoopRecoveryData } from '../types';
import { generateRemCyclesFromAggregate } from '../utils/remCycleGenerator';

export class WhoopService {
  private client: AxiosInstance;

  constructor() {
    // Use configurable base URL, defaulting to v1 API that is currently live
    // Docs: https://developer.whoop.com/api
    const baseURL = process.env.WHOOP_API_BASE_URL || 'https://api.prod.whoop.com/developer/v1';
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for debugging
    this.client.interceptors.request.use(
      (config) => {
        console.log('WHOOP API Request:', {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL}${config.url}`,
          params: config.params,
          hasAuth: !!config.headers?.Authorization,
        });
        return config;
      },
      (error) => {
        console.error('WHOOP API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for debugging
    this.client.interceptors.response.use(
      (response) => {
        console.log('WHOOP API Response:', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length,
        });
        return response;
      },
      (error) => {
        console.error('WHOOP API Error Response:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
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
      // Build query params with defaults
      const requestedLimit = params?.limit ?? 10;
      const limit = Math.min(Math.max(requestedLimit, 1), 25);

      const queryParams: any = {
        limit,
      };

      if (requestedLimit > 25) {
        console.warn(
          `WHOOP API limit capped to 25 (requested ${requestedLimit})`
        );
      }

      // Default to last 30 days if no date range provided
      if (!params?.start && !params?.end) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        queryParams.start = thirtyDaysAgo.toISOString();
        queryParams.end = now.toISOString();
      } else {
        // Use provided dates (must be in ISO 8601 format)
        if (params?.start) queryParams.start = params.start;
        if (params?.end) queryParams.end = params.end;
      }

      // WHOOP API uses next_token (snake_case), not nextToken
      if (params?.nextToken) queryParams.next_token = params.nextToken;

      // v1 API uses /activity/sleep endpoint
      const response = await this.client.get('/activity/sleep', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: queryParams,
      });

      return response.data;
    } catch (error: any) {
      console.error('WHOOP API Error (getSleepData):', {
        status: error.response?.status,
        message: error.response?.statusText || error.message,
        details: error.response?.data,
      });

      // Preserve the original error with response for proper status code handling
      if (error.response) {
        const preservedError: any = new Error(
          `Failed to fetch sleep data: ${error.response?.data?.message || error.response?.data?.error || error.message}`
        );
        preservedError.response = error.response;
        throw preservedError;
      }
      throw error;
    }
  }

  /**
   * Get specific sleep session by ID
   * Note: In v2, sleep IDs are UUIDs. Response includes both id (UUID) and v1_id (integer)
   */
  async getSleepById(accessToken: string, sleepId: string): Promise<WhoopSleepData> {
    try {
      // v1 API uses /activity/sleep/{id} endpoint
      const response = await this.client.get(`/activity/sleep/${sleepId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('WHOOP API Error (getSleepById):', {
        status: error.response?.status,
        message: error.response?.statusText || error.message,
        details: error.response?.data,
      });

      // Preserve the original error with response for proper status code handling
      if (error.response) {
        const preservedError: any = new Error(
          `Failed to fetch sleep by ID: ${error.response?.data?.message || error.response?.data?.error || error.message}`
        );
        preservedError.response = error.response;
        throw preservedError;
      }
      throw error;
    }
  }

  /**
   * Get recovery data for a specific cycle
   * Note: In v2, use the /v2/recovery endpoint with cycle_id parameter
   */
  async getRecoveryByCycle(accessToken: string, cycleId: string): Promise<WhoopRecoveryData> {
    try {
      // v1 API uses /cycle/{id}/recovery endpoint for recovery data
      const response = await this.client.get(`/cycle/${cycleId}/recovery`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('WHOOP API Error (getRecoveryByCycle):', {
        status: error.response?.status,
        message: error.response?.statusText || error.message,
        details: error.response?.data,
      });

      // Preserve the original error with response for proper status code handling
      if (error.response) {
        const preservedError: any = new Error(
          `Failed to fetch recovery data: ${error.response?.data?.message || error.response?.data?.error || error.message}`
        );
        preservedError.response = error.response;
        throw preservedError;
      }
      throw error;
    }
  }

  /**
   * Safely parse ISO datetime string to extract date and time
   */
  private parseISODateTime(isoString: string): { date: string; time: string } | null {
    try {
      if (!isoString || typeof isoString !== 'string') {
        return null;
      }

      const parts = isoString.split('T');
      if (parts.length !== 2) {
        return null;
      }

      const date = parts[0];
      const time = parts[1].substring(0, 8); // Get HH:MM:SS

      // Validate format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}:\d{2}/.test(time)) {
        return null;
      }

      return { date, time };
    } catch (error) {
      console.error('Error parsing ISO datetime:', error);
      return null;
    }
  }

  /**
   * Parse ISO datetime and apply timezone offset to get local time
   */
  private parseISODateTimeWithOffset(
    isoString: string,
    timezoneOffset: string
  ): { date: string; time: string } | null {
    try {
      if (!isoString || typeof isoString !== 'string') {
        return null;
      }

      // Parse the ISO string to Date (UTC)
      const utcDate = new Date(isoString);
      if (isNaN(utcDate.getTime())) {
        return null;
      }

      // Parse timezone offset (e.g., "+05:00" or "-08:00")
      const offsetMatch = timezoneOffset?.match(/^([+-])(\d{2}):(\d{2})$/);
      if (!offsetMatch) {
        console.warn('Invalid timezone offset format:', timezoneOffset);
        return this.parseISODateTime(isoString); // Fallback to UTC parsing
      }

      const sign = offsetMatch[1] === '+' ? 1 : -1;
      const hours = parseInt(offsetMatch[2], 10);
      const minutes = parseInt(offsetMatch[3], 10);
      const offsetMillis = sign * (hours * 60 + minutes) * 60 * 1000;

      // Apply offset to get local time
      const localDate = new Date(utcDate.getTime() + offsetMillis);

      // Extract date and time components (using UTC methods since we already applied offset)
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');
      const hour = String(localDate.getUTCHours()).padStart(2, '0');
      const minute = String(localDate.getUTCMinutes()).padStart(2, '0');
      const second = String(localDate.getUTCSeconds()).padStart(2, '0');

      return {
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minute}:${second}`,
      };
    } catch (error) {
      console.error('Error parsing ISO datetime with offset:', error);
      return null;
    }
  }

  /**
   * Map WHOOP sleep data to app's SleepSession format
   */
  mapWhoopToSleepSession(whoopData: WhoopSleepData, recoveryData?: WhoopRecoveryData): any {
    // Validate required fields
    const score = whoopData?.score;
    if (!score || !score.stage_summary) {
      throw new Error('Sleep data is not scored yet or missing stage summary');
    }

    // Safely parse start and end times with timezone offset
    const startParsed = this.parseISODateTimeWithOffset(
      whoopData.start,
      whoopData.timezone_offset
    );
    const endParsed = this.parseISODateTimeWithOffset(
      whoopData.end,
      whoopData.timezone_offset
    );

    if (!startParsed || !endParsed) {
      throw new Error('Invalid date format in WHOOP sleep data');
    }

    // Safe access to stage summary with defaults
    const stageSummary = score.stage_summary;
    const totalRemMilli = stageSummary.total_rem_sleep_time_milli ?? 0;
    const cycleCount = stageSummary.sleep_cycle_count ?? 0;
    const disturbanceCount = stageSummary.disturbance_count ?? 0;
    const totalInBedMilli = stageSummary.total_in_bed_time_milli ?? 0;
    const totalAwakeMilli = stageSummary.total_awake_time_milli ?? 0;
    const totalLightMilli = stageSummary.total_light_sleep_time_milli ?? 0;
    const totalDeepMilli = stageSummary.total_slow_wave_sleep_time_milli ?? 0;

    // Generate realistic REM cycles from WHOOP aggregate data
    const remCycles = generateRemCyclesFromAggregate(
      totalRemMilli,
      cycleCount,
      disturbanceCount,
      startParsed.time
    );

    // Map sleep stages with safe division
    const stages = [
      {
        type: 'Awake' as const,
        startTime: whoopData.start,
        durationMinutes: Math.round(totalAwakeMilli / 60000) || 0,
      },
      {
        type: 'Core' as const, // Map light sleep to Core
        startTime: whoopData.start,
        durationMinutes: Math.round(totalLightMilli / 60000) || 0,
      },
      {
        type: 'Deep' as const,
        startTime: whoopData.start,
        durationMinutes: Math.round(totalDeepMilli / 60000) || 0,
      },
      {
        type: 'REM' as const,
        startTime: whoopData.start,
        durationMinutes: Math.round(totalRemMilli / 60000) || 0,
      },
    ];

    // Calculate sleep quality based on WHOOP metrics
    const sleepPerf = score.sleep_performance_percentage ?? 50;
    let sleepQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'fair';
    if (sleepPerf >= 90) sleepQuality = 'excellent';
    else if (sleepPerf >= 75) sleepQuality = 'good';
    else if (sleepPerf >= 50) sleepQuality = 'fair';
    else sleepQuality = 'poor';

    // Heart rate data with better estimation
    const restingHR = recoveryData?.score?.resting_heart_rate;
    const hasHRData = restingHR != null && restingHR > 0;

    return {
      id: whoopData.id,
      date: startParsed.date,
      startTime: startParsed.time,
      endTime: endParsed.time,
      totalDurationMinutes: Math.round(totalInBedMilli / 60000) || 0,
      sleepQuality,
      wakeUps: disturbanceCount,
      remCycles,
      stages,
      heartRateData: hasHRData ? {
        restingBPM: restingHR,
        // Average during sleep is typically 5-10 BPM below resting
        averageBPM: Math.round(restingHR * 0.92),
        // Min during deep sleep is typically 10-15 below resting
        minBPM: Math.round(restingHR * 0.85),
        // Max during REM can be 5-10 above resting
        maxBPM: Math.round(restingHR * 1.1),
        spikes: [], // WHOOP doesn't provide granular heart rate spikes
      } : {
        // No HR data available - use typical adult values
        restingBPM: 65,
        averageBPM: 60,
        minBPM: 55,
        maxBPM: 72,
        spikes: [],
      },
    };
  }
}
