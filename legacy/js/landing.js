/**
 * F&B Master - Landing Page Logic
 * Handles dynamic content, carousel, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAboutUsCarousel();
    initMobileMenu();
    initScrollEffects();
    initExperienceCounter();
});

function initExperienceCounter() {
    const expElement = document.getElementById('exp-years');
    if (!expElement) return;

    const startYear = 2018;
    const startMonth = 8; // September (0-indexed)
    const now = new Date();
    let years = now.getFullYear() - startYear;
    if (now.getMonth() < startMonth) {
        years--;
    }
    expElement.innerText = years + '+';
}

// ========================================
// ABOUT US CAROUSEL
// ========================================

let carouselInterval;
let currentImageIndex = 0;

function initAboutUsCarousel() {
    const carouselContainer = document.getElementById('aboutCarouselInner');
    if (!carouselContainer) return;

    // Load config
    let config = window.AboutUsConfig;

    // Fallback if not loaded globally yet
    if (!config) {
        try {
            config = JSON.parse(localStorage.getItem('cad_cms_config'));
        } catch (e) {
            console.error('Error loading config', e);
        }
    }

    // Default config if still null
    if (!config) {
        config = {
            autoPlay: true,
            interval: 3000,
            images: ['logo.jpg'],
            activeImageIndex: 0
        };
    }

    // If no images, use default
    if (!config.images || config.images.length === 0) {
        config.images = ['logo.jpg'];
    }

    renderCarouselImages(carouselContainer, config);
    renderCarouselDots(config);

    // Setup behavior
    if (config.autoPlay && config.images.length > 1) {
        startAutoPlay(config);
    } else {
        // Show specific image if auto-play is off, or just the first one
        const targetIndex = (config.activeImageIndex !== undefined && config.activeImageIndex < config.images.length)
            ? config.activeImageIndex
            : 0;
        showImage(targetIndex);
    }

    // Listen for config updates from Admin (if on same page or via storage event)
    window.addEventListener('storage', (e) => {
        if (e.key === 'cad_cms_config') {
            location.reload(); // Simple reload to reflect changes
        }
    });
}

function renderCarouselImages(container, config) {
    container.innerHTML = config.images.map((src, index) => `
        <img src="${src}"
             alt="Cơm Ánh Dương - Image ${index + 1}"
             class="about-img ${index === 0 ? 'active' : ''}"
             data-index="${index}"
             onerror="this.src='logo.jpg'">
    `).join('');
}

function renderCarouselDots(config) {
    const dotsContainer = document.getElementById('aboutCarouselDots');
    if (!dotsContainer || config.images.length <= 1) return;

    dotsContainer.innerHTML = config.images.map((_, index) => `
        <span class="dot ${index === 0 ? 'active' : ''}" onclick="showImage(${index})"></span>
    `).join('');
}

function showImage(index) {
    const images = document.querySelectorAll('.about-img');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    if (index >= images.length) index = 0;
    if (index < 0) index = images.length - 1;

    currentImageIndex = index;

    // Update Images
    images.forEach(img => img.classList.remove('active'));
    if (images[index]) images[index].classList.add('active');

    // Update Dots
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
}

function startAutoPlay(config) {
    // Clear existing
    if (carouselInterval) clearInterval(carouselInterval);

    // Set new interval
    const intervalTime = config.interval || 3000;

    carouselInterval = setInterval(() => {
        showImage(currentImageIndex + 1);
    }, intervalTime);
}

// ========================================
// EXISTING LANDING PAGE LOGIC (Moved here)
// ========================================

function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    if (!mobileMenuToggle || !navLinks) return;

    function toggleMobileMenu() {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        if (mobileMenuOverlay) mobileMenuOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    // Remove old event listeners to prevent duplicates if inline script runs too
    const newToggle = mobileMenuToggle.cloneNode(true);
    mobileMenuToggle.parentNode.replaceChild(newToggle, mobileMenuToggle);

    newToggle.addEventListener('click', toggleMobileMenu);

    if (mobileMenuOverlay) {
        const newOverlay = mobileMenuOverlay.cloneNode(true);
        mobileMenuOverlay.parentNode.replaceChild(newOverlay, mobileMenuOverlay);
        newOverlay.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking nav links
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
}

function initScrollEffects() {
    const header = document.getElementById('landingHeader');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-header, .about-content, .specialty-card, .gallery-item, .article-card, .contact-card').forEach(el => {
        observer.observe(el);
    });
}
