import { CheckCircle2, Loader2, Cloud, CloudUpload, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function AutosaveIndicator({ isSaving, lastSaved }: AutosaveIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground w-32 overflow-hidden">
      <AnimatePresence mode="wait">
        {isSaving ? (
          <motion.div 
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-2 text-primary"
          >
            <motion.div animate={{ y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <CloudUpload className="h-4 w-4" />
            </motion.div>
            <span>Saving...</span>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-2 text-success"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Check className="h-4 w-4" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2, duration: 1 }}
            >
              Saved {lastSaved ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
