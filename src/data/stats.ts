import type { Stat } from "@/types";

/**
 * Hero stat tiles. Tones cycle mint → peach → periwinkle → pink.
 * Add or remove entries freely; the grid reflows on its own.
 */
export const stats: Stat[] = [
  { id: "projects", label: "Projects", value: "20+", tone: "mint" },
  { id: "components", label: "Components", value: "150+", tone: "peach" },
  { id: "commits", label: "Commits", value: "800+", tone: "periwinkle" },
  { id: "sites", label: "Sites", value: "12", tone: "pink" },
];
