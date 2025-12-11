import { getA2ADiagram } from '@/lib/api';
import { A2ADiagram } from '@/components/a2a/A2ADiagram';
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
        <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 w-full relative bg-slate-50 dark:bg-slate-900">
                {error ? (
                    <div className="p-6 text-red-500">{error}</div>
                ) : (
                    <div className="absolute inset-0">
                        <A2ADiagram mermaid={diagram} />
                    </div>
                )}
            </main>
        </div>
    );
}
