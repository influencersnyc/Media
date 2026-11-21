import type { MetadataRoute } from 'next'
import { articles, publications, site } from '../content/network'
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/publications', '/the-edit', '/advertise', '/advertise/media-kit', '/advertise/inquire', '/partnerships', '/about', '/contact', '/privacy', '/terms', '/advertising-disclosure', '/editorial-standards']
  return [
    ...routes.map(path => ({ url: site + path })),
    ...publications.filter(p => p.status !== 'archived').map(p => ({ url: site + '/publications/' + p.slug })),
    ...articles.map(a => ({ url: site + '/the-edit/' + a.slug, lastModified: a.updatedAt ?? a.publishedAt })),
  ]
}
