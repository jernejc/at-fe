import { getA2AHealth } from '@/lib/api';
import { Header } from '@/components/ui/Header';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
    let healthData = null;
    let error = null;
    try {
        healthData = await getA2AHealth();
    } catch (e: any) {
        error = e.message || 'Failed to load health status';
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
                <div className="max-w-[1600px] mx-auto w-full">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-foreground">A2A System Health</h1>
                        {healthData && (
                            <div className={`px-4 py-2 rounded-full text-sm font-medium ${healthData.healthy ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                                System Status: {healthData.status?.toUpperCase() || (healthData.healthy ? 'HEALTHY' : 'UNHEALTHY')}
                            </div>
                        )}
                    </div>

                    {error && <div className="text-red-500 mb-6">{error}</div>}

                    {healthData && healthData.agents && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Object.values(healthData.agents).map((agent: any) => (
                                <div key={agent.agent_name} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg text-foreground">{agent.agent_name}</h3>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">v{agent.version}</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${agent.healthy ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.2)]`} />
                                    </div>

                                    {/* Message */}
                                    <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        {agent.message}
                                    </div>

                                    {/* Components */}
                                    {agent.components?.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Components</p>
                                            <div className="space-y-1.5">
                                                {agent.components.map((comp: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-700 last:border-0">
                                                        <span className="text-slate-700 dark:text-slate-300">{comp.name}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${comp.healthy ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600'}`}>
                                                            {comp.healthy ? 'OK' : 'ERR'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 text-[10px] text-muted-foreground text-right">
                                        {new Date(agent.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
