---
inclusion: always
---

# Technology Stack Standards

## Core Framework and Build Tools

### Frontend Framework
- **React 18+** with TypeScript for type safety and modern features
- **Vite** for fast development server and optimized production builds
- **React Router v6** for client-side routing and navigation

### Styling and UI
- **Tailwind CSS** for utility-first, responsive design
- **Headless UI** for accessible, unstyled UI components
- **Framer Motion** for smooth animations and transitions
- **Lucide React** for consistent, scalable icons

### Data Visualization
- **Chart.js** with **react-chartjs-2** for interactive charts and graphs
- **D3.js** for custom visualizations if needed
- **React Flow** for any diagram or flowchart needs

## Development and Quality Tools

### Code Quality
- **ESLint** with TypeScript and React rules
- **Prettier** for consistent code formatting
- **Kiro MCP Integration** for git hooks and pre-commit validation
- **lint-staged** for running linters on staged files (if not handled by Kiro MCP)

### Testing Framework
- **Jest** for unit testing with React Testing Library
- **fast-check** for property-based testing
- **Playwright** for end-to-end testing
- **Chromatic** for visual regression testing
- **@axe-core/react** for accessibility testing

### Type Safety and Validation
- **TypeScript** with strict mode enabled
- **Zod** for runtime type validation and schema parsing
- **@types/node** and relevant type definitions

## Data Processing and State Management

### Data Handling
- **Papa Parse** for CSV file parsing and processing
- **date-fns** for date manipulation and formatting
- **lodash-es** for utility functions (tree-shakeable)

### State Management
- **React Context** for global state (user progress, preferences)
- **React Query (TanStack Query)** for server state management if needed
- **Zustand** as lightweight alternative to Context for complex state

### Local Storage and Persistence
- **localStorage** for user preferences and progress tracking
- **IndexedDB** via **Dexie.js** for larger data storage if needed

## Performance and Optimization

### Bundle Optimization
- **Vite's built-in code splitting** for route-based chunks
- **React.lazy()** for component-level code splitting
- **Tree shaking** enabled by default with ES modules

### Image and Asset Optimization
- **WebP** format for images with fallbacks
- **SVG** for icons and simple graphics
- **MP4/WebM** for video content instead of GIFs

### Performance Monitoring
- **Web Vitals** for Core Web Vitals tracking
- **Lighthouse CI** for automated performance auditing

## Development Environment

### Package Management
- **npm** or **pnpm** for package management
- **Node.js 18+** for development environment
- **.nvmrc** file for Node version consistency

### Development Server
- **Vite dev server** with hot module replacement
- **HTTPS** enabled for local development
- **Environment variables** via `.env` files

### Code Editor Configuration
- **VS Code** recommended with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint

## Deployment and Hosting

### Build and Deployment
- **Vite build** for production optimization
- **Netlify** or **Vercel** for static site hosting
- **GitHub Actions** for CI/CD pipeline

### Domain and CDN
- **Custom domain** for professional presentation
- **CDN** for global content delivery
- **SSL/TLS** certificate for secure connections

## Browser Support and Compatibility

### Target Browsers
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Progressive Enhancement
- **Core functionality** works without JavaScript
- **Enhanced experience** with JavaScript enabled
- **Graceful degradation** for older browsers

## Security Considerations

### Content Security Policy
- **Strict CSP** headers for XSS protection
- **HTTPS only** for all external resources
- **No inline scripts** or styles

### Data Privacy
- **No tracking** without user consent
- **Local storage only** for user preferences
- **No external analytics** unless explicitly needed

## File Structure Standards

### Project Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── charts/         # Visualization components
│   └── layout/         # Layout components
├── pages/              # Route-level components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── data/               # Static data and processors
├── styles/             # Global styles and Tailwind config
└── tests/              # Test utilities and setup
```

### Naming Conventions
- **Components**: PascalCase (e.g., `BenchmarkChart.tsx`)
- **Files**: kebab-case (e.g., `data-processor.ts`)
- **Directories**: kebab-case (e.g., `chart-components/`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS`)

## Performance Targets

### Loading Performance
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Bundle Size Targets
- **Initial bundle**: < 200KB gzipped
- **Route chunks**: < 100KB gzipped each
- **Total assets**: < 1MB for initial load

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color contrast**: Minimum 4.5:1 for normal text
- **Keyboard navigation**: All interactive elements accessible
- **Screen readers**: Proper ARIA labels and semantic HTML
- **Focus management**: Visible focus indicators and logical tab order

### Testing Requirements
- **Automated testing** with axe-core
- **Manual testing** with screen readers
- **Keyboard-only navigation** testing
- **Color blindness** simulation testing