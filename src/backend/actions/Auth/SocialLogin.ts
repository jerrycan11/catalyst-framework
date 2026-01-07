import { socialite, SocialUser } from '@/backend/Services/Socialite';
import { db } from '@/database';
import { users } from '@/database/schema';
import { auth } from '@/backend/Services/Auth';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export class SocialLogin {
    /**
     * Handle the social login process
     */
    public async execute(provider: 'github' | 'google', code: string): Promise<void> {
        // 1. Get user from provider
        const socialUser = await socialite.stateless().user(provider, code);

        // 2. Find user by email or provider ID
        const existingUser = await this.findUser(socialUser, provider);

        if (existingUser) {
            // Update avatar/token if needed
            // Use explicit checks and updates to allow strict typing
            const updates: Record<string, unknown> = {
                avatar: socialUser.avatar
            };
            
            // Link account if finding by email but ID was missing
            if (provider === 'github' && !existingUser.github_id) {
                updates.github_id = socialUser.id;
            } else if (provider === 'google' && !existingUser.google_id) {
                updates.google_id = socialUser.id;
            }

            // We need to cast updates to match the schema partial, or use a specific update query
            await db().update(users)
                .set(updates)
                .where(eq(users.id, existingUser.id))
                .run();

            // 3. Login
            await auth.loginUsingId(existingUser.id);
            return;
        }

        // 4. Create new user
        const newUser = await this.createUser(socialUser, provider);
        
        // 5. Login
        await auth.loginUsingId(newUser.id);
    }

    private async findUser(socialUser: SocialUser, provider: 'github' | 'google') {
         // Check by provider ID first
         // We construct the column name dynamically but need to be type-safe for Drizzle
         const providerIdColumn = provider === 'github' ? users.github_id : users.google_id;
         
        let user = await db().select().from(users).where(eq(providerIdColumn, socialUser.id)).get();
        
        if (user) return user;

        // Check by email
        user = await db().select().from(users).where(eq(users.email, socialUser.email)).get();
        
        return user;
    }

    private async createUser(socialUser: SocialUser, provider: 'github' | 'google') {
        const id = nanoid();
        
        const userData: typeof users.$inferInsert = {
            id,
            name: socialUser.name,
            email: socialUser.email,
            avatar: socialUser.avatar,
            password: '', // Social users have no password
            email_verified_at: new Date(), // Trusted provider
            created_at: new Date(),
            updated_at: new Date(),
        };

        if (provider === 'github') {
            userData.github_id = socialUser.id;
        } else {
            userData.google_id = socialUser.id;
        }

        await db().insert(users).values(userData).run();

        return { id, email: socialUser.email };
    }
}
