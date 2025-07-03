// TypeScript-aware CSS analyzer
// Save as "analyze-css-ts.cjs" in your project root

const fs = require('fs');
const path = require('path');

// Get all CSS files
function getAllCSSFiles() {
  const cssFiles = [];
  
  function scanFolder(folder) {
    if (!fs.existsSync(folder)) return;
    
    const items = fs.readdirSync(folder);
    
    items.forEach(item => {
      const fullPath = path.join(folder, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        scanFolder(fullPath);
      } else if (item.endsWith('.css')) {
        cssFiles.push(fullPath);
      }
    });
  }
  
  scanFolder('./src');
  return cssFiles;
}

// Get all React/TypeScript files
function getAllReactFiles() {
  const reactFiles = [];
  
  function scanFolder(folder) {
    if (!fs.existsSync(folder)) return;
    
    const items = fs.readdirSync(folder);
    
    items.forEach(item => {
      const fullPath = path.join(folder, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        scanFolder(fullPath);
      } else if (item.match(/\.(js|jsx|ts|tsx)$/)) {
        reactFiles.push(fullPath);
      }
    });
  }
  
  scanFolder('./src');
  return reactFiles;
}

// Check if CSS file is imported and WHERE
function findCSSImports(cssFile, reactFiles) {
  const cssFileName = path.basename(cssFile);
  const cssFileNameWithoutExt = path.basename(cssFile, '.css');
  
  const relativePath = cssFile.replace(/\\/g, '/');
  const fromSrc = relativePath.replace('src/', './');
  
  const importLocations = [];
  
  for (const reactFile of reactFiles) {
    const content = fs.readFileSync(reactFile, 'utf8');
    const lines = content.split('\n');
    
    const patterns = [
      cssFileName,
      fromSrc,
      relativePath,
      `./${cssFileName}`,
      `../${cssFileName}`,
      `./styles/${cssFileName}`,
      `../styles/${cssFileName}`,
      cssFileNameWithoutExt
    ];
    
    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        if (line.includes('import') && 
            (line.includes(`'${pattern}'`) || 
             line.includes(`"${pattern}"`) ||
             line.includes(`\`${pattern}\``) ||
             line.includes(`from '${pattern}'`) ||
             line.includes(`from "${pattern}"`))) {
          
          importLocations.push({
            file: reactFile,
            line: index + 1,
            statement: line.trim()
          });
          break;
        }
      }
    });
  }
  
  return importLocations;
}

// Find where specific CSS classes are used
function findClassUsage(className, reactFiles) {
  const usageLocations = [];
  
  for (const reactFile of reactFiles) {
    const content = fs.readFileSync(reactFile, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Look for various ways classes can be used
      const patterns = [
        `"${className}"`,
        `'${className}'`,
        `\`${className}\``,
        `className="${className}"`,
        `className='${className}'`,
        `className={\`.*${className}.*\`}`,
        `className={\\".*${className}.*\\"}`,
        `className={'.*${className}.*'}`,
        `class="${className}"`,
        `class='${className}'`
      ];
      
      let found = false;
      for (const pattern of patterns) {
        if (line.includes(className) && 
            (line.includes(`"${className}"`) ||
             line.includes(`'${className}'`) ||
             line.includes(`\`${className}\``) ||
             line.includes(`className=`) ||
             line.includes(`class=`))) {
          found = true;
          break;
        }
      }
      
      if (found) {
        usageLocations.push({
          file: reactFile,
          line: index + 1,
          code: line.trim(),
          context: getLineContext(lines, index)
        });
      }
    });
  }
  
  return usageLocations;
}

// Get context around a line
function getLineContext(lines, lineIndex) {
  const start = Math.max(0, lineIndex - 2);
  const end = Math.min(lines.length, lineIndex + 3);
  
  return lines.slice(start, end).map((line, idx) => ({
    lineNum: start + idx + 1,
    content: line,
    isTarget: start + idx === lineIndex
  }));
}

