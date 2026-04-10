/** Column header row matching the SignalRow layout. */
export function SignalTableHeader() {
  return (
    <div className="flex items-center gap-4 px-6 py-2 -mx-5 text-xs font-medium text-muted-foreground">
      {/* Spacer for signal strength indicator */}
      <div className="w-8 shrink-0" />
      {/* Signal name column */}
      <div className="flex-1 min-w-0">Signal</div>
      {/* Right-side metric columns (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-15">Contributors</span>
        <span className="w-12">Sources</span>
      </div>
    </div>
  );
}
