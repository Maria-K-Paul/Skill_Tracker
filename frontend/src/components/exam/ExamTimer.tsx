import { Clock } from "lucide-react";
import { cn } from "../../lib/utils";

interface ExamTimerProps {
  formattedTime: string;
  isCritical: boolean;
}

export function ExamTimer({ formattedTime, isCritical }: ExamTimerProps) {
  return (
    <div className={cn(
      "flex items-center space-x-2 rounded-lg border px-4 py-2 font-mono text-lg font-bold shadow-sm",
      isCritical ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" : "bg-background text-foreground"
    )}>
      <Clock className="h-5 w-5" />
      <span>{formattedTime}</span>
    </div>
  );
}
