import { ShieldAlert } from "lucide-react";

interface ViolationBannerProps {
  violations: number;
}

export function ViolationBanner({ violations }: ViolationBannerProps) {
  if (violations === 0) return null;
  return (
    <div className="flex items-center justify-center bg-destructive py-2 text-destructive-foreground">
      <ShieldAlert className="mr-2 h-4 w-4" />
      <span className="text-sm font-bold">
        WARNING: Tab switch detected! ({violations}/2 violations). One more will auto-submit.
      </span>
    </div>
  );
}
