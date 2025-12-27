// ========================================
// F&B MASTER - PERFORMANCE OPTIMIZER
// Lazy Loading, Compression, Optimization
// ========================================

const PerformanceOptimizer = {
    config: {
        lazyLoadThreshold: '200px',
        imageQuality: 0.8,
        prefetchOnHover: true,
        debounceDelay: 150,
        cacheImages: true
    },

    stats: {
        imagesLazyLoaded: 0,
        bytesOptimized: 0,
        cacheHits: 0
    },

    init() {
        console.log('⚡ Performance Optimizer initialized');

        this.setupLazyLoading();
        this.setupPrefetching();
        this.optimizeScrolling();
        this.setupImageOptimization();
        this.measurePerformance();
    },

    // ========================================
    // LAZY LOADING
    // ========================================

    setupLazyLoading() {
        // Use Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        this.loadElement(element);
                        this.lazyObserver.unobserve(element);
                    }
                });
            }, {
                rootMargin: this.config.lazyLoadThreshold
            });

            // Observe all lazy elements
            this.observeLazyElements();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    },

    observeLazyElements() {
        // Images
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.lazyObserver.observe(img);
        });

        // Background images
        document.querySelectorAll('[data-bg]').forEach(el => {
            this.lazyObserver.observe(el);
        });

        // Iframes
        document.querySelectorAll('iframe[data-src]').forEach(iframe => {
            this.lazyObserver.observe(iframe);
        });
    },

    loadElement(element) {
        if (element.tagName === 'IMG') {
            const src = element.dataset.src;
            if (src) {
                element.src = src;
                element.removeAttribute('data-src');
                element.classList.add('loaded');
                this.stats.imagesLazyLoaded++;
            }
        } else if (element.dataset.bg) {
            element.style.backgroundImage = `url(${element.dataset.bg})`;
            element.removeAttribute('data-bg');
            element.classList.add('loaded');
        } else if (element.tagName === 'IFRAME') {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
    },

    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    },

    // ========================================
    // PREFETCHING
    // ========================================

    setupPrefetching() {
        if (!this.config.prefetchOnHover) return;

        // Prefetch links on hover
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.href && !link.dataset.prefetched) {
                this.prefetchPage(link.href);
                link.dataset.prefetched = 'true';
            }
        });

        // Prefetch images on hover
        document.addEventListener('mouseover', (e) => {
            const img = e.target.closest('[data-prefetch-src]');
            if (img) {
                this.prefetchImage(img.dataset.prefetchSrc);
            }
        });
    },

    prefetchPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    },

    prefetchImage(src) {
        const img = new Image();
        img.src = src;
    },

    // ========================================
    // SCROLL OPTIMIZATION
    // ========================================

    optimizeScrolling() {
        let ticking = false;
        let lastScrollY = 0;

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;

            if (!ticking) {
                requestAnimationFrame(() => {
                    this.onScroll(lastScrollY);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    },

    onScroll(scrollY) {
        // Update any scroll-dependent UI
        const header = document.querySelector('.customer-header');
        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    },

    // ========================================
    // IMAGE OPTIMIZATION
    // ========================================

    setupImageOptimization() {
        // Add loading="lazy" to all images
        document.querySelectorAll('img:not([loading])').forEach(img => {
            img.loading = 'lazy';
        });

        // Add decode async
        document.querySelectorAll('img:not([decoding])').forEach(img => {
            img.decoding = 'async';
        });
    },

    async compressImage(file, quality = 0.8) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calculate new dimensions (max 1200px)
                    let { width, height } = img;
                    const maxDimension = 1200;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const originalSize = file.size;
                        const compressedSize = blob.size;
                        this.stats.bytesOptimized += (originalSize - compressedSize);
                        resolve(blob);
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    // ========================================
    // CACHING
    // ========================================

    async cacheData(key, data, ttl = 3600000) {
        const cacheItem = {
            data,
            expiry: Date.now() + ttl
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    },

    getCachedData(key) {
        try {
            const cached = localStorage.getItem(`cache_${key}`);
            if (!cached) return null;

            const { data, expiry } = JSON.parse(cached);
            if (Date.now() > expiry) {
                localStorage.removeItem(`cache_${key}`);
                return null;
            }

            this.stats.cacheHits++;
            return data;
        } catch (e) {
            return null;
        }
    },

    clearCache() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`🗑️ Cleared ${keys.length} cached items`);
    },

    // ========================================
    // DEBOUNCE & THROTTLE
    // ========================================

    debounce(func, wait = 150) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    throttle(func, limit = 100) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ========================================
    // PERFORMANCE METRICS
    // ========================================

    measurePerformance() {
        if (!window.performance) return;

        // Wait for page to fully load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perf = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');

                const metrics = {
                    // Core Web Vitals proxies
                    domContentLoaded: Math.round(perf.domContentLoadedEventEnd),
                    loadComplete: Math.round(perf.loadEventEnd),
                    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,

                    // Resource stats
                    resources: performance.getEntriesByType('resource').length,

                    // Custom stats
                    lazyImagesLoaded: this.stats.imagesLazyLoaded,
                    bytesOptimized: this.stats.bytesOptimized,
                    cacheHits: this.stats.cacheHits
                };

                console.log('📊 Performance Metrics:', metrics);

                // Store for debugging
                window.__perfMetrics = metrics;
            }, 0);
        });
    },

    getPerformanceReport() {
        const metrics = window.__perfMetrics || {};
        return {
            ...metrics,
            ...this.stats,
            timestamp: new Date().toISOString()
        };
    },

    // ========================================
    // RESOURCE HINTS
    // ========================================

    addResourceHints() {
        // DNS Prefetch for common domains
        const domains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdn.jsdelivr.net'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });

        // Preconnect to critical origins
        const preconnect = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        preconnect.forEach(origin => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = origin;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    },

    // ========================================
    // CRITICAL CSS
    // ========================================

    inlineCriticalCSS() {
        // This would typically be done at build time
        // Here we just add some performance-critical styles
        const criticalCSS = `
            /* Critical rendering path optimizations */
            .skeleton-loading {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.05) 25%, 
                    rgba(255,255,255,0.1) 50%, 
                    rgba(255,255,255,0.05) 75%
                );
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }

            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            img.loaded {
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .customer-header.scrolled {
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
            }
        `;

        const style = document.createElement('style');
        style.id = 'criticalCSS';
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    PerformanceOptimizer.addResourceHints();
    PerformanceOptimizer.inlineCriticalCSS();
    PerformanceOptimizer.init();
});

window.PerformanceOptimizer = PerformanceOptimizer;
