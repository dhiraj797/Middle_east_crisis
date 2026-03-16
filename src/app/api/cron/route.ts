import { NextRequest, NextResponse } from 'next/server';
import { fetchMiddleEastNews, fetchIndiaImpactNews, fetchMarketData, fetchShippingNews } from '@/lib/serpapi';
import { generateAISummary } from '@/lib/claude';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verify cron secret for security
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [news, indiaNews, markets, shipping] = await Promise.all([
      fetchMiddleEastNews(),
      fetchIndiaImpactNews(),
      fetchMarketData(),
      fetchShippingNews(),
    ]);

    const aiSummary = await generateAISummary(news, indiaNews, shipping, markets);

    // Email provision (disabled by default)
    if (process.env.EMAIL_ENABLED === 'true' && process.env.EMAIL_TO) {
      // TODO: Integrate email service (Resend/SendGrid)
      // await sendBriefingEmail(process.env.EMAIL_TO, { news, markets, shipping, aiSummary });
      console.log('Email would be sent to:', process.env.EMAIL_TO);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      newsCount: news.length,
      riskLevel: aiSummary.riskLevel.level,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
