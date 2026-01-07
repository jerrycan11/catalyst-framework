import { NextRequest, NextResponse } from 'next/server';
import { socialite } from '@/backend/Services/Socialite';
import { db } from '@/database';
import { users } from '@/database/schema';
import { eq, or } from 'drizzle-orm';
import { session } from '@/backend/Services/Session';
import { nanoid } from 'nanoid';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;
    
    if (provider !== 'github' && provider !== 'google') {
        return NextResponse.redirect(new URL('/login?error=invalid_provider', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    try {
        // 1. Get user details from provider
        const socialUser = await socialite.user(provider, code);

        // 2. Find or create user in database
        let user = await db().select().from(users).where(
            or(
                eq(provider === 'github' ? users.github_id : users.google_id, socialUser.id),
                eq(users.email, socialUser.email)
            )
        ).get();

        if (!user) {
            // Create new user
            const userId = nanoid();
            await db().insert(users).values({
                id: userId,
                name: socialUser.name,
                email: socialUser.email,
                avatar: socialUser.avatar,
                [provider === 'github' ? 'github_id' : 'google_id']: socialUser.id,
            }).run();

            user = await db().select().from(users).where(eq(users.id, userId)).get();
        } else {
            // Update existing user with social ID and avatar if missing
            const updates: Partial<typeof users.$inferInsert> = { 
                avatar: user.avatar || socialUser.avatar 
            };
            if (provider === 'github' && !user.github_id) updates.github_id = socialUser.id;
            if (provider === 'google' && !user.google_id) updates.google_id = socialUser.id;

            await db().update(users).set(updates).where(eq(users.id, user.id)).run();
        }

        if (!user) throw new Error('Failed to retrieve user after create/update');

        // 3. Log user in (create session)
        await session.createSession({
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'user',
            permissions: ['*'],
        });

        // 4. Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error) {
        console.error('Social Auth Callback Error:', error);
        return NextResponse.redirect(new URL('/login?error=social_auth_failed', request.url));
    }
}
