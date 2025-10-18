import { Router, Request, Response } from 'express';
import { DreamGenerationService } from '../services/dreamGenerationService';

const router = Router();
const dreamService = new DreamGenerationService();

// Generate dream from sleep data
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { sleepData } = req.body;

    if (!sleepData) {
      return res.status(400).json({ error: 'Sleep data is required' });
    }

    // Generate dream narrative and video
    const dream = await dreamService.generateDream(sleepData);

    res.json(dream);
  } catch (error: any) {
    console.error('Error generating dream:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate dream',
    });
  }
});

// Generate only narrative (for testing)
router.post('/narrative', async (req: Request, res: Response) => {
  try {
    const { sleepData } = req.body;

    if (!sleepData) {
      return res.status(400).json({ error: 'Sleep data is required' });
    }

    const narrative = await dreamService.generateNarrative(sleepData);

    res.json(narrative);
  } catch (error: any) {
    console.error('Error generating narrative:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate narrative',
    });
  }
});

// Generate video from narrative (for testing)
router.post('/video', async (req: Request, res: Response) => {
  try {
    const { prompt, duration = 8, resolution = '1080p' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const video = await dreamService.generateVideo({
      prompt,
      aspectRatio: '16:9',
      durationSeconds: duration,
      resolution,
      generateAudio: true,
    });

    res.json(video);
  } catch (error: any) {
    console.error('Error generating video:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate video',
    });
  }
});

// Check video generation status
router.get('/video/status/:operationId', async (req: Request, res: Response) => {
  try {
    const { operationId } = req.params;

    const status = await dreamService.checkVideoStatus(operationId);

    res.json(status);
  } catch (error: any) {
    console.error('Error checking video status:', error);
    res.status(500).json({
      error: error.message || 'Failed to check video status',
    });
  }
});

export default router;
