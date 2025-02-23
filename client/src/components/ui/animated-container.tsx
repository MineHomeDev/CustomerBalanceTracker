import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedContainer({ children, className }: AnimatedContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className }: AnimatedContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
