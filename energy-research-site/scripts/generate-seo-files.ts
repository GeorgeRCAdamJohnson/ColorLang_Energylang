#!/usr/bin/env tsx

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateSitemap, generateRobotsTxt } from '../src/utils/sitemapGenerator';

// Ensure public directory exists
const publicDir = join(process.cwd(), 'public');
try {
  mkdirSync(publicDir, { recursive: true });
} catch (error) {
  // Directory already exists
}

// Generate sitemap.xml
const sitemap = generateSitemap();
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap, 'utf-8');
console.log('✅ Generated sitemap.xml');

// Generate robots.txt
const robotsTxt = generateRobotsTxt();
writeFileSync(join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');
console.log('✅ Generated robots.txt');

// Generate manifest.json for PWA support
const manifest = {
  name: 'Energy Research Showcase',
  short_name: 'Energy Research',
  description: 'Comprehensive research into programming language energy efficiency and visual programming paradigms',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#2563eb',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable any',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable any',
    },
  ],
  categories: ['education', 'productivity', 'developer'],
  lang: 'en-US',
  orientation: 'portrait-primary',
};

writeFileSync(join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
console.log('✅ Generated manifest.json');

console.log('\n🎉 All SEO files generated successfully!');
console.log('Files created:');
console.log('  - public/sitemap.xml');
console.log('  - public/robots.txt');
console.log('  - public/manifest.json');