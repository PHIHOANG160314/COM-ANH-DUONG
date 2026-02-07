// ========================================
// F&B MASTER - LOYALTY GAMIFICATION
// Tiers, Streaks, Achievements, Rewards
// ========================================

const LoyaltyGame = {
    // Tier Definitions
    tiers: {
        bronze: { name: 'Bronze', minPoints: 0, multiplier: 1, color: '#cd7f32' },
        silver: { name: 'Silver', minPoints: 500, multiplier: 1.2, color: '#c0c0c0' },
        gold: { name: 'Gold', minPoints: 1500, multiplier: 1.5, color: '#ffd700' },
        diamond: { name: 'Diamond', minPoints: 5000, multiplier: 2, color: '#b9f2ff' }
    },

    // Achievement Definitions
    achievements: [
        { id: 'first_order', name: 'Đơn Đầu Tiên', icon: '🎉', desc: 'Đặt đơn hàng đầu tiên', points: 50 },
        { id: 'loyal_5', name: 'Khách Quen', icon: '💝', desc: 'Đặt 5 đơn hàng', points: 100 },
        { id: 'loyal_20', name: 'Fan Cứng', icon: '🏆', desc: 'Đặt 20 đơn hàng', points: 300 },
        { id: 'streak_7', name: '7 Ngày Liên Tiếp', icon: '🔥', desc: 'Đặt 7 ngày liên tiếp', points: 200 },
        { id: 'streak_30', name: '30 Ngày Liên Tiếp', icon: '⚡', desc: 'Đặt 30 ngày liên tiếp', points: 1000 },
        { id: 'big_spender', name: 'Đại Gia', icon: '💎', desc: 'Chi tiêu trên 1 triệu', points: 500 },
        { id: 'early_bird', name: 'Chim Sớm', icon: '🐦', desc: 'Đặt trước 8 giờ sáng', points: 50 },
        { id: 'night_owl', name: 'Cú Đêm', icon: '🦉', desc: 'Đặt sau 10 giờ tối', points: 50 },
        { id: 'variety', name: 'Đa Khẩu Vị', icon: '🌈', desc: 'Thử 10 món khác nhau', points: 150 },
        { id: 'referral', name: 'Đại Sứ', icon: '👥', desc: 'Giới thiệu 3 bạn bè', points: 300 },
        { id: 'birthday', name: 'Sinh Nhật Vui', icon: '🎂', desc: 'Đặt đơn vào ngày sinh', points: 100 },
        { id: 'review_5', name: 'Reviewer', icon: '⭐', desc: 'Viết 5 đánh giá', points: 100 }
    ],

    // State
    state: {
        points: 0,
        tier: 'bronze',
        streak: 0,
        lastOrderDate: null,
        totalOrders: 0,
        totalSpent: 0,
        unlockedAchievements: [],
        orderedItems: []
    },

    init() {
        this.loadState();
        if (window.Debug) Debug.info('Loyalty Game initialized');
    },

    loadState() {
        const saved = localStorage.getItem('loyalty_state');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
        this.updateTier();
    },

    saveState() {
        localStorage.setItem('loyalty_state', JSON.stringify(this.state));
    },

    // ========================================
    // POINTS & TIERS
    // ========================================

    addPoints(points, reason = '') {
        const multiplier = this.tiers[this.state.tier].multiplier;
        const earnedPoints = Math.round(points * multiplier);

        this.state.points += earnedPoints;
        this.updateTier();
        this.saveState();

        // Show notification
        this.showPointsEarned(earnedPoints, reason);

        return earnedPoints;
    },

    updateTier() {
        const points = this.state.points;
        let newTier = 'bronze';

        if (points >= this.tiers.diamond.minPoints) newTier = 'diamond';
        else if (points >= this.tiers.gold.minPoints) newTier = 'gold';
        else if (points >= this.tiers.silver.minPoints) newTier = 'silver';

        if (newTier !== this.state.tier) {
            const oldTier = this.state.tier;
            this.state.tier = newTier;
            this.onTierUp(oldTier, newTier);
        }
    },

    onTierUp(from, to) {
        // Celebration!
        if (typeof Confetti !== 'undefined') {
            Confetti.celebrate();
        }

        this.showTierUpNotification(to);
    },

    getNextTier() {
        const tiers = ['bronze', 'silver', 'gold', 'diamond'];
        const currentIndex = tiers.indexOf(this.state.tier);
        if (currentIndex < tiers.length - 1) {
            return tiers[currentIndex + 1];
        }
        return null;
    },

    getProgressToNextTier() {
        const nextTier = this.getNextTier();
        if (!nextTier) return 100;

        const currentMin = this.tiers[this.state.tier].minPoints;
        const nextMin = this.tiers[nextTier].minPoints;
        const progress = (this.state.points - currentMin) / (nextMin - currentMin) * 100;

        return Math.min(100, Math.max(0, progress));
    },

    // ========================================
    // STREAKS
    // ========================================

    updateStreak() {
        const today = new Date().toDateString();
        const lastOrder = this.state.lastOrderDate;

        if (!lastOrder) {
            this.state.streak = 1;
        } else {
            const lastDate = new Date(lastOrder);
            const diff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

            if (diff === 0) {
                // Already ordered today
                return this.state.streak;
            } else if (diff === 1) {
                // Consecutive day
                this.state.streak++;
                this.checkStreakAchievements();
            } else {
                // Streak broken
                this.state.streak = 1;
            }
        }

        this.state.lastOrderDate = today;
        this.saveState();

        return this.state.streak;
    },

    checkStreakAchievements() {
        if (this.state.streak >= 7) {
            this.unlockAchievement('streak_7');
        }
        if (this.state.streak >= 30) {
            this.unlockAchievement('streak_30');
        }
    },

    getStreakDays() {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const result = [];
        const today = new Date().getDay();

        for (let i = 0; i < 7; i++) {
            const dayIndex = (today - 6 + i + 7) % 7;
            result.push({
                label: days[dayIndex],
                completed: i < this.state.streak % 7 || (i === 6 && this.state.streak >= 7),
                isToday: i === 6
            });
        }

        return result;
    },

    // ========================================
    // ACHIEVEMENTS
    // ========================================

    unlockAchievement(achievementId) {
        if (this.state.unlockedAchievements.includes(achievementId)) {
            return false;
        }

        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return false;

        this.state.unlockedAchievements.push(achievementId);
        this.addPoints(achievement.points, achievement.name);
        this.saveState();

        this.showAchievementUnlocked(achievement);

        // Celebration effect
        if (typeof Confetti !== 'undefined') {
            Confetti.loyaltyUnlock();
        }

        return true;
    },

    checkOrderAchievements(order) {
        this.state.totalOrders++;
        this.state.totalSpent += order.total;

        // Track ordered items
        order.items.forEach(item => {
            if (!this.state.orderedItems.includes(item.id)) {
                this.state.orderedItems.push(item.id);
            }
        });

        // Check achievements
        if (this.state.totalOrders === 1) this.unlockAchievement('first_order');
        if (this.state.totalOrders === 5) this.unlockAchievement('loyal_5');
        if (this.state.totalOrders === 20) this.unlockAchievement('loyal_20');
        if (this.state.totalSpent >= 1000000) this.unlockAchievement('big_spender');
        if (this.state.orderedItems.length >= 10) this.unlockAchievement('variety');

        // Time-based achievements
        const hour = new Date().getHours();
        if (hour < 8) this.unlockAchievement('early_bird');
        if (hour >= 22) this.unlockAchievement('night_owl');

        this.updateStreak();
        this.saveState();
    },

    getAchievementsUI() {
        return this.achievements.map(a => ({
            ...a,
            unlocked: this.state.unlockedAchievements.includes(a.id)
        }));
    },

    // ========================================
    // REFERRALS
    // ========================================

    getReferralCode() {
        let code = localStorage.getItem('referral_code');
        if (!code) {
            code = 'AD' + Math.random().toString(36).substr(2, 6).toUpperCase();
            localStorage.setItem('referral_code', code);
        }
        return code;
    },

    applyReferral(code) {
        if (!code || code === this.getReferralCode()) return false;

        const referrals = JSON.parse(localStorage.getItem('referrals_used') || '[]');
        if (referrals.includes(code)) return false;

        referrals.push(code);
        localStorage.setItem('referrals_used', JSON.stringify(referrals));

        this.addPoints(100, 'Mã giới thiệu');
        return true;
    },

    // ========================================
    // QUICK REORDER
    // ========================================

    getRecentOrders(limit = 5) {
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        return orders.slice(0, limit).map(order => ({
            id: order.id,
            date: order.createdAt,
            items: order.items.map(i => i.name).join(', '),
            itemsList: order.items,
            total: order.total
        }));
    },

    reorder(orderId) {
        const orders = JSON.parse(localStorage.getItem('customer_orders') || '[]');
        const order = orders.find(o => o.id === orderId);

        if (!order || !window.CustomerApp) return false;

        // Add all items from the order to cart
        order.items.forEach(item => {
            for (let i = 0; i < item.qty; i++) {
                CustomerApp.addToCart(item.id);
            }
        });

        CustomerApp.showToast('🛒 Đã thêm đơn cũ vào giỏ hàng!');
        return true;
    },

    // ========================================
    // UI NOTIFICATIONS
    // ========================================

    showPointsEarned(points, reason) {
        const toast = document.createElement('div');
        toast.className = 'points-toast animate-popIn';
        toast.innerHTML = `
            <span class="points-icon">⭐</span>
            <span class="points-amount">+${points}</span>
            <span class="points-reason">${reason || 'điểm thưởng'}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: #1a1a2e;
            border-radius: 30px;
            font-weight: 600;
            z-index: 3000;
            box-shadow: 0 10px 40px rgba(251, 191, 36, 0.4);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    showTierUpNotification(tier) {
        const tierInfo = this.tiers[tier];
        const toast = document.createElement('div');
        toast.className = 'tier-up-toast animate-tada';
        toast.innerHTML = `
            <div class="tier-up-icon">🎖️</div>
            <div class="tier-up-text">
                <strong>Chúc mừng!</strong>
                <span>Bạn đã đạt hạng ${tierInfo.name}!</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 24px 32px;
            background: linear-gradient(135deg, ${tierInfo.color}, var(--primary));
            color: white;
            border-radius: 20px;
            font-size: 1rem;
            z-index: 3000;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    showAchievementUnlocked(achievement) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast animate-popIn';
        toast.innerHTML = `
            <div class="achievement-popup-icon">${achievement.icon}</div>
            <div class="achievement-popup-text">
                <strong>Thành tựu mở khóa!</strong>
                <span>${achievement.name}</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border-radius: 16px;
            font-size: 0.9rem;
            z-index: 3000;
            box-shadow: 0 10px 40px rgba(99, 102, 241, 0.4);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    // ========================================
    // RENDER UI
    // ========================================

    renderLoyaltyCard() {
        const tier = this.state.tier;
        const tierInfo = this.tiers[tier];
        const nextTier = this.getNextTier();
        const progress = this.getProgressToNextTier();

        return `
            <div class="loyalty-tier-card ${tier}">
                <span class="tier-badge ${tier}">${tierInfo.name}</span>
                <div class="tier-info">
                    <h3>🎖️ ${this.state.points.toLocaleString()} điểm</h3>
                    <p>Nhân điểm x${tierInfo.multiplier}</p>
                </div>
                ${nextTier ? `
                    <div class="tier-progress">
                        <div class="tier-progress-bar">
                            <div class="tier-progress-fill ${tier}" style="width: ${progress}%"></div>
                        </div>
                        <div class="tier-progress-text">
                            <span>${this.state.points.toLocaleString()}</span>
                            <span>${this.tiers[nextTier].minPoints.toLocaleString()} (${this.tiers[nextTier].name})</span>
                        </div>
                    </div>
                ` : '<p style="margin-top:12px;color:var(--secondary);">🏆 Hạng cao nhất!</p>'}
            </div>
        `;
    },

    renderStreakSection() {
        const days = this.getStreakDays();

        return `
            <div class="streak-section">
                <div class="streak-header">
                    <div class="streak-count">
                        <span class="streak-fire">🔥</span>
                        <span class="streak-number">${this.state.streak}</span>
                        <span class="streak-label">ngày liên tiếp</span>
                    </div>
                </div>
                <div class="streak-days">
                    ${days.map(d => `
                        <div class="streak-day ${d.completed ? 'completed' : ''} ${d.isToday ? 'today' : ''}">
                            ${d.label}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderAchievements() {
        const achievements = this.getAchievementsUI();

        return `
            <div class="achievements-grid">
                ${achievements.map(a => `
                    <div class="achievement-badge ${a.unlocked ? 'unlocked' : 'locked'}">
                        <span class="achievement-icon">${a.icon}</span>
                        <span class="achievement-name">${a.name}</span>
                        <span class="achievement-desc">${a.desc}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderQuickReorder() {
        const orders = this.getRecentOrders(3);
        if (orders.length === 0) return '';

        return `
            <div class="quick-reorder-section">
                <div class="quick-reorder-title">
                    <h3>🔄 Đặt lại nhanh</h3>
                </div>
                <div class="quick-reorder-cards">
                    ${orders.map(o => `
                        <div class="reorder-card" onclick="LoyaltyGame.reorder('${o.id}')">
                            <div class="reorder-date">${this.formatDate(o.date)}</div>
                            <div class="reorder-items">${o.items}</div>
                            <div class="reorder-total">${this.formatPrice(o.total)}</div>
                            <button class="reorder-btn">Đặt lại</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'short'
        });
    },

    formatPrice(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => LoyaltyGame.init());

window.LoyaltyGame = LoyaltyGame;
