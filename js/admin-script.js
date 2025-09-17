// Admin Panel JavaScript

// Admin credentials (in production, this should be server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Reset admin credentials function
function resetAdminCredentials() {
    localStorage.removeItem('adminCredentials');
    localStorage.removeItem('adminSetupComplete');
    localStorage.removeItem('adminSession');
    console.log('Admin giriş bilgileri sıfırlandı!');
    location.reload();
}

// Make reset function available globally
window.resetAdminCredentials = resetAdminCredentials;

// Get stored admin credentials
function getStoredCredentials() {
    const stored = localStorage.getItem('adminCredentials');
    if (stored) {
        return JSON.parse(stored);
    }
    return null;
}

// Save admin credentials
function saveAdminCredentials(username, password) {
    const credentials = { username, password };
    localStorage.setItem('adminCredentials', JSON.stringify(credentials));
    return credentials;
}

// Data storage
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
let contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];

// Debug: Blog verilerini kontrol et
console.log('Başlangıçta blog verileri:', blogPosts);

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const passwordSetupScreen = document.getElementById('passwordSetupScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const passwordSetupForm = document.getElementById('passwordSetupForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const totalActivitiesEl = document.getElementById('totalActivities');
const totalBlogsEl = document.getElementById('totalBlogs');
const totalMessagesEl = document.getElementById('totalMessages');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    checkAuth();
});

