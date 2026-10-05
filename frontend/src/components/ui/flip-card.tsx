import { useState, useEffect } from "react";
import type { ReactNode, KeyboardEvent } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { ANIMATION_CONFIG } from "../../lib/animations";

export interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  flipped?: boolean;
  defaultFlipped?: boolean;
  trigger?: "hover" | "click" | "auto";
  axis?: "x" | "y";
  className?: string;
  onFlip?: (isFlipped: boolean) => void;
}

export function FlipCard({
  front,
  back,
  flipped: controlledFlipped,
  defaultFlipped = false,
  trigger = "click",
  axis = "y",
  className,
  onFlip
}: FlipCardProps) {
  const [uncontrolledFlipped, setUncontrolledFlipped] = useState(defaultFlipped);
  const isControlled = controlledFlipped !== undefined;
  const isFlipped = isControlled ? controlledFlipped : uncontrolledFlipped;
  const shouldReduceMotion = useReducedMotion();

  const handleFlip = (newFlipped: boolean) => {
    if (!isControlled) {
      setUncontrolledFlipped(newFlipped);
    }
    if (onFlip) {
      onFlip(newFlipped);
    }
  };

  const toggle = () => handleFlip(!isFlipped);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (trigger === "click" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      toggle();
    }
  };

  // Setup Spring for rotation
  const rotationTarget = isFlipped ? 180 : 0;
  
  const rotationSpring = useSpring(rotationTarget, {
    stiffness: ANIMATION_CONFIG.flipCard.stiffness,
    damping: ANIMATION_CONFIG.flipCard.damping,
    restDelta: 0.01
  });

  // Update spring when target changes
  useEffect(() => {
    rotationSpring.set(rotationTarget);
  }, [rotationTarget, rotationSpring]);

  // Transform rotation to shine sweep position
  const shineX = useTransform(rotationSpring, [0, 180], ["-150%", "250%"]);
  const shineOpacity = useTransform(rotationSpring, [0, 90, 180], [0, 0.4, 0]);

  // Prepare interaction handlers based on trigger
  const interactionProps = trigger === "hover" ? {
    onMouseEnter: () => handleFlip(true),
    onMouseLeave: () => handleFlip(false),
    onFocus: () => handleFlip(true),
    onBlur: () => handleFlip(false),
  } : trigger === "click" ? {
    onClick: toggle,
  } : {}; // auto means controlled externally

  return (
    <div 
      className={cn("group [perspective:1000px] relative", className)}
      role="button"
      tabIndex={trigger === "click" || trigger === "hover" ? 0 : -1}
      aria-pressed={isFlipped}
      onKeyDown={handleKeyDown}
      {...interactionProps}
    >
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
        style={{
          rotateY: !shouldReduceMotion && axis === "y" ? rotationSpring : 0,
          rotateX: !shouldReduceMotion && axis === "x" ? rotationSpring : 0,
        }}
      >
        {/* Front Face */}
        <motion.div
          className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden]",
            shouldReduceMotion ? "transition-opacity duration-300" : ""
          )}
          style={{
            opacity: shouldReduceMotion ? (isFlipped ? 0 : 1) : 1,
            pointerEvents: isFlipped ? "none" : "auto",
            zIndex: isFlipped ? 0 : 1,
          }}
          aria-hidden={isFlipped}
        >
          {front}

          {/* Shine Effect on Front */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit] overflow-hidden"
            >
              <motion.div 
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                style={{
                  left: shineX,
                  opacity: shineOpacity
                }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Back Face */}
        <motion.div
          className={cn(
            "absolute inset-0 w-full h-full [backface-visibility:hidden]",
            shouldReduceMotion ? "transition-opacity duration-300" : ""
          )}
          style={{
            rotateY: !shouldReduceMotion && axis === "y" ? 180 : 0,
            rotateX: !shouldReduceMotion && axis === "x" ? 180 : 0,
            opacity: shouldReduceMotion ? (isFlipped ? 1 : 0) : 1,
            pointerEvents: isFlipped ? "auto" : "none",
            zIndex: isFlipped ? 1 : 0,
          }}
          aria-hidden={!isFlipped}
        >
          {back}
        </motion.div>
      </motion.div>
    </div>
  );
}
