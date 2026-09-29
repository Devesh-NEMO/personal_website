/**
 * Minimal class-name joiner.
 *
 * Replaces clsx + tailwind-merge so the project ships without two extra
 * dependencies. Handles the three shapes we actually use: strings, falsy
 * values (for `condition && "class"`), and conditional objects.
 *
 * Note: this concatenates, it does not de-duplicate conflicting Tailwind
 * classes. That is fine here because callers never pass competing utilities.
 */
export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
      continue;
    }

    for (const key of Object.keys(input)) {
      if (input[key]) out.push(key);
    }
  }

  return out.join(" ");
}
