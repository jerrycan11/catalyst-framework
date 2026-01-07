/**
 * Auth Configuration
 */

const authConfig = {
  /**
   * Default Guard
   */
  guard: process.env.AUTH_GUARD || 'session',

  /**
   * OAuth Settings
   */
  oauth: {
    redirect_uri: process.env.OAUTH_REDIRECT_URI || `${process.env.APP_URL}/api/auth/callback`,
    
    github: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
    },
    
    google: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
};

export default authConfig;
