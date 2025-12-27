interface PageSEOConfig {
  title: string
  description: string
  keywords: string[]
  image?: string
  type?: 'website' | 'article'
  section?: string
  structuredData?: object
}

export const seoConfig: Record<string, PageSEOConfig> = {
  home: {
    title: 'Energy Research Showcase',
    description:
      'Comprehensive research into programming language energy efficiency and visual programming paradigms. Discover how C++ is 6x more energy efficient than Python and explore ColorLang visual programming.',
    keywords: [
      'energy efficiency',
      'programming languages',
      'benchmarking',
      'C++',
      'Python',
      'ColorLang',
      'visual programming',
      'performance optimization',
    ],
    image: '/images/og-home.jpg',
    type: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ResearchProject',
      name: 'Energy Research Showcase',
      description:
        'Comprehensive research into programming language energy efficiency and visual programming paradigms',
      url: 'https://energy-research-showcase.netlify.app',
      author: {
        '@type': 'Organization',
        name: 'Energy Research Team',
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
      ],
      mainEntity: {
        '@type': 'Dataset',
        name: 'Programming Language Energy Efficiency Benchmarks',
        description:
          'Comprehensive benchmarking data comparing energy consumption across multiple programming languages',
        keywords: 'energy efficiency, programming languages, benchmarking, performance',
      },
    },
  },

  research: {
    title: 'Research Methodology',
    description:
      'Detailed methodology behind our energy efficiency research, including profiler race condition solutions, file-sentinel handshakes, and rigorous benchmarking protocols.',
    keywords: [
      'research methodology',
      'benchmarking',
      'profiler race conditions',
      'energy measurement',
      'scientific rigor',
    ],
    image: '/images/og-research.jpg',
    type: 'article',
    section: 'Research',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: 'Energy Efficiency Research Methodology',
      description:
        'Comprehensive methodology for measuring and comparing energy efficiency across programming languages',
      author: {
        '@type': 'Organization',
        name: 'Energy Research Team',
      },
      about: {
        '@type': 'Thing',
        name: 'Energy Efficiency Research Methodology',
      },
    },
  },

  findings: {
    title: 'Key Findings',
    description:
      'Discover our groundbreaking findings: C++ is 6x more energy efficient than Python NumPy for matrix multiplication. Explore interactive visualizations of our comprehensive benchmarking results.',
    keywords: [
      'research findings',
      'C++ efficiency',
      'Python performance',
      'matrix multiplication',
      'energy benchmarks',
      'data visualization',
    ],
    image: '/images/og-findings.jpg',
    type: 'article',
    section: 'Findings',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Programming Language Energy Efficiency Findings',
      description:
        'Comprehensive findings showing C++ is 6x more energy efficient than Python for matrix operations',
      creator: {
        '@type': 'Organization',
        name: 'Energy Research Team',
      },
      about: {
        '@type': 'Thing',
        name: 'Programming Language Energy Efficiency',
      },
    },
  },

  colorlang: {
    title: 'ColorLang Visual Programming',
    description:
      'Explore ColorLang, an innovative visual programming language using HSV color encoding for instructions. Experience machine-native programming through 2D color fields with interactive examples.',
    keywords: [
      'ColorLang',
      'visual programming',
      'HSV encoding',
      'color programming',
      'interactive programming',
      '2D color fields',
    ],
    image: '/images/og-colorlang.jpg',
    type: 'article',
    section: 'ColorLang',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ColorLang',
      description:
        'Visual programming language using HSV color encoding for machine-native programming',
      applicationCategory: 'Programming Language',
      operatingSystem: 'Web Browser',
      author: {
        '@type': 'Organization',
        name: 'Energy Research Team',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  },

  methods: {
    title: 'Technical Methods',
    description:
      'Deep dive into our technical implementation: energy measurement tools, benchmarking harnesses, cross-language implementations, and database design for energy semantics.',
    keywords: [
      'technical methods',
      'energy measurement',
      'AMD uProf',
      'NVIDIA-smi',
      'benchmarking harness',
      'cross-language implementation',
    ],
    image: '/images/og-methods.jpg',
    type: 'article',
    section: 'Methods',
  },

  lessons: {
    title: 'AI Collaboration & Strategic Decisions',
    description:
      'Learn from our strategic decision-making process, AI collaboration methodologies, and professional self-assessment. Discover how we navigated the hyperscaler pivot with evidence-based decisions.',
    keywords: [
      'AI collaboration',
      'strategic decisions',
      'hyperscaler pivot',
      'multi-persona reviews',
      'professional development',
    ],
    image: '/images/og-lessons.jpg',
    type: 'article',
    section: 'Lessons',
  },

  impact: {
    title: 'Impact & Recommendations',
    description:
      'Practical applications and recommendations from our energy efficiency research. Understand the broader implications for sustainable software development and performance optimization.',
    keywords: [
      'impact',
      'recommendations',
      'sustainable software',
      'performance optimization',
      'practical applications',
    ],
    image: '/images/og-impact.jpg',
    type: 'article',
    section: 'Impact',
  },
}

// Helper function to get SEO config for a route
export function getSEOConfig(route: string): PageSEOConfig {
  const cleanRoute = route.replace('/', '') || 'home'
  return seoConfig[cleanRoute] || seoConfig.home
}

// Generate sitemap data
export function generateSitemapData() {
  const baseUrl = 'https://energy-research-showcase.netlify.app'
  const routes = Object.keys(seoConfig).map(key => (key === 'home' ? '/' : `/${key}`))

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1.0 : 0.8,
  }))
}
