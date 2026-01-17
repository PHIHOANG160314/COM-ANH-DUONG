// =====================================================
// ARTICLE MANAGER - ADMIN MODULE
// Manage news and articles
// =====================================================

const ArticlesManager = {
    state: {
        articles: [],
        currentEdit: null
    },

    init() {
        console.log('📰 Articles Manager Initialized');
        this.renderPlaceholder();
    },

    // Render initial empty state or loading
    renderPlaceholder() {
        const container = document.getElementById('page-articles');
        // Check if already rendered (look for header)
        if (container && !container.querySelector('.card-header')) {
            container.innerHTML = `
                <div class="card-header">
                    <h2>Quản Lý Bài Viết</h2>
                    <button class="md-button md-button-filled" onclick="ArticlesManager.openModal()">
                        <span class="material-icons">+</span> Thêm bài viết
                    </button>
                </div>
                <div class="md-card table-wrapper">
                    <table class="data-table" id="articlesTable">
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Danh mục</th>
                                <th>Ngày đăng</th>
                                <th>Trạng thái</th>
                                <th>Link</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody id="articlesTableBody">
                            <tr><td colspan="6" class="text-center">Đang tải...</td></tr>
                        </tbody>
                    </table>
                </div>
            `;
            this.loadArticles();
        }
    },

    async loadArticles() {
        if (!typeof SupabaseService === 'undefined') {
            toast.error('Lỗi kết nối CSDL');
            return;
        }

        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) {
            toast.error('Không thể tải bài viết: ' + error.message);
            return;
        }

        this.state.articles = data;
        this.renderTable(data);
    },

    renderTable(articles) {
        const tbody = document.getElementById('articlesTableBody');
        if (!tbody) return;

        if (articles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chưa có bài viết nào</td></tr>';
            return;
        }

        tbody.innerHTML = articles.map(article => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.5rem;">${article.icon || '📰'}</span>
                        <div>
                            <strong>${article.title}</strong>
                            <div style="font-size: 0.8rem; color: #888; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${article.excerpt || ''}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-blue">${article.category || 'Tin tức'}</span></td>
                <td>${new Date(article.published_at).toLocaleDateString('vi-VN')}</td>
                <td>
                    <span class="badge ${article.is_active ? 'badge-green' : 'badge-red'}">
                        ${article.is_active ? 'Hiển thị' : 'Ẩn'}
                    </span>
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
    },

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

        // Create Modal HTML
        const modalHtml = `
            <div class="modal-overlay active" id="articleModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>${articleId ? 'Sửa bài viết' : 'Thêm bài viết mới'}</h3>
                        <button class="btn-close" onclick="document.getElementById('articleModal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="articleForm" onsubmit="event.preventDefault(); ArticlesManager.saveArticle();">
                            <div class="form-group">
                                <label>Tiêu đề</label>
                                <input type="text" id="aTitle" class="md-input" value="${article.title}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Danh mục</label>
                                    <select id="aCategory" class="md-input">
                                        <option value="Tin tức" ${article.category === 'Tin tức' ? 'selected' : ''}>Tin tức</option>
                                        <option value="Khuyến mãi" ${article.category === 'Khuyến mãi' ? 'selected' : ''}>Khuyến mãi</option>
                                        <option value="Sự kiện" ${article.category === 'Sự kiện' ? 'selected' : ''}>Sự kiện</option>
                                        <option value="Ẩm thực" ${article.category === 'Ẩm thực' ? 'selected' : ''}>Ẩm thực</option>
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
                                    <span style="margin-left: 10px;">Hiển thị</span>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="md-button" onclick="document.getElementById('articleModal').remove()">Hủy</button>
                                <button type="submit" class="md-button md-button-filled">Lưu</button>
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
            // Update
            const res = await supabase.from('articles').update(data).eq('id', id);
            error = res.error;
        } else {
            // Insert
            const res = await supabase.from('articles').insert(data);
            error = res.error;
        }

        if (error) {
            toast.error('Lỗi khi lưu: ' + error.message);
        } else {
            toast.success('Đã lưu bài viết thành công!');
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
            toast.success('Đã xóa bài viết');
            this.loadArticles();
        }
    }
};

window.ArticlesManager = ArticlesManager;
