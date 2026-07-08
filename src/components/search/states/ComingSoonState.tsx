import { LucideIcon, Sparkles } from "lucide-react";

export function ComingSoonState({
  label,
  icon: Icon = Sparkles,
}: {
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <Icon size={28} className="text-text-tertiary" />
      <div>
        <p className="text-sm font-medium text-text-primary">{label} is coming soon</p>
        <p className="mt-1 text-sm text-text-secondary">
          This section isn&apos;t wired up to real data yet — check back soon.
        </p>
      </div>
    </div>
  );
}
