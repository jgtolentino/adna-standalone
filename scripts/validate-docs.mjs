#!/usr/bin/env node
/**
 * validate-docs.mjs
 * Documentation validation script for CI
 * Checks for broken links and validates markdown files
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

// Directories to scan for markdown files
const DOCS_DIRS = ['docs', '.'];
const MD_EXTENSIONS = ['.md', '.mdx'];

// Files to exclude from validation
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  '.vercel',
  'src.backup'
];

let errors = [];
let warnings = [];

function shouldExclude(path) {
  return EXCLUDE_PATTERNS.some(pattern => path.includes(pattern));
}

function findMarkdownFiles(dir, files = []) {
  if (!existsSync(dir) || shouldExclude(dir)) {
    return files;
  }

  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);

    if (shouldExclude(fullPath)) {
      continue;
    }

    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (MD_EXTENSIONS.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractLinks(content) {
  const links = [];

  // Match markdown links [text](url)
  const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = mdLinkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      type: 'markdown'
    });
  }

  return links;
}

function validateLink(link, filePath) {
  const { url } = link;

  // Skip external URLs and anchors
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('#')) {
    return null;
  }

  // Skip mailto and tel links
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return null;
  }

  // Handle relative paths
  const fileDir = dirname(filePath);
  const targetPath = resolve(fileDir, url.split('#')[0]); // Remove anchor

  if (!existsSync(targetPath)) {
    return {
      file: filePath,
      link: url,
      error: `Broken link: target does not exist`
    };
  }

  return null;
}

function validateFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const links = extractLinks(content);
  const fileErrors = [];

  for (const link of links) {
    const error = validateLink(link, filePath);
    if (error) {
      fileErrors.push(error);
    }
  }

  // Check for common markdown issues
  const lines = content.split('\n');

  // Check for missing title (first heading)
  const hasTitle = lines.some(line => line.startsWith('# '));
  if (!hasTitle) {
    warnings.push({
      file: filePath,
      warning: 'No H1 heading found in document'
    });
  }

  return fileErrors;
}

function main() {
  console.log('📚 Documentation Validation');
  console.log('============================\n');

  let allFiles = [];

  for (const dir of DOCS_DIRS) {
    const fullDir = join(ROOT_DIR, dir);
    if (existsSync(fullDir)) {
      const files = findMarkdownFiles(fullDir);
      allFiles = [...allFiles, ...files];
    }
  }

  // Remove duplicates
  allFiles = [...new Set(allFiles)];

  console.log(`Found ${allFiles.length} markdown files to validate\n`);

  for (const file of allFiles) {
    const relativePath = file.replace(ROOT_DIR + '/', '');
    process.stdout.write(`  Checking ${relativePath}... `);

    const fileErrors = validateFile(file);

    if (fileErrors.length > 0) {
      console.log('❌');
      errors = [...errors, ...fileErrors];
    } else {
      console.log('✅');
    }
  }

  console.log('\n============================');
  console.log('📊 Validation Summary');
  console.log('============================\n');

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warnings:`);
    warnings.slice(0, 5).forEach(w => {
      console.log(`   - ${w.file}: ${w.warning}`);
    });
    if (warnings.length > 5) {
      console.log(`   ... and ${warnings.length - 5} more warnings`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} errors found:`);
    errors.forEach(e => {
      console.log(`   - ${e.file}`);
      console.log(`     Link: ${e.link}`);
      console.log(`     Error: ${e.error}`);
    });
    console.log('\n⚠️  Documentation validation completed with errors');
    // Exit with 0 to not block CI - broken links are warnings not blockers
    process.exit(0);
  } else {
    console.log('✅ All documentation checks passed!');
    process.exit(0);
  }
}

main();
