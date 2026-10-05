import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface QuestionNavigatorProps {
  total: number;
  current: number;
  answers: Record<number, string>;
  flagged: number[];
  onSelect: (index: number) => void;
}

export function QuestionNavigator({ total, current, answers, flagged, onSelect }: QuestionNavigatorProps) {
  const getStatusClass = (idx: number) => {
    const isAnswered = answers[idx] !== undefined;
    const isFlagged = flagged.includes(idx);
    
    let baseClass = "bg-background border-input hover:bg-muted text-foreground";
    if (isAnswered && !isFlagged) {
      baseClass = "bg-success text-white border-success";
    } else if (isFlagged && !isAnswered) {
      baseClass = "bg-primary text-white border-primary";
    } else if (isFlagged && isAnswered) {
      baseClass = "bg-primary text-white border-success/30 border-2";
    }

    if (idx === current) {
      return cn(baseClass, "ring-2 ring-primary ring-offset-2 dark:ring-offset-background");
    }
    return baseClass;
  };

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 overflow-y-auto max-h-[400px] p-1">
      {Array.from({ length: total }).map((_, idx) => {
        const isAnswered = answers[idx] !== undefined;
        const isFlagged = flagged.includes(idx);
        // Compute a simple string key representing the visual state so framer motion can animate when it changes
        const stateKey = `${isAnswered}-${isFlagged}-${idx === current}`;
        
        return (
          <motion.button
            key={idx}
            layout
            initial={false}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(idx)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors duration-300 relative",
              getStatusClass(idx)
            )}
          >
            <motion.span 
              key={stateKey}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {idx + 1}
            </motion.span>
            
            {isAnswered && isFlagged && (
               <motion.span 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring" }}
                 className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success/100 border border-white dark:border-background" 
               />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
