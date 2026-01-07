/**
 * Catalyst Socialite Service
 * 
 * Handles OAuth authentication for various providers (GitHub, Google, etc.)
 */

import { config } from '@/backend/Services/Config';

export interface SocialUser {
    id: string;
    nickname?: string;
    name: string;
    email: string;
    avatar: string;
    provider: string;
}

class Socialite {
    private static instance: Socialite | null = null;

    private constructor() {}

    public static getInstance(): Socialite {
        if (!Socialite.instance) {
            Socialite.instance = new Socialite();
        }
        return Socialite.instance;
    }

    /**
     * Get the redirect URL for a provider
     */
    public async getRedirectUrl(provider: 'github' | 'google'): Promise<string> {
        const redirectUri = config('auth.oauth.redirect_uri', process.env.OAUTH_REDIRECT_URI);
        
        if (provider === 'github') {
            const clientId = process.env.GITHUB_CLIENT_ID;
            if (!clientId) throw new Error('GITHUB_CLIENT_ID not configured');
            
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: `${redirectUri}/github`,
                scope: 'user:email',
                state: Math.random().toString(36).substring(7),
            });
            
            return `https://github.com/login/oauth/authorize?${params.toString()}`;
        }

        if (provider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
            
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: `${redirectUri}/google`,
                response_type: 'code',
                scope: 'openid email profile',
                state: Math.random().toString(36).substring(7),
                access_type: 'offline',
                prompt: 'select_account',
            });
            
            return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        }

        throw new Error(`Social provider [${provider}] is not supported.`);
    }

    /**
     * Set the request to be stateless (no session state verification)
     */
    public stateless(): this {
        // In a real implementation, this might disable state verification
        // For now, it's a fluent interface helper
        return this;
    }

    /**
     * Handle the callback and get the user
     */
    public async user(provider: 'github' | 'google', code: string): Promise<SocialUser> {
        if (provider === 'github') {
            return this.getGithubUser(code);
        }
        if (provider === 'google') {
            return this.getGoogleUser(code);
        }
        throw new Error(`Social provider [${provider}] is not supported.`);
    }

    private async getGithubUser(code: string): Promise<SocialUser> {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        
        // 1. Exchange code for access token
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(`GitHub Token Error: ${tokenData.error_description}`);

        // 2. Fetch user profile
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });
        const githubUser = await userRes.json();

        // 3. Fetch user emails (if private)
        let email = githubUser.email;
        if (!email) {
            const emailRes = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });
            interface GithubEmail {
                email: string;
                primary: boolean;
                verified: boolean;
                visibility: string | null;
            }
            const emails: GithubEmail[] = await emailRes.json();
            email = emails.find((e) => e.primary)?.email || emails[0]?.email;
        }

        return {
            id: githubUser.id.toString(),
            nickname: githubUser.login,
            name: githubUser.name || githubUser.login,
            email: email,
            avatar: githubUser.avatar_url,
            provider: 'github',
        };
    }

    private async getGoogleUser(code: string): Promise<SocialUser> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `${process.env.OAUTH_REDIRECT_URI}/google`;

        // 1. Exchange code for tokens
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId!,
                client_secret: clientSecret!,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) throw new Error(`Google Token Error: ${tokenData.error_description || tokenData.error}`);

        // 2. Fetch user profile
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
        });
        const googleUser = await userRes.json();

        return {
            id: googleUser.sub,
            name: googleUser.name,
            email: googleUser.email,
            avatar: googleUser.picture,
            provider: 'google',
        };
    }
}

export const socialite = Socialite.getInstance();
export default socialite;
