/**
 * Enterprise Accessibility Utility
 * WCAG 2.1 AA compliance and accessibility enhancements
 */

class AccessibilityManager {
    constructor() {
        this.config = window.getConfig ? window.getConfig() : { ui: {} };
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupColorContrast();
        this.setupAriaLabels();
        this.setupSkipLinks();
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Add keyboard event listeners
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Make all interactive elements focusable
        this.makeElementsFocusable();
        
        // Add focus indicators
        this.addFocusIndicators();
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardNavigation(e) {
        const { key, ctrlKey, altKey, shiftKey } = e;
        
        // Skip to main content (Alt + M)
        if (altKey && key === 'm') {
            e.preventDefault();
            this.skipToMainContent();
        }
        
        // Skip to navigation (Alt + N)
        if (altKey && key === 'n') {
            e.preventDefault();
            this.skipToNavigation();
        }
        
        // Skip to footer (Alt + F)
        if (altKey && key === 'f') {
            e.preventDefault();
            this.skipToFooter();
        }
        
        // Close modal with Escape
        if (key === 'Escape') {
            this.closeModals();
        }
        
        // Tab navigation enhancement
        if (key === 'Tab') {
            this.enhanceTabNavigation(e);
        }
    }

    /**
     * Make elements focusable
     */
    makeElementsFocusable() {
        // Make divs with click handlers focusable
        const clickableDivs = document.querySelectorAll('div[onclick], div.clickable');
        clickableDivs.forEach(div => {
            if (!div.hasAttribute('tabindex')) {
                div.setAttribute('tabindex', '0');
            }
        });

        // Make cards focusable
        const cards = document.querySelectorAll('.card, .blog-card, .activity-card');
        cards.forEach(card => {
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
        });
    }

    /**
     * Add focus indicators
     */
    addFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #6c5ce7 !important;
                outline-offset: 2px !important;
            }
            
