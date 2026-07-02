import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, delay = 0, y = 28, duration = 0.8, className = "", once = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({ children, className = "", stagger = 0.08, delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "", y = 24 }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
