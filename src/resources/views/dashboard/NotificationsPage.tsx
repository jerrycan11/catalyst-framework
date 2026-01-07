import { requireAuth } from '@/backend/Http/Middleware/AuthMiddleware';
import { Card, CardContent } from '@/resources/components/ui/card';
import { Bell, CheckCircle2, Info, Settings } from 'lucide-react';
import { Button } from '@/resources/components/ui/button';

export default async function NotificationsPage() {
  await requireAuth();

  const notifications = [
    {
      id: 1,
      title: 'Welcome to Catalyst',
      description: 'Your account has been successfully created. Explore your new dashboard.',
      time: '2 hours ago',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 2,
      title: 'Security Update',
      description: 'We recommend enabling two-factor authentication for enhanced security.',
      time: '5 hours ago',
      icon: Info,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div className="flex items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Notifications</h1>
          <p className="mt-2 text-lg text-slate-400">
            Stay updated with your latest account activity.
          </p>
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Settings className="w-4 h-4 mr-2" />
          Preferences
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <Card key={n.id} className="bg-slate-900/50 border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${n.bg} ${n.color} h-fit`}>
                    <n.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">{n.title}</h3>
                      <span className="text-xs text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{n.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
            <Bell className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">No notifications yet</h2>
            <p className="text-slate-500 mt-2">We&apos;ll notify you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  );
}
