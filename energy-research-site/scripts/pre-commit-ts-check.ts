#!/usr/bin/env node

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import { glob } from 'glob';

/**
 * Pre-commit TypeScript validation tool
 * Catches TypeScript issues before they enter the codebase
 */
class PreCommitTSChecker {
  private errors: string[] = [];
  private warnings: string[] = [];

  async run(): Promise<boolean> {
    console.log('🔍 Running pre-commit TypeScript checks...\n');

    // 1. Check for TypeScript compilation errors
    await this.checkCompilation();
    
    // 2. Check for common anti-patterns
    await this.checkAntiPatterns();
    
    // 3. Check import consistency
    await this.checkImports();
    
    // 4. Check for missing exports
    await this.checkExports();

    this.printResults();
    
    return this.errors.length === 0;
  }

  private async checkCompilation(): Promise<void> {
    try {
      console.log('📋 Checking TypeScript compilation...');
      execSync('npx tsc --noEmit --project tsconfig.strict.json', { 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      console.log('✅ TypeScript compilation passed\n');
    } catch (error: unknown) {
      const errorObj = error as { stdout?: string; stderr?: string };
      const output = errorObj.stdout || errorObj.stderr || '';
      if (output.includes('error TS')) {
        this.errors.push('TypeScript compilation failed');
        console.log('❌ TypeScript compilation failed');
        console.log(output);
      }
    }
  }

  private async checkAntiPatterns(): Promise<void> {
    console.log('🚫 Checking for anti-patterns...');
    
    const files = await glob('src/**/*.{ts,tsx}');
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for 'any' types
      if (content.includes(': any') || content.includes('<any>')) {
        this.warnings.push(`${file}: Contains 'any' type - consider using more specific types`);
      }
      
      // Check for console.log in non-dev files
      if (content.includes('console.log') && !file.includes('dev') && !file.includes('debug')) {
        this.warnings.push(`${file}: Contains console.log - consider using proper logging`);
      }
      
      // Check for TODO/FIXME comments
      if (content.includes('TODO') || content.includes('FIXME')) {
        this.warnings.push(`${file}: Contains TODO/FIXME comments`);
      }
      
      // Check for unused imports (basic detection)
      const importMatches = content.match(/^import\s+.*from\s+['"][^'"]+['"];?$/gm);
      if (importMatches) {
        for (const importLine of importMatches) {
          const importedItems = this.extractImportedItems(importLine);
          for (const item of importedItems) {
            if (!content.includes(item) || content.indexOf(item) === content.indexOf(importLine)) {
              this.warnings.push(`${file}: Potentially unused import: ${item}`);
            }
          }
        }
      }
    }
    
    console.log('✅ Anti-pattern check completed\n');
  }

  private extractImportedItems(importLine: string): string[] {
    const items: string[] = [];
    
    // Handle default imports: import React from 'react'
    const defaultMatch = importLine.match(/^import\s+(\w+)\s+from/);
    if (defaultMatch) {
      items.push(defaultMatch[1]);
    }
    
    // Handle named imports: import { useState, useEffect } from 'react'
    const namedMatch = importLine.match(/import\s+{([^}]+)}/);
    if (namedMatch) {
      const namedImports = namedMatch[1].split(',').map(item => item.trim().split(' as ')[0]);
      items.push(...namedImports);
    }
    
    return items;
  }

  private async checkImports(): Promise<void> {
    console.log('📦 Checking import consistency...');
    
    const files = await glob('src/**/*.{ts,tsx}');
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for relative import depth
      const relativeImports = content.match(/from\s+['"]\.\.\/.*['"]/g);
      if (relativeImports) {
        for (const imp of relativeImports) {
          const depth = (imp.match(/\.\.\//g) || []).length;
          if (depth > 2) {
            this.warnings.push(`${file}: Deep relative import (${depth} levels): ${imp}`);
          }
        }
      }
      
      // Check for missing file extensions in imports
      const localImports = content.match(/from\s+['"]\.\/[^'"]*['"]/g);
      if (localImports) {
        for (const imp of localImports) {
          if (!imp.includes('.ts') && !imp.includes('.tsx') && !imp.includes('.js')) {
            // Check if the file exists
            const importPath = imp.match(/from\s+['"]([^'"]+)['"]/)?.[1];
            if (importPath) {
              const fullPath = `${file.replace(/\/[^/]+$/, '')}/${importPath}`;
              if (!fs.existsSync(`${fullPath}.ts`) && !fs.existsSync(`${fullPath}.tsx`)) {
                this.errors.push(`${file}: Import path may not exist: ${importPath}`);
              }
            }
          }
        }
      }
    }
    
    console.log('✅ Import consistency check completed\n');
  }

  private async checkExports(): Promise<void> {
    console.log('📤 Checking export consistency...');
    
    const files = await glob('src/**/*.{ts,tsx}');
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Skip test files and index files
      if (file.includes('.test.') || file.includes('.spec.') || file.endsWith('index.ts')) {
        continue;
      }
      
      // Check if file has exports
      const hasExports = content.includes('export ') || content.includes('export default');
      const hasImports = content.includes('import ');
      
      if (hasImports && !hasExports && !file.includes('main.')) {
        this.warnings.push(`${file}: File imports but doesn't export anything - might be unused`);
      }
    }
    
    console.log('✅ Export consistency check completed\n');
  }

  private printResults(): void {
    console.log('📊 Pre-commit Check Results:');
    console.log('============================');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All checks passed! No issues found.');
      return;
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n🚫 Commit blocked due to errors. Please fix the issues above.');
    } else {
      console.log('\n✅ Commit allowed, but consider addressing warnings.');
    }
  }
}

async function main() {
  const checker = new PreCommitTSChecker();
  const success = await checker.run();
  process.exit(success ? 0 : 1);
}

if (import.meta.url.endsWith(process.argv[1])) {
  main().catch(console.error);
}

export { PreCommitTSChecker };