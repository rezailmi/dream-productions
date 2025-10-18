import { Router } from 'express';
import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

const router = Router();

// Configure passport serialization for sessions
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Configure WHOOP OAuth2 Strategy
// Note: Environment variables are loaded in config.ts before this runs
// OAuth endpoints still use api.prod.whoop.com domain
passport.use('whoop', new OAuth2Strategy(
  {
    authorizationURL: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenURL: 'https://api.prod.whoop.com/oauth/oauth2/token',
    clientID: process.env.WHOOP_CLIENT_ID!,
    clientSecret: process.env.WHOOP_CLIENT_SECRET!,
    callbackURL: process.env.WHOOP_CALLBACK_URL || 'http://localhost:3000/auth/whoop/callback',
    scope: ['read:sleep', 'read:recovery', 'read:cycles'],
    state: true, // Enable state parameter for CSRF protection (requires express-session)
  },
  async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    // Store tokens securely - in production, use a database
    // For now, we'll pass them through the callback
    const tokens = {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
    };
    return done(null, tokens);
  }
));

// Initiate WHOOP OAuth flow
router.get('/whoop', passport.authenticate('whoop'));

// WHOOP OAuth callback
router.get('/whoop/callback',
  passport.authenticate('whoop'),
  (req, res) => {
    const user = req.user as any;

    if (!user) {
      // Redirect to mobile app with error
      return res.redirect(`exp://localhost:8081/--/auth/error?message=Authentication failed`);
    }

    // Store tokens (in production, save to secure storage)
    const { accessToken, refreshToken } = user;

    // Redirect to mobile app with success and tokens
    // In production, use a more secure method like deep linking with encrypted data
    res.redirect(
      `exp://localhost:8081/--/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken || ''}`
    );
  }
);

// Endpoint to exchange authorization code for tokens (for manual flow)
router.post('/whoop/token', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // TODO: Exchange code for tokens
    // This would be implemented if using a manual OAuth flow
    res.status(501).json({ error: 'Not implemented - use OAuth flow via /auth/whoop' });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

export default router;
