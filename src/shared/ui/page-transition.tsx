import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Page transition component using Framer Motion
 * - Fade + slide animation (0.25s)
 * - Smooth easeOut timing
 * - Used with AnimatePresence for route transitions
 */
export const PageTransition = ({ children }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    style={{ width: "100%" }}
  >
    {children}
  </motion.div>
);
