// scripts/generate-sitemap.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Try to load .env.local for local development
try {
  config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('ℹ️  No .env.local file found (running on Vercel or CI)');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Product {
  id: string;
  brand: string;
  category: string;
  stock_quantity: number;
}

const DOMAIN = 'https://imcolus.in';

// Get today's date in YYYY-MM-DD format
const TODAY = new Date().toISOString().split('T')[0];

const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/imcolus', priority: 0.9, changefreq: 'weekly' },
  { url: '/bhyross', priority: 0.9, changefreq: 'weekly' },
  { url: '/deecodes', priority: 0.9, changefreq: 'weekly' },
  { url: '/bulk-inquiry', priority: 0.8, changefreq: 'monthly' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/size-guide', priority: 0.6, changefreq: 'monthly' },
  { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
  { url: '/terms', priority: 0.3, changefreq: 'yearly' },
];

async function generateSitemap() {
  try {
    console.log('🔍 Fetching products from Supabase...');
    console.log('📅 Using current date:', TODAY);
    
    // Fetch products with stock info to filter out unavailable ones
    const { data: products, error } = await supabase
      .from('products')
      .select('id, brand, category, stock_quantity')
      .gt('stock_quantity', 0) // Only include products with stock
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`✅ Found ${products?.length || 0} products with stock`);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages with TODAY's date
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <lastmod>${TODAY}</lastmod>\n`;
      xml += '  </url>\n';
    });

    // Add product pages with TODAY's date
    if (products && products.length > 0) {
      products.forEach((product: Product) => {
        const productUrl = `${DOMAIN}/${product.brand}/${product.category}/${product.id}`;
        
        xml += '  <url>\n';
        xml += `    <loc>${productUrl}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `    <lastmod>${TODAY}</lastmod>\n`;
        xml += '  </url>\n';
      });
    }

    xml += '</urlset>';

    // Write to public folder
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);

    console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
    console.log(`📊 Total URLs: ${staticPages.length + (products?.length || 0)}`);
    console.log(`   - Static pages: ${staticPages.length}`);
    console.log(`   - Product pages: ${products?.length || 0}`);
    console.log(`📅 All dates set to: ${TODAY}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap().then(() => {
  console.log('🎉 Sitemap generation complete!');
  process.exit(0);
});