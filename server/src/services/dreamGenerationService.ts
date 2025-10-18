import { WhoopSleepData, DreamNarrative, VeoVideoRequest, VeoVideoResponse, GenerateDreamResponse, SleepVideoContext, SleepQuality } from '../types';
import { GroqService } from './groqService';
import { GoogleVeoService } from './googleVeoService';
import { FalVeoService } from './falVeoService';

// Video service interface
interface VideoService {
  generateVideo(request: VeoVideoRequest): Promise<VeoVideoResponse>;
  waitForVideo(operationId: string, timeoutMs?: number): Promise<VeoVideoResponse>;
  checkVideoStatus(operationId: string): Promise<VeoVideoResponse>;
}

export class DreamGenerationService {
  private groqService: GroqService;
  private videoService: VideoService;
  private videoProvider: string;

  constructor() {
    this.groqService = new GroqService();

    // Select video provider based on environment variable
    this.videoProvider = process.env.VIDEO_PROVIDER || 'google';

    if (this.videoProvider === 'google') {
      this.videoService = new GoogleVeoService();
      console.log('✅ Using Google Veo for video generation');
    } else {
      this.videoService = new FalVeoService();
      console.log('✅ Using Fal.ai for video generation');
    }
  }

  /**
   * Generate complete dream with narrative and video
   */
  async generateDream(sleepData: WhoopSleepData): Promise<GenerateDreamResponse> {
    try {
      console.log('\n┌─────────────────────────────────────┐');
      console.log('│  STEP 1: NARRATIVE GENERATION       │');
      console.log('└─────────────────────────────────────┘');
      console.log('🧠 Using Groq AI to generate dream narrative...');
      console.log('Input: Sleep session', sleepData.id);

      const narrativeStartTime = Date.now();
      const narrative = await this.groqService.generateDreamNarrative(sleepData);
      const narrativeDuration = Date.now() - narrativeStartTime;

      console.log('✅ Narrative generated successfully!');
      console.log('   Title:', narrative.title);
      console.log('   Mood:', narrative.mood);
      console.log('   Scenes:', narrative.scenes.length);
      console.log('   Duration:', `${narrativeDuration}ms`);
      console.log('   Length:', `${narrative.narrative.length} characters`);

      // Step 2: Generate video using Veo with full narrative context
      let videoResult: VeoVideoResponse | null = null;
      let videoError: string | undefined;

      try {
        console.log('\n┌─────────────────────────────────────┐');
        console.log('│  STEP 2: VIDEO GENERATION           │');
        console.log('└─────────────────────────────────────┘');
        console.log(`🎥 Using ${this.videoProvider === 'google' ? 'Google Veo' : 'Fal.ai Veo3'} to generate video...`);

        const videoPrompt = this.enhancePromptForVeo(narrative, sleepData);
        console.log('Prompt preview:', videoPrompt.substring(0, 100) + '...');
        console.log('Settings: 4s duration, 720p, 16:9 aspect ratio, with AI audio');

        const videoRequest: VeoVideoRequest = {
          prompt: videoPrompt,
          aspectRatio: '16:9',
          durationSeconds: 4,
          resolution: '720p', // Reduced from 1080p for mobile optimization (smaller file size)
          generateAudio: true, // Re-enabled AI-generated audio
        };

        const videoStartTime = Date.now();
        const videoOperation = await this.videoService.generateVideo(videoRequest);
        console.log('📤 Video generation request sent!');
        console.log('   Operation ID:', videoOperation.operationId);
        console.log('   Status:', videoOperation.status);

        if (videoOperation.status === 'failed') {
          console.log('❌ Video generation failed immediately');
          console.log('   Error:', videoOperation.error);
          videoError = videoOperation.error;
        } else {
          console.log('\n⏳ Waiting for video to complete (max 2 minutes)...');
          videoResult = await this.videoService.waitForVideo(videoOperation.operationId, 120000);
          const videoDuration = Date.now() - videoStartTime;

          console.log('\n   🔍 DEBUG: VideoResult object:', JSON.stringify(videoResult, null, 2));
          console.log('   🔍 DEBUG: videoResult.videoUrl =', videoResult.videoUrl);

          if (videoResult.status === 'complete') {
            console.log('✅ Video generated successfully!');
            console.log('   Duration:', `${videoDuration}ms`);
            console.log('   URL:', videoResult.videoUrl);
          } else {
            console.log('❌ Video generation failed');
            console.log('   Status:', videoResult.status);
            console.log('   Error:', videoResult.error);
            videoError = videoResult.error;
          }
        }
      } catch (error: any) {
        console.log('❌ Video generation error (continuing with narrative only)');
        console.log('   Error:', error.message);
        videoError = error.message || 'Video generation failed';
      }

      const response: GenerateDreamResponse = {
        id: `dream_${Date.now()}`,
        sleepId: sleepData.id,
        userId: sleepData.user_id,
        narrative,
        videoUrl: videoResult?.videoUrl,
        status: videoResult?.status === 'complete' ? 'complete' : 'complete', // Mark as complete if narrative succeeded
        generatedAt: new Date().toISOString(),
        error: videoError,
      };

      console.log('\n   🔍 DEBUG: Final response object:');
      console.log('      response.videoUrl =', response.videoUrl);
      console.log('      response.status =', response.status);

      console.log('\n┌─────────────────────────────────────┐');
      console.log('│  DREAM GENERATION SUMMARY           │');
      console.log('└─────────────────────────────────────┘');
      console.log('Dream ID:', response.id);
      console.log('Narrative:', '✅ Success');
      console.log('Video:', videoResult?.videoUrl ? '✅ Success' : '❌ Failed');
      console.log('Overall Status:', response.status);
      if (videoError) {
        console.log('⚠️  Video Error:', videoError);
      }
      console.log('');

      return response;
    } catch (error: any) {
      console.log('\n┌─────────────────────────────────────┐');
      console.log('│  FATAL ERROR                        │');
      console.log('└─────────────────────────────────────┘');
      console.error('❌ Dream generation failed completely');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.log('');
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
    const operation = await this.videoService.generateVideo(request);
    return this.videoService.waitForVideo(operation.operationId);
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(operationId: string): Promise<VeoVideoResponse> {
    return this.videoService.checkVideoStatus(operationId);
  }

  /**
   * Enhance prompt for Veo video generation using full narrative context
   */
  private enhancePromptForVeo(narrative: DreamNarrative, sleepData: WhoopSleepData): string {
    // Create a rich prompt from the narrative
    const sleepMetrics = this.buildSleepMetricsContext(sleepData);
    const metricsPreview = this.describeSleepMetrics(sleepMetrics);
    const basePrompt = `${narrative.title}. ${narrative.narrative}. Mood: ${narrative.mood}. ${narrative.emotionalContext}. ${metricsPreview}`;

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

  private buildSleepMetricsContext(sleepData: WhoopSleepData): SleepVideoContext {
    const summary = sleepData.score?.stage_summary;
    const efficiency = sleepData.score?.sleep_efficiency_percentage;
    const respiratoryRate = sleepData.score?.respiratory_rate;

    const remMinutes = summary ? Math.round((summary.total_rem_sleep_time_milli ?? 0) / 60000) : undefined;
    const deepMinutes = summary ? Math.round((summary.total_slow_wave_sleep_time_milli ?? 0) / 60000) : undefined;
    const totalMinutes = summary ? Math.round((summary.total_in_bed_time_milli ?? 0) / 60000) : undefined;

    const heartRate = efficiency
      ? {
          resting: Math.max(Math.round(efficiency / 1.6), 48),
          average: Math.max(Math.round(efficiency / 1.8), 50),
          min: Math.max(Math.round(efficiency / 2.1), 45),
          max: Math.round(efficiency / 1.4),
        }
      : undefined;

    return {
      date: sleepData.start ? new Date(sleepData.start).toISOString().split('T')[0] : undefined,
      sleepQuality: this.estimateSleepQuality(sleepData.score?.sleep_performance_percentage),
      totalDurationMinutes: totalMinutes,
      remDurationMinutes: remMinutes,
      deepDurationMinutes: deepMinutes,
      wakeUps: summary?.disturbance_count,
      respiratoryRate,
      heartRate,
    };
  }

  private describeSleepMetrics(metrics: SleepVideoContext): string {
    const parts: string[] = [];

    if (metrics.sleepQuality) {
      parts.push(`Sleep quality was ${metrics.sleepQuality}`);
    }

    if (metrics.totalDurationMinutes) {
      parts.push(`Total sleep lasted ${Math.round(metrics.totalDurationMinutes / 60)} hours and ${metrics.totalDurationMinutes % 60} minutes`);
    }

    if (metrics.remDurationMinutes) {
      parts.push(`REM sleep spanned ${metrics.remDurationMinutes} minutes, driving the dream intensity`);
    }

    if (metrics.deepDurationMinutes) {
      parts.push(`Deep sleep covered ${metrics.deepDurationMinutes} minutes, grounding the narrative`);
    }

    if (metrics.respiratoryRate) {
      parts.push(`Breathing averaged ${metrics.respiratoryRate.toFixed(1)} respirations per minute`);
    }

    if (metrics.heartRate) {
      parts.push(`Heart rate ranged from ${metrics.heartRate.min ?? '—'} to ${metrics.heartRate.max ?? '—'} bpm`);
    }

    if (metrics.wakeUps != null) {
      parts.push(`There were ${metrics.wakeUps} nocturnal wake-ups influencing dream fragments`);
    }

    return parts.join('. ');
  }

  private estimateSleepQuality(performance?: number): SleepQuality | undefined {
    if (performance == null) {
      return undefined;
    }

    if (performance >= 90) return 'excellent';
    if (performance >= 75) return 'good';
    if (performance >= 50) return 'fair';
    return 'poor';
  }
}
