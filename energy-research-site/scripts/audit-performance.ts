#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface AuditResult {
  category: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

interface AuditReport {
  timestamp: string;
  results: AuditResult[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    overallScore: number;
  };
}

// Performance audit checks
function auditPerformance(): AuditResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check bundle size
  const distPath = join(process.cwd(), 'dist');
  if (existsSync(distPath)) {
    try {
      const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf-8');
      const jsFiles = indexHtml.match(/src="[^"]*\.js"/g) || [];
      const cssFiles = indexHtml.match(/href="[^"]*\.css"/g) || [];
      
      console.log(`📦 Found ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);
      
      if (jsFiles.length > 10) {
        issues.push('Too many JavaScript chunks - consider code splitting optimization');
        recommendations.push('Implement more aggressive code splitting for route-based chunks');
        score -= 10;
      }
    } catch (error) {
      issues.push('Could not analyze bundle structure');
      score -= 5;
    }
  } else {
    issues.push('No production build found - run npm run build first');
    score -= 20;
  }

  // Check for performance optimizations in code
  const srcPath = join(process.cwd(), 'src');
  if (existsSync(srcPath)) {
    // Check for lazy loading
    try {
      const appFile = readFileSync(join(srcPath, 'App.tsx'), 'utf-8');
      if (!appFile.includes('lazy(')) {
        issues.push('No lazy loading detected in App.tsx');
        recommendations.push('Implement React.lazy() for route-based code splitting');
        score -= 15;
      } else {
        console.log('✅ Lazy loading implemented');
      }

      if (!appFile.includes('Suspense')) {
        issues.push('No Suspense boundaries detected');
        recommendations.push('Add Suspense boundaries for better loading states');
        score -= 10;
      } else {
        console.log('✅ Suspense boundaries implemented');
      }
    } catch (error) {
      issues.push('Could not analyze App.tsx for performance patterns');
      score -= 5;
    }
  }

  return {
    category: 'Performance',
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

// Accessibility audit checks
function auditAccessibility(): AuditResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const srcPath = join(process.cwd(), 'src');
  
  // Check for accessibility utilities
  const accessibilityUtilsPath = join(srcPath, 'utils', 'accessibility.ts');
  if (!existsSync(accessibilityUtilsPath)) {
    issues.push('No accessibility utilities found');
    recommendations.push('Create accessibility utility functions for focus management and ARIA');
    score -= 20;
  } else {
    console.log('✅ Accessibility utilities found');
  }

  // Check CSS for accessibility features
  const cssPath = join(srcPath, 'styles', 'index.css');
  if (existsSync(cssPath)) {
    try {
      const cssContent = readFileSync(cssPath, 'utf-8');
      
      if (!cssContent.includes('sr-only')) {
        issues.push('No screen reader only styles found');
        recommendations.push('Add .sr-only class for screen reader content');
        score -= 10;
      } else {
        console.log('✅ Screen reader styles implemented');
      }

      if (!cssContent.includes('prefers-reduced-motion')) {
        issues.push('No reduced motion preferences respected');
        recommendations.push('Add @media (prefers-reduced-motion: reduce) styles');
        score -= 15;
      } else {
        console.log('✅ Reduced motion preferences implemented');
      }

      if (!cssContent.includes('focus:')) {
        issues.push('No focus styles detected');
        recommendations.push('Add comprehensive focus styles for keyboard navigation');
        score -= 20;
      } else {
        console.log('✅ Focus styles implemented');
      }
    } catch (error) {
      issues.push('Could not analyze CSS for accessibility features');
      score -= 5;
    }
  }

  // Check for ARIA attributes in components
  try {
    const layoutPath = join(srcPath, 'components', 'layout', 'Layout.tsx');
    if (existsSync(layoutPath)) {
      const layoutContent = readFileSync(layoutPath, 'utf-8');
      
      if (!layoutContent.includes('aria-')) {
        issues.push('No ARIA attributes found in Layout component');
        recommendations.push('Add ARIA labels and roles to layout elements');
        score -= 15;
      } else {
        console.log('✅ ARIA attributes implemented in Layout');
      }

      if (!layoutContent.includes('Skip to main content')) {
        issues.push('No skip link found');
        recommendations.push('Add skip to main content link for keyboard users');
        score -= 10;
      } else {
        console.log('✅ Skip link implemented');
      }
    }
  } catch (error) {
    issues.push('Could not analyze Layout component for accessibility');
    score -= 5;
  }

  return {
    category: 'Accessibility',
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

// SEO audit checks
function auditSEO(): AuditResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check for SEO components
  const seoPath = join(process.cwd(), 'src', 'components', 'seo');
  if (!existsSync(seoPath)) {
    issues.push('No SEO components found');
    recommendations.push('Create SEO components for meta tags and structured data');
    score -= 30;
  } else {
    console.log('✅ SEO components directory found');
  }

  // Check for sitemap and robots.txt
  const publicPath = join(process.cwd(), 'public');
  if (!existsSync(join(publicPath, 'sitemap.xml'))) {
    issues.push('No sitemap.xml found');
    recommendations.push('Generate sitemap.xml for search engines');
    score -= 15;
  } else {
    console.log('✅ Sitemap.xml found');
  }

  if (!existsSync(join(publicPath, 'robots.txt'))) {
    issues.push('No robots.txt found');
    recommendations.push('Create robots.txt for search engine crawling guidelines');
    score -= 10;
  } else {
    console.log('✅ Robots.txt found');
  }

  if (!existsSync(join(publicPath, 'manifest.json'))) {
    issues.push('No manifest.json found');
    recommendations.push('Create web app manifest for PWA support');
    score -= 10;
  } else {
    console.log('✅ Manifest.json found');
  }

  // Check for structured data
  const seoConfigPath = join(process.cwd(), 'src', 'data', 'seoConfig.ts');
  if (!existsSync(seoConfigPath)) {
    issues.push('No SEO configuration found');
    recommendations.push('Create SEO configuration with structured data');
    score -= 20;
  } else {
    console.log('✅ SEO configuration found');
  }

  return {
    category: 'SEO',
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

// Code quality audit
function auditCodeQuality(): AuditResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  try {
    // Run TypeScript check
    console.log('🔍 Running TypeScript check...');
    execSync('npm run type-check', { stdio: 'pipe' });
    console.log('✅ TypeScript check passed');
  } catch (error) {
    issues.push('TypeScript compilation errors found');
    recommendations.push('Fix TypeScript errors before deployment');
    score -= 25;
  }

  try {
    // Run ESLint check
    console.log('🔍 Running ESLint check...');
    execSync('npm run lint', { stdio: 'pipe' });
    console.log('✅ ESLint check passed');
  } catch (error) {
    issues.push('ESLint errors or warnings found');
    recommendations.push('Fix linting issues for better code quality');
    score -= 15;
  }

  try {
    // Run Prettier check
    console.log('🔍 Running Prettier check...');
    execSync('npm run format:check', { stdio: 'pipe' });
    console.log('✅ Prettier check passed');
  } catch (error) {
    issues.push('Code formatting issues found');
    recommendations.push('Run npm run format to fix formatting');
    score -= 10;
  }

  return {
    category: 'Code Quality',
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

// Main audit function
function runAudit(): AuditReport {
  console.log('🚀 Starting comprehensive audit...\n');

  const results: AuditResult[] = [
    auditPerformance(),
    auditAccessibility(),
    auditSEO(),
    auditCodeQuality(),
  ];

  const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0);
  const criticalIssues = results.filter(result => result.score < 70).length;
  const overallScore = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalIssues,
      criticalIssues,
      overallScore,
    },
  };

  return report;
}

// Generate audit report
function generateReport(report: AuditReport) {
  console.log('\n📊 AUDIT REPORT');
  console.log('================');
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Overall Score: ${report.summary.overallScore}/100`);
  console.log(`Total Issues: ${report.summary.totalIssues}`);
  console.log(`Critical Issues: ${report.summary.criticalIssues}`);
  console.log('');

  report.results.forEach(result => {
    console.log(`${result.category}: ${result.score}/100`);
    if (result.issues.length > 0) {
      console.log('  Issues:');
      result.issues.forEach(issue => console.log(`    ❌ ${issue}`));
    }
    if (result.recommendations.length > 0) {
      console.log('  Recommendations:');
      result.recommendations.forEach(rec => console.log(`    💡 ${rec}`));
    }
    console.log('');
  });

  // Save report to file
  const reportPath = join(process.cwd(), 'audit-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}`);

  // Exit with error code if critical issues found
  if (report.summary.criticalIssues > 0 || report.summary.overallScore < 80) {
    console.log('❌ Audit failed - critical issues found or score too low');
    process.exit(1);
  } else {
    console.log('✅ Audit passed - ready for deployment!');
  }
}

// Run the audit
const report = runAudit();
generateReport(report);