// Initialize Admin Panel
function initializeAdmin() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Password setup form submission
    passwordSetupForm.addEventListener('submit', handlePasswordSetup);
    
    // Change password form submission
    changePasswordForm.addEventListener('submit', handleChangePassword);
    
    // Activity form submission
    const addActivityForm = document.getElementById('addActivityForm');
    const editActivityForm = document.getElementById('editActivityForm');
    if (addActivityForm) addActivityForm.addEventListener('submit', handleAddActivity);
    if (editActivityForm) editActivityForm.addEventListener('submit', handleEditActivity);
    
    // Blog form submission
    const addBlogForm = document.getElementById('addBlogForm');
    const editBlogForm = document.getElementById('editBlogForm');
    if (addBlogForm) {
        addBlogForm.addEventListener('submit', handleAddBlog);
        console.log('Blog ekleme formu event listener eklendi');
    } else {
        console.error('Blog ekleme formu bulunamadı!');
    }
    if (editBlogForm) {
        editBlogForm.addEventListener('submit', handleEditBlog);
        console.log('Blog düzenleme formu event listener eklendi');
    } else {
        console.error('Blog düzenleme formu bulunamadı!');
    }
    
    // Password strength indicator
    document.getElementById('newPasswordChange').addEventListener('input', updatePasswordStrength);
    
    // Password requirements validation
    document.getElementById('newUsername').addEventListener('input', validateRequirements);
    document.getElementById('newPassword').addEventListener('input', validateRequirements);
    document.getElementById('confirmPassword').addEventListener('input', validateRequirements);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="block"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Authentication
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const hasSetupPassword = localStorage.getItem('adminPasswordSetup');
    
    if (isLoggedIn === 'true') {
        showDashboard();
    } else if (hasSetupPassword === 'true') {
        showLogin();
    } else {
        showPasswordSetup();
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check stored credentials first, then fallback to default
    const storedCredentials = getStoredCredentials();
    const credentials = storedCredentials || ADMIN_CREDENTIALS;
    
    if (username === credentials.username && password === credentials.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
        showNotification('Başarıyla giriş yapıldı!', 'success');
    } else {
        showNotification('Kullanıcı adı veya şifre hatalı!', 'error');
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLogin();
    showNotification('Başarıyla çıkış yapıldı!', 'info');
}

function showLogin() {
    loginScreen.style.display = 'flex';
    passwordSetupScreen.style.display = 'none';
    adminDashboard.style.display = 'none';
}

function showPasswordSetup() {
    loginScreen.style.display = 'none';
    passwordSetupScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    passwordSetupScreen.style.display = 'none';
    adminDashboard.style.display = 'block';
    updateStats();
    loadActivities();
    loadBlogPosts();
    loadContactMessages();
    
    // Blog yönetimi bölümünü görünür yap
    const blogManagement = document.getElementById('blogManagement');
    if (blogManagement) {
        blogManagement.style.display = 'block';
        console.log('Blog yönetimi bölümü görünür yapıldı');
    } else {
        console.error('Blog yönetimi bölümü bulunamadı!');
    }
    
    // Mesaj yönetimi bölümünü görünür yap
    const messagesManagement = document.getElementById('messagesManagement');
    if (messagesManagement) {
        messagesManagement.style.display = 'block';
        console.log('Mesaj yönetimi bölümü görünür yapıldı');
    } else {
        console.error('Mesaj yönetimi bölümü bulunamadı!');
    }
}

// Dashboard Functions
function updateStats() {
    totalActivitiesEl.textContent = activities.length;
    totalBlogsEl.textContent = blogPosts.length;
    totalMessagesEl.textContent = contactMessages.length;
}

function goToMainSite() {
    window.open('index.html', '_blank');
}

// Password Management Functions
function handlePasswordSetup(e) {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (username.length < 3) {
        showNotification('Kullanıcı adı en az 3 karakter olmalıdır!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    // Save new credentials
    saveAdminCredentials(username, password);
    localStorage.setItem('adminPasswordSetup', 'true');
    
    showNotification('Güvenlik ayarları başarıyla kaydedildi!', 'success');
    
    // Auto login with new credentials
    setTimeout(() => {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    }, 1500);
}

function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPasswordChange').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Get current credentials
    const storedCredentials = getStoredCredentials();
    const credentials = storedCredentials || ADMIN_CREDENTIALS;
    
    // Validate current password
    if (currentPassword !== credentials.password) {
        showNotification('Mevcut şifre hatalı!', 'error');
        return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
        showNotification('Yeni şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showNotification('Yeni şifreler eşleşmiyor!', 'error');
        return;
    }
    
    // Save new password
    saveAdminCredentials(credentials.username, newPassword);
    
    closeModal('changePasswordModal');
    document.getElementById('changePasswordForm').reset();
    showNotification('Şifre başarıyla değiştirildi!', 'success');
}

function showChangePasswordForm() {
    showModal('changePasswordModal');
}

function validateRequirements() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Username requirement
    const usernameReq = document.getElementById('req-username');
    if (username.length >= 3) {
        usernameReq.classList.add('valid');
    } else {
        usernameReq.classList.remove('valid');
    }
    
    // Password length requirement
    const lengthReq = document.getElementById('req-length');
    if (password.length >= 6) {
        lengthReq.classList.add('valid');
    } else {
        lengthReq.classList.remove('valid');
    }
    
    // Password match requirement
    const matchReq = document.getElementById('req-match');
    if (password === confirmPassword && password.length > 0) {
        matchReq.classList.add('valid');
    } else {
        matchReq.classList.remove('valid');
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('newPasswordChange').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let strengthLabel = '';
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Reset classes
    strengthFill.className = 'strength-fill';
    
    if (strength <= 2) {
        strengthFill.classList.add('weak');
        strengthLabel = 'Zayıf';
    } else if (strength <= 3) {
        strengthFill.classList.add('medium');
        strengthLabel = 'Orta';
    } else {
        strengthFill.classList.add('strong');
        strengthLabel = 'Güçlü';
    }
    
    strengthText.textContent = `Şifre gücü: ${strengthLabel}`;
}

// Activity Management
function handleAddActivity(e) {
    e.preventDefault();
    
    const title = document.getElementById('activityTitle').value;
    const date = document.getElementById('activityDate').value;
    const time = document.getElementById('activityTime').value;
    const location = document.getElementById('activityLocation').value;
    const description = document.getElementById('activityDescription').value;
    const image = document.getElementById('activityImage').value;
    const capacity = document.getElementById('activityCapacity').value;
    
    const newActivity = {
        id: Date.now(),
        title: title,
        date: date,
        time: time || null,
        location: location,
        description: description,
        image: image || null,
        capacity: capacity || null,
        createdAt: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    localStorage.setItem('activities', JSON.stringify(activities));
    
    loadActivities();
    updateStats();
    closeModal('addActivityModal');
    document.getElementById('addActivityForm').reset();
    showNotification('Etkinlik başarıyla eklendi!', 'success');
}

function handleEditActivity(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editActivityId').value);
    const title = document.getElementById('editActivityTitle').value;
    const date = document.getElementById('editActivityDate').value;
    const time = document.getElementById('editActivityTime').value;
    const location = document.getElementById('editActivityLocation').value;
    const description = document.getElementById('editActivityDescription').value;
    const image = document.getElementById('editActivityImage').value;
    const capacity = document.getElementById('editActivityCapacity').value;
    
    const activityIndex = activities.findIndex(activity => activity.id === id);
    if (activityIndex !== -1) {
        activities[activityIndex] = {
            ...activities[activityIndex],
            title: title,
            date: date,
            time: time || null,
            location: location,
            description: description,
            image: image || null,
            capacity: capacity || null,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('activities', JSON.stringify(activities));
        loadActivities();
        closeModal('editActivityModal');
        showNotification('Etkinlik başarıyla güncellendi!', 'success');
    }
}

function loadActivities() {
    const activitiesList = document.getElementById('activitiesList');
    
    if (activities.length === 0) {
        activitiesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <h3>Henüz etkinlik eklenmemiş</h3>
                <p>İlk etkinliğinizi eklemek için "Yeni Etkinlik" butonuna tıklayın!</p>
                <button class="btn btn-primary" onclick="showAddActivityForm()">
                    <i class="fas fa-plus"></i> İlk Etkinliği Ekle
                </button>
            </div>
        `;
        return;
    }
    
    activitiesList.innerHTML = activities.map(activity => `
        <div class="content-item">
            <div class="content-item-header">
                <div>
                    <div class="content-item-title">${activity.title}</div>
                    <div class="content-item-meta">
                        <i class="fas fa-calendar"></i> ${formatDate(activity.date)}
                        ${activity.time ? ` • <i class="fas fa-clock"></i> ${activity.time}` : ''}
                        <br>
                        <i class="fas fa-map-marker-alt"></i> ${activity.location}
                        ${activity.capacity ? ` • <i class="fas fa-users"></i> ${activity.capacity} kişi` : ''}
                    </div>
                </div>
                <div class="content-item-actions">
                    <button class="btn btn-warning btn-sm" onclick="editActivity(${activity.id})">
                        <i class="fas fa-edit"></i> Düzenle
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteActivity(${activity.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
            <p>${activity.description}</p>
            ${activity.image ? `<img src="${activity.image}" alt="${activity.title}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-top: 1rem;" onerror="this.style.display='none'">` : ''}
        </div>
    `).join('');
}

function editActivity(id) {
    const activity = activities.find(a => a.id === id);
    if (activity) {
        document.getElementById('editActivityId').value = activity.id;
        document.getElementById('editActivityTitle').value = activity.title;
        document.getElementById('editActivityDate').value = activity.date;
        document.getElementById('editActivityTime').value = activity.time || '';
        document.getElementById('editActivityLocation').value = activity.location;
        document.getElementById('editActivityDescription').value = activity.description;
        document.getElementById('editActivityImage').value = activity.image || '';
        document.getElementById('editActivityCapacity').value = activity.capacity || '';
        
        showModal('editActivityModal');
    }
}

function deleteActivity(id) {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
        activities = activities.filter(activity => activity.id !== id);
        localStorage.setItem('activities', JSON.stringify(activities));
        loadActivities();
        updateStats();
        showNotification('Etkinlik silindi!', 'info');
    }
}

// Blog Management
function handleAddBlog(e) {
    e.preventDefault();
    console.log('Blog ekleme fonksiyonu çağrıldı');
    
    const title = document.getElementById('blogTitle').value;
    const author = document.getElementById('blogAuthor').value;
    const category = document.getElementById('blogCategory').value;
    const content = document.getElementById('blogContent').value;
    const image = document.getElementById('blogImage').value;
    const tags = document.getElementById('blogTags').value;
    
    console.log('Form verileri:', { title, author, category, content, image, tags });
    
    // Validation
    if (!title.trim()) {
        showNotification('Blog başlığı gereklidir!', 'error');
        return;
    }
    
    if (!author.trim()) {
        showNotification('Yazar adı gereklidir!', 'error');
        return;
    }
    
    if (!content.trim()) {
        showNotification('Blog içeriği gereklidir!', 'error');
        return;
    }
    
    const newBlogPost = {
        id: Date.now(),
        title: title.trim(),
        author: author.trim(),
        category: category || null,
        content: content.trim(),
        image: image || null,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
        createdAt: new Date().toISOString()
    };
    
    blogPosts.unshift(newBlogPost);
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    console.log('Blog yazısı eklendi:', newBlogPost);
    console.log('Toplam blog sayısı:', blogPosts.length);
    
    loadBlogPosts();
    updateStats();
    closeModal('addBlogModal');
    document.getElementById('addBlogForm').reset();
    showNotification('Blog yazısı başarıyla eklendi!', 'success');
}

function handleEditBlog(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editBlogId').value);
    const title = document.getElementById('editBlogTitle').value;
    const author = document.getElementById('editBlogAuthor').value;
    const category = document.getElementById('editBlogCategory').value;
    const content = document.getElementById('editBlogContent').value;
    const image = document.getElementById('editBlogImage').value;
    const tags = document.getElementById('editBlogTags').value;
    
    // Validation
    if (!title.trim()) {
        showNotification('Blog başlığı gereklidir!', 'error');
        return;
    }
    
    if (!author.trim()) {
        showNotification('Yazar adı gereklidir!', 'error');
        return;
    }
    
    if (!content.trim()) {
        showNotification('Blog içeriği gereklidir!', 'error');
        return;
    }
    
    const blogIndex = blogPosts.findIndex(post => post.id === id);
    if (blogIndex !== -1) {
        blogPosts[blogIndex] = {
            ...blogPosts[blogIndex],
            title: title.trim(),
            author: author.trim(),
            category: category || null,
            content: content.trim(),
            image: image || null,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
        loadBlogPosts();
        closeModal('editBlogModal');
        showNotification('Blog yazısı başarıyla güncellendi!', 'success');
    } else {
        showNotification('Blog yazısı bulunamadı!', 'error');
    }
}

function loadBlogPosts() {
    console.log('Blog yazıları yükleniyor...', blogPosts.length, 'adet');
    const blogList = document.getElementById('blogList');
    
    if (!blogList) {
        console.error('Blog listesi elementi bulunamadı');
        return;
    }
    
    if (blogPosts.length === 0) {
        blogList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-blog"></i>
                <h3>Henüz blog yazısı eklenmemiş</h3>
                <p>İlk blog yazınızı eklemek için "Yeni Blog Yazısı" butonuna tıklayın!</p>
                <button class="btn btn-primary" onclick="showAddBlogForm()">
                    <i class="fas fa-plus"></i> İlk Blog Yazısını Ekle
                </button>
            </div>
        `;
        return;
    }
    
    const blogHTML = blogPosts.map(post => `
        <div class="content-item">
            <div class="content-item-header">
                <div>
                    <div class="content-item-title">${post.title}</div>
                    <div class="content-item-meta">
                        <i class="fas fa-user"></i> ${post.author}
                        ${post.category ? ` • <i class="fas fa-tag"></i> ${getCategoryName(post.category)}` : ''}
                        <br>
                        <i class="fas fa-calendar"></i> ${formatDate(post.createdAt)}
                        ${post.tags && post.tags.length > 0 ? ` • <i class="fas fa-hashtag"></i> ${post.tags.join(', ')}` : ''}
                    </div>
                </div>
                <div class="content-item-actions">
                    <button class="btn btn-warning btn-sm" onclick="editBlogPost(${post.id})">
                        <i class="fas fa-edit"></i> Düzenle
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBlogPost(${post.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
            <p>${post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="${post.title}" style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin-top: 1rem;" onerror="this.style.display='none'">` : ''}
        </div>
    `).join('');
    
    blogList.innerHTML = blogHTML;
    console.log('Blog listesi HTML oluşturuldu:', blogHTML.length, 'karakter');
}

function editBlogPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (post) {
        document.getElementById('editBlogId').value = post.id;
        document.getElementById('editBlogTitle').value = post.title;
        document.getElementById('editBlogAuthor').value = post.author;
        document.getElementById('editBlogCategory').value = post.category || '';
        document.getElementById('editBlogContent').value = post.content;
        document.getElementById('editBlogImage').value = post.image || '';
        document.getElementById('editBlogTags').value = post.tags ? post.tags.join(', ') : '';
        
        showModal('editBlogModal');
    } else {
        showNotification('Blog yazısı bulunamadı!', 'error');
    }
}

function deleteBlogPost(id) {
    if (confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
        const initialLength = blogPosts.length;
        blogPosts = blogPosts.filter(post => post.id !== id);
        
        if (blogPosts.length < initialLength) {
            localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
            loadBlogPosts();
            updateStats();
            showNotification('Blog yazısı silindi!', 'info');
        } else {
            showNotification('Blog yazısı bulunamadı!', 'error');
        }
    }
}

// Modal Functions
function showAddActivityForm() {
    showModal('addActivityModal');
}

function showAddBlogForm() {
    console.log('Blog ekleme formu açılıyor...');
    showModal('addBlogModal');
}

function showModal(modalId) {
    console.log('Modal açılıyor:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Modal başarıyla açıldı:', modalId);
    } else {
        console.error('Modal bulunamadı:', modalId);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Contact Messages Management
function loadContactMessages(filter = 'all') {
    console.log('İletişim mesajları yükleniyor...', contactMessages.length, 'adet');
    const messagesList = document.getElementById('messagesList');
    
    if (!messagesList) {
        console.error('Mesaj listesi elementi bulunamadı');
        return;
    }
    
    let filteredMessages = contactMessages;
    
    // Apply filter
    if (filter === 'unread') {
        filteredMessages = contactMessages.filter(msg => !msg.read);
    } else if (filter === 'read') {
        filteredMessages = contactMessages.filter(msg => msg.read);
    }
    
    if (filteredMessages.length === 0) {
        const emptyMessage = filter === 'all' ? 'Henüz mesaj bulunmuyor' : 
                           filter === 'unread' ? 'Okunmamış mesaj bulunmuyor' : 
                           'Okunmuş mesaj bulunmuyor';
        
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope"></i>
                <h3>${emptyMessage}</h3>
                <p>İletişim formundan gelen mesajlar burada görünecek.</p>
            </div>
        `;
        return;
    }
    
    const messagesHTML = filteredMessages.map(message => `
        <div class="content-item ${!message.read ? 'unread-message' : ''}">
            <div class="content-item-header">
                <div>
                    <div class="content-item-title">
                        ${message.name}
                        ${!message.read ? '<span class="unread-badge">Yeni</span>' : ''}
                    </div>
                    <div class="content-item-meta">
                        <i class="fas fa-envelope"></i> ${message.email}
                        <br>
                        <i class="fas fa-calendar"></i> ${formatDate(message.createdAt)}
                    </div>
                </div>
                <div class="content-item-actions">
                    ${!message.read ? `
                        <button class="btn btn-success btn-sm" onclick="markAsRead(${message.id})">
                            <i class="fas fa-check"></i> Okundu İşaretle
                        </button>
                    ` : `
                        <button class="btn btn-warning btn-sm" onclick="markAsUnread(${message.id})">
                            <i class="fas fa-envelope"></i> Okunmadı İşaretle
                        </button>
                    `}
                    <button class="btn btn-danger btn-sm" onclick="deleteMessage(${message.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
            <div class="message-content">
                <p>${message.message}</p>
            </div>
        </div>
    `).join('');
    
    messagesList.innerHTML = messagesHTML;
    console.log('Mesaj listesi HTML oluşturuldu:', messagesHTML.length, 'karakter');
}

function markAsRead(messageId) {
    const messageIndex = contactMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
        contactMessages[messageIndex].read = true;
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
        loadContactMessages();
        updateStats();
        showNotification('Mesaj okundu olarak işaretlendi!', 'success');
    }
}

function markAsUnread(messageId) {
    const messageIndex = contactMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
        contactMessages[messageIndex].read = false;
        localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
        loadContactMessages();
        updateStats();
        showNotification('Mesaj okunmadı olarak işaretlendi!', 'info');
    }
}

function deleteMessage(messageId) {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
        const initialLength = contactMessages.length;
        contactMessages = contactMessages.filter(msg => msg.id !== messageId);
        
        if (contactMessages.length < initialLength) {
            localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
            loadContactMessages();
            updateStats();
            showNotification('Mesaj silindi!', 'info');
        } else {
            showNotification('Mesaj bulunamadı!', 'error');
        }
    }
}

function filterMessages(filter) {
    loadContactMessages(filter);
    
    // Update filter button states
    document.querySelectorAll('.message-filters .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const filterButtons = {
        'all': document.querySelector('button[onclick="filterMessages(\'all\')"]'),
        'unread': document.querySelector('button[onclick="filterMessages(\'unread\')"]'),
        'read': document.querySelector('button[onclick="filterMessages(\'read\')"]')
    };
    
    if (filterButtons[filter]) {
        filterButtons[filter].classList.add('active');
    }
}

// Management Functions
function showManageActivities() {
    document.getElementById('activitiesManagement').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function showManageBlogs() {
    console.log('Blog yönetimi bölümüne kaydırılıyor...');
    const blogManagement = document.getElementById('blogManagement');
    if (blogManagement) {
        blogManagement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        console.error('Blog yönetimi bölümü bulunamadı');
    }
}

function showManageMessages() {
    console.log('Mesaj yönetimi bölümüne kaydırılıyor...');
    const messagesManagement = document.getElementById('messagesManagement');
    if (messagesManagement) {
        messagesManagement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        console.error('Mesaj yönetimi bölümü bulunamadı');
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

function getCategoryName(category) {
    const categories = {
        'egitim': 'Eğitim',
        'gelisim': 'Gelişim',
        'etkinlik': 'Etkinlik',
        'saglik': 'Sağlık',
        'diger': 'Diğer'
    };
    return categories[category] || category;
}

function showNotification(message, type = 'success') {
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
`;
document.head.appendChild(style);

// Auto-save functionality (optional)
function autoSave() {
    localStorage.setItem('activities', JSON.stringify(activities));
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
}

// Save data every 30 seconds
setInterval(autoSave, 30000);

// Export data functionality (for backup)
function exportData() {
    const data = {
        activities: activities,
        blogPosts: blogPosts,
        contactMessages: contactMessages,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `anaokulu-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Add export button to dashboard (optional)
document.addEventListener('DOMContentLoaded', function() {
    const quickActions = document.querySelector('.quick-actions .action-buttons');
    if (quickActions) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'action-btn';
        exportBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Verileri Yedekle</span>
        `;
        exportBtn.onclick = exportData;
        quickActions.appendChild(exportBtn);
    }
});
