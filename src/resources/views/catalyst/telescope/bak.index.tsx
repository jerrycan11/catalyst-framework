'use client';

import { useState, useEffect } from 'react';
import { Loader2, Server, Database, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/resources/components/ui/card';

interface TelescopeData {
    app: {
        name: string;
        env: string;
        debug: boolean;
        timezone: string;
        locale: string;
    };
    system: {
        node_version: string;
        platform: string;
        memory_usage: Record<string, number>;
        uptime: number;
    };
    database: {
        default: string;
    };
}

export default function TelescopePage() {
    const [data, setData] = useState<TelescopeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('app');

    useEffect(() => {
        fetch('/api/catalyst')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load Telescope data');
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500 bg-neutral-950">{error}</div>;
    if (!data) return null;

    const tabs = [
        { id: 'app', label: 'Application', icon: Server },
        { id: 'system', label: 'System', icon: Activity },
        { id: 'database', label: 'Database', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans">
             <header className="mb-8 flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">C</div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">Catalyst Telescope</h1>
                </div>
                <div className="text-sm font-mono text-neutral-500">
                    v1.0.0
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="col-span-2 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.id 
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="col-span-10">
                    <Card className="bg-neutral-900 border-neutral-800 text-neutral-200 shadow-xl">
                        <CardHeader className="border-b border-neutral-800 pb-4">
                            <CardTitle className="text-white flex items-center gap-2">
                                {(() => {
                                    const TabIcon = tabs.find(t => t.id === activeTab)?.icon || Server;
                                    return <TabIcon className="text-indigo-500" size={20} />;
                                })()}
                                {tabs.find(t => t.id === activeTab)?.label} Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {activeTab === 'app' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">App Name</div>
                                            <div className="text-lg font-semibold text-white">{data.app.name}</div>
                                        </div>
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Environment</div>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${data.app.env === 'production' ? 'bg-red-500' : 'bg-green-500'}`} />
                                                <span className="text-lg font-semibold text-white capitalize">{data.app.env}</span>
                                            </div>
                                        </div>
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Debug Mode</div>
                                            <div className="text-lg font-semibold text-white">{data.app.debug ? 'Enabled' : 'Disabled'}</div>
                                        </div>
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Timezone</div>
                                            <div className="text-lg font-semibold text-white">{data.app.timezone}</div>
                                        </div>
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Locale</div>
                                            <div className="text-lg font-semibold text-white">{data.app.locale}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'system' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Node Version</div>
                                            <div className="text-lg font-semibold text-white">{data.system.node_version}</div>
                                        </div>
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Platform</div>
                                            <div className="text-lg font-semibold text-white capitalize">{data.system.platform}</div>
                                        </div>
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Uptime</div>
                                            <div className="text-lg font-semibold text-white">{Math.floor(data.system.uptime)}s</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 mt-4">
                                        <div className="text-neutral-500 text-xs uppercase tracking-wider mb-4">Memory Usage</div>
                                        <div className="space-y-3">
                                            {Object.entries(data.system.memory_usage).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center border-b border-neutral-900 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-neutral-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-white font-mono">{Math.round((value as number) / 1024 / 1024)} MB</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'database' && (
                                <div className="space-y-4">
                                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                        <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Default Connection</div>
                                        <div className="text-lg font-semibold text-white capitalize">{data.database.default}</div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Placeholder for future database stats */}
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 opacity-50">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Query Duration (Avg)</div>
                                            <div className="text-lg font-semibold text-white">-- ms</div>
                                        </div>
                                        <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 opacity-50">
                                            <div className="text-neutral-500 text-xs uppercase tracking-wider mb-1">Total Queries</div>
                                            <div className="text-lg font-semibold text-white">--</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
