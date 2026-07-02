import { motion } from "framer-motion";

/**
 * Splits text into words and reveals them with a staggered rise + blur-in,
 * triggered once the heading enters the viewport.
 */
export default function SplitHeading({ text, as: Tag = "h2", className = "", delay = 0, stagger = 0.045 }) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
        style={{ display: "inline" }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
            <motion.span
              style={{ display: "inline-block" }}
              variants={{
                hidden: { y: "110%", opacity: 0, filter: "blur(6px)" },
                show: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
