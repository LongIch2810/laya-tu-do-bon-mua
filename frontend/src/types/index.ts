export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';

export interface ProductItem {
  id: number;
  brand: 'Cotopaxi' | 'Tentree';
  name: string;
  category: string;
  description: string;
  image: string;
  sourceUrl?: string;
  imageSourceUrl?: string;
}

export interface ClassificationResult {
  id: number;
  season: Season;
  confidence: number | null;
  inference_ms: number;
}

export type SorterState =
  | 'idle'
  | 'falling'
  | 'scanning'
  | 'result'
  | 'transferring'
  | 'bin_impact'
  | 'completed'
  | 'error';

export interface SeasonTheme {
  key: Season;
  name: string;
  subName: string;
  icon: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  badgeBg: string;
  textColor: string;
  floatColor: string;
  particles: string[];
}
