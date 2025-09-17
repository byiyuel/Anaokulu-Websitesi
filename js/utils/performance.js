/**
 * Enterprise Performance Utility
 * Performance monitoring, optimization, and caching utilities
 */

class PerformanceManager {
    constructor() {
        this.config = window.getConfig ? window.getConfig() : { performance: {} };
        this.metrics = new Map();
        this.cache = new Map();
        this.observers = new Map();
        this.init();
    }

    /**
     * Initialize performance manager
     */
    init() {
        this.setupPerformanceObserver();
        this.setupResourceTiming();
        this.setupNavigationTiming();
        this.setupMemoryMonitoring();
        this.setupLazyLoading();
        this.setupImageOptimization();
    }

    /**
     * Start performance measurement
     * @param {string} name - Measurement name
     * @returns {Object} Measurement object
     */
    startMeasurement(name) {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        return {
            name,
            startTime,
            startMemory,
            end: () => this.endMeasurement(name, startTime, startMemory)
        };
    }

    /**
     * End performance measurement
     * @param {string} name - Measurement name
     * @param {number} startTime - Start time
     * @param {number} startMemory - Start memory
     */
    endMeasurement(name, startTime, startMemory) {
        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();
        const duration = endTime - startTime;
        const memoryDelta = endMemory - startMemory;

        const measurement = {
            name,
            duration,
            memoryDelta,
            timestamp: Date.now(),
            url: window.location.href
        };

        this.metrics.set(name, measurement);
        
        if (window.logger) {
            window.logger.performance(name, duration, { memoryDelta });
        }

        return measurement;
    }

    /**
     * Get memory usage
     * @returns {number} Memory usage in bytes
     */
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }

    /**
     * Setup Performance Observer
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.handlePerformanceEntry(entry);
                    }
                });

                observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
                this.observers.set('performance', observer);
            } catch (e) {
                console.warn('Performance Observer not supported:', e);
            }
        }
    }

    /**
     * Handle performance entry
     * @param {PerformanceEntry} entry - Performance entry
     */
    handlePerformanceEntry(entry) {
        const data = {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            entryType: entry.entryType,
            timestamp: Date.now()
        };

        if (entry.entryType === 'resource') {
            data.size = entry.transferSize || 0;
            data.type = this.getResourceType(entry.name);
        }

        this.metrics.set(`entry_${entry.name}`, data);
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
     * Setup Resource Timing
     */
    setupResourceTiming() {
        if (performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                this.handlePerformanceEntry(resource);
            });
        }
    }

    /**
     * Setup Navigation Timing
     */
    setupNavigationTiming() {
        if (performance.getEntriesByType) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const timing = {
                    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                    tcp: navigation.connectEnd - navigation.connectStart,
                    request: navigation.responseStart - navigation.requestStart,
                    response: navigation.responseEnd - navigation.responseStart,
                    dom: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                    load: navigation.loadEventEnd - navigation.navigationStart
                };

                this.metrics.set('navigation_timing', timing);
            }
        }
    }

    /**
     * Setup Memory Monitoring
     */
    setupMemoryMonitoring() {
        if (performance.memory) {
            setInterval(() => {
                const memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };

                this.metrics.set('memory_usage', memory);

                // Check for memory leaks
                if (memory.used > memory.limit * 0.8) {
                    console.warn('High memory usage detected:', memory);
                    if (window.logger) {
                        window.logger.warn('High memory usage', memory);
                    }
                }
            }, 30000); // Check every 30 seconds
        }
    }

    /**
     * Setup Lazy Loading
     */
    setupLazyLoading() {
        if (this.config.performance.enableLazyLoading && 'IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.addEventListener('DOMContentLoaded', () => {
                const lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    imageObserver.observe(img);
                });
            });

            this.observers.set('lazy_images', imageObserver);
        }
    }

    /**
     * Setup Image Optimization
     */
    setupImageOptimization() {
        if (this.config.performance.enableImageOptimization) {
            document.addEventListener('DOMContentLoaded', () => {
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    this.optimizeImage(img);
                });
            });
        }
    }

    /**
     * Optimize image
     * @param {HTMLImageElement} img - Image element
     */
    optimizeImage(img) {
        // Add loading="lazy" for native lazy loading
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }

        // Add error handling
        img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn('Image failed to load:', img.src);
        });

        // Add loading state
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    }

    /**
     * Cache data
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    cache(key, data, ttl = null) {
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.config.performance.cacheDuration || 24 * 60 * 60 * 1000
        };

        this.cache.set(key, cacheEntry);
        this.cleanupCache();
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {*} Cached data or null
     */
    getCached(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Cleanup expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
     * Preload resource
     * @param {string} url - Resource URL
     * @param {string} type - Resource type
     */
    preload(url, type = 'script') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = type;
        document.head.appendChild(link);
    }

    /**
     * Prefetch resource
     * @param {string} url - Resource URL
     */
    prefetch(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        const metrics = {};
        for (const [key, value] of this.metrics.entries()) {
            metrics[key] = value;
        }
        return metrics;
    }

    /**
     * Export performance data
     * @returns {string} Performance data as JSON
     */
    exportMetrics() {
        return JSON.stringify(this.getMetrics(), null, 2);
    }

    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics.clear();
    }

    /**
     * Get Core Web Vitals
     * @returns {Object} Core Web Vitals
     */
    getCoreWebVitals() {
        const vitals = {};

        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    vitals.lcp = lastEntry.startTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('LCP observer not supported:', e);
            }

            // First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        vitals.fid = entry.processingStart - entry.startTime;
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('FID observer not supported:', e);
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
                    vitals.cls = clsValue;
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                console.warn('CLS observer not supported:', e);
            }
        }

        return vitals;
    }

    /**
     * Cleanup observers
     */
    cleanup() {
        for (const observer of this.observers.values()) {
            observer.disconnect();
        }
        this.observers.clear();
    }
}

// Create global performance manager instance
const performanceManager = new PerformanceManager();

// Export performance manager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
} else {
    window.PerformanceManager = PerformanceManager;
    window.performanceManager = performanceManager;
}
