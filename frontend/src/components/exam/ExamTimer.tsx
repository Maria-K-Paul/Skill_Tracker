import { Clock } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ExamTimerProps {
  formattedTime: string; // e.g. "59:59"
  isCritical: boolean;
}

function RollingDigit({ digit }: { digit: string }) {
  return (
    <div className="relative inline-flex h-[1.2em] w-[0.6em] overflow-hidden text-center items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function ExamTimer({ formattedTime, isCritical }: ExamTimerProps) {
  return (
    <motion.div 
      className={cn(
        "flex items-center space-x-2 rounded-lg border px-4 py-2 font-mono text-lg font-bold shadow-sm transition-colors duration-500",
        isCritical ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-background text-foreground"
      )}
      animate={isCritical ? {
        boxShadow: ["0px 0px 0px rgba(239,68,68,0)", "0px 0px 15px rgba(239,68,68,0.3)", "0px 0px 0px rgba(239,68,68,0)"]
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Clock className="h-5 w-5" />
      <div className="flex items-center">
        {formattedTime.split('').map((char, i) => (
          char === ':' ? (
            <span key={i} className="mx-0.5 opacity-70">:</span>
          ) : (
            <RollingDigit key={`${i}-${char}`} digit={char} />
          )
        ))}
      </div>
    </motion.div>
  );
}
