/**
 * Renkli Dünya Anaokulu - Ana Site JavaScript
 * Enterprise-level JavaScript with security, performance, and error handling
 */

// Import utilities
import { logger } from './utils/logger.js';
import { securityManager } from './utils/security.js';
import { performanceManager } from './utils/performance.js';
import { analyticsManager } from './utils/analytics.js';
import { accessibilityManager } from './utils/accessibility.js';
import { errorReportingManager } from './utils/errorReporting.js';
import { getConfig } from '../config/app.config.js';

// Initialize configuration
const config = getConfig();

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const activitiesGrid = document.getElementById('activities-grid');
const blogGrid = document.getElementById('blog-grid');

// Data Storage (LocalStorage kullanarak)
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadActivities();
    loadBlogPosts();
    registerServiceWorker();
    
    // Initialize enterprise features
    initializeEnterpriseFeatures();
});

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/js/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed');
                });
        });
    }
}

// Initialize App
function initializeApp() {
    // Mobile menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Contact form submission
    document.getElementById('contactForm').addEventListener('submit', handleContactForm);
    
    // Forms removed - now handled by admin panel
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize Enterprise Features
function initializeEnterpriseFeatures() {
    try {
        // Track page view
        analyticsManager.trackPageView('home', 'Renkli Dünya Anaokulu - Ana Sayfa');
        
        // Log initialization
        logger.info('Enterprise features initialized successfully');
        
        // Track user interaction
        analyticsManager.trackUserInteraction('page_load', 'home_page', {
            loadTime: performance.now(),
            userAgent: navigator.userAgent
        });
        
        // Announce to screen readers
        if (accessibilityManager) {
            accessibilityManager.announce('Sayfa yüklendi');
        }
        
    } catch (error) {
        logger.error('Failed to initialize enterprise features', null, error);
        errorReportingManager.reportError({
            type: 'initialization_error',
            message: 'Failed to initialize enterprise features',
            stack: error.stack,
            timestamp: Date.now()
        });
    }
}

// Mobile Menu Functions
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

// Scroll to Section Function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Modal Functions removed - now handled by admin panel

// Activity Management - Read only (admin panel handles editing)

function loadActivities() {
    if (activities.length === 0) {
        activitiesGrid.innerHTML = `
            <div class="no-content">
                <i class="fas fa-calendar-plus"></i>
                <h3>Henüz etkinlik eklenmemiş</h3>
                <p>İlk etkinliğinizi eklemek için yukarıdaki butona tıklayın!</p>
            </div>
        `;
        return;
    }
    
    activitiesGrid.innerHTML = activities.map(activity => `
        <div class="activity-card">
            ${activity.image ? `<img src="${activity.image}" alt="${activity.title}" class="activity-image" onerror="this.style.display='none'">` : ''}
            <h3>${activity.title}</h3>
            <div class="activity-date">
                <i class="fas fa-calendar"></i> ${formatDate(activity.date)}
            </div>
            <div class="activity-location">
                <i class="fas fa-map-marker-alt"></i> ${activity.location}
            </div>
            <p class="activity-description">${activity.description}</p>
        </div>
    `).join('');
}

// Delete function removed - admin panel handles this

// Blog Management - Read only (admin panel handles editing)

function loadBlogPosts() {
    if (blogPosts.length === 0) {
        blogGrid.innerHTML = `
            <div class="no-content">
                <i class="fas fa-blog"></i>
                <h3>Henüz blog yazısı eklenmemiş</h3>
                <p>İlk blog yazınızı eklemek için yukarıdaki butona tıklayın!</p>
            </div>
        `;
        return;
    }
    
    blogGrid.innerHTML = blogPosts.map(post => `
        <div class="blog-card">
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="blog-image" onerror="this.style.display='none'">` : ''}
            <h3>${post.title}</h3>
            <div class="blog-author">
                <i class="fas fa-user"></i> ${post.author} - ${formatDate(post.createdAt)}
            </div>
            <p class="blog-content">${post.content}</p>
        </div>
    `).join('');
}

// Delete function removed - admin panel handles this

// Contact Form with Enterprise Security
function handleContactForm(e) {
    e.preventDefault();
    
    const measurement = performanceManager.startMeasurement('contact_form_submission');
    
    try {
        // Get form data with security validation
        const formData = {
            name: e.target.querySelector('input[type="text"]').value,
            email: e.target.querySelector('input[type="email"]').value,
            message: e.target.querySelector('textarea').value
        };

        // Validate form data
        const validationRules = {
            name: { type: 'text', required: true, minLength: 2, maxLength: 100 },
            email: { type: 'email', required: true },
            message: { type: 'text', required: true, minLength: 10, maxLength: 1000 }
        };

        const validation = securityManager.validateFormData(formData, validationRules);
        
        if (!validation.isValid) {
            logger.warn('Contact form validation failed', validation.errors);
            showNotification('Lütfen formu doğru şekilde doldurun!', 'error');
            return;
        }

        // Check for spam (simple rate limiting)
        const lastSubmission = localStorage.getItem('last_contact_submission');
        const now = Date.now();
        if (lastSubmission && (now - parseInt(lastSubmission)) < 30000) { // 30 seconds
            logger.warn('Contact form rate limit exceeded');
            showNotification('Çok sık mesaj gönderiyorsunuz. Lütfen bekleyin.', 'error');
            return;
        }

        // Store contact message with security
        const contactMessage = {
            id: Date.now(),
            name: validation.sanitizedData.name,
            email: validation.sanitizedData.email,
            message: validation.sanitizedData.message,
            createdAt: new Date().toISOString(),
            read: false,
            ip: 'client-side', // Would be server-side in production
            userAgent: navigator.userAgent
        };
        
        // Get existing messages or create new array
        let contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        contactMessages.unshift(contactMessage);
        
        // Limit stored messages to prevent storage bloat
        if (contactMessages.length > 1000) {
            contactMessages = contactMessages.slice(0, 1000);
        }
        
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
        localStorage.setItem('last_contact_submission', now.toString());
        
        // Log successful submission
        logger.info('Contact form submitted successfully', { 
            messageId: contactMessage.id,
            email: contactMessage.email 
        });
        
        // Track form submission with analytics
        analyticsManager.trackFormSubmission('contact_form', true, {
            messageId: contactMessage.id,
            hasEmail: !!contactMessage.email,
            messageLength: contactMessage.message.length
        });
        
        // Simulate form submission with better UX
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<span class="loading"></span> Gönderiliyor...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            e.target.reset();
            showNotification('Mesajınız başarıyla gönderildi!', 'success');
            
            // Track user action
            logger.userAction('contact_form_submitted', {
                messageId: contactMessage.id
            });
        }, 2000);
        
    } catch (error) {
        logger.error('Contact form submission failed', null, error);
        showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
        measurement.end();
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('tr-TR', options);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .no-content {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        color: white;
    }
    
    .no-content i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    .no-content h3 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .no-content p {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature, .activity-card, .blog-card, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
});

// Add some sample data if none exists
if (activities.length === 0 && blogPosts.length === 0) {
    // Add sample activities
    const sampleActivities = [
        {
            id: 1,
            title: "Sanat Atölyesi",
            date: "2024-02-15",
            location: "Anaokulu Sanat Sınıfı",
            description: "Çocuklarımızla birlikte renkli dünyalar yaratacağız. Resim, heykel ve el sanatları etkinlikleri.",
            image: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            title: "Müzik ve Dans",
            date: "2024-02-20",
            location: "Müzik Salonu",
            description: "Ritm ve melodilerle dolu eğlenceli bir gün. Çocuklarımız müzik aletleriyle tanışacak.",
            image: null,
            createdAt: new Date().toISOString()
        }
    ];
    
    // Add sample blog posts
    const sampleBlogPosts = [
        {
            id: 1,
            title: "Çocuk Gelişiminde Sanatın Önemi",
            author: "Uzman Psikolog Ayşe Yılmaz",
            content: "Sanat etkinlikleri çocukların yaratıcılığını geliştirir, motor becerilerini güçlendirir ve duygusal gelişimlerine katkıda bulunur. Bu yazımızda sanatın çocuk gelişimindeki rolünü inceliyoruz.",
            image: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            title: "Anaokulunda İlk Günler",
            author: "Öğretmen Mehmet Kaya",
            content: "Çocuğunuzun anaokuluna başladığı ilk günler hem heyecan verici hem de endişe verici olabilir. Bu süreci nasıl yöneteceğiniz konusunda önerilerimiz...",
            image: null,
            createdAt: new Date().toISOString()
        }
    ];
    
    // Uncomment the lines below if you want to add sample data
    // activities = sampleActivities;
    // blogPosts = sampleBlogPosts;
    // localStorage.setItem('activities', JSON.stringify(activities));
    // localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
}
