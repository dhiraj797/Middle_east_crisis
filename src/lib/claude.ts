import Anthropic from '@anthropic-ai/sdk';
import { NewsItem, ShippingUpdate, MarketData, AISummary } from '@/types/dashboard';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateAISummary(
  news: NewsItem[],
  indiaNews: NewsItem[],
  shipping: ShippingUpdate[],
  markets: MarketData
): Promise<AISummary> {
  const newsContext = news
    .slice(0, 10)
    .map((n, i) => `${i + 1}. ${n.title} (${n.source}, ${n.date})`)
    .join('\n');

  const indiaContext = indiaNews
    .slice(0, 5)
    .map((n, i) => `${i + 1}. ${n.title} (${n.source})`)
    .join('\n');

  const shippingContext = shipping
    .slice(0, 5)
    .map((s, i) => `${i + 1}. ${s.title} (${s.source})`)
    .join('\n');

  const marketContext = `
Brent Crude: ${markets.brentCrude.price} (${markets.brentCrude.change})
WTI Crude: ${markets.wtiCrude.price} (${markets.wtiCrude.change})
Natural Gas: ${markets.naturalGas.price} (${markets.naturalGas.change})
Sensex: ${markets.sensex.price} (${markets.sensex.change})
INR/USD: ${markets.inrUsd.price} (${markets.inrUsd.change})
Gold: ${markets.gold.price} (${markets.gold.change})
  `.trim();

  const prompt = `You are a senior geopolitical analyst preparing a daily briefing for the CEO/MD of Bosch India. Analyze the following Middle East crisis data and provide a structured JSON response.

LATEST NEWS:
${newsContext}

INDIA-SPECIFIC IMPACT NEWS:
${indiaContext}

SHIPPING & LOGISTICS:
${shippingContext}

MARKET DATA:
${marketContext}

CONTEXT: Bosch India operates major manufacturing plants in Bangalore, Jaipur, Nashik, and Gangaikondan. They manufacture automotive components, power tools, and industrial equipment. They export to Europe (via Suez Canal route), import semiconductors and specialty components. High energy costs directly impact manufacturing margins. The INR/USD rate affects import costs.

Respond with ONLY valid JSON in this exact format:
{
  "executiveSummary": "A 2-3 sentence executive summary of overnight developments, written for a C-level executive. Be direct, factual, and highlight the most critical developments.",
  "riskLevel": {
    "level": "LOW|MODERATE|HIGH|CRITICAL",
    "color": "#22c55e for LOW, #f59e0b for MODERATE, #ef4444 for HIGH, #dc2626 for CRITICAL",
    "reasoning": "One sentence explaining the risk level assessment"
  },
  "indiaImpact": "2-3 sentences on how current developments specifically impact India - covering oil imports, trade routes, rupee, defense posture, and diplomatic implications.",
  "boschImpact": "2-3 sentences on specific impact to Bosch India operations - covering manufacturing costs (energy), supply chain (component imports/exports via Suez), currency exposure (INR weakening), and any direct business impact in Middle East markets."
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AISummary;
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return {
      executiveSummary: 'AI summary temporarily unavailable. Please check API configuration.',
      riskLevel: {
        level: 'MODERATE',
        color: '#f59e0b',
        reasoning: 'Unable to assess - AI service unavailable',
      },
      indiaImpact: 'Impact analysis temporarily unavailable.',
      boschImpact: 'Bosch impact analysis temporarily unavailable.',
    };
  }
}
