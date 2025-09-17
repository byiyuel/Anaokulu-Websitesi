/**
 * Enterprise Logger Utility
 * Centralized logging system with different levels and formatting
 */

class Logger {
    constructor() {
        this.config = window.getConfig ? window.getConfig() : { environment: { logLevel: 'info' } };
        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        this.currentLevel = this.logLevels[this.config.environment.logLevel] || 2;
        this.logs = [];
        this.maxLogs = 1000;
    }

    /**
     * Log error messages
     * @param {string} message - Error message
     * @param {Object} data - Additional data
     * @param {Error} error - Error object
     */
    error(message, data = null, error = null) {
        if (this.shouldLog('error')) {
            const logEntry = this.createLogEntry('error', message, data, error);
            this.logs.push(logEntry);
            console.error(`[ERROR] ${logEntry.timestamp} - ${message}`, data, error);
            this.reportError(logEntry);
        }
    }

    /**
     * Log warning messages
     * @param {string} message - Warning message
     * @param {Object} data - Additional data
     */
    warn(message, data = null) {
        if (this.shouldLog('warn')) {
            const logEntry = this.createLogEntry('warn', message, data);
            this.logs.push(logEntry);
            console.warn(`[WARN] ${logEntry.timestamp} - ${message}`, data);
        }
    }

    /**
     * Log info messages
     * @param {string} message - Info message
     * @param {Object} data - Additional data
     */
    info(message, data = null) {
        if (this.shouldLog('info')) {
            const logEntry = this.createLogEntry('info', message, data);
            this.logs.push(logEntry);
            console.info(`[INFO] ${logEntry.timestamp} - ${message}`, data);
        }
    }

    /**
     * Log debug messages
     * @param {string} message - Debug message
     * @param {Object} data - Additional data
     */
    debug(message, data = null) {
        if (this.shouldLog('debug')) {
            const logEntry = this.createLogEntry('debug', message, data);
            this.logs.push(logEntry);
            console.debug(`[DEBUG] ${logEntry.timestamp} - ${message}`, data);
        }
    }

    /**
     * Check if message should be logged based on current log level
     * @param {string} level - Log level
     * @returns {boolean}
     */
    shouldLog(level) {
        return this.logLevels[level] <= this.currentLevel;
    }

    /**
     * Create structured log entry
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     * @param {Error} error - Error object
     * @returns {Object}
     */
    createLogEntry(level, message, data = null, error = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };

        if (data) {
            entry.data = data;
        }

        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack
            };
        }

        return entry;
    }

    /**
     * Get or create session ID
     * @returns {string}
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('logger_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('logger_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Report error to external service (if configured)
     * @param {Object} logEntry - Log entry
     */
    reportError(logEntry) {
        if (this.config.errorHandling && this.config.errorHandling.enableErrorReporting) {
            // In a real application, this would send to an error reporting service
            this.sendToErrorService(logEntry);
        }
    }

    /**
     * Send error to external error reporting service
     * @param {Object} logEntry - Log entry
     */
    sendToErrorService(logEntry) {
        try {
            // Example: Send to external service
            if (navigator.sendBeacon) {
                const errorData = JSON.stringify(logEntry);
                navigator.sendBeacon('/api/errors', errorData);
            }
        } catch (e) {
            console.error('Failed to send error report:', e);
        }
    }

    /**
     * Get all logs
     * @returns {Array}
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Export logs as JSON
     * @returns {string}
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }

    /**
     * Set log level
     * @param {string} level - Log level
     */
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLevel = this.logLevels[level];
        }
    }

    /**
     * Get current log level
     * @returns {string}
     */
    getLogLevel() {
        return Object.keys(this.logLevels)[this.currentLevel];
    }

    /**
     * Log performance metrics
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in milliseconds
     * @param {Object} metadata - Additional metadata
     */
    performance(operation, duration, metadata = {}) {
        this.info(`Performance: ${operation} took ${duration}ms`, {
            operation,
            duration,
            ...metadata
        });
    }

    /**
     * Log user action
     * @param {string} action - User action
     * @param {Object} data - Action data
     */
    userAction(action, data = {}) {
        this.info(`User Action: ${action}`, {
            action,
            ...data,
            timestamp: Date.now()
        });
    }
}

// Create global logger instance
const logger = new Logger();

// Export logger
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
} else {
    window.Logger = Logger;
    window.logger = logger;
}