// Extract CSS classes from a file
function extractCSSClasses(cssFile) {
  if (!fs.existsSync(cssFile)) {
    return [];
  }
  
  const content = fs.readFileSync(cssFile, 'utf8');
  
  // Extract CSS classes (improved regex)
  const classMatches = content.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g);
  if (!classMatches) {
    return [];
  }
  
  // Remove duplicates and filter out potential false positives
  const classes = [...new Set(classMatches.map(match => match.substring(1)))]
    .filter(className => {
      // Filter out common false positives
      return !className.includes('::') && 
             !className.includes('(') && 
             !className.includes(')') &&
             className.length > 0;
    });
  
  return classes;
}

// Analyze a single CSS file in detail
function analyzeCSSFile(cssFile, reactFiles) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📁 ANALYZING: ${cssFile}`);
  console.log(`${'='.repeat(80)}`);
  
  if (!fs.existsSync(cssFile)) {
    console.log('❌ File not found!');
    return { isEmpty: true, classes: [], imports: [], recommendations: 'DELETE - File not found' };
  }
  
  const content = fs.readFileSync(cssFile, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  console.log(`📊 File Info:`);
  console.log(`   Size: ${content.length} characters`);
  console.log(`   Lines: ${lines.length} (non-empty)`);
  
  // Check if file is empty
  if (lines.length === 0) {
    console.log('✅ EMPTY FILE - Safe to delete!');
    return { isEmpty: true, classes: [], imports: [], recommendations: 'DELETE - Empty file' };
  }
  
  // Show file preview
  console.log(`\n📄 File Preview (first 8 lines):`);
  lines.slice(0, 8).forEach((line, index) => {
    console.log(`   ${(index + 1).toString().padStart(2, '0')}: ${line}`);
  });
  if (lines.length > 8) {
    console.log(`   ... and ${lines.length - 8} more lines`);
  }
  
  // Check imports
  const imports = findCSSImports(cssFile, reactFiles);
  console.log(`\n📋 Import Analysis:`);
  if (imports.length > 0) {
    console.log(`   ✅ Imported in ${imports.length} file(s):`);
    imports.forEach(imp => {
      console.log(`      📄 ${path.basename(imp.file)}:${imp.line}`);
      console.log(`         ${imp.statement}`);
    });
  } else {
    console.log(`   ❌ NOT IMPORTED in any file`);
  }
  
  // Extract and analyze classes
  const classes = extractCSSClasses(cssFile);
  console.log(`\n🎯 Class Analysis:`);
  console.log(`   Found ${classes.length} CSS classes`);
  
  if (classes.length === 0) {
    console.log('   ℹ️  No classes found (might be global styles, variables, etc.)');
    return { 
      isEmpty: false, 
      classes: [], 
      imports, 
      recommendations: imports.length > 0 ? 'KEEP - Imported but no classes' : 'REVIEW - No imports, no classes'
    };
  }
  
  const classAnalysis = [];
  
  classes.forEach(className => {
    const usage = findClassUsage(className, reactFiles);
    
    if (usage.length > 0) {
      console.log(`   ✅ .${className} - Used in ${usage.length} location(s):`);
      usage.forEach(use => {
        console.log(`      📄 ${path.basename(use.file)}:${use.line}`);
        console.log(`         ${use.code}`);
      });
    } else {
      console.log(`   ❌ .${className} - UNUSED`);
    }
    
    classAnalysis.push({
      className,
      usage,
      isUsed: usage.length > 0
    });
  });
  
  // Summary and recommendations
  const usedClasses = classAnalysis.filter(c => c.isUsed);
  const unusedClasses = classAnalysis.filter(c => !c.isUsed);
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Used classes: ${usedClasses.length}`);
  console.log(`   ❌ Unused classes: ${unusedClasses.length}`);
  console.log(`   📋 Import status: ${imports.length > 0 ? 'IMPORTED' : 'NOT IMPORTED'}`);
  
  let recommendations = '';
  if (unusedClasses.length === classes.length && imports.length === 0) {
    recommendations = 'DELETE - No imports, all classes unused';
    console.log(`\n🗑️  RECOMMENDATION: SAFE TO DELETE`);
  } else if (unusedClasses.length === classes.length) {
    recommendations = 'REVIEW - Imported but all classes unused';
    console.log(`\n⚠️  RECOMMENDATION: REVIEW (imported but no classes used)`);
  } else if (unusedClasses.length > 0) {
    recommendations = `CLEAN - Remove ${unusedClasses.length} unused classes`;
    console.log(`\n🧹 RECOMMENDATION: CLEAN UP (remove unused classes)`);
  } else {
    recommendations = 'KEEP - All classes in use';
    console.log(`\n✅ RECOMMENDATION: KEEP (all classes used)`);
  }
  
  return {
    isEmpty: false,
    classes: classAnalysis,
    imports,
    recommendations,
    usedCount: usedClasses.length,
    unusedCount: unusedClasses.length
  };
}

