import axios from 'axios';
import { VeoVideoRequest, VeoVideoResponse } from '../types';

interface GoogleVeoOperation {
  name: string;
  done?: boolean;
  error?: {
    code: number;
    message: string;
  };
  response?: {
    generated_videos: Array<{
      video: {
        uri: string;
      };
    }>;
  };
}

export class GoogleVeoService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GOOGLE_VEO_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  GOOGLE_VEO_API_KEY not configured - video generation will be skipped');
    }
  }

  /**
   * Generate a video using Google Veo 3.1
   */
  async generateVideo(request: VeoVideoRequest): Promise<VeoVideoResponse> {
    if (!this.apiKey) {
      throw new Error('Google Veo API key not configured');
    }

    try {
      console.log('Google Veo Request:', {
        prompt: request.prompt.substring(0, 100) + '...',
        duration: request.durationSeconds + 's',
        resolution: request.resolution,
      });

      // Start video generation operation
      const response = await axios.post<GoogleVeoOperation>(
        `${this.baseUrl}/models/veo-3.1-generate-preview:predictLongRunning`,
        {
          instances: [
            {
              prompt: request.prompt,
            },
          ],
          parameters: {
            aspectRatio: request.aspectRatio,
            resolution: request.resolution,
            durationSeconds: request.durationSeconds,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
        }
      );

      const operationName = response.data.name;
      console.log(`Video generation started: ${operationName}`);

      return {
        operationId: operationName,
        status: 'pending',
      };
    } catch (error: any) {
      console.error('Google Veo Error:', error.response?.data || error.message);
      return {
        operationId: `error_${Date.now()}`,
        status: 'failed',
        error: error.response?.data?.error?.message || error.message || 'Failed to start video generation',
      };
    }
  }

  /**
   * Check the status of a video generation operation
   */
  async checkVideoStatus(operationId: string): Promise<VeoVideoResponse> {
    if (!this.apiKey) {
      throw new Error('Google Veo API key not configured');
    }

    try {
      const response = await axios.get<GoogleVeoOperation>(`${this.baseUrl}/${operationId}`, {
        headers: {
          'x-goog-api-key': this.apiKey,
        },
      });

      const operation = response.data;

      if (operation.error) {
        return {
          operationId,
          status: 'failed',
          error: operation.error.message,
        };
      }

      if (!operation.done) {
        return {
          operationId,
          status: 'processing',
        };
      }

      // Operation is complete
      const videoUri = operation.response?.generated_videos?.[0]?.video?.uri;

      if (!videoUri) {
        return {
          operationId,
          status: 'failed',
          error: 'No video URI in response',
        };
      }

      return {
        operationId,
        videoUrl: videoUri,
        status: 'complete',
      };
    } catch (error: any) {
      console.error('Google Veo status check error:', error.response?.data || error.message);
      return {
        operationId,
        status: 'failed',
        error: error.response?.data?.error?.message || error.message || 'Failed to check video status',
      };
    }
  }

  /**
   * Wait for video generation to complete with polling
   */
  async waitForVideo(operationId: string, timeoutMs: number = 180000): Promise<VeoVideoResponse> {
    const startTime = Date.now();
    const pollInterval = 5000; // Poll every 5 seconds

    console.log(`Waiting for video completion: ${operationId}`);

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.checkVideoStatus(operationId);

        if (status.status === 'complete') {
          console.log('Video generation complete!');
          return status;
        }

        if (status.status === 'failed') {
          console.error('Video generation failed:', status.error);
          return status;
        }

        // Still processing, wait before next poll
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        console.error('Google Veo wait error:', error.message);
        return {
          operationId,
          status: 'failed',
          error: error.message || 'Failed while waiting for video',
        };
      }
    }

    // Timeout reached
    console.warn('Video generation timed out');
    return {
      operationId,
      status: 'failed',
      error: 'Video generation timed out',
    };
  }
}
