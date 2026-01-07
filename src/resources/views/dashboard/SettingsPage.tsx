import { requireAuth } from '@/backend/Http/Middleware/AuthMiddleware';
import { SettingsForm } from './SettingsForm';

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Account Settings</h1>
        <p className="mt-2 text-lg text-slate-400">
          Manage your account details and security preferences.
        </p>
      </div>

      <SettingsForm user={user} />
    </div>
  );
}

