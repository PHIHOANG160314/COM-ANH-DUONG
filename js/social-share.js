// ========================================
// F&B MASTER - SOCIAL SHARING
// Share to Stories, Photo Reviews
// ========================================

const SocialShare = {
    init() {
        if (window.Debug) Debug.info('Social Share initialized');
    },

    // ========================================
    // SHARE TO SOCIAL MEDIA
    // ========================================

    async shareOrder(order) {
        const shareData = {
            title: '🍽️ Đặt hàng tại Ánh Dương',
            text: `Vừa đặt ${order.items.length} món ngon tại Nhà hàng Ánh Dương! 😋`,
            url: 'https://com-anh-duong.vercel.app/customer.html'
        };

        return this.share(shareData);
    },

    async shareMenuItem(item) {
        const shareData = {
            title: `${item.icon} ${item.name}`,
            text: `Thử ngay ${item.name} tại Nhà hàng Ánh Dương - Chỉ ${this.formatPrice(item.price)}!`,
            url: `https://com-anh-duong.vercel.app/customer.html?item=${item.id}`
        };

        return this.share(shareData);
    },

    async shareReferral(code) {
        const shareData = {
            title: '🎁 Mã giới thiệu Ánh Dương',
            text: `Dùng mã ${code} để được giảm giá khi đặt hàng tại Ánh Dương!`,
            url: `https://com-anh-duong.vercel.app/customer.html?ref=${code}`
        };

        return this.share(shareData);
    },

    async share(data) {
        // Try native share API first
        if (navigator.share) {
            try {
                await navigator.share(data);
                this.showToast('✅ Đã chia sẻ thành công!');
                return true;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    if (window.Debug) Debug.log('Share cancelled');
                }
            }
        }

        // Fallback to social links
        this.showShareModal(data);
        return false;
    },

    showShareModal(data) {
        const encodedText = encodeURIComponent(data.text);
        const encodedUrl = encodeURIComponent(data.url);

        const modal = document.createElement('div');
        modal.className = 'share-modal animate-fadeInUp';
        modal.innerHTML = `
            <div class="share-modal-overlay" onclick="SocialShare.closeModal()"></div>
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3>📤 Chia sẻ</h3>
                    <button class="share-close-btn" onclick="SocialShare.closeModal()">✕</button>
                </div>
                <div class="share-modal-body">
                    <div class="share-buttons">
                        <button class="share-btn facebook" onclick="SocialShare.openLink('https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}')">
                            <span>📘</span> Facebook
                        </button>
                        <button class="share-btn zalo" onclick="SocialShare.openLink('https://zalo.me/share?url=${encodedUrl}&title=${encodedText}')">
                            <span>💬</span> Zalo
                        </button>
                        <button class="share-btn twitter" onclick="SocialShare.openLink('https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}')">
                            <span>🐦</span> Twitter
                        </button>
                        <button class="share-btn copy" onclick="SocialShare.copyLink('${data.url}')">
                            <span>📋</span> Sao chép link
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.id = 'shareModal';
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Inject styles if not present
        this.injectStyles();
    },

    closeModal() {
        const modal = document.getElementById('shareModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    openLink(url) {
        window.open(url, '_blank', 'width=600,height=400');
        this.closeModal();
    },

    async copyLink(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('📋 Đã sao chép link!');
            this.closeModal();
        } catch (err) {
            // Fallback
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.showToast('📋 Đã sao chép link!');
            this.closeModal();
        }
    },

    // ========================================
    // PHOTO REVIEWS
    // ========================================

    showReviewModal(orderId) {
        const modal = document.createElement('div');
        modal.className = 'review-modal animate-fadeInUp';
        modal.innerHTML = `
            <div class="review-modal-overlay" onclick="SocialShare.closeReviewModal()"></div>
            <div class="review-modal-content">
                <div class="review-modal-header">
                    <h3>⭐ Đánh giá đơn hàng</h3>
                    <button class="review-close-btn" onclick="SocialShare.closeReviewModal()">✕</button>
                </div>
                <div class="review-modal-body">
                    <div class="rating-stars-input" id="ratingInput">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <span class="star" data-value="${i}" onclick="SocialShare.setRating(${i})">☆</span>
                        `).join('')}
                    </div>
                    <textarea id="reviewText" placeholder="Chia sẻ trải nghiệm của bạn..." rows="3"></textarea>
                    <div class="photo-upload">
                        <label for="reviewPhoto" class="photo-upload-btn">
                            📷 Thêm ảnh
                        </label>
                        <input type="file" id="reviewPhoto" accept="image/*" onchange="SocialShare.previewPhoto(this)">
                        <div id="photoPreview"></div>
                    </div>
                    <button class="submit-review-btn" onclick="SocialShare.submitReview('${orderId}')">
                        Gửi đánh giá
                    </button>
                </div>
            </div>
        `;
        modal.id = 'reviewModal';
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        this.currentRating = 0;
    },

    closeReviewModal() {
        const modal = document.getElementById('reviewModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    setRating(value) {
        this.currentRating = value;
        const stars = document.querySelectorAll('#ratingInput .star');
        stars.forEach((star, index) => {
            star.textContent = index < value ? '★' : '☆';
            star.classList.toggle('active', index < value);
        });
    },

    previewPhoto(input) {
        const preview = document.getElementById('photoPreview');
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" class="photo-preview-img">
                    <button class="photo-remove-btn" onclick="SocialShare.removePhoto()">✕</button>
                `;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    removePhoto() {
        document.getElementById('reviewPhoto').value = '';
        document.getElementById('photoPreview').innerHTML = '';
    },

    submitReview(orderId) {
        const text = document.getElementById('reviewText').value;
        const rating = this.currentRating;

        if (rating === 0) {
            this.showToast('⚠️ Vui lòng chọn số sao!');
            return;
        }

        // Save review locally
        const reviews = JSON.parse(localStorage.getItem('user_reviews') || '[]');
        reviews.push({
            orderId,
            rating,
            text,
            date: new Date().toISOString(),
            hasPhoto: !!document.getElementById('reviewPhoto').files[0]
        });
        localStorage.setItem('user_reviews', JSON.stringify(reviews));

        // Celebration
        if (typeof Confetti !== 'undefined' && rating >= 4) {
            Confetti.starBurst();
        }

        // Check achievement
        if (typeof LoyaltyGame !== 'undefined') {
            LoyaltyGame.addPoints(rating * 10, 'Đánh giá');
            const reviewCount = reviews.length;
            if (reviewCount >= 5) {
                LoyaltyGame.unlockAchievement('review_5');
            }
        }

        this.showToast('🎉 Cảm ơn bạn đã đánh giá!');
        this.closeReviewModal();
    },

    // ========================================
    // UTILITIES - Use centralized utils.js
    // ========================================

    showToast(message) {
        if (window.utils?.toast) {
            window.utils.toast.show(message, 'success');
        } else if (typeof CustomerApp !== 'undefined' && CustomerApp.showToast) {
            CustomerApp.showToast(message);
        } else {
            alert(message);
        }
    },

    formatPrice(amount) {
        if (window.utils?.formatPrice) return window.utils.formatPrice(amount);
        return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
    },

    injectStyles() {
        // Styles now loaded from external CSS file: css/social-share.css
        // This function is kept for backward compatibility
        if (document.getElementById('socialShareStyles')) return;

        // Check if external CSS is already loaded
        const existingLink = document.querySelector('link[href*="social-share.css"]');
        if (existingLink) return;

        // Dynamically load external CSS if not present
        const link = document.createElement('link');
        link.id = 'socialShareStyles';
        link.rel = 'stylesheet';
        link.href = 'css/social-share.css';
        document.head.appendChild(link);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => SocialShare.init());

window.SocialShare = SocialShare;
