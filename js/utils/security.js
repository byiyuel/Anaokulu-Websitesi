/**
 * Enterprise Security Utility
 * Security functions for input validation, sanitization, and protection
 */

class SecurityManager {
    constructor() {
        this.config = window.getConfig ? window.getConfig() : { security: {} };
        this.loginAttempts = new Map();
        this.lockedAccounts = new Set();
        this.init();
    }

    /**
     * Initialize security manager
     */
    init() {
        this.setupCSRFProtection();
        this.setupXSSProtection();
        this.setupClickjackingProtection();
        this.loadLockedAccounts();
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean}
     */
    validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    validatePassword(password) {
        const minLength = this.config.security.passwordMinLength || 6;
        const result = {
            isValid: true,
            errors: [],
            strength: 'weak'
        };

        if (password.length < minLength) {
            result.isValid = false;
            result.errors.push(`Password must be at least ${minLength} characters long`);
        }

        if (!/[a-z]/.test(password)) {
            result.errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(password)) {
            result.errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[0-9]/.test(password)) {
            result.errors.push('Password must contain at least one number');
        }

        if (!/[^a-zA-Z0-9]/.test(password)) {
            result.errors.push('Password must contain at least one special character');
        }

        // Calculate strength
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score >= 4) result.strength = 'strong';
        else if (score >= 3) result.strength = 'medium';
        else result.strength = 'weak';

        if (result.errors.length > 0) {
            result.isValid = false;
        }

