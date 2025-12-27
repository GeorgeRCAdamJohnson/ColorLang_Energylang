import { generateSitemapData } from '../data/seoConfig'

export function generateSitemap(): string {
  const sitemapData = generateSitemapData()

  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapData
  .map(
    item => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return sitemapXML
}

export function generateRobotsTxt(): string {
  const baseUrl = 'https://energy-research-showcase.netlify.app'

  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block access to admin or private areas (if any)
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$

# Allow access to CSS and JS files for better rendering
Allow: /assets/
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$
Allow: /*.webp$`
}

// Generate JSON-LD structured data for the entire site
export function generateSiteStructuredData() {
  const baseUrl = 'https://energy-research-showcase.netlify.app'

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Energy Research Showcase',
        description:
          'Comprehensive research into programming language energy efficiency and visual programming paradigms',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Energy Research Team',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${baseUrl}/#logo`,
          inLanguage: 'en-US',
          url: `${baseUrl}/logo.png`,
          contentUrl: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
          caption: 'Energy Research Showcase',
        },
        image: {
          '@id': `${baseUrl}/#logo`,
        },
        sameAs: ['https://github.com/energy-research', 'https://twitter.com/energyresearch'],
      },
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#webpage`,
        url: baseUrl,
        name: 'Energy Research Showcase - Home',
        isPartOf: {
          '@id': `${baseUrl}/#website`,
        },
        about: {
          '@id': `${baseUrl}/#organization`,
        },
        description:
          'Comprehensive research into programming language energy efficiency and visual programming paradigms',
        breadcrumb: {
          '@id': `${baseUrl}/#breadcrumb`,
        },
        inLanguage: 'en-US',
        potentialAction: [
          {
            '@type': 'ReadAction',
            target: [baseUrl],
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
        ],
      },
    ],
  }
}

// Helper to create breadcrumb structured data for any page
export function generateBreadcrumbStructuredData(
  _currentPage: string,
  breadcrumbs: Array<{ name: string; url: string }>
) {
  const baseUrl = 'https://energy-research-showcase.netlify.app'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      ...breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
      })),
    ],
  }
}
