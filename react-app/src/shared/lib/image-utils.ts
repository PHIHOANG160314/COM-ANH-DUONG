/**
 * Image optimization utilities
 * Uses WebP with PNG fallback for browser compatibility
 */

/**
 * Get optimized image URL - converts local PNG paths to WebP
 * Falls back to original URL for external images (Supabase, etc)
 */
export function getOptimizedImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // For external URLs (Supabase storage), return as-is
  // Supabase has its own image transformation API
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // For local images, try WebP version first
  if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
    // Replace extension with .webp
    return url.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  }
  
  return url;
}

/**
 * Get WebP url with fallback for <picture> element
 * @returns { webp: string, fallback: string }
 */
export function getImageSources(url: string | null | undefined): { webp: string | null; fallback: string | null } {
  if (!url) {
    return { webp: null, fallback: null };
  }
  
  // External URLs (Supabase)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Supabase transformation for WebP
    if (url.includes('supabase.co/storage')) {
      const webpUrl = url.includes('?') 
        ? `${url}&format=webp` 
        : `${url}?format=webp`;
      return { webp: webpUrl, fallback: url };
    }
    return { webp: url, fallback: url };
  }
  
  // Local images
  if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) {
    const webp = url.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    return { webp, fallback: url };
  }
  
  return { webp: url, fallback: url };
}

/**
 * Preload critical images for LCP optimization
 */
export function preloadImage(url: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}
