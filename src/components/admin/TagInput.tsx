"use client";

import { useState } from "react";

import { Input } from "@/components/admin/Input";
import { Button } from "@/components/ui/Button";

type TagInputProps = {
  /** Submitted name. Each value is one hidden input, read with getAll(). */
  name: string;
  defaultValue?: string[];
  placeholder?: string;
  id?: string;
  /** Lowercase + dashed ids for keys; leave undefined for free text (tags). */
  normalize?: (value: string) => string;
};

/**
 * A list of short strings edited as removable chips.
 *
 * The committed values are rendered as hidden inputs sharing one `name`, so a
 * server action reads them with `formData.getAll(name)`. The visible text box
 * that adds a value is intentionally unnamed — it is UI, not data.
 */
export function TagInput({
  name,
  defaultValue = [],
  placeholder = "Type and press Enter",
  id,
  normalize,
}: TagInputProps) {
  const [values, setValues] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  function add() {
    const raw = draft.trim();
    if (!raw) return;
    const value = normalize ? normalize(raw) : raw;
    if (!value) return;
    setValues((current) => (current.includes(value) ? current : [...current, value]));
    setDraft("");
  }

  function remove(value: string) {
    setValues((current) => current.filter((item) => item !== value));
  }

  return (
    <div className="flex flex-col gap-3">
      {values.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li key={value}>
              {/* The chunk of data the form actually submits. */}
              <input type="hidden" name={name} value={value} />
              <span className="brutal-pill brutal-border inline-flex items-center gap-1.5 bg-surface px-3 py-1 text-xs font-bold tracking-tight">
                {value}
                <button
                  type="button"
                  onClick={() => remove(value)}
                  aria-label={`Remove ${value}`}
                  className="-mr-0.5 grid size-4 place-items-center rounded-full text-sm leading-none hover:bg-accent hover:text-accent-ink"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs font-medium tracking-tight text-fg/60">Nothing added yet.</p>
      )}

      <div className="flex items-start gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // Enter adds a chip instead of submitting the whole form.
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="secondary" onClick={add} className="shrink-0">
          Add
        </Button>
      </div>
    </div>
  );
}
