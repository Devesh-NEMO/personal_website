import type { SkillGroup } from "@/types";

/**
 * The four skill clusters in the Skills section. Each renders as a card with a
 * heading and a set of pill tags.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "data",
    title: "Data & Databases",
    tone: "mint",
    items: [
      "SQL",
      "Python",
      "PostgreSQL",
      "BigQuery",
      "Snowflake",
      "dbt",
      "Airflow",
      "Spark",
      "Excel",
    ],
  },
  {
    id: "programming",
    title: "Programming",
    tone: "peach",
    items: [
      "pandas",
      "NumPy",
      "scikit-learn",
      "statsmodels",
      "SQLAlchemy",
      "Polars",
      "FastAPI",
      "Docker",
    ],
  },
  {
    id: "visualization",
    title: "Visualization",
    tone: "periwinkle",
    items: ["Tableau", "Power BI", "Looker", "Plotly", "Matplotlib", "Streamlit", "Metabase"],
  },
  {
    id: "other",
    title: "Other",
    tone: "pink",
    items: [
      "Statistics",
      "A/B Testing",
      "Forecasting",
      "dbt Metrics",
      "Git",
      "Data Docs",
      "Agile",
    ],
  },
];
