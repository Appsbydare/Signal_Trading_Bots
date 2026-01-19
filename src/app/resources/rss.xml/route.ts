import { resourceArticles } from '@/data/resources';
import { resourceArticlesContent } from '@/data/resource-articles-content';

export async function GET() {
  const baseUrl = 'https://signaltradingbots.com';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SignalTradingBots Resources - Trading Guides & Articles</title>
    <link>${baseUrl}/resources</link>
    <description>Expert guides on Telegram signal trading, gold trading automation, MT5 integration, and profitable trading strategies</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/resources/rss.xml" rel="self" type="application/rss+xml"/>
    ${resourceArticles
      .filter((article) => article.status === 'available')
      .map((article) => {
        const content = resourceArticlesContent[article.id];
        return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/resources/${article.id}</link>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${new Date(article.lastUpdated).toUTCString()}</pubDate>
      <guid>${baseUrl}/resources/${article.id}</guid>
      <category>${escapeXml(article.category)}</category>
      <content:encoded><![CDATA[
        <p>${escapeXml(content?.intro || article.description)}</p>
      ]]></content:encoded>
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

