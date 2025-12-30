// ========================================
// F&B MASTER - MOBILE PAGINATION ENHANCED
// Scroll memory, Smart loading, Haptic feedback
// ========================================

const MobilePagination = {
    // State
    scrollPositions: {},
    observedContainers: new Set(),
    loadingStates: new Map(),

    // Config
    config: {
        itemsPerPage: 12,
        preloadThreshold: 3, // Load when 3 items before end
        hapticEnabled: true,
        scrollRestoreDelay: 100
    },

    init() {
        if (window.Debug) Debug.info('Mobile Pagination Enhanced initializing...');
        this.setupScrollMemory();
        this.enhanceLoadingStates();
        this.setupStickyTabs();
        this.injectEnhancedStyles();
        if (window.Debug) Debug.info('Mobile Pagination Enhanced ready!');
    },

    // ========================================
    // 1. SCROLL POSITION MEMORY
    // ========================================
    setupScrollMemory() {
        // Save scroll position before leaving menu section
        document.addEventListener('click', (e) => {
            const detailTrigger = e.target.closest('.menu-card, [onclick*="showItemDetail"]');
            if (detailTrigger) {
                this.saveScrollPosition('menu');
            }
        });

        // Listen for bottom sheet close to restore scroll
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.target.id === 'bottomSheet') {
                    const isClosing = !mutation.target.classList.contains('show');
                    if (isClosing) {
                        this.restoreScrollPosition('menu');
                    }
                }
            });
        });

        // Observe bottom sheet when it exists
        setTimeout(() => {
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) {
                observer.observe(bottomSheet, { attributes: true, attributeFilter: ['class'] });
            }
        }, 1000);
    },

    saveScrollPosition(key) {
        this.scrollPositions[key] = {
            x: window.scrollX,
            y: window.scrollY,
            timestamp: Date.now()
        };
    },

    restoreScrollPosition(key) {
        const pos = this.scrollPositions[key];
        if (!pos) return;

        // Only restore if recently saved (within 5 mins)
        if (Date.now() - pos.timestamp > 300000) return;

        setTimeout(() => {
            window.scrollTo({
                top: pos.y,
                left: pos.x,
                behavior: 'smooth'
            });
        }, this.config.scrollRestoreDelay);
    },

    // ========================================
    // 2. SMART LOADING STATES
    // ========================================
    enhanceLoadingStates() {
        // Override Pagination render to add item counter
        if (typeof Pagination !== 'undefined') {
            const originalRender = Pagination.render.bind(Pagination);

            Pagination.render = (containerId, append) => {
                originalRender(containerId, append);
                this.updateItemCounter(containerId);
            };

            // Enhance loadMore with haptic feedback
            const originalLoadMore = Pagination.loadMore.bind(Pagination);
            Pagination.loadMore = (containerId) => {
                this.triggerHaptic('light');
                originalLoadMore(containerId);
            };
        }
    },

    updateItemCounter(containerId) {
        if (typeof Pagination === 'undefined') return;

        const stats = Pagination.getStats(containerId);
        if (!stats || stats.total <= stats.showing) return;

        const remaining = stats.total - stats.showing;
        const counterId = `${containerId}-counter`;

        let counter = document.getElementById(counterId);
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!counter) {
            counter = document.createElement('div');
            counter.id = counterId;
            counter.className = 'pagination-counter';
            container.parentNode.insertBefore(counter, container.nextSibling);
        }

        counter.innerHTML = `
            <span class="counter-text">Còn ${remaining} món nữa</span>
            <span class="counter-progress">${stats.showing}/${stats.total}</span>
        `;
        counter.classList.add('visible');
    },

    // ========================================
    // 3. STICKY CATEGORY TABS
    // ========================================
    setupStickyTabs() {
        const categoryFilter = document.querySelector('.category-filter');
        const subcategoryTabs = document.getElementById('subcategoryTabs');

        if (!categoryFilter) return;

        // Create sticky wrapper
        const stickyWrapper = document.createElement('div');
        stickyWrapper.className = 'sticky-tabs-wrapper';
        stickyWrapper.id = 'stickyTabsWrapper';

        // Wrap if not already wrapped
        if (!categoryFilter.parentElement.classList.contains('sticky-tabs-wrapper')) {
            categoryFilter.parentNode.insertBefore(stickyWrapper, categoryFilter);
            stickyWrapper.appendChild(categoryFilter);
            if (subcategoryTabs) {
                stickyWrapper.appendChild(subcategoryTabs);
            }
        }

        // Setup intersection observer for sticky effect
        const sentinel = document.createElement('div');
        sentinel.className = 'sticky-sentinel';
        stickyWrapper.parentNode.insertBefore(sentinel, stickyWrapper);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                stickyWrapper.classList.toggle('is-sticky', !entry.isIntersecting);
            });
        }, { threshold: 0 });

        observer.observe(sentinel);
    },

    // ========================================
    // 4. HAPTIC FEEDBACK
    // ========================================
    triggerHaptic(type = 'light') {
        if (!this.config.hapticEnabled) return;

        // Check for Vibration API support
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                success: [10, 50, 10],
                error: [50, 50, 50]
            };
            navigator.vibrate(patterns[type] || patterns.light);
        }
    },

    // Enable haptic on add to cart
    setupHapticOnCart() {
        if (typeof CustomerApp !== 'undefined') {
            const originalAddToCart = CustomerApp.addToCart.bind(CustomerApp);
            CustomerApp.addToCart = (itemId) => {
                this.triggerHaptic('success');
                originalAddToCart(itemId);
            };
        }
    },

    // ========================================
    // 5. ENHANCED EMPTY STATES
    // ========================================
    showEnhancedEmptyState(container, query, category) {
        const suggestions = ['drinks', 'food', 'dessert'].filter(c => c !== category);

        container.innerHTML = `
            <div class="empty-state-enhanced">
                <div class="empty-icon">🔍</div>
                <h3>Không tìm thấy "${query || category}"</h3>
                <p>Thử tìm kiếm khác hoặc chọn danh mục:</p>
                <div class="empty-suggestions">
                    ${suggestions.map(cat => `
                        <button class="suggestion-btn" onclick="CustomerApp.filterMenu('${cat}')">
                            ${cat === 'drinks' ? '🥤 Đồ uống' : cat === 'food' ? '🍜 Món ăn' : '🍰 Tráng miệng'}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ========================================
    // 6. PROGRESSIVE LOADING OPTIMIZATION
    // ========================================
    preloadNextBatch(containerId) {
        if (typeof Pagination === 'undefined') return;

        const stats = Pagination.getStats(containerId);
        if (!stats || !stats.hasMore) return;

        const itemsRemaining = stats.total - stats.showing;
        if (itemsRemaining <= this.config.preloadThreshold) {
            // Preload next batch in background
            Pagination.loadMore(containerId);
        }
    },

    // ========================================
    // INJECT ENHANCED STYLES
    // ========================================
    injectEnhancedStyles() {
        if (document.getElementById('mobilePaginationStyles')) return;

        const style = document.createElement('style');
        style.id = 'mobilePaginationStyles';
        style.textContent = `
            /* Sticky Tabs Wrapper */
            .sticky-tabs-wrapper {
                position: relative;
                z-index: 50;
                transition: all 0.2s ease;
            }

            .sticky-tabs-wrapper.is-sticky {
                position: sticky;
                top: 0;
                background: rgba(10, 10, 18, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 8px 16px;
                margin: 0 -16px;
                border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .sticky-tabs-wrapper.is-sticky .category-filter {
                margin-bottom: 8px;
            }

            .sticky-sentinel {
                height: 1px;
                visibility: hidden;
            }

            /* Pagination Counter */
            .pagination-counter {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 16px;
                margin-top: 8px;
                background: linear-gradient(135deg, 
                    rgba(99, 102, 241, 0.1) 0%, 
                    rgba(16, 185, 129, 0.1) 100%);
                border-radius: 10px;
                font-size: 0.85rem;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }

            .pagination-counter.visible {
                opacity: 1;
                transform: translateY(0);
            }

            .counter-text {
                color: var(--text-secondary, #b4b4bc);
            }

            .counter-progress {
                font-weight: 600;
                color: var(--primary-light, #818cf8);
            }

            /* Enhanced Empty State */
            .empty-state-enhanced {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px 20px;
            }

            .empty-state-enhanced .empty-icon {
                font-size: 4rem;
                margin-bottom: 16px;
                animation: float 3s ease-in-out infinite;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            .empty-state-enhanced h3 {
                font-size: 1.1rem;
                margin-bottom: 8px;
                color: var(--text-primary, #f8f8fa);
            }

            .empty-state-enhanced p {
                color: var(--text-muted, #8888a0);
                margin-bottom: 20px;
            }

            .empty-suggestions {
                display: flex;
                gap: 8px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .suggestion-btn {
                padding: 10px 16px;
                background: var(--bg-card, rgba(26, 26, 46, 0.95));
                border: 1px solid var(--border-color, rgba(255,255,255,0.1));
                border-radius: 20px;
                color: var(--text-secondary, #b4b4bc);
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .suggestion-btn:active {
                transform: scale(0.95);
                background: var(--primary);
                color: white;
            }

            /* Enhanced Loading Animation */
            .pagination-item {
                animation: slideInUp 0.4s ease forwards;
                opacity: 0;
            }

            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Subcategory Tabs Styling Enhancement */
            .subcategory-tabs {
                position: relative;
                margin-bottom: 16px;
            }

            .subcategory-tab {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .subcategory-tab.active {
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }

            /* Pull-to-refresh enhancement */
            .pull-indicator.success {
                background: linear-gradient(135deg, var(--secondary), #059669);
            }

            /* Smooth scroll behavior */
            html {
                scroll-behavior: smooth;
            }

            /* Loading skeleton enhancement */
            .skeleton-card {
                animation: pulse 1.5s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    MobilePagination.init();
    MobilePagination.setupHapticOnCart();
});

window.MobilePagination = MobilePagination;
