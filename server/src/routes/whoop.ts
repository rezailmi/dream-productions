import { Router, Request, Response } from 'express';
import { WhoopService } from '../services/whoopService';

const router = Router();
const whoopService = new WhoopService();

// Middleware to extract access token from Authorization header
const authenticateWhoopToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring(7);
  (req as any).whoopAccessToken = token;
  next();
};

// Get user's sleep data
router.get('/sleep', authenticateWhoopToken, async (req: Request, res: Response) => {
  try {
    const accessToken = (req as any).whoopAccessToken;
    const { limit = 10, start, end } = req.query;

    const sleepData = await whoopService.getSleepData(
      accessToken,
      {
        limit: parseInt(limit as string),
        start: start as string,
        end: end as string,
      }
    );

    // Map WHOOP data to our SleepSession format (optimized single-pass)
    const mappedSessions = sleepData.records.reduce((acc: any[], record: any) => {
      // Skip unscored sessions
      if (!record.score) return acc;

      try {
        const mapped = whoopService.mapWhoopToSleepSession(record);
        acc.push(mapped);
      } catch (error) {
        console.log(`Skipping unscored sleep session: ${record.id}`);
      }

      return acc;
    }, [])

    res.json({
      records: mappedSessions,
      next_token: sleepData.next_token,
    });
  } catch (error: any) {
    console.error('Error fetching sleep data:', error);
    res.status(error.response?.status || 500).json({
      error: error.message || 'Failed to fetch sleep data',
    });
  }
});

// Get specific sleep session by ID
router.get('/sleep/:sleepId', authenticateWhoopToken, async (req: Request, res: Response) => {
  try {
    const accessToken = (req as any).whoopAccessToken;
    const { sleepId } = req.params;

    const sleepData = await whoopService.getSleepById(accessToken, sleepId);
    res.json(sleepData);
  } catch (error: any) {
    console.error('Error fetching sleep by ID:', error);
    res.status(error.response?.status || 500).json({
      error: error.message || 'Failed to fetch sleep data',
    });
  }
});

// Get recovery data for a cycle
router.get('/recovery/:cycleId', authenticateWhoopToken, async (req: Request, res: Response) => {
  try {
    const accessToken = (req as any).whoopAccessToken;
    const { cycleId } = req.params;

    const recoveryData = await whoopService.getRecoveryByCycle(accessToken, parseInt(cycleId));
    res.json(recoveryData);
  } catch (error: any) {
    console.error('Error fetching recovery data:', error);
    res.status(error.response?.status || 500).json({
      error: error.message || 'Failed to fetch recovery data',
    });
  }
});

export default router;
