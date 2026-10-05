import React from "react";
import { motion } from "framer-motion";
import { pageTransitionVariants } from "../../lib/animations";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};
