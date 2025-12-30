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
    // UTILITIES
    // ========================================

    showToast(message) {
        if (typeof CustomerApp !== 'undefined' && CustomerApp.showToast) {
            CustomerApp.showToast(message);
        } else {
            alert(message);
        }
    },

    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    injectStyles() {
        if (document.getElementById('socialShareStyles')) return;

        const style = document.createElement('style');
        style.id = 'socialShareStyles';
        style.textContent = `
            .share-modal, .review-modal {
                position: fixed;
                inset: 0;
                z-index: 2000;
                display: flex;
                align-items: flex-end;
            }

            .share-modal-overlay, .review-modal-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.5);
            }

            .share-modal-content, .review-modal-content {
                position: relative;
                width: 100%;
                background: var(--bg-card, #1e1e3a);
                border-radius: 24px 24px 0 0;
                padding: 20px;
                padding-bottom: calc(20px + env(safe-area-inset-bottom));
                animation: slideUp 0.3s ease;
            }

            .share-modal-header, .review-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .share-modal-header h3, .review-modal-header h3 {
                font-size: 1.1rem;
                margin: 0;
            }

            .share-close-btn, .review-close-btn {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.1);
                color: white;
                border-radius: 50%;
                font-size: 1rem;
                cursor: pointer;
            }

            .share-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .share-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 16px;
                border: none;
                border-radius: 16px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .share-btn:active {
                transform: scale(0.97);
            }

            .share-btn.facebook { background: #1877f2; color: white; }
            .share-btn.zalo { background: #0068ff; color: white; }
            .share-btn.twitter { background: #1da1f2; color: white; }
            .share-btn.copy { background: rgba(255,255,255,0.1); color: white; }

            .rating-stars-input {
                display: flex;
                justify-content: center;
                gap: 8px;
                font-size: 2.5rem;
                margin-bottom: 16px;
            }

            .rating-stars-input .star {
                cursor: pointer;
                color: #fbbf24;
                transition: transform 0.2s;
            }

            .rating-stars-input .star:hover {
                transform: scale(1.2);
            }

            .rating-stars-input .star.active {
                animation: starPop 0.3s ease;
            }

            @keyframes starPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }

            #reviewText {
                width: 100%;
                padding: 16px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 16px;
                color: white;
                font-size: 0.9rem;
                resize: none;
                margin-bottom: 16px;
            }

            .photo-upload {
                margin-bottom: 16px;
            }

            .photo-upload-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                color: white;
                cursor: pointer;
            }

            #reviewPhoto {
                display: none;
            }

            #photoPreview {
                position: relative;
                margin-top: 12px;
            }

            .photo-preview-img {
                max-width: 100%;
                max-height: 150px;
                border-radius: 12px;
            }

            .photo-remove-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 28px;
                height: 28px;
                border: none;
                background: rgba(0,0,0,0.7);
                color: white;
                border-radius: 50%;
                cursor: pointer;
            }

            .submit-review-btn {
                width: 100%;
                padding: 16px;
                background: linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #10b981));
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
        `;
        document.head.appendChild(style);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => SocialShare.init());

window.SocialShare = SocialShare;
