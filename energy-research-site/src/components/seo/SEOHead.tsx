import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  structuredData?: object
}

export function SEOHead({
  title = 'Energy Research Showcase',
  description = 'Comprehensive research into programming language energy efficiency and visual programming paradigms. Featuring EnergyLang benchmarking and ColorLang visual programming framework.',
  keywords = [
    'energy efficiency',
    'programming languages',
    'benchmarking',
    'visual programming',
    'ColorLang',
    'EnergyLang',
    'C++',
    'Python',
    'performance',
  ],
  image = '/og-image.jpg',
  url = 'https://energy-research-showcase.netlify.app',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Energy Research Team',
  section,
  structuredData,
}: SEOHeadProps) {
  const fullTitle =
    title === 'Energy Research Showcase' ? title : `${title} - Energy Research Showcase`
  const fullUrl = url.startsWith('http')
    ? url
    : `https://energy-research-showcase.netlify.app${url}`
  const fullImageUrl = image.startsWith('http')
    ? image
    : `https://energy-research-showcase.netlify.app${image}`

  // Default structured data for the website
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    name: 'Energy Research Showcase',
    description: description,
    url: fullUrl,
    author: {
      '@type': 'Organization',
      name: author,
    },
    about: [
      {
        '@type': 'Thing',
        name: 'Energy Efficiency in Programming Languages',
      },
      {
        '@type': 'Thing',
        name: 'Visual Programming Languages',
      },
      {
        '@type': 'Thing',
        name: 'Software Performance Benchmarking',
      },
    ],
    keywords: keywords.join(', '),
    image: fullImageUrl,
    datePublished: publishedTime,
    dateModified: modifiedTime || new Date().toISOString(),
  }

  const finalStructuredData = structuredData || defaultStructuredData

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Energy Research Showcase" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {keywords.map(keyword => (
            <meta key={keyword} property="article:tag" content={keyword} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@energyresearch" />
      <meta name="twitter:site" content="@energyresearch" />

      {/* Additional Meta Tags */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(finalStructuredData)}</script>

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  )
}
