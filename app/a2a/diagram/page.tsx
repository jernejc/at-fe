import { getA2ADiagram } from '@/lib/api';
import { Mermaid } from '@/components/ui/Mermaid';
import { Header } from '@/components/ui/Header';

export const dynamic = 'force-dynamic';

export default async function DiagramPage() {
    let diagram = '';
    let error = null;
    try {
        diagram = await getA2ADiagram();
    } catch (e) {
        error = 'Failed to load diagram';
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <Header />
            <main className="flex-1 p-6 overflow-hidden flex flex-col">
                <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col flex-1">
                    <h1 className="text-2xl font-bold mb-6 text-foreground">A2A Infrastructure Diagram</h1>
                    {error ? (
                        <div className="text-red-500">{error}</div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-auto min-h-[600px]">
                            <Mermaid chart={diagram} className="min-w-[800px]" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
