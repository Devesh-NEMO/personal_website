import type { Stat } from "@/types";

/**
 * Hero stat tiles. Tones cycle mint → peach → periwinkle → pink.
 * Add or remove entries freely; the grid reflows on its own.
 */
export const stats: Stat[] = [
  { id: "projects", label: "Projects", value: "40+", tone: "mint" },
  { id: "dashboards", label: "Dashboards", value: "18", tone: "peach" },
  { id: "rows", label: "Rows analyzed", value: "2.4B", tone: "periwinkle" },
  { id: "tools", label: "Daily tools", value: "12", tone: "pink" },
];
