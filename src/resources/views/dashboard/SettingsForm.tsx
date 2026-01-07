'use client';

import { useActionState } from 'react';
import { Button } from '@/resources/components/ui/button';
import { Input } from '@/resources/components/ui/input';
import { Label } from '@/resources/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/resources/components/ui/card';
import { User, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateProfile, updatePassword, AuthState } from '@/backend/actions/auth';

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [profileState, profileAction, isProfilePending] = useActionState<AuthState, FormData>(
    updateProfile,
    {}
  );

  const [passwordState, passwordAction, isPasswordPending] = useActionState<AuthState, FormData>(
    updatePassword,
    {}
  );

  return (
    <div className="grid gap-8">
      {/* Profile Settings */}
      <form action={profileAction}>
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-slate-400">Update your account name and email address.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {profileState?.success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {profileState.message}
              </div>
            )}
            {profileState?.error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {profileState.error}
              </div>
            )}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  defaultValue={user.name} 
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 text-white focus:border-violet-500/50 transition-colors"
                  disabled={isProfilePending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <Input 
                  id="email" 
                  defaultValue={user.email} 
                  disabled
                  className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed opacity-70"
                />
                <p className="text-[10px] text-slate-500">Email cannot be changed.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700 text-white"
                loading={isProfilePending}
              >
                {!isProfilePending && <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Security Settings */}
      <form action={passwordAction}>
        <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Security</CardTitle>
                <CardDescription className="text-slate-400">Change your password to keep your account secure.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {passwordState?.success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {passwordState.message}
              </div>
            )}
            {passwordState?.error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {passwordState.error}
              </div>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-slate-200">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  name="currentPassword"
                  type="password"
                  className="bg-white/5 border-white/10 text-white focus:border-violet-500/50 transition-colors"
                  disabled={isPasswordPending}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-200">New Password</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword"
                    type="password"
                    className="bg-white/5 border-white/10 text-white focus:border-violet-500/50 transition-colors"
                    disabled={isPasswordPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password"
                    className="bg-white/5 border-white/10 text-white focus:border-violet-500/50 transition-colors"
                    disabled={isPasswordPending}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700 text-white"
                loading={isPasswordPending}
              >
                {!isPasswordPending && <Save className="w-4 h-4 mr-2" />}
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
