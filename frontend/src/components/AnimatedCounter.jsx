import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

export default function AnimatedCounter({ value = 0, suffix = "", duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  const displayRef = useRef(null);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (displayRef.current) displayRef.current.textContent = Math.round(v).toLocaleString() + suffix;
    });
    return unsub;
  }, [spring, suffix]);

  return (
    <motion.span ref={ref} className={className}>
      <span ref={displayRef}>0{suffix}</span>
    </motion.span>
  );
}
