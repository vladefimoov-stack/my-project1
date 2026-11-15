"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

const KEY = "kl_cookie_notice";

/**
 * The site only uses strictly-necessary storage (language preference, bag),
 * which does not require consent under the ePrivacy Directive. This notice
 * informs visitors transparently. If analytics/marketing tools are added
 * later, replace this with a real opt-in consent manager.
 */
export function CookieNotice() {
  const { dict, locale } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);
  const ok = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="region"
          aria-label="Cookies"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-line bg-white/95 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] backdrop-blur sm:flex-row sm:items-center"
        >
          <p className="flex-1 text-[13px] leading-relaxed text-ink/75">
            {dict.cookies.text}{" "}
            <Link href={`/${locale}/privacy`} className="link-underline text-ink">
              {dict.cookies.more}
            </Link>
          </p>
          <button type="button" onClick={ok} className="btn-primary h-10 px-6">
            {dict.cookies.ok}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
