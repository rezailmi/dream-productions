import { fal } from '@fal-ai/client';
import { VeoVideoRequest, VeoVideoResponse } from '../types';

export class FalVeoService {
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
      console.log('   🔧 Fal.ai Configuration:');
      console.log('      Model: fal-ai/veo3');
      console.log('      Duration:', `${request.durationSeconds}s`);
      console.log('      Resolution:', request.resolution);
      console.log('      Aspect Ratio:', request.aspectRatio);
      console.log('      Enhance Prompt: Yes');

      console.log('\n   📡 Sending request to Fal.ai...');

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
          if (update.status === 'IN_QUEUE') {
            console.log('   ⏸️  In queue, waiting to start...');
          } else if (update.status === 'IN_PROGRESS') {
            console.log('   🎬 Video generation in progress...');
            if (update.logs) {
              update.logs.forEach((log: any) => {
                console.log('      Log:', log.message || log);
              });
            }
          }
        },
      });

      console.log('   ✅ Fal.ai video generation complete!');

      // DEBUG: Log the complete raw response from Fal.ai
      console.log('\n   🔍 DEBUG: Raw Fal.ai result object:');
      console.log(JSON.stringify(result, null, 2));

      const videoUrl = (result as any).data?.video?.url;
      console.log('\n   🔍 DEBUG: Extracted videoUrl from result.data.video.url:', videoUrl);
      console.log('   🔍 DEBUG: result.data.video =', (result as any).data?.video);
      console.log('   📹 Video URL:', videoUrl);

      return {
        operationId: (result as any).requestId || `veo_${Date.now()}`,
        status: 'complete',
        videoUrl,
      };
    } catch (error: any) {
      console.log('   ❌ Fal.ai Error:');
      console.log('      Message:', error.message);
      if (error.body) {
        console.log('      Details:', JSON.stringify(error.body, null, 2));
      }
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
          videoUrl: (result as any).data?.video?.url,
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

      console.log('\n   🔍 DEBUG: waitForVideo result object:');
      console.log(JSON.stringify(result, null, 2));
      console.log('   🔍 DEBUG: Accessing result.data.video.url:', (result as any).data?.video?.url);

      return {
        operationId,
        status: 'complete',
        videoUrl: (result as any).data?.video?.url,
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
