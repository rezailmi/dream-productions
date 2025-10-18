// Load config and environment variables FIRST
import './config';  // This MUST be the first import

import express, { Application } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth';
import dreamRoutes from './routes/dreams';
import whoopRoutes from './routes/whoop';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 10 * 60 * 1000, // 10 minutes - enough for OAuth flow
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Root route - API info page
app.get('/', (req, res) => {
  res.json({
    name: 'Dream Machine API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to the Dream Machine API! This is a backend server for generating AI-powered dreams from sleep data.',
    endpoints: {
      health: 'GET /health',
      auth: {
        whoopLogin: 'GET /auth/whoop',
        whoopCallback: 'GET /auth/whoop/callback'
      },
      whoop: {
        getSleep: 'GET /api/whoop/sleep',
        getSleepById: 'GET /api/whoop/sleep/:sleepId',
        getRecovery: 'GET /api/whoop/recovery/:cycleId'
      },
      dreams: {
        generate: 'POST /api/dreams/generate',
        generateNarrative: 'POST /api/dreams/narrative',
        generateVideo: 'POST /api/dreams/video',
        videoStatus: 'GET /api/dreams/video/status/:operationId'
      }
    },
    services: {
      whoop: process.env.WHOOP_CLIENT_ID ? '✅ Configured' : '❌ Missing',
      groq: process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Missing',
      fal: process.env.FAL_API_KEY ? '✅ Configured' : '❌ Missing'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dream Machine API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/whoop', whoopRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dream Machine API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth callback: http://localhost:${PORT}/auth/whoop/callback`);
});

export default app;
