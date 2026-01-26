/**
 * F&B Master - Featured Items Manager
 * Author: Google DeepMind / Antigravity Team
 * Description: Manages "Best Seller" items display and configuration.
 */

const FeaturedManager = {
    config: {
        mode: 'auto',       // 'auto' | 'manual'
        auto_count: 6,
        manual_items: []    // Array of item IDs
    },
    masterItems: [],

    async init() {
        if (window.Debug) Debug.log('🔥 FeaturedManager initializing...');

        // Load master items
        if (typeof window.menuItems !== 'undefined') {
            this.masterItems = window.menuItems;
        }

        // Load config from Supabase
        if (typeof FeaturedItemsService !== 'undefined') {
            const result = await FeaturedItemsService.getConfig();
            if (result.success && result.data) {
                this.config = { ...this.config, ...result.data };
            }
        }

        this.setupEventListeners();
        this.render();
        if (window.Debug) Debug.log('✅ FeaturedManager ready');
    },

    setupEventListeners() {
        // Mode toggle
        const modeToggle = document.getElementById('featuredModeToggle');
        if (modeToggle) {
            modeToggle.addEventListener('change', () => {
                this.config.mode = modeToggle.checked ? 'manual' : 'auto';
                this.render();
                this.saveConfig();
            });
        }

        // Auto count select
        const autoCountSelect = document.getElementById('featuredAutoCount');
        if (autoCountSelect) {
            autoCountSelect.addEventListener('change', () => {
                this.config.auto_count = parseInt(autoCountSelect.value);
                this.saveConfig();
            });
        }

        // Add item button
        const addBtn = document.getElementById('addFeaturedBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddItemModal());
        }
    },

    render() {
        this.renderModeToggle();
        this.renderAutoSection();
        this.renderManualSection();
    },

    renderModeToggle() {
        const toggle = document.getElementById('featuredModeToggle');
        if (toggle) {
            toggle.checked = this.config.mode === 'manual';
        }

        const autoSection = document.getElementById('featuredAutoSection');
        const manualSection = document.getElementById('featuredManualSection');

        if (autoSection) autoSection.style.display = this.config.mode === 'auto' ? 'block' : 'none';
        if (manualSection) manualSection.style.display = this.config.mode === 'manual' ? 'block' : 'none';
    },

    renderAutoSection() {
        const select = document.getElementById('featuredAutoCount');
        if (select) {
            select.value = this.config.auto_count;
        }

        // Preview auto items
        const preview = document.getElementById('featuredAutoPreview');
        if (preview) {
            const previewItems = this.masterItems.slice(0, this.config.auto_count);
            preview.innerHTML = previewItems.map(item => `
                <div class="preview-item">
                    <div class="item-icon" style="font-size: 1.5rem;">${item.icon || '🍽️'}</div>
                    <span>${item.name}</span>
                </div>
            `).join('') || '<p class="text-muted">Không có dữ liệu</p>';
        }
    },

    renderManualSection() {
        const list = document.getElementById('featuredManualList');
        if (!list) return;

        const items = this.config.manual_items
            .map(id => this.masterItems.find(item => item.id === id))
            .filter(Boolean);

        if (items.length === 0) {
            list.innerHTML = '<p class="text-muted">Chưa có món nào. Nhấn "Thêm món" để bắt đầu.</p>';
            return;
        }

        list.innerHTML = items.map((item, index) => `
            <div class="manual-item" data-id="${item.id}" draggable="true">
                <span class="drag-handle">⋮⋮</span>
                <div class="item-icon" style="font-size: 2rem; width: 48px; text-align: center;">${item.icon || '🍽️'}</div>
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <small>${this.formatPrice(item.price)}</small>
                </div>
                <button class="remove-btn" onclick="FeaturedManager.removeItem(${item.id})">✕</button>
            </div>
        `).join('');

        // Setup drag-drop
        this.setupDragDrop(list);
    },

    setupDragDrop(container) {
        const items = container.querySelectorAll('.manual-item');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = container.querySelector('.dragging');
                if (dragging && dragging !== item) {
                    const rect = item.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        container.insertBefore(dragging, item);
                    } else {
                        container.insertBefore(dragging, item.nextSibling);
                    }
                }
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                // Update order
                const newOrder = Array.from(container.querySelectorAll('.manual-item'))
                    .map(el => parseInt(el.dataset.id));
                this.config.manual_items = newOrder;
                this.saveConfig();
            });
        });
    },

    showAddItemModal() {
        const modal = document.getElementById('addFeaturedModal');
        if (!modal) return;

        // Clear search input
        const searchInput = document.getElementById('featuredItemSearch');
        if (searchInput) searchInput.value = '';

        // Populate available items (exclude already selected)
        this.renderAvailableItems('');

        modal.style.display = 'flex';
    },

    renderAvailableItems(searchQuery = '') {
        const modal = document.getElementById('addFeaturedModal');
        if (!modal) return;

        const list = modal.querySelector('.available-items-list') || document.getElementById('availableItemsList');
        if (!list) return;

        // Filter available items (exclude already selected)
        let availableItems = this.masterItems.filter(
            item => !this.config.manual_items.includes(item.id)
        );

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            availableItems = availableItems.filter(item =>
                item.name.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
        }

        if (availableItems.length === 0) {
            list.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">Không tìm thấy món phù hợp</p>';
            return;
        }

        list.innerHTML = availableItems.map(item => `
            <div class="available-item" onclick="FeaturedManager.addItem(${item.id})">
                <div class="item-icon" style="font-size: 2rem; width: 40px; text-align: center;">${item.icon || '🍽️'}</div>
                <div>
                    <strong>${item.name}</strong>
                    <small>${this.formatPrice(item.price)}</small>
                </div>
            </div>
        `).join('');
    },

    filterAvailableItems(query) {
        this.renderAvailableItems(query);
    },

    hideAddItemModal() {
        const modal = document.getElementById('addFeaturedModal');
        if (modal) modal.style.display = 'none';
    },

    addItem(itemId) {
        if (!this.config.manual_items.includes(itemId)) {
            this.config.manual_items.push(itemId);
            this.renderManualSection();
            this.saveConfig();
        }
        this.hideAddItemModal();
    },

    removeItem(itemId) {
        this.config.manual_items = this.config.manual_items.filter(id => id !== itemId);
        this.renderManualSection();
        this.saveConfig();
    },

    async saveConfig() {
        if (typeof FeaturedItemsService !== 'undefined') {
            await FeaturedItemsService.saveConfig(this.config);
            if (window.AdminDashboard?.showToast) {
                window.AdminDashboard.showToast('✅ Đã lưu cấu hình Món bán chạy');
            }
        }
    },

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    }
};

// Export
window.FeaturedManager = FeaturedManager;
