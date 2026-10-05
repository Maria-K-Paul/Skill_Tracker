import { useEffect, useState, useRef } from "react";

export function useAutosave(data: any, saveFn: (data: any) => Promise<void>, delay = 5000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveFn(data);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Autosave failed", error);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, delay, saveFn]);

  return { isSaving, lastSaved };
}
