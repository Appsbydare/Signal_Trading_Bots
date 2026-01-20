import { MetadataRoute } from 'next';
import { resourceArticles } from '@/data/resources';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://signaltradingbots.com';
  
  // Static pages
  const staticPages = [
    '',
    '/products',
    '/resources',
    '/contact',
    '/faq',
    '/specs',
    '/compare',
    '/privacy',
    '/terms',
    '/refund',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Resource articles (blog posts)
  const resourcePages = resourceArticles
    .filter((article) => article.status === 'available')
    .map((article) => ({
      url: `${baseUrl}/resources/${article.id}`,
      lastModified: new Date(article.lastUpdated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...resourcePages];
}

