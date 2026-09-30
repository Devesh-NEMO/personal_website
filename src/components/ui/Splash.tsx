"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { motion } from "@/lib/constants";
import { site } from "@/data/site";

/**
 * =============================================================================
 * LOADING SPLASH
 * =============================================================================
 * A short first-visit greeting: the "DK." logo, a chunky progress bar that
 * fills in steps, and a line of text cycling through data-themed messages.
 *
 * Three constraints:
 *
 *   1. **First visit only.** `sessionStorage` marks it seen.
 *   2. **Non-blocking.** The page content is in the HTML from first paint.
 *      This overlays it after hydration. If JS fails, the splash never mounts.
 *   3. **Reduced motion skips it entirely.**
 *
 * Exit: the splash slides up (transform only) to reveal the page.
 */

/**
 * Read once, outside React's render cycle, so React 19's ref rules are not
 * involved. The value is `true` when the splash has not yet been shown in this
 * browser session.
 */
function shouldShowSplash(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !window.sessionStorage.getItem(site.splash.storageKey);
  } catch {
    return false;
  }
}

export function Splash() {
  const reducedMotion = usePrefersReducedMotion();

  /*
   * Initialise to `true` when the splash should render — the effect below will
   * drive progress and eventually flip it to `false` (dismissed). If reduced
   * motion is on or sessionStorage says "already seen", start as `false` and
   * render nothing.
   */
  const [visible, setVisible] = useState(() => !reducedMotion && shouldShowSplash());
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const steps = motion.splashSteps;
    const stepDuration = motion.splashStepDuration;
    const messages = site.splash.messages;
    let stepIndex = 0;
    let alive = true;

    const interval = setInterval(() => {
      if (!alive) return;

      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex]);

        const msgIndex = Math.min(
          Math.floor((stepIndex / steps.length) * messages.length),
          messages.length - 1,
        );
        setMessageIndex(msgIndex);
        stepIndex += 1;
      } else {
        clearInterval(interval);

        // Hold at 100% briefly, then start the exit slide.
        setTimeout(() => {
          if (!alive) return;
          setExiting(true);

          // Once the slide finishes, dismiss and mark seen.
          setTimeout(() => {
            if (!alive) return;
            setVisible(false);
            try {
              window.sessionStorage.setItem(site.splash.storageKey, "true");
            } catch {
              // Ignore
            }
          }, motion.splashDuration);
        }, stepDuration);
      }
    }, stepDuration);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="splash"
      data-exiting={exiting}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="text-5xl font-black tracking-tighter sm:text-6xl">
        {site.shortTitle}
      </div>

      <div className="splash-progress">
        <div
          className="splash-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="splash-message">
        {site.splash.messages[messageIndex]}
      </div>
    </div>
  );
}
