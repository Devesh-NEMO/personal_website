"use client";

import { useCallback, useEffect, useRef } from "react";

import { useCommandMenu } from "@/hooks/useCommandMenu";
import { track } from "@/lib/analytics";
import { toast } from "@/components/ui/Toast";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { nav } from "@/data/profile";
import type { CommandItem } from "@/types";

/**
 * =============================================================================
 * COMMAND MENU (Cmd / Ctrl + K)
 * =============================================================================
 * A keyboard-driven search palette: Navigate, Projects, and Actions, all built
 * from the data files rather than hardcoded here.
 *
 * Three groups:
 *
 *   - **Navigate:** About, Work, Skills, Contact — smooth-scroll to the section.
 *   - **Projects:** one entry per project — scrolls to the Work section.
 *   - **Actions:** Toggle dark mode, Copy email, Download CV (if present),
 *     Open GitHub, Open LinkedIn.
 *
 * Fuzzy search, arrow-key navigation, Enter to run, Escape to close. A focus
 * trap keeps Tab/Shift+Tab inside the dialog, and focus returns to the
 * previously focused element on close.
 */
export function CommandMenu() {
  const items = useCommandItems();
  const {
    open,
    openMenu,
    closeMenu,
    query,
    setQuery,
    activeIndex,
    setActiveIndex,
    runActive,
    filtered,
    flatItems,
    inputRef,
  } = useCommandMenu(items);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!dialogRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, closeMenu]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  // Save/restore focus.
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Focus trap.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const { command } = site;

  const activeItem = flatItems[activeIndex];
  const activeDescendant = activeItem ? `cmd-${activeItem.id}` : undefined;

  return (
    <>
      {/* Trigger: wide on desktop, icon-only on mobile */}
      <button
        type="button"
        onClick={openMenu}
        aria-label={command.triggerLabel}
        className="brutal-pill brutal-border hidden items-center gap-2 bg-surface px-4 py-2 text-sm font-extrabold shadow-brutal transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg md:inline-flex"
      >
        <SearchIcon className="size-4" />
        <span>{command.triggerLabel}</span>
        <kbd className="brutal-pill brutal-border bg-bg px-2 py-0.5 text-xs font-black">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={openMenu}
        aria-label={command.triggerIconLabel}
        className="brutal-pill brutal-border grid size-11 shrink-0 place-items-center bg-surface shadow-brutal transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg md:hidden"
      >
        <SearchIcon className="size-5" />
      </button>

      {/* Backdrop */}
      <div
        className="command-backdrop"
        data-open={open}
        onClick={closeMenu}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={command.label}
        className="command-dialog"
        data-open={open}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={command.placeholder}
          className="command-input"
          aria-autocomplete="list"
          aria-controls="command-list"
          aria-activedescendant={activeDescendant}
        />

        <div id="command-list" role="listbox" className="command-list">
          {filtered.length === 0 ? (
            <div className="command-empty">{command.emptyMessage}</div>
          ) : (
            filtered.map((group) => (
              <div key={group.group} className="command-group">
                <div className="command-group-heading">{group.group}</div>
                {group.items.map((item) => {
                  const globalIndex = flatItems.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      id={`cmd-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={globalIndex === activeIndex}
                      data-active={globalIndex === activeIndex}
                      onClick={() => {
                        item.run();
                        closeMenu();
                      }}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                      className="command-item"
                    >
                      <span>{item.label}</span>
                      {item.hint && (
                        <span className="command-item-hint">{item.hint}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="command-footer">
          <span className="command-footer-item">{command.shortcuts.move}</span>
          <span className="command-footer-item">
            {command.shortcuts.select}
          </span>
          <span className="command-footer-item">{command.shortcuts.close}</span>
        </div>
      </div>
    </>
  );
}

/* =============================================================================
 * ITEM BUILDER
 * -------------------------------------------------------------------------- */

/** Builds the full item list from the data files. */
function useCommandItems(): CommandItem[] {
  const { command, links } = site;

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    try {
      window.localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // Ignore
    }
    track("theme_toggle", { mode: isDark ? "dark" : "light" });
  }, []);

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const copyEmail = useCallback(() => {
    navigator.clipboard?.writeText(links.email).then(() => {
      toast.show("Copied!");
      track("contact_click", { method: "email" });
    });
  }, [links.email]);

  const openLink = useCallback(
    (url: string, method: string) => {
      window.open(url, "_blank", "noopener,noreferrer");
      track("contact_click", { method });
    },
    [],
  );

  const downloadCv = useCallback(() => {
    const a = document.createElement("a");
    a.href = links.cv;
    a.download = "cv.pdf";
    a.click();
    track("cv_download");
  }, [links.cv]);

  const items: CommandItem[] = [
    // Navigate
    ...nav.links.map((link) => ({
      id: `nav-${link.href}`,
      label: link.label,
      group: command.groups.navigate,
      run: () => scrollTo(link.href.slice(1)),
    })),

    // Projects
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      label: project.title,
      group: command.groups.projects,
      keywords: project.tags,
      run: () => {
        scrollTo("work");
        setTimeout(
          () => track("project_click", { name: project.title }),
          100,
        );
      },
    })),

    // Actions
    {
      id: "action-theme",
      label: command.actions.toggleTheme,
      group: command.groups.actions,
      run: toggleTheme,
    },
    {
      id: "action-email",
      label: command.actions.copyEmail,
      group: command.groups.actions,
      hint: command.hints.email,
      run: copyEmail,
    },
    ...(links.cv
      ? [
          {
            id: "action-cv",
            label: command.actions.downloadCv,
            group: command.groups.actions,
            hint: command.hints.cv,
            run: downloadCv,
          },
        ]
      : []),
    {
      id: "action-github",
      label: command.actions.openGithub,
      group: command.groups.actions,
      hint: command.hints.github,
      run: () => openLink(links.github, "github"),
    },
    {
      id: "action-linkedin",
      label: command.actions.openLinkedin,
      group: command.groups.actions,
      hint: command.hints.linkedin,
      run: () => openLink(links.linkedin, "linkedin"),
    },
  ];

  return items;
}

/* =============================================================================
 * SVG
 * -------------------------------------------------------------------------- */

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
