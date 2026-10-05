import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import { ANIMATION_CONFIG } from "../../lib/animations";

interface GradientBandsProps {
  bands?: number;
  palette?: string[];
  speed?: number;
  className?: string;
  children?: React.ReactNode;
  overlayClassName?: string;
}

// Deterministic pseudo-random number generator for stable SSR/Hydration matching
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export function GradientBands({
  bands = 6,
  palette = [
    "hsl(var(--primary) / 0.1)",
    "hsl(var(--primary) / 0.4)",
    "hsl(var(--primary) / 0.8)",
    "hsl(var(--primary) / 0.4)",
    "hsl(var(--primary) / 0.1)",
  ],
  speed = 1,
  className,
  children,
  overlayClassName,
}: GradientBandsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const shouldReduceMotion = useReducedMotion();

  // Create bands array
  const bandArray = Array.from({ length: bands });

  return (
    <div ref={ref} className={cn("relative w-full h-full overflow-hidden flex", className)}>
      {/* The Bands Container */}
      <div className="absolute inset-0 flex w-full h-full">
        {bandArray.map((_, i) => {
          // Generate stable random-like values for phase, duration, and direction based on index
          const rand = seededRandom(i * 1234);
          const duration = (6 + rand * 4) * (ANIMATION_CONFIG.gradientBands.durationMultiplier / speed);
          const direction = seededRandom(i * 4321) > 0.5 ? 1 : -1;
          const yRange = direction > 0 ? ["-50%", "0%"] : ["0%", "-50%"];
          
          return (
            <div key={i} className="relative flex-1 h-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-full"
                style={{
                  height: "200%",
                  background: `linear-gradient(to bottom, ${palette.join(", ")})`,
                  // Static frame if motion is reduced or not in view
                  translateY: shouldReduceMotion ? yRange[0] : undefined,
                }}
                animate={
                  !shouldReduceMotion && isInView
                    ? { translateY: yRange }
                    : { translateY: yRange[0] } // Pause at start frame when out of view
                }
                transition={{
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: duration,
                  ease: ANIMATION_CONFIG.gradientBands.ease,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Overlay to ensure AA contrast for text */}
      <div className={cn("absolute inset-0 z-10 pointer-events-none", overlayClassName)} />

      {/* Children content (usually text) */}
      {children && (
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}
