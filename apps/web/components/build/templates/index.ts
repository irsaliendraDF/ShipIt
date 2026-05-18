import type { ComponentType } from 'react';
import { SpinningWheelTemplate } from './SpinningWheelTemplate';
import { InteractiveQuizTemplate } from './InteractiveQuizTemplate';
import { PyramidFrameworkTemplate } from './PyramidFrameworkTemplate';
import { Matrix2x2Template } from './Matrix2x2Template';
import { RandomPickerTemplate } from './RandomPickerTemplate';
import { PersonalityAssessmentTemplate } from './PersonalityAssessmentTemplate';
import { SalesFunnelTemplate } from './SalesFunnelTemplate';
import { CustomerJourneyTemplate } from './CustomerJourneyTemplate';
import { WordCloudTemplate } from './WordCloudTemplate';
import { DiagnosticScorecardTemplate } from './DiagnosticScorecardTemplate';
import { KnowledgeGameTemplate } from './KnowledgeGameTemplate';
import { LiveVotingTemplate } from './LiveVotingTemplate';

/**
 * Registry of slugs that have an interactive preview template.
 * Catalog cards with `hasPreview: true` must have a matching entry here.
 */
export const TEMPLATE_REGISTRY: Record<string, ComponentType> = {
  'spinning-wheel': SpinningWheelTemplate,
  'interactive-quiz': InteractiveQuizTemplate,
  'pyramid-framework': PyramidFrameworkTemplate,
  '2x2-matrix': Matrix2x2Template,
  'random-picker': RandomPickerTemplate,
  'personality-assessment': PersonalityAssessmentTemplate,
  'sales-funnel': SalesFunnelTemplate,
  'customer-journey': CustomerJourneyTemplate,
  'word-cloud': WordCloudTemplate,
  'diagnostic-scorecard': DiagnosticScorecardTemplate,
  'knowledge-game': KnowledgeGameTemplate,
  'live-voting': LiveVotingTemplate,
};

export function getTemplate(slug: string): ComponentType | null {
  return TEMPLATE_REGISTRY[slug] ?? null;
}
