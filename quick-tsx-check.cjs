// Quick TSX Usage Checker - optimized for your project structure
// Save as "quick-tsx-check.cjs"

const fs = require('fs');
const path = require('path');

// Get all TSX files
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
      } else if (item.match(/\.(tsx|ts|jsx|js)$/)) {
        tsxFiles.push(fullPath);
      }
    });
  }
  
  scanFolder('./src');
  return tsxFiles;
}

// Simple component name extraction
function getComponentName(filePath) {
  const fileName = path.basename(filePath);
  return fileName.replace(/\.(tsx|ts|jsx|js)$/, '');
}

// Check if component is mentioned anywhere
function isComponentMentioned(componentName, filePath, allFiles) {
  let mentionCount = 0;
  const mentionedIn = [];
  
  allFiles.forEach(file => {
    if (file === filePath) return; // Skip self
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Look for various mentions
    const patterns = [
      componentName,
      `'${componentName}'`,
      `"${componentName}"`,
      `<${componentName}`,
      `{${componentName}}`,
      `/${componentName}`,
      `./${componentName}`,
      `../${componentName}`
    ];
    
    let found = false;
    patterns.forEach(pattern => {
      if (content.includes(pattern)) {
        found = true;
      }
    });
    
    if (found) {
      mentionCount++;
      mentionedIn.push(path.basename(file));
    }
  });
  
  return { count: mentionCount, files: mentionedIn };
}

// Check if it's a special file (entry points, etc.)
function isSpecialFile(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative('./src', filePath);
  
  // Entry points
  if (['main.tsx', 'App.tsx', 'index.tsx'].includes(fileName)) {
    return { special: true, reason: 'Entry point' };
  }
  
  // Page components (likely used in routing)
  if (relativePath.startsWith('pages/') || relativePath.startsWith('Pages/')) {
    return { special: true, reason: 'Page component' };
  }
  
  // Context providers
  if (fileName.includes('Context') || fileName.includes('Provider')) {
    return { special: true, reason: 'Context/Provider' };
  }
  
  // Hooks
  if (fileName.startsWith('use') || relativePath.startsWith('hooks/')) {
    return { special: true, reason: 'Hook' };
  }
  
  // Utils
  if (relativePath.startsWith('utils/') || relativePath.startsWith('lib/')) {
    return { special: true, reason: 'Utility' };
  }
  
  return { special: false, reason: '' };
}

// Quick analysis
function quickTSXAnalysis() {
  console.log('🔍 Quick TSX/Component Usage Check\n');
  
  const allFiles = getAllTSXFiles();
  
  console.log(`📊 Found ${allFiles.length} TypeScript/React files\n`);
  
  const results = [];
  
  // Group files by directory for better organization
  const filesByDir = {};
  allFiles.forEach(file => {
    const dir = path.dirname(file).replace('./src/', '');
    if (!filesByDir[dir]) filesByDir[dir] = [];
    filesByDir[dir].push(file);
  });
  
  // Analyze each file
  Object.keys(filesByDir).sort().forEach(dir => {
    console.log(`📁 ${dir}/`);
    
    filesByDir[dir].forEach(file => {
      const componentName = getComponentName(file);
      const mentions = isComponentMentioned(componentName, file, allFiles);
      const special = isSpecialFile(file);
      
      let status = '';
      let recommendation = '';
      
      if (special.special) {
        status = `🎯 ${special.reason.toUpperCase()}`;
        recommendation = 'KEEP';
      } else if (mentions.count === 0) {
        status = '❌ NO MENTIONS';
        recommendation = 'LIKELY SAFE TO DELETE';
      } else if (mentions.count === 1) {
        status = '⚠️  1 MENTION';
        recommendation = 'REVIEW';
      } else {
        status = `✅ ${mentions.count} MENTIONS`;
        recommendation = 'KEEP';
      }
      
      results.push({
        file,
        componentName,
        mentions: mentions.count,
        mentionedIn: mentions.files,
        special,
        status,
        recommendation
      });
      
      console.log(`  📄 ${path.basename(file)}`);
      console.log(`     ${status}`);
      if (mentions.count > 0) {
        console.log(`     Used in: ${mentions.files.slice(0, 3).join(', ')}${mentions.files.length > 3 ? '...' : ''}`);
      }
      console.log(`     💡 ${recommendation}`);
      console.log('');
    });
  });
  
  // Summary
  console.log('='.repeat(50));
  console.log('📈 SUMMARY\n');
  
  const safeToDelete = results.filter(r => r.recommendation === 'LIKELY SAFE TO DELETE');
  const needReview = results.filter(r => r.recommendation === 'REVIEW');
  const keep = results.filter(r => r.recommendation === 'KEEP');
  
  if (safeToDelete.length > 0) {
    console.log('🗑️  LIKELY SAFE TO DELETE:');
    safeToDelete.forEach(r => {
      console.log(`   📄 ${r.file}`);
    });
    console.log('');
  }
  
  if (needReview.length > 0) {
    console.log('⚠️  NEEDS REVIEW (1 mention - might be unused):');
    needReview.forEach(r => {
      console.log(`   📄 ${r.file}`);
      console.log(`      Mentioned in: ${r.mentionedIn.join(', ')}`);
    });
    console.log('');
  }
  
  console.log('📊 BREAKDOWN:');
  console.log(`   🗑️  Likely safe to delete: ${safeToDelete.length}`);
  console.log(`   ⚠️  Need review: ${needReview.length}`);
  console.log(`   ✅ Keep: ${keep.length}`);
  
  return results;
}

// For checking specific file
const targetFile = process.argv[2];
if (targetFile) {
  console.log(`🔍 Checking specific file: ${targetFile}\n`);
  
  const allFiles = getAllTSXFiles();
  const componentName = getComponentName(targetFile);
  const mentions = isComponentMentioned(componentName, targetFile, allFiles);
  const special = isSpecialFile(targetFile);
  
  console.log(`📄 File: ${targetFile}`);
  console.log(`🏷️  Component: ${componentName}`);
  console.log(`📊 Mentions: ${mentions.count}`);
  console.log(`🎯 Special: ${special.special ? special.reason : 'No'}`);
  
  if (mentions.count > 0) {
    console.log(`\n📍 Mentioned in:`);
    mentions.files.forEach(file => console.log(`   - ${file}`));
  }
  
  let recommendation = '';
  if (special.special) {
    recommendation = 'KEEP - Special file';
  } else if (mentions.count === 0) {
    recommendation = 'LIKELY SAFE TO DELETE - No mentions found';
  } else if (mentions.count === 1) {
    recommendation = 'REVIEW - Only 1 mention, might be unused';
  } else {
    recommendation = 'KEEP - Multiple mentions';
  }
  
  console.log(`\n💡 Recommendation: ${recommendation}`);
} else {
  quickTSXAnalysis();
}

console.log('\n💡 TIP: To check a specific file, run:');
console.log('   node quick-tsx-check.cjs src/components/SomeComponent.tsx');