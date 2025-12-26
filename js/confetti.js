// ========================================
// F&B MASTER - CONFETTI EFFECTS
// Celebration animations for special moments
// ========================================

const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    colors: [
        '#6366f1', // primary
        '#10b981', // secondary
        '#f59e0b', // warning
        '#ec4899', // pink
        '#8b5cf6', // purple
        '#06b6d4', // cyan
    ],

    init() {
        if (this.canvas) return;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // ========================================
    // CONFETTI EXPLOSION
    // ========================================
    explode(options = {}) {
        this.init();

        const defaults = {
            particleCount: 100,
            spread: 70,
            startVelocity: 30,
            decay: 0.95,
            gravity: 1,
            originX: 0.5,
            originY: 0.5,
            shapes: ['square', 'circle'],
            duration: 3000
        };

        const config = { ...defaults, ...options };
        const startX = this.canvas.width * config.originX;
        const startY = this.canvas.height * config.originY;

        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = config.startVelocity * (0.5 + Math.random() * 0.5);

            this.particles.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * velocity * (config.spread / 50),
                vy: Math.sin(angle) * velocity - 10,
                size: Math.random() * 8 + 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                decay: config.decay,
                gravity: config.gravity,
                alpha: 1
            });
        }

        if (!this.animationId) {
            this.animate();
        }

        setTimeout(() => this.stop(), config.duration);
    },

    // ========================================
    // STAR BURST
    // ========================================
    starBurst(x, y, count = 20) {
        this.init();

        const centerX = x || this.canvas.width / 2;
        const centerY = y || this.canvas.height / 2;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const velocity = 8 + Math.random() * 5;

            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 4,
                color: '#f59e0b',
                shape: 'star',
                rotation: 0,
                rotationSpeed: 5,
                decay: 0.96,
                gravity: 0.2,
                alpha: 1
            });
        }

        if (!this.animationId) {
            this.animate();
        }

        setTimeout(() => this.stop(), 2000);
    },

    // ========================================
    // SPARKLE RING
    // ========================================
    sparkleRing(x, y) {
        this.init();

        const centerX = x || this.canvas.width / 2;
        const centerY = y || this.canvas.height / 2;

        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 30;

                this.particles.push({
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    vx: 0,
                    vy: -1,
                    size: 3 + Math.random() * 3,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    shape: 'circle',
                    rotation: 0,
                    rotationSpeed: 0,
                    decay: 0.92,
                    gravity: 0,
                    alpha: 1
                });
            }, i * 50);
        }

        if (!this.animationId) {
            this.animate();
        }

        setTimeout(() => this.stop(), 3000);
    },

    // ========================================
    // ANIMATION LOOP
    // ========================================
    animate() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.decay;
            p.vy *= p.decay;
            p.rotation += p.rotationSpeed;
            p.alpha -= 0.01;
            p.size *= 0.99;

            // Draw particle
            if (p.alpha > 0 && p.size > 0.5) {
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation * Math.PI / 180);
                this.ctx.fillStyle = p.color;

                if (p.shape === 'square') {
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else if (p.shape === 'circle') {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (p.shape === 'star') {
                    this.drawStar(0, 0, 5, p.size, p.size / 2);
                }

                this.ctx.restore();
                return true;
            }
            return false;
        });

        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.stop();
        }
    },

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.particles = [];
    },

    // ========================================
    // PRESET EFFECTS
    // ========================================
    celebrate() {
        // Big celebration with multiple bursts
        this.explode({ originX: 0.2, originY: 0.6 });
        setTimeout(() => this.explode({ originX: 0.8, originY: 0.6 }), 150);
        setTimeout(() => this.explode({ originX: 0.5, originY: 0.4, particleCount: 150 }), 300);
    },

    orderSuccess() {
        // Centered celebration for order completion
        this.explode({
            particleCount: 80,
            originX: 0.5,
            originY: 0.3,
            spread: 60,
            startVelocity: 25
        });
    },

    promoSuccess(element) {
        // Star burst near the promo code input
        if (element) {
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            this.starBurst(x, y, 15);
        } else {
            this.starBurst();
        }
    },

    loyaltyUnlock(element) {
        // Sparkle ring for loyalty achievement
        if (element) {
            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            this.sparkleRing(x, y);
        } else {
            this.sparkleRing();
        }
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Pre-init canvas for faster first use
    setTimeout(() => Confetti.init(), 1000);
});

window.Confetti = Confetti;
