import { requireAuth } from '@/backend/Http/Middleware/AuthMiddleware';
import { Button } from '@/resources/components/ui/button';
import { Plus, Layout, Zap, Book, Shield, Github } from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-12 py-10">
      {/* Hero / Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-500">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Your workspace is fresh and ready for new projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <Layout className="w-4 h-4 mr-2" />
                Customize
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20">
                <Plus className="w-4 h-4 mr-2" />
                New Project
            </Button>
        </div>
      </div>

      {/* Blank Empty State */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col items-center justify-center min-h-[450px] rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-12 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-violet-500/20 rounded-2xl blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                    <Zap className="w-12 h-12 text-violet-500 animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-900 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Clean Slate</h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-10 text-lg leading-relaxed">
                Connect your first repository or choose a template to get started. 
                Everything is set up and optimized for your success.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {[
                    { label: 'Documentation', sub: 'Explore API guides', icon: Book, color: 'text-blue-400' },
                    { label: 'Security', sub: 'Military-grade protection', icon: Shield, color: 'text-emerald-400' },
                    { label: 'GitHub', sub: 'Connect your repo', icon: Github, color: 'text-white' },
                ].map((item, i) => (
                    <div key={i} className="group/card flex flex-col items-start p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer">
                        <item.icon className={`w-6 h-6 ${item.color} mb-4`} />
                        <h3 className="text-sm font-semibold text-white group-hover/card:text-violet-400 transition-colors">{item.label}</h3>
                        <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              API Online
          </div>
          <div className="text-sm text-slate-400 font-mono">v1.0.0-catalyst</div>
      </div>
    </div>
  );
}

