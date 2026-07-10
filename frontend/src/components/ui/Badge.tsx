export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border-hover bg-surface-active px-2.5 py-0.5 text-xs font-medium text-text-primary/80">
      {children}
    </span>
  );
}