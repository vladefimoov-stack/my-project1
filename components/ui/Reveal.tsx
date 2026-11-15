"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/** Scroll-triggered fade/slide reveal. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
  ...rest
}: { children: React.ReactNode; delay?: number; y?: number; as?: "div" | "li" | "section" } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const Comp = as === "li" ? motion.li : as === "section" ? motion.section : motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...(rest as object)}
    >
      {children}
    </Comp>
  );
}
