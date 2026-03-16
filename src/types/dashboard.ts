export interface NewsItem {
  title: string;
  snippet: string;
  source: string;
  link: string;
  date: string;
  indiaImpact?: string;
  boschImpact?: string;
}

export interface MarketData {
  brentCrude: { price: string; change: string; direction: 'up' | 'down' | 'flat' };
  wtiCrude: { price: string; change: string; direction: 'up' | 'down' | 'flat' };
  naturalGas: { price: string; change: string; direction: 'up' | 'down' | 'flat' };
  sensex: { price: string; change: string; direction: 'up' | 'down' | 'flat' };
  inrUsd: { price: string; change: string; direction: 'up' | 'down' | 'flat' };
  gold: { price: string; change: string; direction: 'up' | 'down' | 'flat' };
}

export interface ShippingUpdate {
  title: string;
  snippet: string;
  source: string;
  link: string;
  date: string;
}

export interface RiskLevel {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  color: string;
  reasoning: string;
}

export interface AISummary {
  executiveSummary: string;
  riskLevel: RiskLevel;
  indiaImpact: string;
  boschImpact: string;
}

export interface DashboardData {
  lastUpdated: string;
  news: NewsItem[];
  markets: MarketData;
  shipping: ShippingUpdate[];
  aiSummary: AISummary;
  historicalNews: { date: string; items: NewsItem[] }[];
}