            .focus-visible {
                box-shadow: 0 0 0 2px #6c5ce7 !important;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #6c5ce7;
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 1000;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup screen reader support
     */
    setupScreenReaderSupport() {
        // Add screen reader only text
        this.addScreenReaderText();
        
        // Add live regions for dynamic content
        this.addLiveRegions();
        
        // Enhance form labels
        this.enhanceFormLabels();
    }

    /**
     * Add screen reader only text
     */
    addScreenReaderText() {
        const style = document.createElement('style');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Add live regions for dynamic content
     */
    addLiveRegions() {
        // Add live region for notifications
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    /**
     * Enhance form labels
     */
    enhanceFormLabels() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
                } else {
                    const placeholder = input.getAttribute('placeholder');
                    if (placeholder) {
                        input.setAttribute('aria-label', placeholder);
                    }
                }
            }
        });
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Trap focus in modals
        this.setupModalFocusTrap();
        
        // Manage focus on page load
        this.setupPageLoadFocus();
        
        // Manage focus on navigation
        this.setupNavigationFocus();
    }

    /**
     * Setup modal focus trap
     */
    setupModalFocusTrap() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocusInModal(modal, e);
                }
            });
        });
    }

    /**
     * Trap focus in modal
     * @param {HTMLElement} modal - Modal element
     * @param {KeyboardEvent} e - Keyboard event
     */
    trapFocusInModal(modal, e) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    /**
     * Setup page load focus
     */
    setupPageLoadFocus() {
        document.addEventListener('DOMContentLoaded', () => {
            // Focus on main content
            const main = document.querySelector('main');
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus();
            }
        });
    }

    /**
     * Setup navigation focus
     */
    setupNavigationFocus() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('focus', () => {
                link.setAttribute('aria-current', 'page');
            });
            
            link.addEventListener('blur', () => {
                link.removeAttribute('aria-current');
            });
        });
    }

    /**
     * Setup color contrast
     */
    setupColorContrast() {
        // Add high contrast mode support
        this.addHighContrastMode();
        
        // Check color contrast ratios
        this.checkColorContrast();
    }

    /**
     * Add high contrast mode
     */
    addHighContrastMode() {
        const style = document.createElement('style');
        style.textContent = `
            @media (prefers-contrast: high) {
                * {
                    background: white !important;
                    color: black !important;
                }
                
                .gradient {
                    background: white !important;
                }
                
                button, .btn {
                    border: 2px solid black !important;
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Check color contrast
     */
    checkColorContrast() {
        // This would typically use a color contrast checking library
        // For now, we'll add a basic implementation
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            // Basic contrast check (simplified)
            if (color && backgroundColor && color !== backgroundColor) {
                element.setAttribute('data-contrast-checked', 'true');
            }
        });
    }

    /**
     * Setup ARIA labels
     */
    setupAriaLabels() {
        this.addAriaLabels();
        this.addAriaDescribedBy();
        this.addAriaExpanded();
        this.addAriaHidden();
    }

    /**
     * Add ARIA labels
     */
    addAriaLabels() {
        // Add labels to buttons without text
        const iconButtons = document.querySelectorAll('button i, .btn i');
        iconButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon && !button.getAttribute('aria-label')) {
                const iconClass = icon.className;
                let label = 'Button';
                
                if (iconClass.includes('fa-plus')) label = 'Add';
                else if (iconClass.includes('fa-edit')) label = 'Edit';
                else if (iconClass.includes('fa-trash')) label = 'Delete';
                else if (iconClass.includes('fa-save')) label = 'Save';
                else if (iconClass.includes('fa-close')) label = 'Close';
                else if (iconClass.includes('fa-menu')) label = 'Menu';
                
                button.setAttribute('aria-label', label);
            }
        });

        // Add labels to form elements
        const formElements = document.querySelectorAll('input, textarea, select');
        formElements.forEach(element => {
            if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                const placeholder = element.getAttribute('placeholder');
                if (placeholder) {
                    element.setAttribute('aria-label', placeholder);
                }
            }
        });
    }

    /**
     * Add ARIA describedby
     */
    addAriaDescribedBy() {
        // Add descriptions to form elements
        const formElements = document.querySelectorAll('input, textarea, select');
        formElements.forEach(element => {
            const helpText = element.parentElement.querySelector('.help-text, .form-help');
            if (helpText && !element.getAttribute('aria-describedby')) {
                const helpId = helpText.id || `help-${element.id}`;
                helpText.id = helpId;
                element.setAttribute('aria-describedby', helpId);
            }
        });
    }

    /**
     * Add ARIA expanded
     */
    addAriaExpanded() {
        // Add expanded state to collapsible elements
        const collapsibles = document.querySelectorAll('.collapsible, .accordion-item');
        collapsibles.forEach(element => {
            element.setAttribute('aria-expanded', 'false');
            
            element.addEventListener('click', () => {
                const isExpanded = element.getAttribute('aria-expanded') === 'true';
                element.setAttribute('aria-expanded', (!isExpanded).toString());
            });
        });
    }

    /**
     * Add ARIA hidden
     */
    addAriaHidden() {
        // Hide decorative elements from screen readers
        const decorativeElements = document.querySelectorAll('.decoration, .ornament');
        decorativeElements.forEach(element => {
            element.setAttribute('aria-hidden', 'true');
        });
    }

    /**
     * Setup skip links
     */
    setupSkipLinks() {
        this.addSkipLinks();
    }

    /**
     * Add skip links
     */
    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#footer" class="skip-link">Skip to footer</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    /**
     * Skip to main content
     */
    skipToMainContent() {
        const main = document.querySelector('main, #main-content');
        if (main) {
            main.focus();
            main.scrollIntoView();
        }
    }

    /**
     * Skip to navigation
     */
    skipToNavigation() {
        const nav = document.querySelector('nav, #navigation');
        if (nav) {
            const firstLink = nav.querySelector('a');
            if (firstLink) {
                firstLink.focus();
            }
        }
    }

    /**
     * Skip to footer
     */
    skipToFooter() {
        const footer = document.querySelector('footer, #footer');
        if (footer) {
            footer.focus();
            footer.scrollIntoView();
        }
    }

    /**
     * Close modals
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.focus();
            }
        });
    }

    /**
     * Enhance tab navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    enhanceTabNavigation(e) {
        // Add visual focus indicators
        const activeElement = document.activeElement;
        if (activeElement) {
            activeElement.classList.add('focus-visible');
            
            // Remove focus indicator from other elements
            const otherElements = document.querySelectorAll('.focus-visible');
            otherElements.forEach(element => {
                if (element !== activeElement) {
                    element.classList.remove('focus-visible');
                }
            });
        }
    }

    /**
     * Announce to screen readers
     * @param {string} message - Message to announce
     */
    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Check accessibility compliance
     * @returns {Object} Accessibility report
     */
    checkAccessibility() {
        const report = {
            errors: [],
            warnings: [],
            passed: [],
            score: 0
        };

        // Check for missing alt text
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.getAttribute('alt')) {
                report.errors.push(`Image missing alt text: ${img.src}`);
            } else {
                report.passed.push(`Image has alt text: ${img.src}`);
            }
        });

        // Check for missing form labels
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (!label) {
                    report.errors.push(`Form element missing label: ${input.type}`);
                }
            } else {
                report.passed.push(`Form element has label: ${input.type}`);
            }
        });

        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                report.warnings.push(`Heading hierarchy skip: ${heading.tagName}`);
            }
            lastLevel = level;
        });

        // Calculate score
        const total = report.errors.length + report.warnings.length + report.passed.length;
        report.score = total > 0 ? Math.round((report.passed.length / total) * 100) : 100;

        return report;
    }
}

// Create global accessibility manager instance
const accessibilityManager = new AccessibilityManager();

// Export accessibility manager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
} else {
    window.AccessibilityManager = AccessibilityManager;
    window.accessibilityManager = accessibilityManager;
}
