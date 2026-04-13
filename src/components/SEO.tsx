// src/components/SEO.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  schema?: object;
  canonical?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image = 'https://lovable.dev/opengraph-image-p98pqg.png',
  type = 'website',
  schema,
  canonical,
}) => {
  const location = useLocation();
  const currentUrl = canonical || `https://imcolus.in${location.pathname}`;
  const fullTitle = title.includes('Imcolus') ? title : `${title} | Imcolus`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'Imcolus', true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@imcolus');

    // Canonical URL
    let canonicalLink = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Add structured data (schema.org)
    if (schema) {
      let schemaScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    }

    // Cleanup function
    return () => {
      // Optional: Remove schema on unmount if needed
    };
  }, [fullTitle, description, keywords, image, type, currentUrl, schema]);

  return null; // This component doesn't render anything
};

// Helper function to generate product schema
export const generateProductSchema = (product: any, brand: string, category: string, currentStock: number) => {
  const images = product.product_variants?.flatMap((v: any) => 
    v.product_images?.map((img: any) => img.image_url) || []
  ) || [];

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": images,
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": brand.charAt(0).toUpperCase() + brand.slice(1)
    },
    "offers": {
      "@type": "Offer",
      "url": `https://imcolus.in/${brand}/${category}/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Imcolus"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "89"
    }
  };
};

// Helper function to generate breadcrumb schema
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://imcolus.in${item.url}`
    }))
  };
};