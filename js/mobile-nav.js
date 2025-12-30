// ========================================
// F&B MASTER - MOBILE NAVIGATION MODULE
// Native App-like Navigation & Gestures
// ========================================

const MobileNav = {
    lastScrollY: 0,
    isNavHidden: false,
    deferredPrompt: null,
    touchStartY: 0,
    isPulling: false,

    init() {
        if (window.Debug) Debug.info('Mobile Navigation initializing...');

        this.setupScrollBehavior();
        this.setupPullToRefresh();
        this.setupInstallPrompt();
        this.updateCartBadge();
        this.setupBottomNavSync();
        this.setupHapticFeedback();

        if (window.Debug) Debug.info('Mobile Navigation ready!');
    },

    // ========================================
    // SCROLL BEHAVIOR - Hide/Show Nav
    // ========================================
    setupScrollBehavior() {
        const nav = document.getElementById('mobileBottomNav');
        if (!nav) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    // Hide nav when scrolling down, show when scrolling up
                    if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                        if (!this.isNavHidden) {
                            nav.classList.add('hidden');
                            this.isNavHidden = true;
                        }
                    } else {
                        if (this.isNavHidden) {
                            nav.classList.remove('hidden');
                            this.isNavHidden = false;
                        }
                    }

                    this.lastScrollY = currentScrollY;
                    ticking = false;
                });

                ticking = true;
            }
        }, { passive: true });
    },

    // ========================================
    // PULL TO REFRESH
    // ========================================
    setupPullToRefresh() {
        const pullIndicator = document.getElementById('pullToRefresh');
        const main = document.querySelector('.customer-main');
        if (!pullIndicator || !main) return;

        let startY = 0;
        let pulling = false;

        main.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
            }
        }, { passive: true });

        main.addEventListener('touchmove', (e) => {
            if (window.scrollY > 0) return;

            const currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff > 50 && !pulling) {
                pulling = true;
                pullIndicator.classList.add('visible');
            }
        }, { passive: true });

        main.addEventListener('touchend', () => {
            if (pulling) {
                pullIndicator.classList.add('refreshing');

                // Simulate refresh
                setTimeout(() => {
                    // Reload current section data
                    if (typeof CustomerApp !== 'undefined') {
                        CustomerApp.renderMenu();
                        CustomerApp.renderOrderHistory();
                    }

                    pullIndicator.classList.remove('visible', 'refreshing');
                    pulling = false;

                    // Haptic feedback if available
                    this.hapticFeedback('light');
                }, 1000);
            }
        }, { passive: true });
    },

    // ========================================
    // INSTALL APP PROMPT (PWA)
    // ========================================
    setupInstallPrompt() {
        // Capture the install prompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;

            // Show install prompt after user has engaged
            setTimeout(() => {
                if (this.deferredPrompt && !localStorage.getItem('pwa_install_dismissed')) {
                    this.showInstallPrompt();
                }
            }, 30000); // Show after 30 seconds
        });

        // Track successful installation
        window.addEventListener('appinstalled', () => {
            if (window.Debug) Debug.info('PWA installed successfully');
            this.hideInstallPrompt();
            this.deferredPrompt = null;

            if (typeof CustomerApp !== 'undefined') {
                CustomerApp.showToast('🎉 Ứng dụng đã được cài đặt!');
            }
        });
    },

    showInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        if (prompt) {
            prompt.classList.add('show');
        }
    },

    hideInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        if (prompt) {
            prompt.classList.remove('show');
            localStorage.setItem('pwa_install_dismissed', 'true');
        }
    },

    async installApp() {
        if (!this.deferredPrompt) {
            // Fallback for iOS
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                alert('Để cài đặt ứng dụng trên iOS:\n\n1. Nhấn nút Chia sẻ (📤)\n2. Chọn "Thêm vào màn hình chính"');
            }
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (window.Debug) Debug.log(`Install prompt outcome: ${outcome}`);
        this.hideInstallPrompt();
        this.deferredPrompt = null;
    },

    // ========================================
    // CART BADGE SYNC
    // ========================================
    updateCartBadge() {
        const badge = document.getElementById('navCartBadge');
        if (!badge) return;

        // Get cart count from CustomerApp
        let count = 0;
        if (typeof CustomerApp !== 'undefined' && CustomerApp.cart) {
            count = CustomerApp.cart.reduce((sum, item) => sum + item.qty, 0);
        }

        badge.textContent = count > 0 ? (count > 99 ? '99+' : count) : '';
    },

    // ========================================
    // BOTTOM NAV SYNC WITH SECTIONS
    // ========================================
    setupBottomNavSync() {
        // Override CustomerApp.showSection to also update bottom nav
        const originalShowSection = CustomerApp?.showSection;

        if (originalShowSection) {
            CustomerApp.showSection = (sectionId) => {
                originalShowSection.call(CustomerApp, sectionId);
                this.updateActiveNav(sectionId);
            };
        }

        // Also sync with header nav (if exists)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.updateActiveNav(btn.dataset.section);
            });
        });
    },

    updateActiveNav(sectionId) {
        // Update bottom nav active state
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update header nav active state (for desktop)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.section === sectionId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // ========================================
    // HAPTIC FEEDBACK
    // ========================================
    setupHapticFeedback() {
        // Add haptic feedback to all buttons
        document.querySelectorAll('.bottom-nav-item, .bottom-nav-fab, .btn-feedback').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hapticFeedback('light');
            });
        });
    },

    hapticFeedback(type = 'light') {
        if ('vibrate' in navigator) {
            switch (type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate([30, 10, 30]);
                    break;
                case 'success':
                    navigator.vibrate([10, 50, 20]);
                    break;
                case 'error':
                    navigator.vibrate([50, 30, 50, 30, 50]);
                    break;
            }
        }
    },

    // ========================================
    // SWIPE GESTURES
    // ========================================
    setupSwipeGestures(element, callbacks) {
        let startX, startY, distX, distY;
        const threshold = 100;

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            distX = e.changedTouches[0].pageX - startX;
            distY = e.changedTouches[0].pageY - startY;

            // Check if horizontal swipe
            if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
                if (distX > 0 && callbacks.onSwipeRight) {
                    callbacks.onSwipeRight();
                } else if (distX < 0 && callbacks.onSwipeLeft) {
                    callbacks.onSwipeLeft();
                }
            }

            // Check if vertical swipe
            if (Math.abs(distY) > Math.abs(distX) && Math.abs(distY) > threshold) {
                if (distY > 0 && callbacks.onSwipeDown) {
                    callbacks.onSwipeDown();
                } else if (distY < 0 && callbacks.onSwipeUp) {
                    callbacks.onSwipeUp();
                }
            }
        }, { passive: true });
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for CustomerApp to initialize first
    setTimeout(() => {
        MobileNav.init();
    }, 100);
});

// Update cart badge whenever cart changes
const originalUpdateCartUI = CustomerApp?.updateCartUI;
if (originalUpdateCartUI) {
    CustomerApp.updateCartUI = function () {
        originalUpdateCartUI.call(CustomerApp);
        MobileNav.updateCartBadge();
    };
}

window.MobileNav = MobileNav;
