/**
 * Authentication Server Actions
 * 
 * Server-side actions for handling authentication flows.
 * Uses the Auth service to manage sessions and tokens.
 * 
 * @security CRITICAL - Handles user credentials and session creation
 */

'use server';

import { redirect } from 'next/navigation';
import { auth, hashPassword, verifyPassword } from '@/backend/Services/Auth';
import { socialite } from '@/backend/Services/Socialite';
import { z } from 'zod';
import { db } from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { session } from '@/backend/Services/Session';
import { revalidatePath } from 'next/cache';

// ==================== SCHEMAS ====================

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ==================== ACTIONS ====================

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Handle user login
 */
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  // 1. Validate input
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    remember: formData.get('remember') === 'on',
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input data. Please check your credentials.',
    };
  }

  const { email, password, remember } = validatedFields.data;

  try {
    // 2. Attempt authentication
    const success = await auth.guard('session').attempt(
      { email, password },
      remember
    );

    if (!success) {
      return {
        error: 'Invalid credentials. Please try again.',
      };
    }

  } catch (error) {
    console.error('Login error:', error);
    return {
      error: 'An unexpected error occurred. Please try again.',
    };
  }

  // 3. Redirect on success
  // Note: We redirect outside the try/catch because redirects work by throwing an error in Next.js
  redirect('/dashboard');
}

/**
 * Handle user logout
 */
export async function logout(): Promise<void> {
  await auth.logout();
  redirect('/login');
}

/**
 * Get available social login providers
 */
export async function getSocialProviders() {
  return {
    github: !!process.env.GITHUB_CLIENT_ID,
    google: !!process.env.GOOGLE_CLIENT_ID,
  };
}

/**
 * Handle social login redirect
 */
export async function socialLogin(provider: 'github' | 'google') {
  try {
    const url = await socialite.getRedirectUrl(provider);
    redirect(url);
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    console.error(`Social login error [${provider}]:`, error);
    redirect('/login?error=social_auth_failed');
  }
}

/**
 * Update user profile information
 */
export async function updateProfile(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const user = await auth.user();
  if (!user) return { error: 'Not authenticated' };

  const validatedFields = UpdateProfileSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.name?.[0] || 'Invalid input' };
  }

  const { name } = validatedFields.data;

  try {
    // Update database
    await db().update(users)
      .set({ name })
      .where(eq(users.id, user.id))
      .run();

    // Refresh session to update cookies
    const updatedUser = { ...user, name };
    await session.createSession(updatedUser);
    
    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'Failed to update profile' };
  }
}

/**
 * Update user password
 */
export async function updatePassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const user = await auth.user();
  if (!user) return { error: 'Not authenticated' };

  const validatedFields = UpdatePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return { 
      error: validatedFields.error.errors[0].message 
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    // Verify current password
    const userRecord = await db().select().from(users).where(eq(users.id, user.id)).get();
    if (!userRecord || !userRecord.password || !verifyPassword(currentPassword, userRecord.password)) {
      return { error: 'Incorrect current password' };
    }

    // Update password
    await db().update(users)
      .set({ password: hashPassword(newPassword) })
      .where(eq(users.id, user.id))
      .run();

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: 'Failed to update password' };
  }
}

