export const copyPlatforms = ['xiaohongshu', 'douyin', 'moments'] as const;
export const copyContentTypes = ['video', 'image_text', 'product_ad'] as const;
export const stockRiskLevels = ['low', 'medium', 'high'] as const;
export const stockRecommendationLevels = ['buy', 'hold', 'sell'] as const;

export type CopyPlatform = (typeof copyPlatforms)[number];
export type CopyContentType = (typeof copyContentTypes)[number];
export type StockRiskLevel = (typeof stockRiskLevels)[number];
export type StockRecommendationLevel = (typeof stockRecommendationLevels)[number];

export interface CopywritingItem {
  content: string;
  styleTag: string;
}

export interface StockPredictionRange {
  low: number;
  high: number;
  confidence: number;
}

export interface StockAnalysisPayload {
  summary: string;
  trend: string;
  valuation: string;
  sentiment: string;
  riskLevel: StockRiskLevel;
  recommendation: StockRecommendationLevel;
  reasons: string[];
  weekPrediction: StockPredictionRange;
  monthPrediction: StockPredictionRange;
  yearPrediction: StockPredictionRange;
  positionSuggestion: string;
}
