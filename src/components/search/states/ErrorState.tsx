import { AlertTriangle } from "lucide-react";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <AlertTriangle size={28} className="text-danger" />
      <div>
        <p className="text-sm font-medium text-text-primary">Search failed</p>
        <p className="mt-1 text-sm text-text-secondary">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-1 rounded-md bg-accent px-3.5 py-1.5 text-sm text-white hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  );
}
