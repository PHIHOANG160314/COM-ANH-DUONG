// ========================================
// F&B MASTER - MOBILE UX UTILITIES
// Touch gestures, pagination, infinite scroll
// ========================================

const MobileUX = {
    // Configuration
    config: {
        itemsPerPage: 8,
        loadMoreThreshold: 200, // px from bottom
        pullRefreshThreshold: 80,
        debounceDelay: 300,
        swipeThreshold: 50
    },

    // State
    state: {
        currentPage: 1,
        isLoading: false,
        hasMore: true,
        touchStartY: 0,
        touchStartX: 0,
        isPulling: false
    },

    init() {
        if (window.Debug) Debug.info('Mobile UX initializing...');
        this.setupInfiniteScroll();
        this.setupPullToRefresh();
        this.setupSwipeGestures();
        this.setupDebouncedSearch();
        this.injectStyles();
        if (window.Debug) Debug.info('Mobile UX ready!');
    },

    // ========================================
    // PAGINATION & INFINITE SCROLL
    // ========================================

    setupInfiniteScroll() {
        const menuSection = document.getElementById('section-menu');
        if (!menuSection) return;

        // Create intersection observer for infinite scroll
        const sentinel = document.createElement('div');
        sentinel.id = 'scrollSentinel';
        sentinel.className = 'scroll-sentinel';

        const menuGrid = document.getElementById('customerMenuGrid');
        if (menuGrid && menuGrid.parentNode) {
            menuGrid.parentNode.appendChild(sentinel);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.state.hasMore && !this.state.isLoading) {
                    this.loadMoreItems();
                }
            });
        }, { rootMargin: '100px' });

        observer.observe(sentinel);
    },

    loadMoreItems() {
        if (this.state.isLoading || !this.state.hasMore) return;

        this.state.isLoading = true;
        this.showLoadingIndicator();

        // Simulate loading delay for smooth UX
        setTimeout(() => {
            this.state.currentPage++;

            if (typeof CustomerApp !== 'undefined') {
                const allItems = CustomerApp.getMenuItems();
                const category = CustomerApp.currentCategory;
                const query = CustomerApp.searchQuery;

                // Filter items
                let filtered = allItems;
                if (category !== 'all') {
                    filtered = filtered.filter(item => item.category === category);
                }
                if (query) {
                    filtered = filtered.filter(item =>
                        item.name.toLowerCase().includes(query) ||
                        (item.description && item.description.toLowerCase().includes(query))
                    );
                }

                const endIndex = this.state.currentPage * this.config.itemsPerPage;
                const newItems = filtered.slice(
                    (this.state.currentPage - 1) * this.config.itemsPerPage,
                    endIndex
                );

                if (newItems.length > 0) {
                    this.appendMenuItems(newItems);
                }

                this.state.hasMore = endIndex < filtered.length;
            }

            this.state.isLoading = false;
            this.hideLoadingIndicator();
        }, 300);
    },

    appendMenuItems(items) {
        const grid = document.getElementById('customerMenuGrid');
        if (!grid) return;

        const existingCount = grid.children.length;

        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'menu-card animate-fadeInUp hover-lift';
            card.dataset.id = item.id;
            card.style.animationDelay = `${index * 0.05}s`;
            card.style.opacity = '0';
            card.onclick = () => CustomerApp.showItemDetail(item.id);

            card.innerHTML = `
                <div class="menu-card-image">${item.icon || '🍽️'}</div>
                <div class="menu-card-body">
                    <div class="menu-card-name">${item.name}</div>
                    <div class="menu-card-price">${CustomerApp.formatPrice(item.price)}</div>
                    <button class="menu-card-add btn-press hover-glow" onclick="event.stopPropagation(); CustomerApp.addToCart(${item.id})">
                        + Thêm vào giỏ
                    </button>
                </div>
            `;

            grid.appendChild(card);
        });
    },

    showLoadingIndicator() {
        let loader = document.getElementById('loadMoreLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loadMoreLoader';
            loader.className = 'load-more-indicator';
            loader.innerHTML = `
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                <span>Đang tải thêm...</span>
            `;
            const sentinel = document.getElementById('scrollSentinel');
            if (sentinel) {
                sentinel.parentNode.insertBefore(loader, sentinel);
            }
        }
        loader.style.display = 'flex';
    },

    hideLoadingIndicator() {
        const loader = document.getElementById('loadMoreLoader');
        if (loader) loader.style.display = 'none';
    },

    resetPagination() {
        this.state.currentPage = 1;
        this.state.hasMore = true;
        this.state.isLoading = false;
    },

    // ========================================
    // SKELETON LOADING
    // ========================================

    showSkeletonCards(count = 6) {
        const grid = document.getElementById('customerMenuGrid');
        if (!grid) return;

        grid.innerHTML = Array(count).fill(0).map(() => `
            <div class="menu-card skeleton-card">
                <div class="skeleton-image loading-shimmer"></div>
                <div class="skeleton-body">
                    <div class="skeleton-text loading-shimmer"></div>
                    <div class="skeleton-text short loading-shimmer"></div>
                    <div class="skeleton-button loading-shimmer"></div>
                </div>
            </div>
        `).join('');
    },

    // ========================================
    // PULL TO REFRESH
    // ========================================

    setupPullToRefresh() {
        const main = document.querySelector('.customer-main');
        if (!main) return;

        // Create pull indicator
        const indicator = document.createElement('div');
        indicator.id = 'pullIndicator';
        indicator.className = 'pull-indicator';
        indicator.innerHTML = `
            <div class="pull-icon">↓</div>
            <span class="pull-text">Kéo để làm mới</span>
        `;
        main.parentNode.insertBefore(indicator, main);

        main.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                this.state.touchStartY = e.touches[0].clientY;
                this.state.isPulling = true;
            }
        }, { passive: true });

        main.addEventListener('touchmove', (e) => {
            if (!this.state.isPulling) return;

            const touchY = e.touches[0].clientY;
            const pullDistance = touchY - this.state.touchStartY;

            if (pullDistance > 0 && pullDistance < 150) {
                indicator.style.transform = `translateY(${pullDistance - 60}px)`;
                indicator.style.opacity = Math.min(pullDistance / this.config.pullRefreshThreshold, 1);

                if (pullDistance > this.config.pullRefreshThreshold) {
                    indicator.classList.add('ready');
                    indicator.querySelector('.pull-text').textContent = 'Thả để làm mới';
                } else {
                    indicator.classList.remove('ready');
                    indicator.querySelector('.pull-text').textContent = 'Kéo để làm mới';
                }
            }
        }, { passive: true });

        main.addEventListener('touchend', () => {
            if (!this.state.isPulling) return;

            const indicator = document.getElementById('pullIndicator');
            if (indicator.classList.contains('ready')) {
                this.refreshContent();
            }

            indicator.style.transform = '';
            indicator.style.opacity = '0';
            indicator.classList.remove('ready');
            this.state.isPulling = false;
        });
    },

    refreshContent() {
        const indicator = document.getElementById('pullIndicator');
        indicator.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="pull-text">Đang làm mới...</span>
        `;
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';

        setTimeout(() => {
            this.resetPagination();
            if (typeof CustomerApp !== 'undefined') {
                CustomerApp.renderMenu(CustomerApp.currentCategory);
            }

            indicator.innerHTML = `
                <div class="pull-icon">✓</div>
                <span class="pull-text">Đã làm mới!</span>
            `;

            setTimeout(() => {
                indicator.style.opacity = '0';
                indicator.style.transform = '';
                indicator.innerHTML = `
                    <div class="pull-icon">↓</div>
                    <span class="pull-text">Kéo để làm mới</span>
                `;
            }, 1000);
        }, 800);
    },

    // ========================================
    // SWIPE GESTURES
    // ========================================

    setupSwipeGestures() {
        const menuSection = document.getElementById('section-menu');
        if (!menuSection) return;

        const categoryBtns = document.querySelectorAll('.filter-btn');
        const categories = Array.from(categoryBtns).map(btn => btn.dataset.cat);

        menuSection.addEventListener('touchstart', (e) => {
            this.state.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        menuSection.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diffX = this.state.touchStartX - touchEndX;

            if (Math.abs(diffX) > this.config.swipeThreshold) {
                const currentCat = typeof CustomerApp !== 'undefined' ? CustomerApp.currentCategory : 'all';
                const currentIndex = categories.indexOf(currentCat);

                if (diffX > 0 && currentIndex < categories.length - 1) {
                    // Swipe left - next category
                    this.animateSwipe('left');
                    CustomerApp.filterMenu(categories[currentIndex + 1]);
                } else if (diffX < 0 && currentIndex > 0) {
                    // Swipe right - previous category
                    this.animateSwipe('right');
                    CustomerApp.filterMenu(categories[currentIndex - 1]);
                }
            }
        });
    },

    animateSwipe(direction) {
        const grid = document.getElementById('customerMenuGrid');
        if (!grid) return;

        grid.style.transform = `translateX(${direction === 'left' ? '-20px' : '20px'})`;
        grid.style.opacity = '0.5';

        setTimeout(() => {
            grid.style.transform = '';
            grid.style.opacity = '';
        }, 150);
    },

    // ========================================
    // DEBOUNCED SEARCH
    // ========================================

    setupDebouncedSearch() {
        const searchInput = document.getElementById('menuSearchInput');
        if (!searchInput) return;

        let debounceTimer;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);

            // Show loading state
            const grid = document.getElementById('customerMenuGrid');
            if (grid) {
                grid.style.opacity = '0.6';
            }

            debounceTimer = setTimeout(() => {
                this.resetPagination();
                if (typeof CustomerApp !== 'undefined') {
                    CustomerApp.searchMenu(e.target.value);
                }
                if (grid) {
                    grid.style.opacity = '1';
                }
            }, this.config.debounceDelay);
        });
    },

    // ========================================
    // BOTTOM SHEET MODAL
    // ========================================

    showBottomSheet(content) {
        let sheet = document.getElementById('bottomSheet');
        if (!sheet) {
            sheet = document.createElement('div');
            sheet.id = 'bottomSheet';
            sheet.className = 'bottom-sheet';
            sheet.innerHTML = `
                <div class="bottom-sheet-overlay" onclick="MobileUX.hideBottomSheet()"></div>
                <div class="bottom-sheet-content">
                    <div class="bottom-sheet-handle"></div>
                    <div class="bottom-sheet-body"></div>
                </div>
            `;
            document.body.appendChild(sheet);
        }

        sheet.querySelector('.bottom-sheet-body').innerHTML = content;
        sheet.classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    hideBottomSheet() {
        const sheet = document.getElementById('bottomSheet');
        if (sheet) {
            sheet.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    showItemDetail(item) {
        const content = `
            <div class="item-detail">
                <div class="item-detail-image">${item.icon || '🍽️'}</div>
                <h2 class="item-detail-name">${item.name}</h2>
                <p class="item-detail-desc">${item.description || 'Món ăn ngon từ Ánh Dương'}</p>
                <div class="item-detail-price">${CustomerApp.formatPrice(item.price)}</div>
                <div class="item-detail-actions">
                    <button class="btn-qty" onclick="MobileUX.updateDetailQty(-1)">−</button>
                    <span class="detail-qty" id="detailQty">1</span>
                    <button class="btn-qty" onclick="MobileUX.updateDetailQty(1)">+</button>
                </div>
                <button class="btn-add-detail btn-press" onclick="MobileUX.addFromDetail(${item.id})">
                    Thêm vào giỏ - ${CustomerApp.formatPrice(item.price)}
                </button>
            </div>
        `;
        this.showBottomSheet(content);
    },

    updateDetailQty(delta) {
        const qtyEl = document.getElementById('detailQty');
        if (!qtyEl) return;
        const current = parseInt(qtyEl.textContent);
        const newQty = Math.max(1, current + delta);
        qtyEl.textContent = newQty;
    },

    addFromDetail(itemId) {
        const qty = parseInt(document.getElementById('detailQty')?.textContent || 1);
        for (let i = 0; i < qty; i++) {
            CustomerApp.addToCart(itemId);
        }
        this.hideBottomSheet();

        // Celebrate!
        if (typeof Confetti !== 'undefined' && qty >= 3) {
            Confetti.starBurst();
        }
    },

    // ========================================
    // INJECT STYLES
    // ========================================

    injectStyles() {
        if (document.getElementById('mobileUxStyles')) return;

        const style = document.createElement('style');
        style.id = 'mobileUxStyles';
        style.textContent = `
            /* Load More Indicator */
            .load-more-indicator {
                display: none;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                padding: 24px;
                color: var(--text-muted);
            }

            .scroll-sentinel {
                height: 1px;
            }

            /* Skeleton Cards */
            .skeleton-card {
                background: var(--bg-card);
                border-radius: 16px;
                overflow: hidden;
            }

            .skeleton-image {
                height: 100px;
                background: rgba(255,255,255,0.05);
            }

            .skeleton-body {
                padding: 16px;
            }

            .skeleton-text {
                height: 16px;
                background: rgba(255,255,255,0.05);
                border-radius: 8px;
                margin-bottom: 12px;
            }

            .skeleton-text.short {
                width: 60%;
            }

            .skeleton-button {
                height: 40px;
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }

            /* Pull to Refresh */
            .pull-indicator {
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%) translateY(-60px);
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 24px;
                background: var(--bg-card);
                border-radius: 30px;
                color: var(--text-secondary);
                font-size: 0.9rem;
                z-index: 200;
                opacity: 0;
                transition: opacity 0.2s;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }

            .pull-indicator.ready {
                color: var(--primary-light);
            }

            .pull-indicator.ready .pull-icon {
                transform: rotate(180deg);
            }

            .pull-icon {
                font-size: 1.2rem;
                transition: transform 0.2s;
            }

            /* Bottom Sheet */
            .bottom-sheet {
                position: fixed;
                inset: 0;
                z-index: 1000;
                display: none;
            }

            .bottom-sheet.show {
                display: block;
            }

            .bottom-sheet-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.5);
                animation: fadeIn 0.2s ease;
            }

            .bottom-sheet-content {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                max-height: 80vh;
                background: var(--bg-card);
                border-radius: 24px 24px 0 0;
                padding: 16px;
                padding-bottom: calc(16px + env(safe-area-inset-bottom));
                animation: slideUp 0.3s ease;
            }

            .bottom-sheet-handle {
                width: 40px;
                height: 4px;
                background: rgba(255,255,255,0.2);
                border-radius: 2px;
                margin: 0 auto 16px;
            }

            /* Item Detail */
            .item-detail {
                text-align: center;
                padding: 16px;
            }

            .item-detail-image {
                font-size: 5rem;
                margin-bottom: 16px;
            }

            .item-detail-name {
                font-size: 1.5rem;
                margin-bottom: 8px;
            }

            .item-detail-desc {
                color: var(--text-secondary);
                margin-bottom: 16px;
            }

            .item-detail-price {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--secondary);
                margin-bottom: 24px;
            }

            .item-detail-actions {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin-bottom: 24px;
            }

            .btn-qty {
                width: 44px;
                height: 44px;
                border: 2px solid var(--border-color);
                border-radius: 50%;
                background: transparent;
                color: var(--text-primary);
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-qty:active {
                transform: scale(0.95);
                background: var(--primary);
                border-color: var(--primary);
            }

            .detail-qty {
                font-size: 1.5rem;
                font-weight: 700;
                min-width: 40px;
            }

            .btn-add-detail {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                border: none;
                border-radius: 16px;
                color: white;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
            }

            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => MobileUX.init());

window.MobileUX = MobileUX;
