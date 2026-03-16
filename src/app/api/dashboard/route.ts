import { NextResponse } from 'next/server';
import { fetchMiddleEastNews, fetchIndiaImpactNews, fetchMarketData, fetchShippingNews } from '@/lib/serpapi';
import { generateAISummary } from '@/lib/claude';
import { DashboardData } from '@/types/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [news, indiaNews, markets, shipping] = await Promise.all([
      fetchMiddleEastNews(),
      fetchIndiaImpactNews(),
      fetchMarketData(),
      fetchShippingNews(),
    ]);

    const allNews = [...news, ...indiaNews].filter(
      (item, index, self) => index === self.findIndex((n) => n.title === item.title)
    );

    const aiSummary = await generateAISummary(news, indiaNews, shipping, markets);

    const dashboardData: DashboardData = {
      lastUpdated: new Date().toISOString(),
      news: allNews,
      markets,
      shipping,
      aiSummary,
      historicalNews: [],
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
