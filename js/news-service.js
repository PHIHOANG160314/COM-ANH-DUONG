// =====================================================
// NEWS SERVICE - ÁNH DƯƠNG F&B
// Handles fetching articles from Supabase
// =====================================================

const NewsService = {
    /**
     * Fetch latest active articles
     * @param {number} limit - Number of articles to fetch
     * @returns {Promise<{success: boolean, data: Array, error: any}>}
     */
    async getLatestArticles(limit = 3) {
        // Use global Supabase client from supabase-client.js
        if (!window.getSupabase) {
            console.error('Supabase client not available');
            return { success: false, error: 'Supabase client not initialized' };
        }

        const supabase = await window.getSupabase();
        if (!supabase) {
            // Fallback for when Supabase is not configured (dev mode)
            if (window.Debug) Debug.warn('Supabase not configured, using fallback data');
            return { success: false, error: 'Not configured' };
        }

        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('is_active', true)
                .order('published_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching articles:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (err) {
            console.error('Exception fetching articles:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Render articles to the DOM
     * @param {string} containerId - ID of the container element
     */
    async renderArticles(containerId = 'articles-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const result = await this.getLatestArticles();

        // Only render if we successfully got data and it's not empty
        if (result.success && result.data && result.data.length > 0) {

            // Format date helper
            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            };

            const html = result.data.map(article => `
                <article class="article-card ${article.is_featured ? 'featured' : ''}">
                    <div class="article-image">
                        <div class="article-placeholder">${article.icon || '📰'}</div>
                        <div class="article-category">${article.category || 'Tin tức'}</div>
                    </div>
                    <div class="article-content">
                        <time class="article-date">${formatDate(article.published_at)}</time>
                        <h3>${article.title}</h3>
                        <p>${article.excerpt || ''}</p>
                        <a href="${article.link_url || '#'}" class="article-link">${article.link_text || 'Xem chi tiết →'}</a>
                    </div>
                </article>
            `).join('');

            // Fade out current content and fade in new
            container.style.opacity = '0';
            setTimeout(() => {
                container.innerHTML = html;

                // IMPORTANT: Add animate-in class to make articles visible
                // (IntersectionObserver only watches initial DOM elements)
                const cards = container.querySelectorAll('.article-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 100); // Stagger animation
                });

                container.style.opacity = '1';
            }, 300);
        } else {
            // If fetch fails or no data, we keep the static fallback content intact
            if (window.Debug) Debug.info('Using static fallback articles');
        }
    }
};

// Auto-init specific to Landing Page
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on landing page and have attributes
    if (document.getElementById('articles-grid')) {
        NewsService.renderArticles();
    }
});

// Export
window.NewsService = NewsService;
