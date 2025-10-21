import OpenAI from 'openai';
import { AnySleepData, WhoopSleepData, SleepSession, DreamNarrative, DreamScene } from '../types';

export class GroqService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Generate dream narrative from sleep data using OpenAI GPT-OSS-120B on Groq
   * This uses OpenAI's 120B parameter open model running on Groq's fast infrastructure
   */
  async generateDreamNarrative(sleepData: AnySleepData): Promise<DreamNarrative> {
    try {
      const prompt = this.buildPrompt(sleepData);

      const completion = await this.client.chat.completions.create({
        model: 'openai/gpt-oss-120b', // OpenAI's 120B open model on Groq (500+ tokens/sec)
        messages: [
          {
            role: 'system',
            content: `You are a dream interpreter and creative writer who analyzes sleep data to generate vivid, cinematic dream narratives AND a concise Oneiromancy prediction. Narratives are immersive, first-person, visual and emotional. The Oneiromancy summarizes symbols, themes, advice, category and confidence. Return strict JSON only.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 1.2, // Higher creativity
        max_tokens: 2000,
        response_format: { type: "json_object" }, // Ensure JSON output
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
  private buildPrompt(sleepData: AnySleepData): string {
    // Type guard to check if it's WHOOP data
    const isWhoopData = (data: AnySleepData): data is WhoopSleepData => {
      return 'score' in data && data.score !== undefined;
    };

    // Type guard to check if it's demo data
    const isDemoData = (data: AnySleepData): data is SleepSession => {
      return 'remCycles' in data && 'stages' in data;
    };

    let totalSleepMinutes: number;
    let remMinutes: number;
    let deepSleepMinutes: number;
    let disturbances: number;
    let cycleCount: number;
    let sleepQuality: number;
    let respiratoryRate: number;

    if (isWhoopData(sleepData)) {
      // Extract from WHOOP format
      const score = sleepData.score;
      if (!score) {
        throw new Error('WHOOP sleep data not scored');
      }

      totalSleepMinutes = Math.round(score.stage_summary.total_in_bed_time_milli / 60000);
      remMinutes = Math.round(score.stage_summary.total_rem_sleep_time_milli / 60000);
      deepSleepMinutes = Math.round(score.stage_summary.total_slow_wave_sleep_time_milli / 60000);
      disturbances = score.stage_summary.disturbance_count;
      cycleCount = score.stage_summary.sleep_cycle_count;
      sleepQuality = score.sleep_performance_percentage;
      respiratoryRate = score.respiratory_rate;
    } else if (isDemoData(sleepData)) {
      // Extract from demo format
      totalSleepMinutes = sleepData.totalDurationMinutes;

      // Calculate REM minutes from stages
      remMinutes = sleepData.stages
        .filter(stage => stage.type === 'REM')
        .reduce((sum, stage) => sum + stage.durationMinutes, 0);

      // Calculate deep sleep minutes
      deepSleepMinutes = sleepData.stages
        .filter(stage => stage.type === 'Deep')
        .reduce((sum, stage) => sum + stage.durationMinutes, 0);

      disturbances = sleepData.wakeUps;
      cycleCount = sleepData.remCycles.length;

      // Convert sleep quality string to percentage
      const qualityMap: Record<string, number> = {
        'poor': 60,
        'fair': 75,
        'good': 85,
        'excellent': 95
      };
      sleepQuality = qualityMap[sleepData.sleepQuality] || 75;

      // Estimate respiratory rate from heart rate data (rough approximation)
      respiratoryRate = Math.round((sleepData.heartRateData.averageBPM || 60) / 4);
    } else {
      throw new Error('Invalid sleep data format');
    }

    return `Generate a vivid, cinematic dream narrative based on this sleep data, and include a Oneiromancy prediction object:

Sleep Analysis:
- Total Sleep: ${totalSleepMinutes} minutes
- REM Sleep: ${remMinutes} minutes across ${cycleCount} cycles
- Deep Sleep: ${deepSleepMinutes} minutes
- Sleep Disturbances: ${disturbances}
- Sleep Quality Score: ${sleepQuality}%
- Respiratory Rate: ${respiratoryRate} breaths/min

Context:
${disturbances > 3 ? '- Restless night with multiple wake-ups suggests fragmented, intense dreams' : '- Peaceful sleep suggests flowing, cohesive dream narrative'}
${remMinutes > 90 ? '- Extended REM periods indicate vivid, elaborate dream sequences' : '- Moderate REM suggests shorter dream fragments'}
${sleepQuality > 85 ? '- High sleep quality indicates surreal, fantastical elements' : '- Lower sleep quality may indicate anxiety or stress-themed dreams'}

Generate a dream narrative with the following structure (use strict JSON format only):

{
  "title": "Poetic dream title (5-8 words)",
  "mood": "Overall emotional tone (1-2 words)",
  "emotionalContext": "Brief emotional analysis (1 sentence)",
  "narrative": "Full dream story in first-person, present tense (200-300 words). Make it vivid, sensory, and emotional.",
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "Scene description (50-80 words)",
      "prompt": "DETAILED video generation prompt (60-80 words) with SPECIFIC CINEMATIC ELEMENTS:
        - SETTING: Exact location and environment (indoor/outdoor, specific place)
        - CAMERA: First-person POV, 9:16 vertical framing, specify if static/moving/panning
        - LIGHTING: Specific light source (sunlight/moonlight/lamp/neon/firelight), quality (harsh/soft/dim/bright), color temperature (warm/cool/neutral)
        - COLORS: Dominant color palette (3-4 specific colors or tones)
        - ATMOSPHERE: Weather, time of day, air quality (misty/clear/hazy/dusty)
        - ACTION: What's happening in frame, any movement or stillness
        - MOOD: Emotional tone that drives the visual aesthetic
        - AUDIO CUES: Ambient sounds that should accompany (wind/water/voices/silence/music)
        Be SPECIFIC and VISUAL. Avoid abstractions. Make it unique to THIS dream and THIS sleep data.",
      "duration": 4
    },
    // Generate 3-5 scenes total, each with uniquely detailed prompts
  ],
  "oneiromancy": {
    "summary": "2-3 sentence interpretation focused on emotional meaning and patterns",
    "themes": ["theme1", "theme2", "theme3"],
    "symbols": ["primary symbol(s) observed"],
    "advice": "short, compassionate advice based on the dream",
    "category": "Wealth|Love|Career|Danger|Health|Family|Animals|Water|Food|Travel|Spiritual|Death",
    "confidence": 0.0
  }
}

CRITICAL RULES FOR VIDEO PROMPTS:
- Each scene prompt MUST be 60-80 words with ALL cinematic elements specified
- Use CONCRETE, SPECIFIC details (not "beautiful lighting" but "golden afternoon sun through dusty window")
- Reflect sleep quality in visuals: High quality = vivid colors/clarity, Low quality = muted/hazy/fragmented
- Reflect disturbances: Many wake-ups = jarring transitions/intense visuals, Few = smooth/flowing imagery
- Reflect REM duration: Long REM = surreal/fantastical elements, Short REM = realistic/grounded imagery
- Vary lighting, colors, settings across scenes based on dream progression
- Make each prompt UNIQUE - no generic templates
- FIRST SCENE is especially important as it will be used for video generation

General Rules:
- Make it VIVID and VISUAL (describe what you SEE, HEAR, FEEL)
- Use present tense, first-person perspective
- Include surreal, dreamlike elements appropriate to sleep quality
- Each scene should be visually distinct and cinematic
- Incorporate the sleep data context throughout
- Return strict JSON without backticks or extra prose

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
          duration: scene.duration || 4, // Default to 4s (Sora minimum)
        })),
        oneiromancy: parsed.oneiromancy ? {
          summary: parsed.oneiromancy.summary || '',
          themes: Array.isArray(parsed.oneiromancy.themes) ? parsed.oneiromancy.themes : [],
          symbols: Array.isArray(parsed.oneiromancy.symbols) ? parsed.oneiromancy.symbols : [],
          advice: parsed.oneiromancy.advice || '',
          category: parsed.oneiromancy.category || '',
          confidence: typeof parsed.oneiromancy.confidence === 'number' ? parsed.oneiromancy.confidence : 0.5,
        } : undefined,
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
            prompt: `First-person POV, 9:16 vertical format. Cinematic dream sequence with surreal atmosphere, soft ambient lighting, ethereal mood. Calm movement through dreamlike space. Muted colors with hints of deep blues and purples. Quiet ambient sounds.`,
            duration: 4, // Sora minimum duration
          },
        ],
        oneiromancy: {
          summary: 'An ambiguous dream suggesting inner processing without clear symbols.',
          themes: [],
          symbols: [],
          advice: 'Reflect on your day and note any lingering emotions.',
          category: '',
          confidence: 0.2,
        },
      };
    }
  }
}
