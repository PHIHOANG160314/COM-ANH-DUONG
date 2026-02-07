/**
 * F&B Master - Secure Storage
 * Author: Google DeepMind / Antigravity Team
 * Description: AES-GCM encrypted local storage with device fingerprinting.
 */

const SecureStorage = {
    // Configuration
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12,
    SALT_LENGTH: 16,

    // Cached encryption key
    _key: null,
    _initialized: false,

    // =====================================================
    // INITIALIZATION
    // =====================================================

    /**
     * Initialize secure storage with device-based key derivation
     */
    async init() {
        if (this._initialized) return true;

        try {
            // Generate or retrieve device fingerprint
            const fingerprint = await this._getDeviceFingerprint();

            // Derive encryption key from fingerprint
            this._key = await this._deriveKey(fingerprint);
            this._initialized = true;

            if (window.Debug) Debug.info('🔐 SecureStorage initialized');
            return true;
        } catch (err) {
            console.error('SecureStorage init failed:', err);
            return false;
        }
    },

    /**
     * Generate device fingerprint based on browser characteristics
     * This provides device-binding for encrypted data
     */
    async _getDeviceFingerprint() {
        // Check for stored salt (needed for consistent key derivation)
        let salt = localStorage.getItem('_ss_salt');

        if (!salt) {
            // Generate new salt on first run
            const saltBytes = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
            salt = this._arrayToBase64(saltBytes);
            localStorage.setItem('_ss_salt', salt);
        }

        // Collect device characteristics
        const characteristics = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset().toString(),
            salt
        ].join('|');

        // Hash the characteristics
        const encoder = new TextEncoder();
        const data = encoder.encode(characteristics);
        const hash = await crypto.subtle.digest('SHA-256', data);

        return new Uint8Array(hash);
    },

    /**
     * Derive encryption key from fingerprint using PBKDF2
     */
    async _deriveKey(fingerprint) {
        // Import fingerprint as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            fingerprint,
            'PBKDF2',
            false,
            ['deriveKey']
        );

        // Get salt
        const saltStr = localStorage.getItem('_ss_salt') || '';
        const salt = this._base64ToArray(saltStr);

        // Derive AES key using PBKDF2
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: this.ALGORITHM,
                length: this.KEY_LENGTH
            },
            false,
            ['encrypt', 'decrypt']
        );
    },

    // =====================================================
    // ENCRYPTION / DECRYPTION
    // =====================================================

    /**
     * Encrypt data using AES-GCM
     * @param {any} data - Data to encrypt (will be JSON serialized)
     * @returns {string} - Base64 encoded encrypted data
     */
    async encrypt(data) {
        if (!this._initialized) await this.init();
        if (!this._key) throw new Error('Encryption key not available');

        try {
            // Generate random IV
            const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

            // Serialize data to JSON
            const jsonStr = JSON.stringify(data);
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(jsonStr);

            // Encrypt
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                this._key,
                dataBytes
            );

            // Combine IV + encrypted data
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encrypted), iv.length);

            // Return as base64
            return this._arrayToBase64(combined);
        } catch (err) {
            console.error('Encryption failed:', err);
            throw err;
        }
    },

    /**
     * Decrypt data using AES-GCM
     * @param {string} encryptedBase64 - Base64 encoded encrypted data
     * @returns {any} - Decrypted data
     */
    async decrypt(encryptedBase64) {
        if (!this._initialized) await this.init();
        if (!this._key) throw new Error('Encryption key not available');

        try {
            // Decode base64
            const combined = this._base64ToArray(encryptedBase64);

            // Extract IV and encrypted data
            const iv = combined.slice(0, this.IV_LENGTH);
            const encryptedData = combined.slice(this.IV_LENGTH);

            // Decrypt
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                this._key,
                encryptedData
            );

            // Parse JSON
            const decoder = new TextDecoder();
            const jsonStr = decoder.decode(decrypted);
            return JSON.parse(jsonStr);
        } catch (err) {
            console.error('Decryption failed:', err);
            return null;
        }
    },

    // =====================================================
    // STORAGE OPERATIONS
    // =====================================================

    /**
     * Store encrypted data in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     */
    async setItem(key, value) {
        try {
            const encrypted = await this.encrypt(value);
            localStorage.setItem(this._secureKey(key), encrypted);
            return true;
        } catch (err) {
            console.error('SecureStorage.setItem failed:', err);
            return false;
        }
    },

    /**
     * Retrieve and decrypt data from localStorage
     * @param {string} key - Storage key
     * @returns {any} - Decrypted data or null
     */
    async getItem(key) {
        try {
            const encrypted = localStorage.getItem(this._secureKey(key));
            if (!encrypted) return null;
            return await this.decrypt(encrypted);
        } catch (err) {
            console.error('SecureStorage.getItem failed:', err);
            return null;
        }
    },

    /**
     * Remove item from secure storage
     * @param {string} key - Storage key
     */
    removeItem(key) {
        localStorage.removeItem(this._secureKey(key));
    },

    /**
     * Check if key exists in secure storage
     * @param {string} key - Storage key
     */
    hasItem(key) {
        return localStorage.getItem(this._secureKey(key)) !== null;
    },

    /**
     * Clear all secure storage items
     */
    clear() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('_sec_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    },

    // =====================================================
    // MIGRATION UTILITIES
    // =====================================================

    /**
     * Migrate plain localStorage data to secure storage
     * @param {string} oldKey - Original localStorage key
     * @param {string} newKey - Optional new key name
     */
    async migrateFromPlain(oldKey, newKey = null) {
        try {
            const plainData = localStorage.getItem(oldKey);
            if (!plainData) return false;

            // Parse JSON if possible
            let data;
            try {
                data = JSON.parse(plainData);
            } catch {
                data = plainData;
            }

            // Store encrypted
            const targetKey = newKey || oldKey;
            await this.setItem(targetKey, data);

            // Remove plain data
            localStorage.removeItem(oldKey);

            if (window.Debug) Debug.info(`🔐 Migrated ${oldKey} to secure storage`);
            return true;
        } catch (err) {
            console.error('Migration failed:', err);
            return false;
        }
    },

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    /**
     * Generate secure key prefix
     */
    _secureKey(key) {
        return `_sec_${key}`;
    },

    /**
     * Convert Uint8Array to base64 string
     */
    _arrayToBase64(array) {
        return btoa(String.fromCharCode.apply(null, array));
    },

    /**
     * Convert base64 string to Uint8Array
     */
    _base64ToArray(base64) {
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return bytes;
    },

    // =====================================================
    // VERIFICATION
    // =====================================================

    /**
     * Self-test encryption/decryption
     */
    async selfTest() {
        try {
            await this.init();

            const testData = {
                message: 'Hello, Secure World!',
                number: 12345,
                nested: { foo: 'bar' }
            };

            const encrypted = await this.encrypt(testData);
            const decrypted = await this.decrypt(encrypted);

            const success =
                decrypted.message === testData.message &&
                decrypted.number === testData.number &&
                decrypted.nested.foo === testData.nested.foo;

            if (success) {
                if (window.Debug) Debug.info('✅ SecureStorage self-test passed');
            } else {
                console.error('SecureStorage self-test FAILED');
            }

            return success;
        } catch (err) {
            console.error('SecureStorage self-test error:', err);
            return false;
        }
    }
};

// Initialize on load
SecureStorage.init().catch(console.error);

// Export to window
window.SecureStorage = SecureStorage;

if (window.Debug) Debug.log('✅ SecureStorage module loaded');
