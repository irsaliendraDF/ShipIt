/**
 * shipit.build catalog — 12 pre-built vibe-coded tools.
 *
 * Descriptions sourced from the build spec at
 * https://www.notion.so/35e7b3f7964681b88941cce11b46eeda (Section 5).
 * Richer per-tool detail lives in the Vibe Coding Ideas database at
 * https://www.notion.so/9fcbd388ddb6406280da10d8a697b012 — pull from there
 * if you ever want to extend a card with a longer-form story.
 *
 * NB: keep this list ordered by category (the page renders thin pixel-font
 * category dividers between groups).
 */

export type CatalogCategory =
  | 'quizzes-assessments'
  | 'decision-wheels'
  | 'animated-frameworks'
  | 'workshop-activities';

export type CatalogSprite = 'SHIP' | 'BUILD' | 'SPARK' | 'BOLT';

export type CatalogTool = {
  slug: string;
  name: string;
  category: CatalogCategory;
  /** CAD, per single-asset purchase. Bundle of 3 is a flat $1,500 regardless. */
  price: number;
  description: string;
  sprite: CatalogSprite;
  /** Optional: true when an interactive template exists at /build/preview/[slug]. */
  hasPreview?: boolean;
};

export const CATEGORY_LABEL: Record<CatalogCategory, string> = {
  'quizzes-assessments': 'Quizzes & Assessments',
  'decision-wheels': 'Decision Wheels',
  'animated-frameworks': 'Animated Frameworks',
  'workshop-activities': 'Workshop Activities',
};

export const catalog: CatalogTool[] = [
  // Quizzes & Assessments
  {
    slug: 'interactive-quiz',
    name: 'Interactive Quiz',
    category: 'quizzes-assessments',
    price: 450,
    description:
      'multi-choice quiz with score tracking, branded results page, and shareable outcomes. for marketers, educators, and agencies who want a branded alternative to free quiz platforms.',
    sprite: 'SPARK',
    hasPreview: true,
  },
  {
    slug: 'knowledge-game',
    name: 'Knowledge Game',
    category: 'quizzes-assessments',
    price: 550,
    description:
      'real-time multiplayer trivia with timer, points, leaderboard. white-label alternative to live trivia tools. solo or team mode.',
    sprite: 'BOLT',
    hasPreview: true,
  },
  {
    slug: 'personality-assessment',
    name: 'Personality Assessment',
    category: 'quizzes-assessments',
    price: 650,
    description:
      'question-based archetype assessment with personalized results, recommendations, and social share. classic "what\'s your X type" lead-gen tool.',
    sprite: 'SPARK',
    hasPreview: true,
  },
  {
    slug: 'diagnostic-scorecard',
    name: 'Diagnostic Scorecard',
    category: 'quizzes-assessments',
    price: 750,
    description:
      'multi-axis scored assessment with personalized scorecard, recommendations, branded PDF export. premium lead-gen for consultants.',
    sprite: 'BUILD',
    hasPreview: true,
  },

  // Decision Wheels
  {
    slug: 'spinning-wheel',
    name: 'Spinning Wheel',
    category: 'decision-wheels',
    price: 300,
    description:
      'customizable branded spinning wheel for live picks, raffles, group assignments. workshop and event staple, professionalized.',
    sprite: 'BOLT',
    hasPreview: true,
  },
  {
    slug: 'random-picker',
    name: 'Random Picker (Card Deck)',
    category: 'decision-wheels',
    price: 300,
    description:
      'animated card-deck randomizer for prompts, icebreakers, names, random decisions. lightweight, fast to ship.',
    sprite: 'SPARK',
    hasPreview: true,
  },

  // Animated Frameworks
  {
    slug: '2x2-matrix',
    name: '2x2 Matrix Visualizer',
    category: 'animated-frameworks',
    price: 500,
    description:
      'drag-to-place interactive 2x2 grid. Eisenhower, BCG, importance-effort, custom framework. exportable, shareable.',
    sprite: 'BUILD',
    hasPreview: true,
  },
  {
    slug: 'sales-funnel',
    name: 'Sales Funnel Visualizer',
    category: 'animated-frameworks',
    price: 550,
    description:
      'editable animated sales funnel with live calculations and exportable visuals. for sales, RevOps, and marketing consultants.',
    sprite: 'BUILD',
    hasPreview: true,
  },
  {
    slug: 'customer-journey',
    name: 'Customer Journey Mapper',
    category: 'animated-frameworks',
    price: 700,
    description:
      'interactive journey map with stages, touchpoints, emotion curve, pain markers. UX consultant deliverable, made live.',
    sprite: 'SHIP',
    hasPreview: true,
  },
  {
    slug: 'pyramid-framework',
    name: 'Pyramid Framework Visualizer',
    category: 'animated-frameworks',
    price: 450,
    description:
      "animated tiered pyramid for Maslow, Bloom's, maturity models, custom frameworks. click-to-reveal stages.",
    sprite: 'BUILD',
    hasPreview: true,
  },

  // Workshop Activities
  {
    slug: 'live-voting',
    name: 'Live Voting Tool',
    category: 'workshop-activities',
    price: 500,
    description:
      'real-time audience voting with live bar chart. no participant signup, host-controlled. white-label alternative to live polling tools.',
    sprite: 'BOLT',
    hasPreview: true,
  },
  {
    slug: 'word-cloud',
    name: 'Word Cloud Generator',
    category: 'workshop-activities',
    price: 400,
    description:
      'live audience word cloud, real-time aggregation, branded backdrop, PNG export for recaps. workshop and conference staple.',
    sprite: 'SPARK',
    hasPreview: true,
  },
];

export const CATEGORY_ORDER: CatalogCategory[] = [
  'quizzes-assessments',
  'decision-wheels',
  'animated-frameworks',
  'workshop-activities',
];

/** Group catalog tools by category for the rendered grid. */
export function catalogByCategory(): Record<CatalogCategory, CatalogTool[]> {
  const out: Record<CatalogCategory, CatalogTool[]> = {
    'quizzes-assessments': [],
    'decision-wheels': [],
    'animated-frameworks': [],
    'workshop-activities': [],
  };
  for (const tool of catalog) out[tool.category].push(tool);
  return out;
}

export function getCatalogTool(slug: string): CatalogTool | undefined {
  return catalog.find((t) => t.slug === slug);
}
