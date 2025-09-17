/**
 * Enterprise Analytics Utility
 * Google Analytics 4 integration with custom event tracking
 */

class AnalyticsManager {
    constructor() {
        this.config = window.getConfig ? window.getConfig() : { analytics: {} };
        this.isInitialized = false;
        this.customEvents = new Map();
        this.init();
    }

    /**
     * Initialize Google Analytics
     */
    init() {
        if (this.config.analytics.enableGoogleAnalytics && this.config.analytics.googleAnalyticsId) {
            this.loadGoogleAnalytics();
        }
        
        if (this.config.analytics.enableCustomAnalytics) {
            this.setupCustomAnalytics();
        }
    }

    /**
     * Load Google Analytics script
     */
    loadGoogleAnalytics() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.analytics.googleAnalyticsId}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', this.config.analytics.googleAnalyticsId, {
            anonymize_ip: this.config.analytics.anonymizeIP,
            send_page_view: true
        });

        this.isInitialized = true;
        console.log('Google Analytics initialized');
    }

    /**
     * Setup custom analytics
     */
    setupCustomAnalytics() {
        this.customEvents = new Map();
        this.setupPerformanceTracking();
        this.setupUserInteractionTracking();
        this.setupErrorTracking();
    }

    /**
     * Track page view
     * @param {string} page - Page name
     * @param {string} title - Page title
     */
    trackPageView(page, title) {
        if (this.isInitialized && window.gtag) {
            gtag('config', this.config.analytics.googleAnalyticsId, {
                page_title: title,
                page_location: window.location.href,
                page_path: page
            });
        }

        this.trackCustomEvent('page_view', {
            page: page,
            title: title,
            url: window.location.href,
            timestamp: Date.now()
        });
    }

    /**
     * Track custom event
     * @param {string} eventName - Event name
     * @param {Object} parameters - Event parameters
     */
    trackEvent(eventName, parameters = {}) {
        if (this.isInitialized && window.gtag) {
            gtag('event', eventName, {
                ...parameters,
                timestamp: Date.now()
            });
        }

        this.trackCustomEvent(eventName, parameters);
    }

    /**
     * Track custom event (internal)
     * @param {string} eventName - Event name
     * @param {Object} parameters - Event parameters
     */
    trackCustomEvent(eventName, parameters = {}) {
        const event = {
            name: eventName,
            parameters: parameters,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Store in custom events
        if (!this.customEvents.has(eventName)) {
            this.customEvents.set(eventName, []);
        }
        this.customEvents.get(eventName).push(event);

        // Limit stored events
        const events = this.customEvents.get(eventName);
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }

        // Log to console in development
        if (this.config.environment.debug) {
            console.log('Analytics Event:', event);
        }
    }

    /**
     * Track user interaction
     * @param {string} action - Action type
     * @param {string} element - Element interacted with
     * @param {Object} data - Additional data
     */
    trackUserInteraction(action, element, data = {}) {
        this.trackEvent('user_interaction', {
            action: action,
            element: element,
            ...data
        });
    }

    /**
     * Track form submission
     * @param {string} formName - Form name
     * @param {boolean} success - Whether submission was successful
     * @param {Object} data - Form data
     */
    trackFormSubmission(formName, success, data = {}) {
        this.trackEvent('form_submission', {
            form_name: formName,
            success: success,
            ...data
        });
    }

    /**
     * Track performance metrics
     * @param {string} metric - Metric name
     * @param {number} value - Metric value
     * @param {Object} data - Additional data
     */
    trackPerformance(metric, value, data = {}) {
        this.trackEvent('performance_metric', {
            metric: metric,
            value: value,
            ...data
        });
    }

    /**
     * Track error
     * @param {string} errorType - Error type
     * @param {string} errorMessage - Error message
     * @param {Object} data - Additional data
     */
    trackError(errorType, errorMessage, data = {}) {
        this.trackEvent('error', {
            error_type: errorType,
            error_message: errorMessage,
            ...data
        });
    }

    /**
     * Setup performance tracking
     */
    setupPerformanceTracking() {
        if ('PerformanceObserver' in window) {
            // Track Core Web Vitals
            this.trackCoreWebVitals();
            
            // Track resource loading
            this.trackResourceLoading();
        }
    }

    /**
     * Track Core Web Vitals
     */
    trackCoreWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.trackPerformance('lcp', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP tracking not supported:', e);
            }

            // First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        const fid = entry.processingStart - entry.startTime;
                        this.trackPerformance('fid', fid);
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID tracking not supported:', e);
            }

            // Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.trackPerformance('cls', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS tracking not supported:', e);
            }
        }
    }

    /**
     * Track resource loading
     */
    trackResourceLoading() {
        if ('PerformanceObserver' in window) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackPerformance('resource_load', entry.duration, {
                            resource_type: this.getResourceType(entry.name),
                            resource_size: entry.transferSize || 0
                        });
                    }
                });
                resourceObserver.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.warn('Resource tracking not supported:', e);
            }
        }
    }

    /**
     * Get resource type from URL
     * @param {string} url - Resource URL
     * @returns {string} Resource type
     */
    getResourceType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const types = {
            'js': 'script',
            'css': 'stylesheet',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font',
            'eot': 'font'
        };
        return types[extension] || 'other';
    }

    /**
     * Setup user interaction tracking
     */
    setupUserInteractionTracking() {
        // Track clicks
        document.addEventListener('click', (e) => {
            const element = e.target;
            const elementType = element.tagName.toLowerCase();
            const elementId = element.id || element.className || 'unknown';
            
            this.trackUserInteraction('click', `${elementType}#${elementId}`, {
                text: element.textContent?.substring(0, 100) || '',
                href: element.href || ''
            });
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formName = form.name || form.id || 'unknown';
            
            this.trackFormSubmission(formName, true, {
                form_action: form.action || '',
                form_method: form.method || 'get'
            });
        });

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.trackUserInteraction('scroll_depth', 'page', {
                    depth: scrollDepth
                });
            }
        }, 1000));
    }

    /**
     * Setup error tracking
     */
    setupErrorTracking() {
        // Track JavaScript errors
        window.addEventListener('error', (e) => {
            this.trackError('javascript_error', e.message, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error?.stack || ''
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError('unhandled_promise_rejection', e.reason?.message || 'Unknown error', {
                stack: e.reason?.stack || ''
            });
        });
    }

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Get analytics data
     * @returns {Object} Analytics data
     */
    getAnalyticsData() {
        const data = {
            customEvents: {},
            timestamp: Date.now(),
            url: window.location.href
        };

        for (const [eventName, events] of this.customEvents.entries()) {
            data.customEvents[eventName] = events;
        }

        return data;
    }

    /**
     * Export analytics data
     * @returns {string} Analytics data as JSON
     */
    exportAnalyticsData() {
        return JSON.stringify(this.getAnalyticsData(), null, 2);
    }

    /**
     * Clear analytics data
     */
    clearAnalyticsData() {
        this.customEvents.clear();
    }
}

// Create global analytics manager instance
const analyticsManager = new AnalyticsManager();

// Export analytics manager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
} else {
    window.AnalyticsManager = AnalyticsManager;
    window.analyticsManager = analyticsManager;
}
