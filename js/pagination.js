// ========================================
// F&B MASTER - PAGINATION UTILITY
// Reusable pagination component
// ========================================

const Pagination = {
    defaultPageSize: 10,
    pageSizes: [10, 20, 50, 100],

    /**
     * Create pagination data
     * @param {Array} items - All items to paginate
     * @param {number} currentPage - Current page (1-indexed)
     * @param {number} pageSize - Items per page
     * @returns {Object} Pagination data
     */
    paginate(items, currentPage = 1, pageSize = this.defaultPageSize) {
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const page = Math.max(1, Math.min(currentPage, totalPages));
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const paginatedItems = items.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            currentPage: page,
            pageSize,
            totalItems,
            totalPages,
            startIndex: startIndex + 1,
            endIndex,
            hasPrev: page > 1,
            hasNext: page < totalPages
        };
    },

    /**
     * Render pagination controls
     * @param {Object} data - Pagination data from paginate()
     * @param {string} targetId - Target container ID
     * @param {Function} onPageChange - Callback when page changes
     */
    render(data, targetId, onPageChange) {
        const container = document.getElementById(targetId);
        if (!container) return;

        const { currentPage, totalPages, totalItems, startIndex, endIndex, hasPrev, hasNext } = data;

        container.innerHTML = `
            <div class="pagination">
                <div class="pagination-info">
                    Hiển thị ${startIndex} - ${endIndex} / ${totalItems} mục
                </div>
                <div class="pagination-controls">
                    <button class="page-btn" ${!hasPrev ? 'disabled' : ''} data-page="1" title="Trang đầu">
                        ⏮
                    </button>
                    <button class="page-btn" ${!hasPrev ? 'disabled' : ''} data-page="${currentPage - 1}" title="Trang trước">
                        ◀
                    </button>
                    <div class="page-numbers">
                        ${this.renderPageNumbers(currentPage, totalPages)}
                    </div>
                    <button class="page-btn" ${!hasNext ? 'disabled' : ''} data-page="${currentPage + 1}" title="Trang sau">
                        ▶
                    </button>
                    <button class="page-btn" ${!hasNext ? 'disabled' : ''} data-page="${totalPages}" title="Trang cuối">
                        ⏭
                    </button>
                </div>
                <div class="pagination-size">
                    <select class="page-size-select">
                        ${this.pageSizes.map(size =>
            `<option value="${size}" ${size === data.pageSize ? 'selected' : ''}>${size}/trang</option>`
        ).join('')}
                    </select>
                </div>
            </div>
        `;

        // Add event listeners
        container.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (onPageChange) onPageChange(page, data.pageSize);
            });
        });

        container.querySelectorAll('.page-num:not(.active)').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (onPageChange) onPageChange(page, data.pageSize);
            });
        });

        container.querySelector('.page-size-select')?.addEventListener('change', (e) => {
            const newSize = parseInt(e.target.value);
            if (onPageChange) onPageChange(1, newSize);
        });
    },

    /**
     * Render page number buttons
     */
    renderPageNumbers(current, total) {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, current - Math.floor(maxVisible / 2));
        let end = Math.min(total, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            pages.push(`<button class="page-num" data-page="1">1</button>`);
            if (start > 2) {
                pages.push(`<span class="page-dots">...</span>`);
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(`
                <button class="page-num ${i === current ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `);
        }

        if (end < total) {
            if (end < total - 1) {
                pages.push(`<span class="page-dots">...</span>`);
            }
            pages.push(`<button class="page-num" data-page="${total}">${total}</button>`);
        }

        return pages.join('');
    },

    /**
     * Get pagination CSS styles
     */
    getStyles() {
        return `
            .pagination {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
                padding: 16px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                margin-top: 16px;
            }

            .pagination-info {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }

            .pagination-controls {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .page-btn {
                width: 36px;
                height: 36px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-card);
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.9rem;
            }

            .page-btn:hover:not([disabled]) {
                background: var(--primary);
                border-color: var(--primary);
            }

            .page-btn[disabled] {
                opacity: 0.4;
                cursor: not-allowed;
            }

            .page-numbers {
                display: flex;
                align-items: center;
                gap: 4px;
                margin: 0 8px;
            }

            .page-num {
                min-width: 36px;
                height: 36px;
                padding: 0 8px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-card);
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.85rem;
            }

            .page-num:hover:not(.active) {
                background: var(--bg-hover);
            }

            .page-num.active {
                background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                border-color: transparent;
                color: white;
                font-weight: 600;
            }

            .page-dots {
                color: var(--text-muted);
                padding: 0 4px;
            }

            .page-size-select {
                padding: 8px 12px;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                background: var(--bg-card);
                color: var(--text-primary);
                font-size: 0.85rem;
                cursor: pointer;
            }

            .pagination-size {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            @media (max-width: 768px) {
                .pagination {
                    flex-direction: column;
                    gap: 12px;
                }

                .pagination-info {
                    order: 2;
                    text-align: center;
                }

                .pagination-controls {
                    order: 1;
                }

                .pagination-size {
                    order: 3;
                }

                .page-numbers {
                    display: none;
                }

                .page-btn {
                    width: 44px;
                    height: 44px;
                }
            }
        `;
    }
};

// Inject pagination styles
(function injectPaginationStyles() {
    const style = document.createElement('style');
    style.textContent = Pagination.getStyles();
    document.head.appendChild(style);
})();

window.Pagination = Pagination;
