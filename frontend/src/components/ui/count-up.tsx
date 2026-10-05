import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ANIMATION_CONFIG } from "../../lib/animations";

export function CountUp({ value, delay = 0, className }: { value: number, delay?: number, className?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(0, value, { 
      duration: 1.5, 
      delay, 
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (val) => count.set(val)
    });
    return controls.stop;
  }, [value, delay, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
