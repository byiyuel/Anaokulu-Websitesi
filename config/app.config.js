/**
 * Application Configuration
 * Enterprise-level configuration management
 */

const AppConfig = {
    // Application Information
    app: {
        name: 'Renkli Dünya Anaokulu',
        version: '1.0.0',
        description: 'Modern, responsive anaokulu web sitesi',
        author: 'Renkli Dünya Anaokulu',
        email: 'info@renklidunya.com',
        phone: '+90 (212) 555 0123',
        address: 'Örnek Mahallesi, Çocuk Sokak No:123, İstanbul, Türkiye'
    },

    // Environment Configuration
    environment: {
        development: {
            apiUrl: 'http://localhost:3000',
            debug: true,
            logLevel: 'debug'
        },
        production: {
            apiUrl: 'https://renklidunya.com',
            debug: false,
            logLevel: 'error'
        }
    },

    // Security Configuration
    security: {
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        passwordMinLength: 6,
        enableCSRF: true,
        enableXSSProtection: true
    },

    // Feature Flags
    features: {
        enableAnalytics: true,
        enableNotifications: true,
        enableOfflineMode: true,
        enablePWA: true,
        enableContactForm: true,
        enableAdminPanel: true,
        enableBlog: true,
        enableActivities: true
    },

    // Performance Configuration
    performance: {
        enableLazyLoading: true,
        enableImageOptimization: true,
        enableCaching: true,
        cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
        maxImageSize: 5 * 1024 * 1024, // 5MB
        enableCompression: true
    },

    // UI Configuration
    ui: {
        theme: 'modern',
        language: 'tr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        itemsPerPage: 10,
        enableAnimations: true,
        animationDuration: 300
    },

    // API Configuration
    api: {
        timeout: 10000, // 10 seconds
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
        enableCaching: true
    },

    // Storage Configuration
    storage: {
        prefix: 'renkli_dunya_',
        enableCompression: true,
        maxStorageSize: 10 * 1024 * 1024, // 10MB
        enableBackup: true
    },

    // Notification Configuration
    notifications: {
        enablePush: true,
        enableEmail: true,
        enableSMS: false,
        defaultDuration: 5000 // 5 seconds
    },

    // Analytics Configuration
    analytics: {
        enableGoogleAnalytics: false,
        enableCustomAnalytics: true,
        trackUserInteractions: true,
        trackPerformance: true,
        anonymizeIP: true
    },

    // Error Handling Configuration
    errorHandling: {
        enableGlobalErrorHandler: true,
        enableErrorReporting: true,
        enableUserFeedback: true,
        maxErrorReports: 100
    },

    // Development Configuration
    development: {
        enableHotReload: true,
        enableSourceMaps: true,
        enableDebugTools: true,
        mockData: false
    }
};

// Environment detection
const getCurrentEnvironment = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    }
    return 'production';
};

// Get current configuration
const getConfig = () => {
    const env = getCurrentEnvironment();
    return {
        ...AppConfig,
        environment: AppConfig.environment[env],
        currentEnvironment: env
    };
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppConfig, getConfig };
} else {
    window.AppConfig = AppConfig;
    window.getConfig = getConfig;
}