// Main analysis function
function analyzeAllCSS() {
  console.log('🔍 TypeScript-Aware CSS Analysis');
  console.log('🎯 Analyzing your React/TypeScript project...\n');
  
  const cssFiles = getAllCSSFiles();
  const reactFiles = getAllReactFiles();
  
  console.log(`📊 Project Overview:`);
  console.log(`   CSS files found: ${cssFiles.length}`);
  console.log(`   React/TS files found: ${reactFiles.length}`);
  
  if (cssFiles.length === 0) {
    console.log('\n❌ No CSS files found in src/ directory');
    return;
  }
  
  console.log(`\n📁 CSS Files to analyze:`);
  cssFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  
  // Analyze each file
  const results = {};
  cssFiles.forEach(cssFile => {
    results[cssFile] = analyzeCSSFile(cssFile, reactFiles);
  });
  
  // Final summary
  console.log(`\n\n${'='.repeat(80)}`);
  console.log('🎯 FINAL RECOMMENDATIONS');
  console.log(`${'='.repeat(80)}`);
  
  const safeToDelete = [];
  const needsCleaning = [];
  const needsReview = [];
  const keepFiles = [];
  
  Object.entries(results).forEach(([file, analysis]) => {
    if (analysis.recommendations.startsWith('DELETE')) {
      safeToDelete.push(file);
    } else if (analysis.recommendations.startsWith('CLEAN')) {
      needsCleaning.push(file);
    } else if (analysis.recommendations.startsWith('REVIEW')) {
      needsReview.push(file);
    } else {
      keepFiles.push(file);
    }
  });
  
  if (safeToDelete.length > 0) {
    console.log(`\n🗑️  SAFE TO DELETE (${safeToDelete.length} files):`);
    safeToDelete.forEach(file => {
      console.log(`   📁 ${file}`);
      console.log(`      → ${results[file].recommendations}`);
    });
  }
  
  if (needsCleaning.length > 0) {
    console.log(`\n🧹 NEEDS CLEANING (${needsCleaning.length} files):`);
    needsCleaning.forEach(file => {
      console.log(`   📁 ${file}`);
      console.log(`      → Keep ${results[file].usedCount} classes, remove ${results[file].unusedCount} unused`);
    });
  }
  
  if (needsReview.length > 0) {
    console.log(`\n⚠️  NEEDS REVIEW (${needsReview.length} files):`);
    needsReview.forEach(file => {
      console.log(`   📁 ${file}`);
      console.log(`      → ${results[file].recommendations}`);
    });
  }
  
  if (keepFiles.length > 0) {
    console.log(`\n✅ KEEP AS IS (${keepFiles.length} files):`);
    keepFiles.forEach(file => {
      console.log(`   📁 ${file}`);
    });
  }
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   🗑️  Safe to delete: ${safeToDelete.length}`);
  console.log(`   🧹 Need cleaning: ${needsCleaning.length}`);
  console.log(`   ⚠️  Need review: ${needsReview.length}`);
  console.log(`   ✅ Keep as is: ${keepFiles.length}`);
  
  return results;
}

// Run the analysis
analyzeAllCSS();