import { useEffect, useState } from "react";
import { Maximize, ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import { useProctoring } from "../../hooks/useProctoring";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ProctoringGuardProps {
  children: React.ReactNode;
  onViolationLimit: () => void;
  isMock?: boolean;
}

export function ProctoringGuard({ children, onViolationLimit, isMock = false }: ProctoringGuardProps) {
  const { isFullscreen, requestFullscreen, violations } = useProctoring(onViolationLimit);
  const [started, setStarted] = useState(false);

  if (isMock) {
    return <>{children}</>;
  }

  if (!started || !isFullscreen) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <ShieldAlert className="mb-4 h-16 w-16 text-destructive" />
        <h2 className="mb-2 text-2xl font-bold">Secure Exam Environment</h2>
        <p className="mb-6 max-w-md text-muted-foreground">
          This exam requires full-screen mode. Exiting full-screen or switching tabs will be recorded as a violation. Two violations will auto-submit your exam.
        </p>
        <Button size="lg" onClick={() => {
          requestFullscreen();
          setStarted(true);
        }}>
          <Maximize className="mr-2 h-5 w-5" />
          Enter Fullscreen & Start
        </Button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {violations > 0 && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              x: [-0, -5, 5, -5, 5, 0] // Gentle shake on entry
            }}
            transition={{ 
              duration: 0.5,
              x: { duration: 0.4, delay: 0.2 }
            }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center bg-destructive py-2 text-destructive-foreground shadow-lg"
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            <span className="text-sm font-bold">
              WARNING: Tab switch detected! ({violations}/2 violations). One more will auto-submit.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={cn("h-screen overflow-hidden transition-all duration-300", violations > 0 && "pt-8")}>
        {children}
      </div>
    </>
  );
}
