import { NewsItem, MarketData, ShippingUpdate } from '@/types/dashboard';

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

async function serpSearch(query: string, params: Record<string, string> = {}) {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('api_key', SERPAPI_KEY || '');
  url.searchParams.set('q', query);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  return res.json();
}

export async function fetchMiddleEastNews(): Promise<NewsItem[]> {
  try {
    const data = await serpSearch('Middle East crisis war conflict today', {
      engine: 'google_news',
      gl: 'in',
      hl: 'en',
      topic_token: '',
    });

    const articles = data.news_results || [];
    return articles.slice(0, 15).map((article: Record<string, unknown>) => ({
      title: article.title || '',
      snippet: (article.snippet || article.title || '') as string,
      source: ((article.source as Record<string, unknown>)?.name || article.source || 'Unknown') as string,
      link: (article.link || '#') as string,
      date: (article.date || new Date().toISOString()) as string,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function fetchIndiaImpactNews(): Promise<NewsItem[]> {
  try {
    const data = await serpSearch('Middle East crisis impact India oil economy today', {
      engine: 'google_news',
      gl: 'in',
      hl: 'en',
    });

    const articles = data.news_results || [];
    return articles.slice(0, 10).map((article: Record<string, unknown>) => ({
      title: article.title || '',
      snippet: (article.snippet || article.title || '') as string,
      source: ((article.source as Record<string, unknown>)?.name || article.source || 'Unknown') as string,
      link: (article.link || '#') as string,
      date: (article.date || new Date().toISOString()) as string,
      indiaImpact: 'Direct',
    }));
  } catch (error) {
    console.error('Error fetching India impact news:', error);
    return [];
  }
}

export async function fetchMarketData(): Promise<MarketData> {
  try {
    // Use Google Finance engine for accurate real-time prices
    const queries = [
      serpSearch('BZ=F', { engine: 'google_finance', hl: 'en' }).catch(() => null),
      serpSearch('CL=F', { engine: 'google_finance', hl: 'en' }).catch(() => null),
      serpSearch('NG=F', { engine: 'google_finance', hl: 'en' }).catch(() => null),
      serpSearch('SENSEX:INDEXBOM', { engine: 'google_finance', hl: 'en' }).catch(() => null),
      serpSearch('USD/INR', { engine: 'google_finance', hl: 'en' }).catch(() => null),
      serpSearch('GC=F', { engine: 'google_finance', hl: 'en' }).catch(() => null),
    ];

    const [brentData, wtiData, natGasData, sensexData, forexData, goldData] = await Promise.all(queries);

    return {
      brentCrude: extractFinancePrice(brentData, 'Brent Crude'),
      wtiCrude: extractFinancePrice(wtiData, 'WTI Crude'),
      naturalGas: extractFinancePrice(natGasData, 'Natural Gas'),
      sensex: extractFinancePrice(sensexData, 'Sensex'),
      inrUsd: extractFinancePrice(forexData, 'INR/USD'),
      gold: extractFinancePrice(goldData, 'Gold'),
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Fallback: try regular Google search
    return fetchMarketDataFallback();
  }
}

function extractFinancePrice(
  data: Record<string, unknown> | null,
  label: string
): { price: string; change: string; direction: 'up' | 'down' | 'flat' } {
  if (!data) return { price: 'N/A', change: '', direction: 'flat' };

  try {
    // Google Finance engine returns summary with price info
    const summary = data.summary as Record<string, unknown> | undefined;
    if (summary) {
      const price = summary.price || summary.extracted_price || '';
      const change = summary.price_change || summary.percentage || '';
      const pctChange = summary.price_change_percentage || summary.percent_change || '';
      const priceStr = price.toString();
      const changeStr = change ? `${change} (${pctChange})` : pctChange ? pctChange.toString() : '';

      if (priceStr) {
        return {
          price: priceStr,
          change: changeStr,
          direction: changeStr.includes('-') ? 'down' : changeStr.includes('+') || (Number(change) > 0) ? 'up' : 'flat',
        };
      }
    }

    // Try market_data or finance_results
    const marketInfo = (data.market_data || data.finance_results || data.markets) as Record<string, unknown> | undefined;
    if (marketInfo) {
      const price = marketInfo.current_price || marketInfo.price || '';
      if (price) {
        return { price: price.toString(), change: '', direction: 'flat' };
      }
    }

    // Fallback: answer_box
    const answerBox = data.answer_box as Record<string, unknown> | undefined;
    if (answerBox) {
      const price = (answerBox.answer || answerBox.result || answerBox.snippet || '') as string;
      const change = (answerBox.change || answerBox.percentage || '') as string;
      if (price) {
        return {
          price: price.toString(),
          change: change.toString(),
          direction: change.toString().includes('-') ? 'down' : change.toString().includes('+') ? 'up' : 'flat',
        };
      }
    }

    // Fallback: knowledge graph
    const kg = data.knowledge_graph as Record<string, unknown> | undefined;
    if (kg) {
      const price = (kg.price || kg.value || kg.header || '') as string;
      if (price) {
        return { price: price.toString(), change: '', direction: 'flat' };
      }
    }

    console.log(`No price found for ${label}, data keys:`, Object.keys(data));
    return { price: 'N/A', change: '', direction: 'flat' };
  } catch {
    console.error(`Error extracting price for ${label}`);
    return { price: 'N/A', change: '', direction: 'flat' };
  }
}

async function fetchMarketDataFallback(): Promise<MarketData> {
  try {
    // Fallback using regular Google search with tbs for recent results
    const queries = [
      serpSearch('Brent crude oil price USD today', { engine: 'google', gl: 'us' }),
      serpSearch('WTI crude oil price USD today', { engine: 'google', gl: 'us' }),
      serpSearch('Natural gas price USD today', { engine: 'google', gl: 'us' }),
      serpSearch('BSE Sensex index today', { engine: 'google', gl: 'in' }),
      serpSearch('USD INR exchange rate', { engine: 'google', gl: 'in' }),
      serpSearch('Gold price per ounce USD today', { engine: 'google', gl: 'us' }),
    ];

    const [brent, wti, gas, sensex, forex, gold] = await Promise.all(queries);

    return {
      brentCrude: extractFinancePrice(brent, 'Brent'),
      wtiCrude: extractFinancePrice(wti, 'WTI'),
      naturalGas: extractFinancePrice(gas, 'NatGas'),
      sensex: extractFinancePrice(sensex, 'Sensex'),
      inrUsd: extractFinancePrice(forex, 'INRUSD'),
      gold: extractFinancePrice(gold, 'Gold'),
    };
  } catch {
    return getDefaultMarketData();
  }
}

export async function fetchShippingNews(): Promise<ShippingUpdate[]> {
  try {
    const data = await serpSearch('Red Sea shipping Suez Canal Houthi attacks today', {
      engine: 'google_news',
      gl: 'in',
      hl: 'en',
    });

    const articles = data.news_results || [];
    return articles.slice(0, 8).map((article: Record<string, unknown>) => ({
      title: article.title || '',
      snippet: (article.snippet || article.title || '') as string,
      source: ((article.source as Record<string, unknown>)?.name || article.source || 'Unknown') as string,
      link: (article.link || '#') as string,
      date: (article.date || new Date().toISOString()) as string,
    }));
  } catch (error) {
    console.error('Error fetching shipping news:', error);
    return [];
  }
}

function getDefaultMarketData(): MarketData {
  return {
    brentCrude: { price: 'N/A', change: '', direction: 'flat' },
    wtiCrude: { price: 'N/A', change: '', direction: 'flat' },
    naturalGas: { price: 'N/A', change: '', direction: 'flat' },
    sensex: { price: 'N/A', change: '', direction: 'flat' },
    inrUsd: { price: 'N/A', change: '', direction: 'flat' },
    gold: { price: 'N/A', change: '', direction: 'flat' },
  };
}
