import type { ComponentType } from 'react';
import { SpinningWheelTemplate } from './SpinningWheelTemplate';
import { InteractiveQuizTemplate } from './InteractiveQuizTemplate';
import { PyramidFrameworkTemplate } from './PyramidFrameworkTemplate';
import { Matrix2x2Template } from './Matrix2x2Template';

/**
 * Registry of slugs that have an interactive preview template.
 * Catalog cards with `hasPreview: true` must have a matching entry here.
 */
export const TEMPLATE_REGISTRY: Record<string, ComponentType> = {
  'spinning-wheel': SpinningWheelTemplate,
  'interactive-quiz': InteractiveQuizTemplate,
  'pyramid-framework': PyramidFrameworkTemplate,
  '2x2-matrix': Matrix2x2Template,
};

export function getTemplate(slug: string): ComponentType | null {
  return TEMPLATE_REGISTRY[slug] ?? null;
}
