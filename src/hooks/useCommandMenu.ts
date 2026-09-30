"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { track } from "@/lib/analytics";
import type { CommandItem } from "@/types";

/* =============================================================================
 * FUZZY FILTER
 * -------------------------------------------------------------------------- */

type GroupedItems = { group: string; items: CommandItem[] };

/**
 * Filters and scores items by a fuzzy match, then groups them.
 *
 * Every word in the query (split on whitespace) must appear somewhere in the
 * item's label or keywords, in any order. Score is the sum of match positions:
 * earlier is better, and label matches are weighted higher than keyword matches.
 *
 * An empty query returns everything, in its original order.
 */
function filterAndGroup(items: CommandItem[], query: string): GroupedItems[] {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return groupBy(items, (item) => item.group);
  }

  const words = trimmed.split(/\s+/);

  type Scored = CommandItem & { score: number };

  const scored: Scored[] = items
    .map((item) => {
      const label = item.label.toLowerCase();
      const keywords = (item.keywords ?? []).map((k) => k.toLowerCase()).join(" ");

      let score = 0;
      let matched = true;

      for (const word of words) {
        const labelIndex = label.indexOf(word);
        const keywordIndex = keywords.indexOf(word);

        if (labelIndex === -1 && keywordIndex === -1) {
          matched = false;
          break;
        }

        score += labelIndex !== -1 ? labelIndex : 100 + keywordIndex;
      }

      return matched ? { ...item, score } : null;
    })
    .filter((item): item is Scored => item !== null)
    .sort((a, b) => a.score - b.score);

  return groupBy(scored, (item) => item.group);
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): { group: string; items: T[] }[] {
  const map = new Map<string, T[]>();

  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);

    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return Array.from(map.entries()).map(([group, groupItems]) => ({
    group,
    items: groupItems,
  }));
}

/* =============================================================================
 * HOOK
 * -------------------------------------------------------------------------- */

/**
 * Manages the command palette's open state, keyboard shortcut, item filtering,
 * and arrow-key navigation.
 *
 * Returns plain state values and callbacks — NOT an object that includes a ref,
 * which React 19's `react-hooks/refs` rule would mark as "accessing a ref during
 * render" the moment any returned value is read in JSX.
 */
export function useCommandMenu(items: CommandItem[]) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = filterAndGroup(items, query);
  const flatItems = filtered.flatMap((g) => g.items);

  // Clamp when the list shrinks — computed from the new value rather than set
  // in an effect, which is what the lint rule below objects to.
  const clampedActiveIndex =
    flatItems.length > 0 && activeIndex >= flatItems.length
      ? flatItems.length - 1
      : activeIndex;

  const openMenu = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
    track("command_menu_open");
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const runActive = useCallback(() => {
    const item = flatItems[clampedActiveIndex];
    if (!item) return;
    item.run();
    closeMenu();
  }, [flatItems, clampedActiveIndex, closeMenu]);

  // Cmd/Ctrl + K
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (open) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openMenu, closeMenu]);

  // Arrow keys and Enter, only while open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(1, flatItems.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) =>
          (i - 1 + flatItems.length) % Math.max(1, flatItems.length),
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        runActive();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, flatItems.length, runActive]);

  // Focus the input when the menu opens.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useLockBodyScroll(open);

  return {
    open,
    openMenu,
    closeMenu,
    query,
    setQuery,
    activeIndex: clampedActiveIndex,
    setActiveIndex,
    runActive,
    filtered,
    flatItems,
    inputRef,
  } as const;
}
