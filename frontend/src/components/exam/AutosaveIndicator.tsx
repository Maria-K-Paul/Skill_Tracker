import { CheckCircle2, Loader2 } from "lucide-react";

interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function AutosaveIndicator({ isSaving, lastSaved }: AutosaveIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>Saved {lastSaved ? lastSaved.toLocaleTimeString() : ''}</span>
        </>
      )}
    </div>
  );
}
