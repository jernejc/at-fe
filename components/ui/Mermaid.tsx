'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
    chart: string;
    className?: string;
}

export function Mermaid({ chart, className }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart) return;

            try {
                // Dynamically import mermaid to avoid global side effects and ensure client-side only
                const mermaid = (await import('mermaid')).default;

                // Configure mermaid to not auto-render and suppress error popups
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    fontFamily: 'inherit',
                    suppressErrorRendering: true,
                });

                // Generate a unique ID for each render to avoid conflicts
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
                setRenderError(null);
            } catch (error) {
                console.error('Mermaid render error:', error);
                setRenderError('Failed to render diagram');
            }
        };

        renderChart();
    }, [chart]);

    if (renderError) {
        return <div className="text-red-500 text-sm p-4 border rounded">{renderError}</div>;
    }

    return (
        <div
            ref={ref}
            className={`mermaid-container flex justify-center overflow-auto p-4 ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
