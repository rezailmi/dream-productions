import axios, { AxiosInstance } from 'axios';

// Configure your backend API URL
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000' // Development
  : 'https://your-production-api.com'; // Production

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 300000, // 5 minutes (for video generation)
    });
  }

  // WHOOP API
  async fetchWhoopSleep(accessToken: string, params?: { limit?: number; start?: string; end?: string }) {
    const response = await this.client.get('/api/whoop/sleep', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return response.data;
  }

  async fetchWhoopSleepById(accessToken: string, sleepId: string) {
    const response = await this.client.get(`/api/whoop/sleep/${sleepId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  async fetchWhoopRecovery(accessToken: string, cycleId: number) {
    const response = await this.client.get(`/api/whoop/recovery/${cycleId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  // Dream API
  async generateDream(sleepData: any) {
    const response = await this.client.post('/api/dreams/generate', {
      sleepData,
    });
    return response.data;
  }

  async generateNarrative(sleepData: any) {
    const response = await this.client.post('/api/dreams/narrative', {
      sleepData,
    });
    return response.data;
  }

  async generateVideo(prompt: string, duration: number = 8, resolution: string = '1080p') {
    const response = await this.client.post('/api/dreams/video', {
      prompt,
      duration,
      resolution,
    });
    return response.data;
  }

  async checkVideoStatus(operationId: string) {
    const response = await this.client.get(`/api/dreams/video/status/${operationId}`);
    return response.data;
  }
}

export default new APIClient();
