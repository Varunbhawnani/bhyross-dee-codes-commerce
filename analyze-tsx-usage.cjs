// TypeScript/React Component Usage Analyzer
// Save as "analyze-tsx-usage.cjs"

const fs = require('fs');
const path = require('path');

// Get all TypeScript/React files
function getAllTSXFiles() {
  const tsxFiles = [];
  
  function scanFolder(folder) {
    if (!fs.existsSync(folder)) return;
    
    const items = fs.readdirSync(folder);
    
    items.forEach(item => {
      const fullPath = path.join(folder, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        scanFolder(fullPath);
      } else if (item.match(/\.(js|jsx|ts|tsx)$/)) {
        tsxFiles.push(fullPath);
      }
    });
  }
  
  scanFolder('./src');
  return tsxFiles;
}

// Extract component name from file
function getComponentName(filePath) {
  const fileName = path.basename(filePath);
  const nameWithoutExt = fileName.replace(/\.(js|jsx|ts|tsx)$/, '');
  
  // Handle different naming conventions
  if (nameWithoutExt === 'index') {
    // For index files, use the parent directory name
    return path.basename(path.dirname(filePath));
  }
  
  return nameWithoutExt;
}

// Extract all imports from a file
function extractImports(filePath) {
  if (!fs.existsSync(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const imports = [];
  
  lines.forEach((line, index) => {
    // Match various import patterns
    const importPatterns = [
      // import Component from './Component'
      /import\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+['"`]([^'"`]+)['"`]/g,
      // import { Component } from './file'
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"`]([^'"`]+)['"`]/g,
      // import * as Component from './file'
      /import\s+\*\s+as\s+([A-Z][a-zA-Z0-9_]*)\s+from\s+['"`]([^'"`]+)['"`]/g,
      // Dynamic imports
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ];
    
    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        if (match[1] && match[2]) {
          // Named imports (destructured)
          if (match[1].includes(',')) {
            const namedImports = match[1].split(',').map(imp => imp.trim());
            namedImports.forEach(imp => {
              imports.push({
                componentName: imp.replace(/\s+as\s+\w+/, '').trim(),
                importPath: match[2],
                line: index + 1,
                statement: line.trim(),
                type: 'named'
              });
            });
          } else {
            imports.push({
              componentName: match[1],
              importPath: match[2],
              line: index + 1,
              statement: line.trim(),
              type: 'default'
            });
          }
        } else if (match[1]) {
          // Dynamic import
          imports.push({
            componentName: null,
            importPath: match[1],
            line: index + 1,
            statement: line.trim(),
            type: 'dynamic'
          });
        }
      }
    });
  });
  
  return imports;
}

// Check if a component is used in JSX
function isComponentUsedInJSX(componentName, filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Look for JSX usage patterns
  const jsxPatterns = [
    new RegExp(`<${componentName}[\\s/>]`, 'g'),
    new RegExp(`<${componentName}\\.`, 'g'), // For compound components
    new RegExp(`{${componentName}}`, 'g'), // Used in expressions
    new RegExp(`${componentName}\\(`, 'g'), // Function calls
  ];
  
  return jsxPatterns.some(pattern => pattern.test(content));
}

// Resolve import path to actual file
function resolveImportPath(importPath, fromFile) {
  // Handle relative imports
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    const fromDir = path.dirname(fromFile);
    const resolvedPath = path.resolve(fromDir, importPath);
    
    // Try different extensions
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
    
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }
  
  // Handle absolute imports from src
  if (importPath.startsWith('@/') || importPath.startsWith('src/')) {
    const cleanPath = importPath.replace('@/', '').replace('src/', '');
    const srcPath = path.resolve('./src', cleanPath);
    
    const extensions = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];
    
    for (const ext of extensions) {
      const fullPath = srcPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }
  
  return null;
}

// Find where a component is used
function findComponentUsage(targetFile, allFiles) {
  const componentName = getComponentName(targetFile);
  const usageLocations = [];
  
  allFiles.forEach(file => {
    if (file === targetFile) return; // Don't check the file itself
    
    const imports = extractImports(file);
    
    // Check if this file imports the target component
    const relevantImports = imports.filter(imp => {
      const resolvedPath = resolveImportPath(imp.importPath, file);
      return resolvedPath === targetFile || 
             imp.componentName === componentName ||
             imp.importPath.includes(path.basename(targetFile, path.extname(targetFile)));
    });
    
    if (relevantImports.length > 0) {
      // Check if it's actually used in JSX
      const isUsedInJSX = isComponentUsedInJSX(componentName, file);
      
      usageLocations.push({
        file,
        imports: relevantImports,
        usedInJSX: isUsedInJSX,
        componentName
      });
    }
  });
  
  return usageLocations;
}

// Check if file is an entry point
function isEntryPoint(filePath) {
  const fileName = path.basename(filePath);
  const entryPoints = [
    'main.tsx',
    'main.ts', 
    'index.tsx',
    'index.ts',
    'App.tsx',
    'App.ts'
  ];
  
  return entryPoints.includes(fileName) || 
         filePath.includes('pages/') || // Page components
         filePath.includes('Pages/');
}

// Check if it's a route component (used in routing)
function isRouteComponent(filePath, allFiles) {
  const componentName = getComponentName(filePath);
  
  // Check all files for routing patterns
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for routing patterns
    const routingPatterns = [
      new RegExp(`component={${componentName}}`, 'g'),
      new RegExp(`element={<${componentName}`, 'g'),
      new RegExp(`'${componentName}'`, 'g'),
      new RegExp(`"${componentName}"`, 'g'),
    ];
    
    if (routingPatterns.some(pattern => pattern.test(content))) {
      return true;
    }
  }
  
  return false;
}

// Main analysis function
function analyzeComponentUsage() {
  console.log('🔍 TypeScript/React Component Usage Analysis\n');
  
  const allFiles = getAllTSXFiles();
  
  console.log(`📊 Found ${allFiles.length} TypeScript/React files\n`);
  
  const results = [];
  
  // Analyze each file
  allFiles.forEach((file, index) => {
    const componentName = getComponentName(file);
    const usage = findComponentUsage(file, allFiles);
    const isEntry = isEntryPoint(file);
    const isRoute = isRouteComponent(file, allFiles);
    
    let status = '';
    let recommendation = '';
    
    if (isEntry) {
      status = '🎯 ENTRY POINT';
      recommendation = 'KEEP - Entry point file';
    } else if (isRoute) {
      status = '🛣️  ROUTE COMPONENT';
      recommendation = 'KEEP - Used in routing';
    } else if (usage.length === 0) {
      status = '❌ UNUSED';
      recommendation = 'SAFE TO DELETE - No imports found';
    } else if (usage.every(u => !u.usedInJSX)) {
      status = '⚠️  IMPORTED BUT NOT USED';
      recommendation = 'LIKELY SAFE TO DELETE - Imported but not used in JSX';
    } else {
      status = '✅ IN USE';
      recommendation = 'KEEP - Actively used';
    }
    
    results.push({
      file,
      componentName,
      usage,
      isEntry,
      isRoute,
      status,
      recommendation
    });
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Component: ${componentName}`);
    console.log(`   Usage: ${usage.length} locations`);
    console.log(`   ${status}`);
    
    if (usage.length > 0) {
      console.log(`   Used in:`);
      usage.forEach(u => {
        console.log(`     📄 ${path.basename(u.file)} (JSX: ${u.usedInJSX ? 'Yes' : 'No'})`);
      });
    }
    
    console.log(`   💡 ${recommendation}\n`);
  });
  
  // Summary
  console.log('='.repeat(60));
  console.log('📈 SUMMARY\n');
  
  const safeToDelete = results.filter(r => r.recommendation.includes('SAFE TO DELETE'));
  const likelyDelete = results.filter(r => r.recommendation.includes('LIKELY SAFE TO DELETE'));
  const keep = results.filter(r => r.recommendation.includes('KEEP'));
  
  if (safeToDelete.length > 0) {
    console.log('🗑️  SAFE TO DELETE:');
    safeToDelete.forEach(r => console.log(`   📄 ${r.file}`));
    console.log('');
  }
  
  if (likelyDelete.length > 0) {
    console.log('⚠️  LIKELY SAFE TO DELETE (review first):');
    likelyDelete.forEach(r => console.log(`   📄 ${r.file}`));
    console.log('');
  }
  
  if (keep.length > 0) {
    console.log('✅ KEEP:');
    keep.forEach(r => console.log(`   📄 ${r.file}`));
    console.log('');
  }
  
  console.log('📊 TOTALS:');
  console.log(`   🗑️  Safe to delete: ${safeToDelete.length}`);
  console.log(`   ⚠️  Likely safe to delete: ${likelyDelete.length}`);
  console.log(`   ✅ Keep: ${keep.length}`);
  
  return results;
}

// Run analysis
analyzeComponentUsage();