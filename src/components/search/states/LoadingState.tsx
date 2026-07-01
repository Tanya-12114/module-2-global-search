export function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2.5">
            <div className="skeleton h-9 w-9 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-2/3 rounded" />
              <div className="skeleton h-2.5 w-1/3 rounded" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
          </div>
          <div className="skeleton h-6 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}
