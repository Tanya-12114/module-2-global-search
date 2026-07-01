export function LoadingState() {
  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-surface">
      <div className="min-w-[640px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-b-0"
          >
            <div className="skeleton h-9 w-9 shrink-0 rounded-md" />
            <div className="min-w-[180px] flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-1/3 rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
            <div className="w-36 shrink-0 space-y-1.5">
              <div className="skeleton ml-auto h-2.5 w-20 rounded" />
              <div className="skeleton ml-auto h-2.5 w-14 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}