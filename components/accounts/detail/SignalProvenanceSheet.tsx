import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { SignalProvenanceResponse } from '@/lib/schemas/provenance';
import { SignalProvenanceDetail } from '@/components/signals/SignalProvenanceDetail';

interface SignalProvenanceSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    signal: SignalProvenanceResponse | null;
    isLoading?: boolean;
}

export function SignalProvenanceSheet({ open, onOpenChange, signal, isLoading }: SignalProvenanceSheetProps) {
    if (!signal && !isLoading) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="p-0 flex flex-col h-full bg-background border-l shadow-xl"
                style={{ width: '100%', maxWidth: '650px', zIndex: 60 }}
                overlayClassName="!z-[60]"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>Signal Provenance</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <SignalProvenanceDetail signal={signal} isLoading={isLoading} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
