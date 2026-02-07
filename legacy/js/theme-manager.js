// ========================================
// F&B MASTER - THEME MANAGER
// Dark/Light Mode Toggle
// ========================================

const ThemeManager = {
    themes: {
        dark: {
            name: 'Dark',
            icon: '🌙',
            vars: {
                '--bg-main': '#0f0f23',
                '--bg-card': '#1e1e3a',
                '--bg-surface': '#2d2d4a',
                '--text-primary': '#ffffff',
                '--text-secondary': '#a0a0b8',
                '--text-muted': '#6b6b8a',
                '--primary': '#6366f1',
                '--secondary': '#10b981',
                '--accent': '#fbbf24',
                '--border': 'rgba(255, 255, 255, 0.1)',
                '--shadow': 'rgba(0, 0, 0, 0.3)'
            }
        },
        light: {
            name: 'Light',
            icon: '☀️',
            vars: {
                '--bg-main': '#f8fafc',
                '--bg-card': '#ffffff',
                '--bg-surface': '#f1f5f9',
                '--text-primary': '#1e293b',
                '--text-secondary': '#475569',
                '--text-muted': '#94a3b8',
                '--primary': '#4f46e5',
                '--secondary': '#059669',
                '--accent': '#d97706',
                '--border': 'rgba(0, 0, 0, 0.1)',
                '--shadow': 'rgba(0, 0, 0, 0.1)'
            }
        },
        sunset: {
            name: 'Sunset',
            icon: '🌅',
            vars: {
                '--bg-main': '#1a1423',
                '--bg-card': '#2d2137',
                '--bg-surface': '#3d2e4a',
                '--text-primary': '#fce7f3',
                '--text-secondary': '#f9a8d4',
                '--text-muted': '#db7093',
                '--primary': '#ec4899',
                '--secondary': '#f97316',
                '--accent': '#fbbf24',
                '--border': 'rgba(236, 72, 153, 0.2)',
                '--shadow': 'rgba(0, 0, 0, 0.4)'
            }
        },
        ocean: {
            name: 'Ocean',
            icon: '🌊',
            vars: {
                '--bg-main': '#0c1929',
                '--bg-card': '#132f4c',
                '--bg-surface': '#1e4976',
                '--text-primary': '#e0f2fe',
                '--text-secondary': '#7dd3fc',
                '--text-muted': '#38bdf8',
                '--primary': '#0ea5e9',
                '--secondary': '#06b6d4',
                '--accent': '#22d3ee',
                '--border': 'rgba(14, 165, 233, 0.2)',
                '--shadow': 'rgba(0, 0, 0, 0.4)'
            }
        }
    },

    currentTheme: 'dark',

    init() {
        if (window.Debug) Debug.info('Theme Manager initialized');

        // Load saved theme
        const saved = localStorage.getItem('app_theme') || 'dark';
        this.setTheme(saved, false);

        // Add toggle button
        this.addThemeToggle();

        // Listen for system preference changes
        this.watchSystemPreference();
    },

    setTheme(themeName, save = true) {
        const theme = this.themes[themeName];
        if (!theme) return;

        this.currentTheme = themeName;

        // Apply CSS variables
        const root = document.documentElement;
        Object.entries(theme.vars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Update body class
        document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .trim() + ` theme-${themeName}`;

        // Update toggle button
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = `<span>${theme.icon}</span>`;
        }

        // Save preference
        if (save) {
            localStorage.setItem('app_theme', themeName);
        }
    },

    toggle() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextTheme = themeNames[nextIndex];

        this.setTheme(nextTheme);
        this.showThemeToast(nextTheme);
    },

    showThemePicker() {
        const modal = document.createElement('div');
        modal.className = 'theme-picker-modal';
        modal.id = 'themePicker';
        modal.innerHTML = `
            <div class="theme-picker-overlay" onclick="ThemeManager.closePicker()"></div>
            <div class="theme-picker animate-fadeInUp">
                <div class="theme-picker-header">
                    <h3>🎨 Chọn giao diện</h3>
                    <button onclick="ThemeManager.closePicker()">✕</button>
                </div>
                <div class="theme-picker-body">
                    ${Object.entries(this.themes).map(([key, theme]) => `
                        <div class="theme-option ${key === this.currentTheme ? 'active' : ''}" 
                             onclick="ThemeManager.selectTheme('${key}')">
                            <div class="theme-preview" style="
                                background: ${theme.vars['--bg-main']};
                                border-color: ${theme.vars['--primary']};
                            ">
                                <div class="preview-card" style="background: ${theme.vars['--bg-card']}">
                                    <div class="preview-text" style="background: ${theme.vars['--text-primary']}"></div>
                                    <div class="preview-accent" style="background: ${theme.vars['--primary']}"></div>
                                </div>
                            </div>
                            <div class="theme-info">
                                <span class="theme-icon">${theme.icon}</span>
                                <span class="theme-name">${theme.name}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        this.injectStyles();
    },

    selectTheme(themeName) {
        this.setTheme(themeName);
        this.closePicker();
    },

    closePicker() {
        const modal = document.getElementById('themePicker');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    addThemeToggle() {
        if (document.getElementById('themeToggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'themeToggle';
        toggle.className = 'theme-toggle';
        toggle.innerHTML = `<span>${this.themes[this.currentTheme].icon}</span>`;
        toggle.onclick = (e) => {
            if (e.shiftKey) {
                this.showThemePicker();
            } else {
                this.toggle();
            }
        };
        toggle.title = 'Click để đổi theme, Shift+Click để chọn';
        document.body.appendChild(toggle);
    },

    watchSystemPreference() {
        if (window.matchMedia) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
            prefersDark.addEventListener('change', (e) => {
                if (!localStorage.getItem('app_theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light', false);
                }
            });
        }
    },

    showThemeToast(themeName) {
        const theme = this.themes[themeName];
        if (typeof CustomerApp !== 'undefined' && CustomerApp.showToast) {
            CustomerApp.showToast(`${theme.icon} Đã đổi sang ${theme.name}`);
        }
    },

    injectStyles() {
        if (document.getElementById('themeManagerStyles')) return;

        const style = document.createElement('style');
        style.id = 'themeManagerStyles';
        style.textContent = `
            .theme-toggle {
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 48px;
                height: 48px;
                background: var(--bg-card);
                border: 1px solid var(--border);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 20px var(--shadow);
                z-index: 999;
                font-size: 1.3rem;
                transition: transform 0.3s, box-shadow 0.3s;
            }

            .theme-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px var(--shadow);
            }

            .theme-toggle:active {
                transform: scale(0.95);
            }

            /* Theme Picker Modal */
            .theme-picker-modal {
                position: fixed;
                inset: 0;
                z-index: 2000;
                display: flex;
                align-items: flex-end;
                justify-content: center;
            }

            .theme-picker-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.6);
            }

            .theme-picker {
                position: relative;
                width: 100%;
                max-width: 500px;
                background: var(--bg-card);
                border-radius: 24px 24px 0 0;
                padding: 20px;
                padding-bottom: calc(20px + env(safe-area-inset-bottom));
            }

            .theme-picker-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .theme-picker-header h3 { margin: 0; }

            .theme-picker-header button {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.1);
                color: var(--text-primary);
                border-radius: 50%;
                cursor: pointer;
            }

            .theme-picker-body {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .theme-option {
                background: rgba(255,255,255,0.02);
                border: 2px solid transparent;
                border-radius: 16px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .theme-option:hover {
                background: rgba(255,255,255,0.05);
            }

            .theme-option.active {
                border-color: var(--primary);
                background: rgba(99, 102, 241, 0.1);
            }

            .theme-preview {
                height: 60px;
                border-radius: 12px;
                border: 2px solid;
                padding: 8px;
                margin-bottom: 8px;
            }

            .preview-card {
                height: 100%;
                border-radius: 8px;
                padding: 8px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .preview-text {
                height: 8px;
                width: 60%;
                border-radius: 4px;
                opacity: 0.8;
            }

            .preview-accent {
                height: 16px;
                width: 40%;
                border-radius: 8px;
            }

            .theme-info {
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
            }

            .theme-icon { font-size: 1.2rem; }

            .theme-name {
                font-weight: 600;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());

window.ThemeManager = ThemeManager;
