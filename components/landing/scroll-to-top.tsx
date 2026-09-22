"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed right-6 bottom-6 z-40 flex size-11 items-center justify-center rounded-full bg-brand-navy text-white shadow-lg transition-colors hover:bg-brand-navy/90 dark:bg-white dark:text-brand-navy dark:hover:bg-white/90"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
