import OpenAI from 'openai';
import { WhoopSleepData, DreamNarrative, DreamScene } from '../types';

export class GroqService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Generate dream narrative from sleep data
   */
  async generateDreamNarrative(sleepData: WhoopSleepData): Promise<DreamNarrative> {
    try {
      const prompt = this.buildPrompt(sleepData);

      const completion = await this.client.chat.completions.create({
        model: 'mixtral-8x7b-32768', // Fast, high-quality model
        messages: [
          {
            role: 'system',
            content: `You are a dream interpreter and creative writer who analyzes sleep data to generate vivid, cinematic dream narratives. You create immersive, first-person dream stories based on REM cycles, sleep quality, and physiological data. Your narratives are visual, emotional, and surreal - perfect for video generation.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 1.2, // Higher creativity
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from Groq API');
      }

      // Parse the structured response
      return this.parseNarrativeResponse(response);
    } catch (error: any) {
      console.error('Groq API Error:', error);
      throw new Error(`Failed to generate dream narrative: ${error.message}`);
    }
  }

  /**
   * Build the prompt for dream generation
   */
  private buildPrompt(sleepData: WhoopSleepData): string {
    const score = sleepData.score;
    if (!score) {
      throw new Error('Sleep data not scored');
    }

    const totalSleepMinutes = Math.round(score.stage_summary.total_in_bed_time_milli / 60000);
    const remMinutes = Math.round(score.stage_summary.total_rem_sleep_time_milli / 60000);
    const deepSleepMinutes = Math.round(score.stage_summary.total_slow_wave_sleep_time_milli / 60000);
    const disturbances = score.stage_summary.disturbance_count;
    const cycleCount = score.stage_summary.sleep_cycle_count;
    const sleepQuality = score.sleep_performance_percentage;

    return `Generate a vivid, cinematic dream narrative based on this sleep data:

Sleep Analysis:
- Total Sleep: ${totalSleepMinutes} minutes
- REM Sleep: ${remMinutes} minutes across ${cycleCount} cycles
- Deep Sleep: ${deepSleepMinutes} minutes
- Sleep Disturbances: ${disturbances}
- Sleep Quality Score: ${sleepQuality}%
- Respiratory Rate: ${score.respiratory_rate} breaths/min

Context:
${disturbances > 3 ? '- Restless night with multiple wake-ups suggests fragmented, intense dreams' : '- Peaceful sleep suggests flowing, cohesive dream narrative'}
${remMinutes > 90 ? '- Extended REM periods indicate vivid, elaborate dream sequences' : '- Moderate REM suggests shorter dream fragments'}
${sleepQuality > 85 ? '- High sleep quality indicates surreal, fantastical elements' : '- Lower sleep quality may indicate anxiety or stress-themed dreams'}

Generate a dream narrative with the following structure (use JSON format):

{
  "title": "Poetic dream title (5-8 words)",
  "mood": "Overall emotional tone (1-2 words)",
  "emotionalContext": "Brief emotional analysis (1 sentence)",
  "narrative": "Full dream story in first-person, present tense (200-300 words). Make it vivid, sensory, and emotional.",
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "Scene description (50-80 words)",
      "prompt": "Optimized video generation prompt: cinematic, detailed, visual (30-50 words). Focus on visual elements, lighting, atmosphere, and action.",
      "duration": 8
    },
    // Generate 3-5 scenes total
  ]
}

Rules:
- Make it VIVID and VISUAL (describe what you SEE, HEAR, FEEL)
- Use present tense, first-person perspective
- Include surreal, dreamlike elements
- Each scene should be visually distinct and cinematic
- Video prompts should be clear, actionable descriptions for AI video generation
- Incorporate the sleep data context (disturbances = scene changes, high REM = elaborate imagery)

Generate the JSON response now:`;
  }

  /**
   * Parse the narrative response from Groq
   */
  private parseNarrativeResponse(response: string): DreamNarrative {
    try {
      // Extract JSON from response (in case there's surrounding text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!parsed.title || !parsed.narrative || !Array.isArray(parsed.scenes)) {
        throw new Error('Invalid narrative structure');
      }

      return {
        title: parsed.title,
        narrative: parsed.narrative,
        mood: parsed.mood || 'mysterious',
        emotionalContext: parsed.emotionalContext || '',
        scenes: parsed.scenes.map((scene: any, index: number) => ({
          sceneNumber: index + 1,
          description: scene.description,
          prompt: scene.prompt,
          duration: scene.duration || 8,
        })),
      };
    } catch (error: any) {
      console.error('Failed to parse narrative response:', error);
      console.log('Raw response:', response);

      // Fallback: create a simple narrative from the raw response
      return {
        title: 'Dream Sequence',
        narrative: response.substring(0, 500),
        mood: 'mysterious',
        emotionalContext: 'Generated from sleep data',
        scenes: [
          {
            sceneNumber: 1,
            description: response.substring(0, 200),
            prompt: `Cinematic dream sequence, surreal atmosphere, soft lighting, ethereal mood`,
            duration: 8,
          },
        ],
      };
    }
  }
}
