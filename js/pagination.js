// ========================================
// F&B MASTER - PAGINATION MODULE
// Reusable pagination with WOW effects
// ========================================

const Pagination = {
    instances: {},

    /**
     * Initialize pagination for a container
     * @param {Object} config Configuration object
     * @param {string} config.containerId - Container element ID
     * @param {number} config.itemsPerPage - Items per page (default: 10)
     * @param {Function} config.renderItem - Function to render single item
     * @param {Function} config.getData - Function to get all data
     * @param {string} config.emptyMessage - Message when no items
     * @param {boolean} config.infiniteScroll - Enable infinite scroll (default: true)
     */
    init(config) {
        const defaults = {
            itemsPerPage: 10,
            emptyMessage: 'Không có dữ liệu',
            infiniteScroll: true,
            loadMoreText: 'Xem thêm',
            currentPage: 1
        };

        const settings = { ...defaults, ...config };
        this.instances[config.containerId] = {
            ...settings,
            isLoading: false,
            hasMore: true
        };

        this.render(config.containerId);

        if (settings.infiniteScroll) {
            this.setupInfiniteScroll(config.containerId);
        }

        return this;
    },

    /**
     * Render items with pagination
     */
    render(containerId, append = false) {
        const instance = this.instances[containerId];
        if (!instance) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const allData = instance.getData();
        const startIndex = 0;
        const endIndex = instance.currentPage * instance.itemsPerPage;
        const items = allData.slice(startIndex, endIndex);

        instance.hasMore = endIndex < allData.length;

        if (items.length === 0) {
            container.innerHTML = `<p class="pagination-empty">${instance.emptyMessage}</p>`;
            return;
        }

        if (!append) {
            container.innerHTML = '';
        }

        // Render items with staggered animation
        const fragment = document.createDocumentFragment();
        const existingCount = append ? container.children.length : 0;

        items.slice(append ? (instance.currentPage - 1) * instance.itemsPerPage : 0).forEach((item, index) => {
            const element = document.createElement('div');
            element.className = 'pagination-item';
            element.innerHTML = instance.renderItem(item);
            element.style.animationDelay = `${index * 50}ms`;
            fragment.appendChild(element);
        });

        container.appendChild(fragment);

        // Add or update load more button
        this.updateLoadMore(containerId);
    },

    /**
     * Setup infinite scroll observer
     */
    setupInfiniteScroll(containerId) {
        const instance = this.instances[containerId];
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create sentinel element
        let sentinel = document.getElementById(`${containerId}-sentinel`);
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = `${containerId}-sentinel`;
            sentinel.className = 'pagination-sentinel';
            container.parentNode.insertBefore(sentinel, container.nextSibling);
        }

        // Setup Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && instance.hasMore && !instance.isLoading) {
                    this.loadMore(containerId);
                }
            });
        }, {
            rootMargin: '100px'
        });

        observer.observe(sentinel);
        instance.observer = observer;
    },

    /**
     * Load more items
     */
    loadMore(containerId) {
        const instance = this.instances[containerId];
        if (!instance || instance.isLoading || !instance.hasMore) return;

        instance.isLoading = true;
        this.showLoading(containerId);

        // Simulate network delay for smooth UX
        setTimeout(() => {
            instance.currentPage++;
            this.render(containerId, true);
            instance.isLoading = false;
            this.hideLoading(containerId);
        }, 300);
    },

    /**
     * Update load more button
     */
    updateLoadMore(containerId) {
        const instance = this.instances[containerId];
        const container = document.getElementById(containerId);
        if (!container) return;

        // Remove existing button
        const existingBtn = document.getElementById(`${containerId}-loadmore`);
        if (existingBtn) existingBtn.remove();

        if (instance.hasMore && !instance.infiniteScroll) {
            const btn = document.createElement('button');
            btn.id = `${containerId}-loadmore`;
            btn.className = 'pagination-loadmore';
            btn.innerHTML = `
                <span class="loadmore-text">${instance.loadMoreText}</span>
                <span class="loadmore-icon">↓</span>
            `;
            btn.onclick = () => this.loadMore(containerId);
            container.parentNode.insertBefore(btn, container.nextSibling);
        }
    },

    /**
     * Show skeleton loading
     */
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const skeleton = document.createElement('div');
        skeleton.className = 'pagination-skeleton';
        skeleton.id = `${containerId}-skeleton`;
        skeleton.innerHTML = `
            <div class="skeleton-item"></div>
            <div class="skeleton-item"></div>
            <div class="skeleton-item"></div>
        `;
        container.appendChild(skeleton);
    },

    /**
     * Hide skeleton loading
     */
    hideLoading(containerId) {
        const skeleton = document.getElementById(`${containerId}-skeleton`);
        if (skeleton) {
            skeleton.classList.add('fade-out');
            setTimeout(() => skeleton.remove(), 200);
        }
    },

    /**
     * Refresh pagination (reset to page 1)
     */
    refresh(containerId) {
        const instance = this.instances[containerId];
        if (!instance) return;

        instance.currentPage = 1;
        instance.hasMore = true;
        this.render(containerId, false);
    },

    /**
     * Get current stats
     */
    getStats(containerId) {
        const instance = this.instances[containerId];
        if (!instance) return null;

        const allData = instance.getData();
        const showing = Math.min(instance.currentPage * instance.itemsPerPage, allData.length);

        return {
            total: allData.length,
            showing: showing,
            currentPage: instance.currentPage,
            totalPages: Math.ceil(allData.length / instance.itemsPerPage),
            hasMore: instance.hasMore
        };
    },

    /**
     * Destroy pagination instance
     */
    destroy(containerId) {
        const instance = this.instances[containerId];
        if (!instance) return;

        if (instance.observer) {
            instance.observer.disconnect();
        }

        const sentinel = document.getElementById(`${containerId}-sentinel`);
        if (sentinel) sentinel.remove();

        const loadmore = document.getElementById(`${containerId}-loadmore`);
        if (loadmore) loadmore.remove();

        delete this.instances[containerId];
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
}

window.Pagination = Pagination;
