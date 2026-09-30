"use client";

import { useEffect, useState } from "react";

import { motion } from "@/lib/constants";

/**
 * =============================================================================
 * TOAST
 * =============================================================================
 * A short-lived notification at the bottom of the screen, primarily for
 * "Copied!" after the command menu copies an email address.
 *
 * Deliberately minimal: one message, no queue, no dismiss button. A second
 * toast while one is already showing replaces it rather than stacking.
 *
 * Exported as a hook rather than a component, so the consumer calls
 * `toast.show("message")` without needing to render anything. The <Toast />
 * component itself is mounted once in the layout, where it listens for events.
 */

type ToastState = {
  message: string;
  visible: boolean;
};

let listeners: Array<(state: ToastState) => void> = [];

export const toast = {
  show(message: string) {
    if (typeof window === "undefined") return;

    // Clear any existing timer and show the new message.
    const state: ToastState = { message, visible: true };
    listeners.forEach((fn) => fn(state));

    // Auto-hide after the configured duration.
    setTimeout(() => {
      listeners.forEach((fn) => fn({ message, visible: false }));
    }, motion.toastDuration);
  },
};

/**
 * The toast itself. Mount it once, high in the tree — `layout.tsx` alongside
 * the analytics component.
 */
export function Toast() {
  const [state, setState] = useState<ToastState>({ message: "", visible: false });

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((fn) => fn !== setState);
    };
  }, []);

  if (!state.message) return null;

  return (
    <div className="toast" data-visible={state.visible} role="status" aria-live="polite">
      {state.message}
    </div>
  );
}
