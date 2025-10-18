import { fal } from '@fal-ai/client';
import { VeoVideoRequest, VeoVideoResponse } from '../types';

export class VeoService {
  constructor() {
    // Configure Fal.ai client with API key
    fal.config({
      credentials: process.env.FAL_API_KEY,
    });

    if (!process.env.FAL_API_KEY) {
      console.warn('FAL_API_KEY environment variable is not set');
    }
  }

  /**
   * Generate video using Fal.ai Veo3 API
   * Uses the subscribe method which waits for completion
   */
  async generateVideo(request: VeoVideoRequest): Promise<VeoVideoResponse> {
    try {
      console.log('Fal.ai Veo3 Request:', {
        prompt: request.prompt.substring(0, 100) + '...',
        duration: `${request.durationSeconds}s`,
        resolution: request.resolution,
      });

      // Use fal.subscribe for synchronous waiting (recommended)
      const result = await fal.subscribe('fal-ai/veo3', {
        input: {
          prompt: request.prompt,
          aspect_ratio: request.aspectRatio,
          duration: `${request.durationSeconds}s` as '4s' | '6s' | '8s',
          resolution: request.resolution,
          generate_audio: request.generateAudio,
          enhance_prompt: true, // Let Fal.ai enhance the prompt for better results
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('Video generation in progress...');
          }
        },
      });

      console.log('Fal.ai video generation complete!');

      return {
        operationId: (result as any).requestId || `veo_${Date.now()}`,
        status: 'complete',
        videoUrl: (result as any).video.url,
      };
    } catch (error: any) {
      console.error('Fal.ai Veo Error:', error);
      return {
        operationId: `error_${Date.now()}`,
        status: 'failed',
        error: error.message || 'Failed to generate video with Fal.ai',
      };
    }
  }

  /**
   * Generate video asynchronously using queue
   * Returns immediately with operation ID for later status checking
   */
  async generateVideoAsync(request: VeoVideoRequest): Promise<VeoVideoResponse> {
    try {
      const { request_id } = await fal.queue.submit('fal-ai/veo3', {
        input: {
          prompt: request.prompt,
          aspect_ratio: request.aspectRatio,
          duration: `${request.durationSeconds}s` as '4s' | '6s' | '8s',
          resolution: request.resolution,
          generate_audio: request.generateAudio,
          enhance_prompt: true,
        },
      });

      console.log('Fal.ai async video generation started:', request_id);

      return {
        operationId: request_id,
        status: 'pending',
      };
    } catch (error: any) {
      console.error('Fal.ai queue submission error:', error);
      return {
        operationId: `error_${Date.now()}`,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Check the status of a video generation operation
   */
  async checkVideoStatus(operationId: string): Promise<VeoVideoResponse> {
    try {
      const status = await fal.queue.status('fal-ai/veo3', {
        requestId: operationId,
        logs: true,
      });

      if (status.status === 'COMPLETED') {
        const result = await fal.queue.result('fal-ai/veo3', {
          requestId: operationId,
        });

        return {
          operationId,
          status: 'complete',
          videoUrl: (result as any).video.url,
        };
      }

      if (status.status === 'IN_QUEUE' || status.status === 'IN_PROGRESS') {
        return {
          operationId,
          status: 'processing',
        };
      }

      return {
        operationId,
        status: 'failed',
        error: 'Video generation failed',
      };
    } catch (error: any) {
      console.error('Fal.ai status check error:', error);
      return {
        operationId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Poll for video completion (for async operations)
   */
  async waitForVideo(operationId: string, maxWaitTime: number = 120000): Promise<VeoVideoResponse> {
    try {
      console.log('Waiting for video completion:', operationId);

      // Use Fal.ai queue result method which polls automatically
      const result = await fal.queue.result('fal-ai/veo3', {
        requestId: operationId,
      });

      return {
        operationId,
        status: 'complete',
        videoUrl: (result as any).video.url,
      };
    } catch (error: any) {
      console.error('Fal.ai wait error:', error);
      return {
        operationId,
        status: 'failed',
        error: error.message || 'Video generation timed out or failed',
      };
    }
  }
}
