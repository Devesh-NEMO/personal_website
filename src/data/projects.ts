import type { Project } from "@/types";

/**
 * Case studies rendered in the Work section.
 *
 * `results` holds exactly two outcome bullets — the measurable "so what", not a
 * restatement of the description. `tone` sets the card background; the component
 * grid alternates them automatically, so you only need to set it when you want
 * to break the rhythm.
 */
export const projects: Project[] = [
  {
    id: "retail-demand",
    title: "Retail demand forecasting",
    description:
      "Rebuilt a 24-month weekly SKU forecast across 1,800 products, replacing a spreadsheet process that took four analysts a full week to run.",
    results: [
      "Cut MAPE from 31% to 12% after adding promo and stockout covariates",
      "Went from a 4-day refresh cycle to a nightly job the team runs themselves",
    ],
    tags: ["Python", "pandas", "Prophet", "BigQuery"],
    href: "https://github.com/your-handle/retail-forecast",
    image: "/images/projects/retail-demand.png",
    imageAlt: "Line chart of forecast versus actual weekly sales across 1,800 SKUs",
    tone: "mint",
  },
  {
    id: "churn-model",
    title: "Churn model & retention dashboard",
    description:
      "Built a gradient-boosted churn model and the dashboard that sells it, so lifecycle marketing could act on risk scores instead of intuition.",
    results: [
      "Identified 78% of churners 45 days before cancellation",
      "Saved roughly $310K in annual retention spend in the first two quarters",
    ],
    tags: ["scikit-learn", "SHAP", "Streamlit", "PostgreSQL"],
    href: "https://github.com/your-handle/churn-model",
    image: "/images/projects/churn-model.png",
    imageAlt: "Risk distribution of predicted churn scores by customer segment",
    tone: "peach",
  },
  {
    id: "marketing-mix",
    title: "Marketing mix attribution",
    description:
      "Reconciled ad platform, email and on-site event data into one model so finance and growth finally agreed on where the budget went.",
    results: [
      "Unified five tracking sources into a single reporting model",
      "Surfaced $180K of spend sitting in channels that returned nothing",
    ],
    tags: ["dbt", "SQL", "Looker", "Fivetran"],
    href: "https://github.com/your-handle/mix-attribution",
    image: "/images/projects/marketing-mix.png",
    imageAlt: "Table of channel spend and return on investment by campaign",
    tone: "periwinkle",
  },
  {
    id: "logistics-etl",
    title: "Logistics ETL pipeline",
    description:
      "Automated the nightly warehouse feed that three people used to babysit by hand, with alerting that pages someone when a load fails.",
    results: [
      "Eliminated 9 hours of manual spreadsheet work every week",
      "Freshness SLA moved from best-effort to a guaranteed 6am delivery",
    ],
    tags: ["Airflow", "Python", "Snowflake", "Great Expectations"],
    href: "https://github.com/your-handle/logistics-etl",
    image: "/images/projects/logistics-etl.png",
    imageAlt: "Diagram of the nightly warehouse ETL pipeline with load status per stage",
    tone: "pink",
  },
  {
    id: "product-funnel",
    title: "Product funnel diagnostics",
    description:
      "Instrumented a broken signup funnel end to end and found the one field that was quietly costing more signups than every other fix combined.",
    results: [
      "Recovered 6,400 signups per quarter by fixing a single redirect",
      "Cut funnel drop-off between step 2 and 3 by a third",
    ],
    tags: ["Amplitude", "SQL", "dbt", "Python"],
    href: "https://github.com/your-handle/funnel-diagnostics",
    image: "/images/projects/product-funnel.png",
    imageAlt: "Funnel chart showing the drop-off between the second and third signup steps",
    tone: "mint",
  },
  {
    id: "forecast-explainer",
    title: "Open-source forecast toolkit",
    description:
      "Packaged the time-series utilities I reuse on every project into a documented library, so the next analyst starts from a baseline instead of a blank notebook.",
    results: [
      "600+ stars and adopted by three other internal data teams",
      "Removed roughly 40 hours of copy-paste preprocessing per engagement",
    ],
    tags: ["NumPy", "statsmodels", "Polars", "PyPI"],
    href: "https://github.com/your-handle/forecast-toolkit",
    image: "/images/projects/forecast-explainer.png",
    imageAlt: "Bar chart comparing three forecasting models against actual demand",
    tone: "peach",
  },
];
