import React from "react";
import { motion, useInView } from "framer-motion";
import { revealVariants, ANIMATION_CONFIG } from "../../lib/animations";

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
}

export const Reveal = ({ children, width = "100%", delay = 0 }: RevealProps) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} style={{ width, position: "relative", overflow: "hidden" }}>
      <motion.div
        variants={revealVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ 
          delay, 
          duration: ANIMATION_CONFIG.transition.duration, 
          ease: ANIMATION_CONFIG.transition.ease 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
