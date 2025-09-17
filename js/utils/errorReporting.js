/**
 * Enterprise Error Reporting Utility
 * Comprehensive error tracking and reporting system
 */

class ErrorReportingManager {
    constructor() {
        this.config = window.getConfig ? window.getConfig() : { errorHandling: {} };
        this.errors = [];
        this.maxErrors = this.config.errorHandling.maxErrorReports || 100;
        this.init();
    }

    /**
     * Initialize error reporting
     */
    init() {
        if (this.config.errorHandling.enableGlobalErrorHandler) {
            this.setupGlobalErrorHandler();
        }
        
        if (this.config.errorHandling.enableErrorReporting) {
            this.setupErrorReporting();
        }
        
        if (this.config.errorHandling.enableUserFeedback) {
            this.setupUserFeedback();
        }
    }

    /**
     * Setup global error handler
     */
    setupGlobalErrorHandler() {
        // JavaScript errors
        window.addEventListener('error', (e) => {
            this.reportError({
                type: 'javascript_error',
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error?.stack || '',
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.reportError({
                type: 'unhandled_promise_rejection',
                message: e.reason?.message || 'Unknown error',
                stack: e.reason?.stack || '',
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        // Resource loading errors
        window.addEventListener('error', (e) => {
            if (e.target !== window) {
                this.reportError({
                    type: 'resource_error',
                    message: `Failed to load resource: ${e.target.src || e.target.href}`,
                    element: e.target.tagName,
                    src: e.target.src || e.target.href,
                    timestamp: Date.now(),
                    url: window.location.href
                });
            }
        }, true);
    }

    /**
     * Setup error reporting
     */
    setupErrorReporting() {
        // Send errors to external service
        this.setupExternalReporting();
        
        // Store errors locally
        this.setupLocalStorage();
        
        // Send errors in batches
        this.setupBatchReporting();
    }

    /**
     * Setup external reporting
     */
    setupExternalReporting() {
        // This would integrate with services like Sentry, LogRocket, etc.
        // For now, we'll simulate external reporting
        this.externalReportingEnabled = true;
    }

    /**
     * Setup local storage
     */
    setupLocalStorage() {
        // Load existing errors
        try {
            const storedErrors = localStorage.getItem('error_reports');
            if (storedErrors) {
                this.errors = JSON.parse(storedErrors);
            }
        } catch (e) {
            console.warn('Failed to load stored errors:', e);
        }
    }

    /**
     * Setup batch reporting
     */
    setupBatchReporting() {
        // Send errors in batches every 30 seconds
        setInterval(() => {
            this.sendBatchErrors();
        }, 30000);
    }

    /**
     * Report error
     * @param {Object} errorData - Error data
     */
    reportError(errorData) {
        const error = {
            id: this.generateErrorId(),
            ...errorData,
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            environment: this.getEnvironment()
        };

        // Add to errors array
        this.errors.push(error);
        
        // Limit stored errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Store locally
        this.storeErrorsLocally();

        // Send to external service
        if (this.externalReportingEnabled) {
            this.sendErrorToExternalService(error);
        }

        // Log to console in development
        if (this.config.environment.debug) {
            console.error('Error reported:', error);
        }

        // Track with analytics
        if (window.analyticsManager) {
            window.analyticsManager.trackError(error.type, error.message, {
                filename: error.filename,
                lineno: error.lineno
            });
        }
    }

    /**
     * Generate error ID
     * @returns {string} Error ID
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get session ID
     * @returns {string} Session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('error_reporting_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('error_reporting_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Get user ID
     * @returns {string} User ID
     */
    getUserId() {
        // In a real application, this would come from authentication
        return localStorage.getItem('user_id') || 'anonymous';
    }

    /**
     * Get environment
     * @returns {string} Environment
     */
    getEnvironment() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        return 'production';
    }

    /**
     * Store errors locally
     */
    storeErrorsLocally() {
        try {
            localStorage.setItem('error_reports', JSON.stringify(this.errors));
        } catch (e) {
            console.warn('Failed to store errors locally:', e);
        }
    }

    /**
     * Send error to external service
     * @param {Object} error - Error data
     */
    sendErrorToExternalService(error) {
        try {
            // Simulate sending to external service
            if (navigator.sendBeacon) {
                const errorData = JSON.stringify(error);
                navigator.sendBeacon('/api/errors', errorData);
            } else {
                // Fallback to fetch
                fetch('/api/errors', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(error)
                }).catch(e => {
                    console.warn('Failed to send error to external service:', e);
                });
            }
        } catch (e) {
            console.warn('Failed to send error to external service:', e);
        }
    }

    /**
     * Send batch errors
     */
    sendBatchErrors() {
        if (this.errors.length === 0) return;

        const batchErrors = this.errors.filter(error => !error.sent);
        
        if (batchErrors.length > 0) {
            try {
                if (navigator.sendBeacon) {
                    const batchData = JSON.stringify({
                        errors: batchErrors,
                        timestamp: Date.now(),
                        sessionId: this.getSessionId()
                    });
                    navigator.sendBeacon('/api/errors/batch', batchData);
                } else {
                    fetch('/api/errors/batch', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            errors: batchErrors,
                            timestamp: Date.now(),
                            sessionId: this.getSessionId()
                        })
                    }).catch(e => {
                        console.warn('Failed to send batch errors:', e);
                    });
                }

                // Mark errors as sent
                batchErrors.forEach(error => {
                    error.sent = true;
                });

                this.storeErrorsLocally();
            } catch (e) {
                console.warn('Failed to send batch errors:', e);
            }
        }
    }

    /**
     * Setup user feedback
     */
    setupUserFeedback() {
        this.addFeedbackButton();
        this.setupFeedbackModal();
    }

    /**
     * Add feedback button
     */
    addFeedbackButton() {
        const feedbackButton = document.createElement('button');
        feedbackButton.innerHTML = '🐛 Report Bug';
        feedbackButton.className = 'feedback-button';
        feedbackButton.setAttribute('aria-label', 'Report a bug or issue');
        
        // Style the button
        feedbackButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #6c5ce7;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        `;

        feedbackButton.addEventListener('click', () => {
            this.showFeedbackModal();
        });

        feedbackButton.addEventListener('mouseenter', () => {
            feedbackButton.style.transform = 'scale(1.05)';
        });

        feedbackButton.addEventListener('mouseleave', () => {
            feedbackButton.style.transform = 'scale(1)';
        });

        document.body.appendChild(feedbackButton);
    }

    /**
     * Setup feedback modal
     */
    setupFeedbackModal() {
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-modal-content">
                <div class="feedback-modal-header">
                    <h3>Report a Bug</h3>
                    <button class="feedback-close-btn" aria-label="Close feedback modal">&times;</button>
                </div>
                <form class="feedback-form">
                    <div class="form-group">
                        <label for="feedback-type">Issue Type:</label>
                        <select id="feedback-type" required>
                            <option value="">Select issue type</option>
                            <option value="bug">Bug</option>
                            <option value="feature">Feature Request</option>
                            <option value="ui">UI/UX Issue</option>
                            <option value="performance">Performance Issue</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="feedback-description">Description:</label>
                        <textarea id="feedback-description" required placeholder="Describe the issue..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="feedback-steps">Steps to Reproduce:</label>
                        <textarea id="feedback-steps" placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="feedback-email">Email (optional):</label>
                        <input type="email" id="feedback-email" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="feedback-include-data"> Include technical data (browser info, console logs)
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary feedback-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit Report</button>
                    </div>
                </form>
            </div>
        `;

        // Style the modal
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
        `;

        const content = modal.querySelector('.feedback-modal-content');
        content.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.feedback-close-btn').addEventListener('click', () => {
            this.hideFeedbackModal();
        });

