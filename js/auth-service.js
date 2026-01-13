// =====================================================
// AUTH SERVICE - ÁNH DƯƠNG F&B
// Unified authentication with rate limiting & sessions
// =====================================================

const AuthService = {
    // Configuration
    SESSION_KEY: 'fb_auth_session',
    SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes

    // Rate limiting storage
    _attempts: {},

    // =====================================================
    // RATE LIMITING
    // =====================================================

    canAttemptLogin(identifier) {
        const record = this._attempts[identifier];
        if (!record) return { allowed: true, remaining: this.MAX_ATTEMPTS };

        // Check if lockout expired
        if (record.lockedUntil && Date.now() > record.lockedUntil) {
            delete this._attempts[identifier];
            return { allowed: true, remaining: this.MAX_ATTEMPTS };
        }

        // Check if locked
        if (record.lockedUntil && Date.now() < record.lockedUntil) {
            const remainingMs = record.lockedUntil - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            return {
                allowed: false,
                remaining: 0,
                lockedFor: remainingMin,
                message: `Tài khoản bị khóa. Thử lại sau ${remainingMin} phút.`
            };
        }

        const remaining = this.MAX_ATTEMPTS - record.count;
        return { allowed: remaining > 0, remaining };
    },

    recordLoginAttempt(identifier, success) {
        if (success) {
            delete this._attempts[identifier];
            return;
        }

        if (!this._attempts[identifier]) {
            this._attempts[identifier] = { count: 0, firstAttempt: Date.now() };
        }

        this._attempts[identifier].count++;
        this._attempts[identifier].lastAttempt = Date.now();

        // Lock after MAX_ATTEMPTS
        if (this._attempts[identifier].count >= this.MAX_ATTEMPTS) {
            this._attempts[identifier].lockedUntil = Date.now() + this.LOCKOUT_DURATION;
        }
    },

    // =====================================================
    // SESSION MANAGEMENT
    // =====================================================

    createSession(user, portal = 'admin') {
        const session = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                phone: user.phone || ''
            },
            portal,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.SESSION_DURATION,
            token: this._generateToken()
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        if (window.Debug) Debug.info('🔐 Session created for:', user.name);
        return session;
    },

    getSession() {
        try {
            const data = localStorage.getItem(this.SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    validateSession() {
        const session = this.getSession();

        if (!session) return null;

        // Check expiration
        if (Date.now() > session.expiresAt) {
            this.logout();
            return null;
        }

        return session;
    },

    refreshSession() {
        const session = this.validateSession();
        if (session) {
            session.expiresAt = Date.now() + this.SESSION_DURATION;
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
        return session;
    },

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        if (window.Debug) Debug.info('🔓 Session cleared');
    },

    _generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    },

    // =====================================================
    // AUTHENTICATION
    // =====================================================

    async login(pin, portal = 'admin') {
        const identifier = `${portal}_login`;

        // Check rate limit
        const rateCheck = this.canAttemptLogin(identifier);
        if (!rateCheck.allowed) {
            return {
                success: false,
                error: rateCheck.message,
                locked: true,
                lockedFor: rateCheck.lockedFor
            };
        }

        // Validate PIN format
        if (!this._validatePin(pin)) {
            return { success: false, error: 'Mã PIN phải là 4-6 chữ số' };
        }

        // Try database authentication first
        if (typeof SupabaseService !== 'undefined' && typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            try {
                const result = await this._authenticateDatabase(pin, portal);
                if (result.success) {
                    this.recordLoginAttempt(identifier, true);
                    return result;
                }
            } catch (err) {
                if (window.Debug) Debug.warn('Database auth failed, falling back to local:', err);
            }
        }

        // Fallback to local AdminCredentials
        const user = this._authenticateLocal(pin);

        if (user) {
            this.recordLoginAttempt(identifier, true);
            const session = this.createSession(user, portal);
            return { success: true, user, session };
        }

        // Failed login
        this.recordLoginAttempt(identifier, false);
        const remaining = this.MAX_ATTEMPTS - (this._attempts[identifier]?.count || 0);

        return {
            success: false,
            error: `Mã PIN không đúng. Còn ${remaining} lần thử.`,
            remaining
        };
    },

    async _authenticateDatabase(pin, portal) {
        // For staff portal
        if (portal === 'admin' || portal === 'staff') {
            const { data, error } = await window.getSupabase().then(s =>
                s.rpc('verify_staff_pin', { p_role: '', p_pin: pin })
            );

            if (!error && data && data.length > 0) {
                const user = data[0];
                const session = this.createSession(user, portal);
                return { success: true, user, session };
            }
        }

        return { success: false };
    },

    _authenticateLocal(pin) {
        if (typeof AdminCredentials !== 'undefined') {
            return AdminCredentials.authenticateByPin(pin);
        }
        return null;
    },

    _validatePin(pin) {
        return /^\d{4,6}$/.test(pin);
    },

    // =====================================================
    // PERMISSIONS
    // =====================================================

    hasPermission(permission) {
        const session = this.validateSession();
        if (!session) return false;

        const role = session.user.role;
        const permissions = this._getRolePermissions(role);

        return permissions.includes(permission) || permissions.includes('*');
    },

    _getRolePermissions(role) {
        const roleMap = {
            'admin': ['*'], // All permissions
            'Quản lý': ['*'],
            'manager': ['dashboard', 'orders', 'menu', 'reports', 'staff'],
            'Thu ngân': ['dashboard', 'orders', 'pos'],
            'cashier': ['dashboard', 'orders', 'pos'],
            'Phục vụ': ['dashboard', 'orders'],
            'waiter': ['dashboard', 'orders'],
            'Bếp': ['kitchen'],
            'chef': ['kitchen']
        };

        return roleMap[role] || [];
    },

    // =====================================================
    // UI HELPERS
    // =====================================================

    showLoginRequired(containerId, onSuccess) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="auth-login-overlay">
                <div class="auth-login-box">
                    <div class="auth-logo">🔐</div>
                    <h2>Đăng nhập Admin</h2>
                    <p>Nhập mã PIN để tiếp tục</p>
                    
                    <div class="auth-pin-input">
                        <input type="password" 
                               id="authPinInput" 
                               maxlength="6" 
                               placeholder="••••"
                               pattern="[0-9]*"
                               inputmode="numeric"
                               autocomplete="off">
                    </div>
                    
                    <div id="authError" class="auth-error"></div>
                    
                    <button id="authLoginBtn" class="auth-login-btn">
                        Đăng nhập
                    </button>
                </div>
            </div>
        `;

        this._injectStyles();

        const pinInput = document.getElementById('authPinInput');
        const loginBtn = document.getElementById('authLoginBtn');
        const errorDiv = document.getElementById('authError');

        const doLogin = async () => {
            const pin = pinInput.value;
            loginBtn.disabled = true;
            loginBtn.textContent = 'Đang xác thực...';

            const result = await this.login(pin, 'admin');

            if (result.success) {
                container.innerHTML = '';
                if (onSuccess) onSuccess(result.user, result.session);
            } else {
                errorDiv.textContent = result.error;
                errorDiv.classList.add('show');
                pinInput.value = '';
                pinInput.focus();
                loginBtn.disabled = false;
                loginBtn.textContent = 'Đăng nhập';
            }
        };

        loginBtn.addEventListener('click', doLogin);
        pinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doLogin();
        });

        pinInput.focus();
    },

    _injectStyles() {
        if (document.getElementById('authServiceStyles')) return;

        const style = document.createElement('style');
        style.id = 'authServiceStyles';
        style.textContent = `
            .auth-login-overlay {
                position: fixed;
                inset: 0;
                background: var(--bg-main, #0a0a12);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .auth-login-box {
                background: var(--bg-card, rgba(26, 26, 46, 0.95));
                border: 1px solid var(--border-color, rgba(255,255,255,0.1));
                border-radius: 24px;
                padding: 3rem 2.5rem;
                text-align: center;
                max-width: 360px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            
            .auth-logo {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            
            .auth-login-box h2 {
                color: var(--text-primary, #f8f8fa);
                margin-bottom: 0.5rem;
                font-size: 1.5rem;
            }
            
            .auth-login-box p {
                color: var(--text-muted, #8888a0);
                margin-bottom: 2rem;
            }
            
            .auth-pin-input input {
                width: 100%;
                padding: 1rem;
                font-size: 2rem;
                text-align: center;
                letter-spacing: 0.5rem;
                background: var(--bg-input, rgba(255,255,255,0.05));
                border: 2px solid var(--border-color, rgba(255,255,255,0.1));
                border-radius: 12px;
                color: var(--text-primary, #f8f8fa);
                outline: none;
                transition: border-color 0.3s;
            }
            
            .auth-pin-input input:focus {
                border-color: var(--primary, #6366f1);
            }
            
            .auth-error {
                color: #ef4444;
                margin-top: 1rem;
                min-height: 1.5rem;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .auth-error.show {
                opacity: 1;
            }
            
            .auth-login-btn {
                width: 100%;
                padding: 1rem;
                margin-top: 1.5rem;
                background: linear-gradient(135deg, var(--primary, #6366f1), var(--secondary, #10b981));
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, opacity 0.2s;
            }
            
            .auth-login-btn:hover:not(:disabled) {
                transform: translateY(-2px);
            }
            
            .auth-login-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .auth-hint {
                margin-top: 1.5rem;
                font-size: 0.8rem;
                color: var(--text-muted, #8888a0);
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize
window.AuthService = AuthService;

console.log('✅ Auth Service loaded');