        return result;
    }

    /**
     * Sanitize HTML input
     * @param {string} input - Input to sanitize
     * @returns {string}
     */
    sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Sanitize text input
     * @param {string} input - Input to sanitize
     * @returns {string}
     */
    sanitizeText(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Validate and sanitize form data
     * @param {Object} formData - Form data to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result
     */
    validateFormData(formData, rules) {
        const result = {
            isValid: true,
            errors: {},
            sanitizedData: {}
        };

        for (const [field, value] of Object.entries(formData)) {
            const rule = rules[field];
            if (!rule) continue;

            let sanitizedValue = value;

            // Sanitize based on type
            if (rule.type === 'email') {
                sanitizedValue = this.sanitizeText(value);
                if (!this.validateEmail(sanitizedValue)) {
                    result.isValid = false;
                    result.errors[field] = 'Invalid email format';
                }
            } else if (rule.type === 'phone') {
                sanitizedValue = this.sanitizeText(value);
                if (!this.validatePhone(sanitizedValue)) {
                    result.isValid = false;
                    result.errors[field] = 'Invalid phone number format';
                }
            } else if (rule.type === 'password') {
                const passwordValidation = this.validatePassword(value);
                if (!passwordValidation.isValid) {
                    result.isValid = false;
                    result.errors[field] = passwordValidation.errors.join(', ');
                }
            } else if (rule.type === 'text') {
                sanitizedValue = this.sanitizeText(value);
            } else if (rule.type === 'html') {
                sanitizedValue = this.sanitizeHTML(value);
            }

            // Check required
            if (rule.required && (!sanitizedValue || sanitizedValue.trim() === '')) {
                result.isValid = false;
                result.errors[field] = 'This field is required';
            }

            // Check min/max length
            if (sanitizedValue && rule.minLength && sanitizedValue.length < rule.minLength) {
                result.isValid = false;
                result.errors[field] = `Minimum length is ${rule.minLength} characters`;
            }

            if (sanitizedValue && rule.maxLength && sanitizedValue.length > rule.maxLength) {
                result.isValid = false;
                result.errors[field] = `Maximum length is ${rule.maxLength} characters`;
            }

            result.sanitizedData[field] = sanitizedValue;
        }

        return result;
    }

    /**
     * Check if account is locked
     * @param {string} identifier - Account identifier
     * @returns {boolean}
     */
    isAccountLocked(identifier) {
        return this.lockedAccounts.has(identifier);
    }

    /**
     * Record login attempt
     * @param {string} identifier - Account identifier
     * @param {boolean} success - Whether login was successful
     */
    recordLoginAttempt(identifier, success) {
        if (success) {
            this.loginAttempts.delete(identifier);
            this.lockedAccounts.delete(identifier);
            return;
        }

        const attempts = this.loginAttempts.get(identifier) || 0;
        const newAttempts = attempts + 1;
        this.loginAttempts.set(identifier, newAttempts);

        const maxAttempts = this.config.security.maxLoginAttempts || 5;
        if (newAttempts >= maxAttempts) {
            this.lockAccount(identifier);
        }
    }

    /**
     * Lock account
     * @param {string} identifier - Account identifier
     */
    lockAccount(identifier) {
        this.lockedAccounts.add(identifier);
        const lockoutDuration = this.config.security.lockoutDuration || 15 * 60 * 1000;
        
        setTimeout(() => {
            this.lockedAccounts.delete(identifier);
            this.loginAttempts.delete(identifier);
        }, lockoutDuration);

        this.saveLockedAccounts();
    }

    /**
     * Generate CSRF token
     * @returns {string}
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate CSRF token
     * @param {string} token - Token to validate
     * @returns {boolean}
     */
    validateCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return token === storedToken;
    }

    /**
     * Setup CSRF protection
     */
    setupCSRFProtection() {
        if (this.config.security.enableCSRF) {
            const token = this.generateCSRFToken();
            sessionStorage.setItem('csrf_token', token);
            
            // Add token to all forms
            document.addEventListener('DOMContentLoaded', () => {
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    const tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = 'csrf_token';
                    tokenInput.value = token;
                    form.appendChild(tokenInput);
                });
            });
        }
    }

    /**
     * Setup XSS protection
     */
    setupXSSProtection() {
        if (this.config.security.enableXSSProtection) {
            // Content Security Policy
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';";
            document.head.appendChild(meta);
        }
    }

    /**
     * Setup clickjacking protection
     */
    setupClickjackingProtection() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'X-Frame-Options';
        meta.content = 'DENY';
        document.head.appendChild(meta);
    }

    /**
     * Save locked accounts to localStorage
     */
    saveLockedAccounts() {
        const lockedArray = Array.from(this.lockedAccounts);
        localStorage.setItem('locked_accounts', JSON.stringify(lockedArray));
    }

    /**
     * Load locked accounts from localStorage
     */
    loadLockedAccounts() {
        try {
            const lockedArray = JSON.parse(localStorage.getItem('locked_accounts') || '[]');
            this.lockedAccounts = new Set(lockedArray);
        } catch (e) {
            console.error('Failed to load locked accounts:', e);
        }
    }

    /**
     * Encrypt sensitive data
     * @param {string} data - Data to encrypt
     * @returns {string}
     */
    encrypt(data) {
        // Simple base64 encoding for demo purposes
        // In production, use proper encryption
        return btoa(encodeURIComponent(data));
    }

    /**
     * Decrypt sensitive data
     * @param {string} encryptedData - Encrypted data
     * @returns {string}
     */
    decrypt(encryptedData) {
        try {
            return decodeURIComponent(atob(encryptedData));
        } catch (e) {
            console.error('Failed to decrypt data:', e);
            return '';
        }
    }

    /**
     * Validate file upload
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    validateFile(file, options = {}) {
        const result = {
            isValid: true,
            errors: []
        };

        const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
        const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];
        const allowedExtensions = options.allowedExtensions || ['.jpg', '.jpeg', '.png', '.gif'];

        if (file.size > maxSize) {
            result.isValid = false;
            result.errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        }

        if (!allowedTypes.includes(file.type)) {
            result.isValid = false;
            result.errors.push('File type not allowed');
        }

        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            result.isValid = false;
            result.errors.push('File extension not allowed');
        }

        return result;
    }
}

// Create global security manager instance
const securityManager = new SecurityManager();

// Export security manager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
} else {
    window.SecurityManager = SecurityManager;
    window.securityManager = securityManager;
}