        modal.querySelector('.feedback-cancel').addEventListener('click', () => {
            this.hideFeedbackModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideFeedbackModal();
            }
        });

        modal.querySelector('.feedback-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback(e.target);
        });
    }

    /**
     * Show feedback modal
     */
    showFeedbackModal() {
        const modal = document.querySelector('.feedback-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    /**
     * Hide feedback modal
     */
    hideFeedbackModal() {
        const modal = document.querySelector('.feedback-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Submit feedback
     * @param {HTMLFormElement} form - Feedback form
     */
    submitFeedback(form) {
        const formData = new FormData(form);
        const feedback = {
            type: formData.get('feedback-type'),
            description: formData.get('feedback-description'),
            steps: formData.get('feedback-steps'),
            email: formData.get('feedback-email'),
            includeData: formData.get('feedback-include-data') === 'on',
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };

        // Include technical data if requested
        if (feedback.includeData) {
            feedback.technicalData = {
                screenResolution: `${screen.width}x${screen.height}`,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                browserInfo: this.getBrowserInfo(),
                consoleLogs: this.getConsoleLogs(),
                recentErrors: this.errors.slice(-5)
            };
        }

        // Report as user feedback error
        this.reportError({
            type: 'user_feedback',
            message: `User feedback: ${feedback.type}`,
            description: feedback.description,
            steps: feedback.steps,
            email: feedback.email,
            technicalData: feedback.technicalData,
            timestamp: feedback.timestamp,
            url: feedback.url,
            userAgent: feedback.userAgent
        });

        // Show success message
        this.showSuccessMessage('Thank you for your feedback! We\'ll look into this issue.');

        // Hide modal
        this.hideFeedbackModal();

        // Reset form
        form.reset();
    }

    /**
     * Get browser info
     * @returns {Object} Browser information
     */
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }

    /**
     * Get console logs
     * @returns {Array} Console logs
     */
    getConsoleLogs() {
        // This would require intercepting console methods
        // For now, return empty array
        return [];
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 10001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Get error report
     * @returns {Object} Error report
     */
    getErrorReport() {
        return {
            totalErrors: this.errors.length,
            errorsByType: this.getErrorsByType(),
            errorsByTime: this.getErrorsByTime(),
            recentErrors: this.errors.slice(-10),
            timestamp: Date.now()
        };
    }

    /**
     * Get errors by type
     * @returns {Object} Errors grouped by type
     */
    getErrorsByType() {
        const errorsByType = {};
        this.errors.forEach(error => {
            if (!errorsByType[error.type]) {
                errorsByType[error.type] = 0;
            }
            errorsByType[error.type]++;
        });
        return errorsByType;
    }

    /**
     * Get errors by time
     * @returns {Object} Errors grouped by time
     */
    getErrorsByTime() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;

        return {
            lastHour: this.errors.filter(e => now - e.timestamp < oneHour).length,
            lastDay: this.errors.filter(e => now - e.timestamp < oneDay).length,
            total: this.errors.length
        };
    }

    /**
     * Export error data
     * @returns {string} Error data as JSON
     */
    exportErrorData() {
        return JSON.stringify(this.getErrorReport(), null, 2);
    }

    /**
     * Clear error data
     */
    clearErrorData() {
        this.errors = [];
        localStorage.removeItem('error_reports');
    }
}

// Create global error reporting manager instance
const errorReportingManager = new ErrorReportingManager();

// Export error reporting manager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorReportingManager;
} else {
    window.ErrorReportingManager = ErrorReportingManager;
    window.errorReportingManager = errorReportingManager;
}
