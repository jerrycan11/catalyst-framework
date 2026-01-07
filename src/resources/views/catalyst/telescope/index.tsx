'use client';

import { useState, useEffect } from 'react';
import { Loader2, Server, Database, Activity, ClipboardList, ChevronDown, ChevronRight, Search } from 'lucide-react';
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
    logs: Array<{
        timestamp: string;
        level: string;
        source: string;
        message: string;
        context?: Record<string, unknown>;
        error?: { name: string; message: string; stack?: string };
    }>;
}

export default function TelescopePage() {
    const [data, setData] = useState<TelescopeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('app');
    const [logFilter, setLogFilter] = useState('all');
    const [expandedLogs, setExpandedLogs] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

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
        { id: 'logs', label: 'Logs', icon: ClipboardList },
    ];

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'emergency':
            case 'alert':
            case 'critical':
            case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'notice':
            case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
        }
    };

    const toggleLog = (index: number) => {
        setExpandedLogs(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const filteredLogs = data.logs.filter(log => {
        const matchesLevel = logFilter === 'all' || log.level === logFilter;
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.source.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesLevel && matchesSearch;
    });

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

                            {activeTab === 'logs' && (
                                <div className="space-y-4">
                                    <div className="flex gap-4 mb-6">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Search logs..." 
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <select 
                                            className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                            value={logFilter}
                                            onChange={e => setLogFilter(e.target.value)}
                                        >
                                            <option value="all">All Levels</option>
                                            <option value="error">Error</option>
                                            <option value="warning">Warning</option>
                                            <option value="info">Info</option>
                                            <option value="debug">Debug</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        {filteredLogs.length === 0 ? (
                                            <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                                                No logs found matching your criteria
                                            </div>
                                        ) : (
                                            filteredLogs.map((log, index) => (
                                                <div key={index} className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden transition-all duration-200 hover:border-neutral-700">
                                                    <div 
                                                        className="flex items-center gap-4 p-4 cursor-pointer"
                                                        onClick={() => toggleLog(index)}
                                                    >
                                                        <div className={`p-1 rounded bg-neutral-900 border ${expandedLogs.includes(index) ? 'border-indigo-500 text-indigo-500' : 'border-neutral-800 text-neutral-500'}`}>
                                                            {expandedLogs.includes(index) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </div>
                                                        <div className={`px-2 py-0.5 rounded text-xs font-mono uppercase border ${getLevelColor(log.level)}`}>
                                                            {log.level}
                                                        </div>
                                                        <div className="text-neutral-500 font-mono text-xs whitespace-nowrap">
                                                            {new Date(log.timestamp).toLocaleTimeString()}
                                                        </div>
                                                        <div className="flex-1 font-mono text-sm text-neutral-300 truncate">
                                                            <span className="text-neutral-500 mr-2">[{log.source}]</span>
                                                            {log.message}
                                                        </div>
                                                    </div>
                                                    
                                                    {expandedLogs.includes(index) && (
                                                        <div className="border-t border-neutral-800 bg-neutral-900/50 p-4 font-mono text-xs">
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <div className="text-neutral-500 mb-1">Timestamp</div>
                                                                    <div className="text-white">{log.timestamp}</div>
                                                                </div>
                                                                
                                                                {log.context && Object.keys(log.context).length > 0 && (
                                                                    <div>
                                                                        <div className="text-neutral-500 mb-1">Context</div>
                                                                        <pre className="bg-neutral-950 p-3 rounded border border-neutral-800 overflow-x-auto text-green-400">
                                                                            {JSON.stringify(log.context, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                                
                                                                {log.error && (
                                                                    <div>
                                                                        <div className="text-red-400 mb-1">Error Details</div>
                                                                        <div className="bg-red-950/20 border border-red-500/20 p-3 rounded">
                                                                            <div className="text-red-400 font-bold mb-2">{log.error.name}: {log.error.message}</div>
                                                                            {log.error.stack && (
                                                                                <pre className="text-red-300 opacity-70 overflow-x-auto whitespace-pre-wrap pl-4 border-l-2 border-red-500/30">
                                                                                    {log.error.stack}
                                                                                </pre>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
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
