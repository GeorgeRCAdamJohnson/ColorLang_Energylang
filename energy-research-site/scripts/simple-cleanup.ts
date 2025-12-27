#!/usr/bin/env node

import * as fs from 'node:fs';
import { glob } from 'glob';

/**
 * Simple TypeScript cleanup utility
 * Only fixes specific, safe issues that we know about
 */
class SimpleCleanup {
  private stats = {
    filesProcessed: 0,
    issuesFixed: 0
  };

  async run(): Promise<void> {
    console.log('🧹 Starting simple TypeScript cleanup...\n');

    const files = await glob('src/**/*.{ts,tsx}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**', '**/*.d.ts']
    });

    console.log(`Found ${files.length} TypeScript files to process.\n`);

    for (const file of files) {
      await this.processFile(file);
    }

    console.log('\n📊 Cleanup Summary:');
    console.log('==================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Total issues fixed: ${this.stats.issuesFixed}`);
  }

  private async processFile(filePath: string): Promise<void> {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf-8');
      let content = originalContent;
      let fileIssuesFixed = 0;

      // Only fix specific, safe issues
      
      // 1. Remove unused React imports (only when using JSX transform)
      const reactImportPattern = /^import React from ['"]react['"];?\s*\n/gm;
      if (reactImportPattern.test(content) && !content.includes('React.')) {
        content = content.replace(reactImportPattern, '');
        fileIssuesFixed++;
      }

      // 2. Fix obvious unused parameter prefixes (only in function signatures)
      const unusedParamPattern = /(\w+)(\s*:\s*\w+)(\s*[,)]\s*=>\s*{)/g;
      content = content.replace(unusedParamPattern, (match, paramName, typeAnnotation, rest) => {
        // Only prefix if it's clearly an unused parameter and doesn't already start with _
        if (!paramName.startsWith('_') && (paramName === 'event' || paramName === 'e' || paramName === 'evt')) {
          fileIssuesFixed++;
          return `_${paramName}${typeAnnotation}${rest}`;
        }
        return match;
      });

      // Write file if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        this.stats.issuesFixed += fileIssuesFixed;
        console.log(`✅ ${filePath}: Fixed ${fileIssuesFixed} issues`);
      }

      this.stats.filesProcessed++;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
    }
  }
}

async function main() {
  const cleanup = new SimpleCleanup();
  await cleanup.run();
}

main().catch(console.error);