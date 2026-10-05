import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ANIMATION_CONFIG } from "../../lib/animations";
import { cn } from "../../lib/utils";

interface FallingLettersProps {
  text: string;
  variant: "pass" | "fail";
  className?: string;
  onComplete?: () => void;
}

export function FallingLetters({ text, variant, className, onComplete }: FallingLettersProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);
  const letters = text.split("");
  
  const config = ANIMATION_CONFIG.fallingLetters[variant];

  // Helper for random rotations
  const randomRotate = (index: number, max: number) => {
    // Deterministic random so it doesn't jump around on re-renders, alternating direction
    const sign = index % 2 === 0 ? 1 : -1;
    const amount = (index * 7 + 13) % max; 
    return sign * Math.max(amount, 3);
  };

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : config.stagger,
      },
    },
  };

  const letterVariants = {
    hidden: (i: number) => {
      if (prefersReducedMotion) return { opacity: 1, y: 0, rotate: randomRotate(i, config.tiltMax) };
      
      const startRotate = variant === "pass" 
        ? (i % 2 === 0 ? 1 : -1) * (45 + ((i * 13) % 45)) 
        : 0;

      return {
        opacity: 0,
        y: config.yDrop,
        rotate: startRotate,
        scale: variant === "pass" ? 1.5 : 1,
      };
    },
    visible: (i: number) => {
      const finalRotate = randomRotate(i, config.tiltMax);
      return {
        opacity: 1,
        y: 0,
        rotate: finalRotate,
        scale: 1,
        transition: {
          type: "spring" as const,
          stiffness: config.stiffness,
          damping: config.damping,
        },
      };
    },
  };

  return (
    <motion.div
      className={cn("flex justify-center overflow-clip px-4 py-8", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={() => {
        if (!hasAnimated) {
          setHasAnimated(true);
          onComplete?.();
        }
      }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          // Idle drift animation for pass state after settling
          animate={
            hasAnimated && variant === "pass" && !prefersReducedMotion
              ? {
                  y: [0, -3, 0],
                  rotate: [randomRotate(i, config.tiltMax), randomRotate(i, config.tiltMax) + 2, randomRotate(i, config.tiltMax)],
                  transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                }
              : undefined
          }
          className={cn(
            "inline-block font-mono font-black text-5xl md:text-7xl",
            variant === "pass" 
              ? "text-primary drop-shadow-lg" 
              : "text-muted-foreground drop-shadow-sm"
          )}
          style={{ transformOrigin: "bottom center" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
