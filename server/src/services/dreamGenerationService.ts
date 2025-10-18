import { WhoopSleepData, DreamNarrative, VeoVideoRequest, VeoVideoResponse, GenerateDreamResponse } from '../types';
import { GroqService } from './groqService';
import { VeoService } from './veoService';

export class DreamGenerationService {
  private groqService: GroqService;
  private veoService: VeoService;

  constructor() {
    this.groqService = new GroqService();
    this.veoService = new VeoService();
  }

  /**
   * Generate complete dream with narrative and video
   */
  async generateDream(sleepData: WhoopSleepData): Promise<GenerateDreamResponse> {
    try {
      console.log(`Generating dream for sleep session: ${sleepData.id}`);

      // Step 1: Generate dream narrative using Groq
      console.log('Step 1: Generating narrative with Groq...');
      const narrative = await this.groqService.generateDreamNarrative(sleepData);
      console.log(`Generated narrative: "${narrative.title}"`);

      // Step 2: Select primary scene for video generation
      const primaryScene = narrative.scenes.find((s) => s.sceneNumber === 1) || narrative.scenes[0];

      if (!primaryScene) {
        throw new Error('No scenes generated in narrative');
      }

      // Step 3: Generate video using Veo
      console.log('Step 2: Generating video with Veo...');
      const videoRequest: VeoVideoRequest = {
        prompt: this.enhancePromptForVeo(primaryScene.prompt),
        aspectRatio: '16:9',
        durationSeconds: 8,
        resolution: '1080p',
        generateAudio: true,
      };

      const videoOperation = await this.veoService.generateVideo(videoRequest);
      console.log(`Video generation started: ${videoOperation.operationId}`);

      // Step 4: Wait for video to complete (with timeout)
      console.log('Step 3: Waiting for video completion...');
      const videoResult = await this.veoService.waitForVideo(videoOperation.operationId, 120000);

      if (videoResult.status === 'failed') {
        console.warn('Video generation failed:', videoResult.error);
      }

      const response: GenerateDreamResponse = {
        id: `dream_${Date.now()}`,
        sleepId: sleepData.id,
        userId: sleepData.user_id,
        narrative,
        videoUrl: videoResult.videoUrl,
        status: videoResult.status === 'complete' ? 'complete' : 'failed',
        generatedAt: new Date().toISOString(),
        error: videoResult.error,
      };

      console.log(`Dream generation ${response.status}!`);
      return response;
    } catch (error: any) {
      console.error('Dream generation error:', error);
      throw error;
    }
  }

  /**
   * Generate only narrative (useful for testing)
   */
  async generateNarrative(sleepData: WhoopSleepData): Promise<DreamNarrative> {
    return this.groqService.generateDreamNarrative(sleepData);
  }

  /**
   * Generate only video (useful for testing)
   */
  async generateVideo(request: VeoVideoRequest): Promise<VeoVideoResponse> {
    const operation = await this.veoService.generateVideo(request);
    return this.veoService.waitForVideo(operation.operationId);
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(operationId: string): Promise<VeoVideoResponse> {
    return this.veoService.checkVideoStatus(operationId);
  }

  /**
   * Enhance prompt for Veo video generation
   */
  private enhancePromptForVeo(basePrompt: string): string {
    // Add cinematographic elements to make videos more visually appealing
    const enhancements = [
      'Cinematic quality',
      'dreamlike atmosphere',
      'soft ethereal lighting',
      'smooth camera movement',
      'high detail',
      'surreal elements',
      '4K quality',
    ];

    return `${basePrompt}. ${enhancements.join(', ')}.`;
  }
}
