import { NewsItem, MarketData, ShippingUpdate } from '@/types/dashboard';

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;

async function serpSearch(query: string, params: Record<string, string> = {}) {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('api_key', SERPAPI_KEY || '');
  url.searchParams.set('q', query);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  return res.json();
}

export async function fetchMiddleEastNews(): Promise<NewsItem[]> {
  try {
    const data = await serpSearch('Middle East crisis latest developments', {
      engine: 'google_news',
      gl: 'in',
      hl: 'en',
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
    const data = await serpSearch('Middle East crisis impact on India economy oil', {
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
    const queries = [
      serpSearch('Brent crude oil price today', { engine: 'google' }),
      serpSearch('Sensex today', { engine: 'google', gl: 'in' }),
      serpSearch('USD INR exchange rate today', { engine: 'google', gl: 'in' }),
      serpSearch('Gold price today USD', { engine: 'google' }),
      serpSearch('WTI crude oil price today', { engine: 'google' }),
      serpSearch('Natural gas price today', { engine: 'google' }),
    ];

    const [brentData, sensexData, forexData, goldData, wtiData, natGasData] = await Promise.all(queries);

    return {
      brentCrude: extractPrice(brentData, 'Brent Crude'),
      wtiCrude: extractPrice(wtiData, 'WTI Crude'),
      naturalGas: extractPrice(natGasData, 'Natural Gas'),
      sensex: extractPrice(sensexData, 'Sensex'),
      inrUsd: extractPrice(forexData, 'INR/USD'),
      gold: extractPrice(goldData, 'Gold'),
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    return getDefaultMarketData();
  }
}

function extractPrice(data: Record<string, unknown>, label: string): { price: string; change: string; direction: 'up' | 'down' | 'flat' } {
  try {
    // Try answer box first
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

    // Try knowledge graph
    const kg = data.knowledge_graph as Record<string, unknown> | undefined;
    if (kg) {
      const price = (kg.price || kg.value || '') as string;
      if (price) {
        return { price: price.toString(), change: '', direction: 'flat' };
      }
    }

    // Try organic results snippet
    const organic = (data.organic_results || []) as Record<string, unknown>[];
    if (organic.length > 0) {
      const snippet = (organic[0].snippet || '') as string;
      const priceMatch = snippet.match(/\$?[\d,.]+/);
      if (priceMatch) {
        return { price: priceMatch[0], change: '', direction: 'flat' };
      }
    }

    return { price: 'N/A', change: '', direction: 'flat' };
  } catch {
    console.error(`Error extracting price for ${label}`);
    return { price: 'N/A', change: '', direction: 'flat' };
  }
}

export async function fetchShippingNews(): Promise<ShippingUpdate[]> {
  try {
    const data = await serpSearch('Red Sea shipping disruption Suez Canal Houthi latest', {
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
