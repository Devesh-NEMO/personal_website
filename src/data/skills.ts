import type { SkillGroup } from "@/types";

/**
 * The four skill clusters in the Skills section. Each renders as a card with a
 * heading and a set of pill tags.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "frontend",
    title: "Frontend Core",
    tone: "mint",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "HTML",
      "CSS",
      "Vue.js",
      "Svelte",
    ],
  },
  {
    id: "styling",
    title: "Styling & UI",
    tone: "peach",
    items: [
      "Tailwind CSS",
      "CSS Modules",
      "Styled Components",
      "Sass",
      "Framer Motion",
      "shadcn/ui",
      "Radix UI",
    ],
  },
  {
    id: "backend",
    title: "Backend & APIs",
    tone: "periwinkle",
    items: [
      "Node.js",
      "Express",
      "FastAPI",
      "REST APIs",
      "GraphQL",
      "Prisma",
      "MongoDB",
      "PostgreSQL",
    ],
  },
  {
    id: "tools",
    title: "Tools & Workflow",
    tone: "pink",
    items: [
      "Git",
      "GitHub",
      "VS Code",
      "Figma",
      "Webpack",
      "Vite",
      "ESLint",
      "Prettier",
    ],
  },
];
