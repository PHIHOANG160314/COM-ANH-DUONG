// =====================================================
// ARTICLE MANAGER - ADMIN MODULE (Enhanced)
// Manage news and articles with professional features
// =====================================================

const ArticlesManager = {
    state: {
        articles: [],
        filteredArticles: [],
        currentEdit: null,
        // Filter & Search
        searchQuery: '',
        filterCategory: 'all',
        filterStatus: 'all',
        // Sorting
        sortBy: 'published_at',
        sortOrder: 'desc',
        // Pagination
        currentPage: 1,
        itemsPerPage: 10,
        // Bulk selection
        selectedIds: new Set()
    },

    init() {
        console.log('📰 Articles Manager Initialized (Enhanced)');
        this.renderUI();
        this.loadArticles();
    },

    // ==================== UI RENDERING ====================

    renderUI() {
        const container = document.getElementById('page-articles');
        if (!container || container.querySelector('.articles-header')) return;

        container.innerHTML = `
            <!-- Header with Actions -->
            <div class="articles-header">
                <div class="header-left">
                    <h2>📰 Quản Lý Bài Viết</h2>
                    <span class="article-count" id="articleCount">0 bài viết</span>
                </div>
                <button class="btn-primary btn-icon-text" onclick="ArticlesManager.openModal()">
                    <span>+</span> Thêm bài viết
                </button>
            </div>

            <!-- Filters & Search -->
            <div class="articles-filters">
                <div class="search-box">
                    <input type="text" id="articleSearch" placeholder="🔍 Tìm kiếm theo tiêu đề..." 
                           onkeyup="ArticlesManager.handleSearch(event)">
                </div>
                <select id="categoryFilter" onchange="ArticlesManager.handleFilterChange()">
                    <option value="all">📂 Tất cả danh mục</option>
                    <option value="Tin tức">📰 Tin tức</option>
                    <option value="Khuyến mãi">🎁 Khuyến mãi</option>
                    <option value="Sự kiện">🎉 Sự kiện</option>
                    <option value="Ẩm thực">🍜 Ẩm thực</option>
                </select>
                <select id="statusFilter" onchange="ArticlesManager.handleFilterChange()">
                    <option value="all">👁️ Tất cả trạng thái</option>
                    <option value="active">✅ Hiển thị</option>
                    <option value="hidden">❌ Ẩn</option>
                </select>
                <button class="btn-secondary btn-sm" onclick="ArticlesManager.clearFilters()">
                    🔄 Xóa bộ lọc
                </button>
            </div>

            <!-- Bulk Actions Bar (hidden by default) -->
            <div class="bulk-actions-bar" id="bulkActionsBar" style="display: none;">
                <span id="bulkCount">0 mục đã chọn</span>
                <button class="btn-warning btn-sm" onclick="ArticlesManager.bulkToggleStatus()">
                    👁️ Bật/Tắt hiển thị
                </button>
                <button class="btn-danger btn-sm" onclick="ArticlesManager.bulkDelete()">
                    🗑️ Xóa
                </button>
                <button class="btn-secondary btn-sm" onclick="ArticlesManager.clearSelection()">
                    ✕ Bỏ chọn
                </button>
            </div>

            <!-- Table -->
            <div class="articles-table-wrapper">
                <table class="articles-table" id="articlesTable">
                    <thead>
                        <tr>
                            <th style="width: 40px;">
                                <input type="checkbox" id="selectAll" onchange="ArticlesManager.toggleSelectAll()">
                            </th>
                            <th class="sortable" onclick="ArticlesManager.sort('title')">
                                Tiêu đề <span class="sort-icon">⬍</span>
                            </th>
                            <th class="sortable" onclick="ArticlesManager.sort('category')">
                                Danh mục <span class="sort-icon">⬍</span>
                            </th>
                            <th class="sortable" onclick="ArticlesManager.sort('published_at')">
                                Ngày đăng <span class="sort-icon">▼</span>
                            </th>
                            <th>Trạng thái</th>
                            <th>Link</th>
                            <th style="width: 120px;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="articlesTableBody">
                        <tr><td colspan="7" class="loading-state">⏳ Đang tải...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="pagination" id="articlesPagination"></div>

            <style>
                .articles-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding: 20px;
                    background: var(--bg-card);
                    border-radius: 12px;
                }
                .header-left h2 { margin: 0 0 5px 0; }
                .article-count {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                .articles-filters {
                    display: grid;
                    grid-template-columns: 1fr auto auto auto;
                    gap: 12px;
                    margin-bottom: 16px;
                    padding: 16px;
                    background: var(--bg-card);
                    border-radius: 12px;
                }
                .search-box { position: relative; }
                .search-box input {
                    width: 100%;
                    padding: 10px 16px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: var(--bg-surface);
                    color: var(--text-primary);
                }
                .articles-filters select {
                    padding: 10px 16px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: var(--bg-surface);
                    color: var(--text-primary);
                    cursor: pointer;
                }
                .bulk-actions-bar {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--primary);
                    color: white;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }
                .bulk-actions-bar span {
                    flex: 1;
                    font-weight: 600;
                }
                .articles-table-wrapper {
                    background: var(--bg-card);
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 16px;
                }
                .articles-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .articles-table th {
                    background: var(--bg-surface);
                    padding: 14px 16px;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid var(--border);
                }
                .articles-table th.sortable {
                    cursor: pointer;
                    user-select: none;
                }
                .articles-table th.sortable:hover {
                    background: var(--bg-hover);
                }
                .sort-icon {
                    opacity: 0.3;
                    font-size: 0.8rem;
                    margin-left: 4px;
                }
                .articles-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--border);
                }
                .articles-table tbody tr:hover {
                    background: var(--bg-hover);
                }
                .article-title-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .article-icon {
                    font-size: 2rem;
                    line-height: 1;
                }
                .article-info strong {
                    display: block;
                    margin-bottom: 4px;
                }
                .article-excerpt {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    max-width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .status-toggle {
                    position: relative;
                    display: inline-block;
                    width: 48px;
                    height: 24px;
                }
                .status-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.3s;
                    border-radius: 24px;
                }
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                }
                input:checked + .toggle-slider {
                    background-color: var(--success);
                }
                input:checked + .toggle-slider:before {
                    transform: translateX(24px);
                }
                .action-buttons {
                    display: flex;
                    gap: 8px;
                }
                .btn-icon {
                    padding: 6px 10px;
                    border: none;
                    background: var(--bg-surface);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                }
                .btn-icon:hover {
                    background: var(--bg-hover);
                    transform: scale(1.1);
                }
                .pagination {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px;
                }
                .pagination button {
                    padding: 8px 14px;
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-primary);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pagination button:hover:not(:disabled) {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .pagination button.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .pagination button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .loading-state, .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-secondary);
                }
                @media (max-width: 768px) {
                    .articles-filters {
                        grid-template-columns: 1fr;
                    }
                    .articles-table {
                        font-size: 0.875rem;
                    }
                }
            </style>
        `;
    },

    // ==================== DATA LOADING ====================

    async loadArticles() {
        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) {
            toast.error('Không thể tải bài viết: ' + error.message);
            return;
        }

        this.state.articles = data || [];
        this.applyFiltersAndRender();
    },

    // ==================== FILTERING & SEARCH ====================

    handleSearch(event) {
        this.state.searchQuery = event.target.value.toLowerCase();
        this.state.currentPage = 1;
        this.applyFiltersAndRender();
    },

    handleFilterChange() {
        this.state.filterCategory = document.getElementById('categoryFilter').value;
        this.state.filterStatus = document.getElementById('statusFilter').value;
        this.state.currentPage = 1;
        this.applyFiltersAndRender();
    },

    clearFilters() {
        document.getElementById('articleSearch').value = '';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('statusFilter').value = 'all';
        this.state.searchQuery = '';
        this.state.filterCategory = 'all';
        this.state.filterStatus = 'all';
        this.state.currentPage = 1;
        this.applyFiltersAndRender();
    },

    applyFiltersAndRender() {
        let filtered = [...this.state.articles];

        // Search
        if (this.state.searchQuery) {
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(this.state.searchQuery) ||
                (a.excerpt && a.excerpt.toLowerCase().includes(this.state.searchQuery))
            );
        }

        // Category filter
        if (this.state.filterCategory !== 'all') {
            filtered = filtered.filter(a => a.category === this.state.filterCategory);
        }

        // Status filter
        if (this.state.filterStatus !== 'all') {
            filtered = filtered.filter(a =>
                this.state.filterStatus === 'active' ? a.is_active : !a.is_active
            );
        }

        this.state.filteredArticles = filtered;
        this.sortArticles();
        this.renderTable();
        this.renderPagination();
        this.updateCount();
    },

    // ==================== SORTING ====================

    sort(column) {
        if (this.state.sortBy === column) {
            this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortBy = column;
            this.state.sortOrder = 'asc';
        }
        this.sortArticles();
        this.renderTable();
        this.updateSortIcons();
    },

    sortArticles() {
        const { sortBy, sortOrder } = this.state;
        this.state.filteredArticles.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'published_at') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    },

    updateSortIcons() {
        document.querySelectorAll('.sort-icon').forEach(icon => {
            icon.textContent = '⬍';
            icon.style.opacity = '0.3';
        });

        const ths = Array.from(document.querySelectorAll('.sortable'));
        const columns = ['title', 'category', 'published_at'];
        const index = columns.indexOf(this.state.sortBy);

        if (index >= 0 && ths[index]) {
            const icon = ths[index].querySelector('.sort-icon');
            icon.textContent = this.state.sortOrder === 'asc' ? '▲' : '▼';
            icon.style.opacity = '1';
        }
    },

    // ==================== TABLE RENDERING ====================

    renderTable() {
        const tbody = document.getElementById('articlesTableBody');
        if (!tbody) return;

        const { currentPage, itemsPerPage } = this.state;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageArticles = this.state.filteredArticles.slice(start, end);

        if (pageArticles.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" class="empty-state">
                    📭 Không tìm thấy bài viết nào<br>
                    <small>Thử thay đổi bộ lọc hoặc tạo bài viết mới</small>
                </td></tr>
            `;
            return;
        }

        tbody.innerHTML = pageArticles.map(article => `
            <tr>
                <td>
                    <input type="checkbox" 
                           ${this.state.selectedIds.has(article.id) ? 'checked' : ''}
                           onchange="ArticlesManager.toggleSelect('${article.id}')">
                </td>
                <td>
                    <div class="article-title-cell">
                        <span class="article-icon">${article.icon || '📰'}</span>
                        <div class="article-info">
                            <strong>${article.title}</strong>
                            <div class="article-excerpt">${article.excerpt || ''}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-blue">${article.category || 'Tin tức'}</span></td>
                <td>${new Date(article.published_at).toLocaleDateString('vi-VN')}</td>
                <td>
                    <label class="status-toggle">
                        <input type="checkbox" 
                               ${article.is_active ? 'checked' : ''}
                               onchange="ArticlesManager.quickToggle('${article.id}', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td><a href="${article.link_url}" target="_blank" style="color: var(--primary);">${article.link_text}</a></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="ArticlesManager.openModal('${article.id}')" title="Sửa">✏️</button>
                        <button class="btn-icon" onclick="ArticlesManager.deleteArticle('${article.id}')" title="Xóa">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateSelectAllCheckbox();
    },

    // ==================== PAGINATION ====================

    renderPagination() {
        const container = document.getElementById('articlesPagination');
        if (!container) return;

        const { currentPage, itemsPerPage, filteredArticles } = this.state;
        const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button onclick="ArticlesManager.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                ‹ Trước
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `
                    <button class="${i === currentPage ? 'active' : ''}" 
                            onclick="ArticlesManager.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<span>...</span>`;
            }
        }

        html += `
            <button onclick="ArticlesManager.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                Sau ›
            </button>
        `;

        container.innerHTML = html;
    },

    goToPage(page) {
        const totalPages = Math.ceil(this.state.filteredArticles.length / this.state.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.state.currentPage = page;
        this.renderTable();
        this.renderPagination();
    },

    updateCount() {
        const countEl = document.getElementById('articleCount');
        if (countEl) {
            const total = this.state.filteredArticles.length;
            countEl.textContent = `${total} bài viết`;
        }
    },

    // ==================== QUICK ACTIONS ====================

    async quickToggle(id, isActive) {
        const supabase = await getSupabase();
        const { error } = await supabase
            .from('articles')
            .update({ is_active: isActive })
            .eq('id', id);

        if (error) {
            toast.error('Lỗi khi cập nhật: ' + error.message);
            this.loadArticles();
        } else {
            toast.success(isActive ? '✅ Đã hiển thị bài viết' : '❌ Đã ẩn bài viết');
            const article = this.state.articles.find(a => a.id === id);
            if (article) article.is_active = isActive;
            this.applyFiltersAndRender();
        }
    },

    // ==================== BULK ACTIONS ====================

    toggleSelect(id) {
        if (this.state.selectedIds.has(id)) {
            this.state.selectedIds.delete(id);
        } else {
            this.state.selectedIds.add(id);
        }
        this.updateBulkActions();
        this.updateSelectAllCheckbox();
    },

    toggleSelectAll() {
        const checkbox = document.getElementById('selectAll');
        const { currentPage, itemsPerPage } = this.state;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageArticles = this.state.filteredArticles.slice(start, end);

        if (checkbox.checked) {
            pageArticles.forEach(a => this.state.selectedIds.add(a.id));
        } else {
            pageArticles.forEach(a => this.state.selectedIds.delete(a.id));
        }

        this.renderTable();
        this.updateBulkActions();
    },

    updateSelectAllCheckbox() {
        const checkbox = document.getElementById('selectAll');
        if (!checkbox) return;

        const { currentPage, itemsPerPage } = this.state;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageArticles = this.state.filteredArticles.slice(start, end);

        const allSelected = pageArticles.length > 0 &&
            pageArticles.every(a => this.state.selectedIds.has(a.id));
        checkbox.checked = allSelected;
    },

    updateBulkActions() {
        const bar = document.getElementById('bulkActionsBar');
        const count = document.getElementById('bulkCount');

        if (this.state.selectedIds.size > 0) {
            bar.style.display = 'flex';
            count.textContent = `${this.state.selectedIds.size} mục đã chọn`;
        } else {
            bar.style.display = 'none';
        }
    },

    clearSelection() {
        this.state.selectedIds.clear();
        this.renderTable();
        this.updateBulkActions();
    },

    async bulkToggleStatus() {
        if (this.state.selectedIds.size === 0) return;

        const supabase = await getSupabase();
        const ids = Array.from(this.state.selectedIds);

        // Toggle all selected articles
        for (const id of ids) {
            const article = this.state.articles.find(a => a.id === id);
            if (article) {
                await supabase
                    .from('articles')
                    .update({ is_active: !article.is_active })
                    .eq('id', id);
            }
        }

        toast.success(`✅ Đã cập nhật ${ids.length} bài viết`);
        this.clearSelection();
        this.loadArticles();
    },

    async bulkDelete() {
        if (this.state.selectedIds.size === 0) return;

        const count = this.state.selectedIds.size;
        if (!confirm(`Bạn có chắc chắn muốn xóa ${count} bài viết đã chọn?`)) return;

        const supabase = await getSupabase();
        const ids = Array.from(this.state.selectedIds);

        for (const id of ids) {
            await supabase.from('articles').delete().eq('id', id);
        }

        toast.success(`🗑️ Đã xóa ${count} bài viết`);
        this.clearSelection();
        this.loadArticles();
    },

    // ==================== CRUD OPERATIONS (existing) ====================

    openModal(articleId = null) {
        let article = {
            title: '',
            excerpt: '',
            category: 'Tin tức',
            icon: '📰',
            link_url: '/customer',
            link_text: 'Xem chi tiết →',
            is_active: true,
            published_at: new Date().toISOString().split('T')[0]
        };

        if (articleId) {
            article = this.state.articles.find(a => a.id === articleId) || article;
        }

        this.state.currentEdit = articleId ? article : null;

        const modalHtml = `
            <div class="modal-overlay active" id="articleModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>${articleId ? '✏️ Sửa bài viết' : '➕ Thêm bài viết mới'}</h3>
                        <button class="btn-close" onclick="document.getElementById('articleModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="articleForm" onsubmit="event.preventDefault(); ArticlesManager.saveArticle();">
                            <div class="form-group">
                                <label>Tiêu đề *</label>
                                <input type="text" id="aTitle" class="md-input" value="${article.title}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Danh mục</label>
                                    <select id="aCategory" class="md-input">
                                        <option value="Tin tức" ${article.category === 'Tin tức' ? 'selected' : ''}>📰 Tin tức</option>
                                        <option value="Khuyến mãi" ${article.category === 'Khuyến mãi' ? 'selected' : ''}>🎁 Khuyến mãi</option>
                                        <option value="Sự kiện" ${article.category === 'Sự kiện' ? 'selected' : ''}>🎉 Sự kiện</option>
                                        <option value="Ẩm thực" ${article.category === 'Ẩm thực' ? 'selected' : ''}>🍜 Ẩm thực</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Icon (Emoji)</label>
                                    <input type="text" id="aIcon" class="md-input" value="${article.icon}" placeholder="📰">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Mô tả ngắn</label>
                                <textarea id="aExcerpt" class="md-input" rows="3">${article.excerpt || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Link Đích (URL)</label>
                                    <input type="text" id="aLink" class="md-input" value="${article.link_url || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Tên nút bấm</label>
                                    <input type="text" id="aBtnText" class="md-input" value="${article.link_text || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Ngày đăng</label>
                                    <input type="date" id="aDate" class="md-input" value="${new Date(article.published_at).toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group" style="display: flex; align-items: center; margin-top: 24px;">
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="aActive" ${article.is_active ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                    <span style="margin-left: 10px;">Hiển thị trên trang chủ</span>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="md-button" onclick="document.getElementById('articleModal').remove()">Hủy</button>
                                <button type="submit" class="md-button md-button-filled">💾 Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    async saveArticle() {
        const id = this.state.currentEdit ? this.state.currentEdit.id : undefined;
        const data = {
            title: document.getElementById('aTitle').value,
            category: document.getElementById('aCategory').value,
            icon: document.getElementById('aIcon').value,
            excerpt: document.getElementById('aExcerpt').value,
            link_url: document.getElementById('aLink').value,
            link_text: document.getElementById('aBtnText').value,
            published_at: document.getElementById('aDate').value ? new Date(document.getElementById('aDate').value).toISOString() : new Date().toISOString(),
            is_active: document.getElementById('aActive').checked
        };

        const supabase = await getSupabase();
        let error;

        if (id) {
            const res = await supabase.from('articles').update(data).eq('id', id);
            error = res.error;
        } else {
            const res = await supabase.from('articles').insert(data);
            error = res.error;
        }

        if (error) {
            toast.error('Lỗi khi lưu: ' + error.message);
        } else {
            toast.success(id ? '✅ Đã cập nhật bài viết!' : '✅ Đã tạo bài viết mới!');
            document.getElementById('articleModal').remove();
            this.loadArticles();
        }
    },

    async deleteArticle(id) {
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;

        const supabase = await getSupabase();
        const { error } = await supabase.from('articles').delete().eq('id', id);

        if (error) {
            toast.error('Lỗi khi xóa: ' + error.message);
        } else {
            toast.success('🗑️ Đã xóa bài viết');
            this.loadArticles();
        }
    }
};

window.ArticlesManager = ArticlesManager;
