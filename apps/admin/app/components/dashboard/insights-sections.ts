export const INSIGHT_SECTIONS = [
  'calendar',
  'in-season',
  'leaving',
  'coming',
  'out',
  'stock',
  'suggestions',
  'market',
] as const;

export type InsightSection = (typeof INSIGHT_SECTIONS)[number];

/** The `insight` URL value, if it names a section. */
export function readInsightSection(value: string | null): InsightSection | null {
  return INSIGHT_SECTIONS.find(section => section === value) ?? null;
}
