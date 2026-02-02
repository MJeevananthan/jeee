// Global user data
let currentUser = null;
let userData = null;

// Check authentication status
async function checkAuth() {
    return new Promise((resolve) => {
        window.firebaseAuth.onAuthStateChange(async (user) => {
            if (!user) {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
                resolve(false);
                return;
            }
            
            console.log('User authenticated:', user.email);
            currentUser = user;
            
            // Get user data from Firestore
            const userDataResult = await window.firebaseDB.getUserData(user.uid);
            if (userDataResult.success) {
                userData = userDataResult.data;
                updateUserInterface();
            }
            
            resolve(true);
        });
    });
}

// Update user interface with Firebase data
function updateUserInterface() {
    if (!currentUser || !userData) return;
    
    console.log('Updating UI with user data:', userData);
    
    // Update user info in header
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar && userData.displayName) {
        userAvatar.innerHTML = `<span>${userData.displayName.charAt(0).toUpperCase()}</span>`;
        userAvatar.title = userData.displayName;
    }
    
    // Update balance
    const balanceElements = document.querySelectorAll('.balance');
    balanceElements.forEach(element => {
        if (userData.portfolio && userData.portfolio.balance) {
            element.textContent = `$${userData.portfolio.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
    });
    
    // Update user menu info
    updateUserInfo();
}

// Update user info in menu
function updateUserInfo() {
    if (!currentUser || !userData) return;
    
    // Update user name and email in menu
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    const userAvatarLarge = document.querySelector('.user-avatar-large');
    
    if (userName && userData.displayName) {
        userName.textContent = userData.displayName;
    }
    
    if (userEmail && currentUser.email) {
        userEmail.textContent = currentUser.email;
    }
    
    if (userAvatarLarge && userData.displayName) {
        userAvatarLarge.innerHTML = `<span>${userData.displayName.charAt(0).toUpperCase()}</span>`;
    }
}

// Logout functionality
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        const result = await window.firebaseAuth.signOutUser();
        if (result.success) {
            showNotification('Logged out successfully!', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showNotification('Error logging out. Please try again.', 'error');
        }
    }
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard page loaded');
    
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        return;
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = this.getAttribute('href').substring(1);
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Initialize charts
    initializeCharts();
    
    // Initialize signal filters
    initializeSignalFilters();
    
    // Initialize alerts functionality
    initializeAlerts();
    
    // Simulate real-time data updates
    startRealTimeUpdates();
});

// Chart initialization
function initializeCharts() {
    // Portfolio Performance Chart
    const portfolioCtx = document.getElementById('portfolioChart');
    if (portfolioCtx) {
        new Chart(portfolioCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [20000, 21500, 19800, 23200, 24100, 25430],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Market Overview Chart
    const marketCtx = document.getElementById('marketChart');
    if (marketCtx) {
        new Chart(marketCtx, {
            type: 'doughnut',
            data: {
                labels: ['Stocks', 'Crypto', 'Forex', 'Commodities'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Signal filters functionality
function initializeSignalFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const signalCards = document.querySelectorAll('.signal-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            
            signalCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (filter === 'buy' && card.classList.contains('buy')) {
                    card.style.display = 'block';
                } else if (filter === 'sell' && card.classList.contains('sell')) {
                    card.style.display = 'block';
                } else if (filter === 'high' && card.getAttribute('data-confidence') === 'high') {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Execute trade functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('execute-btn')) {
        const signalCard = e.target.closest('.signal-card');
        const symbol = signalCard.querySelector('.symbol').textContent;
        const signalType = signalCard.querySelector('.signal-badge').textContent;
        
        // Show confirmation dialog
        if (confirm(`Execute ${signalType} trade for ${symbol}?`)) {
            // Simulate trade execution
            e.target.textContent = 'Executing...';
            e.target.disabled = true;
            
            setTimeout(() => {
                e.target.textContent = 'Trade Executed';
                e.target.style.background = '#28a745';
                
                // Show success notification
                showNotification(`${signalType} trade for ${symbol} executed successfully!`, 'success');
            }, 2000);
        }
    }
});

// Alerts functionality
function initializeAlerts() {
    const deleteButtons = document.querySelectorAll('.delete-alert');
    const addAlertBtn = document.querySelector('.add-alert-btn');

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Delete this alert?')) {
                this.closest('.alert-item').remove();
                showNotification('Alert deleted successfully!', 'info');
            }
        });
    });

    if (addAlertBtn) {
        addAlertBtn.addEventListener('click', function() {
            showAddAlertModal();
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 15px;
                animation: slideIn 0.3s ease;
            }
            .notification.success { background: #28a745; }
            .notification.error { background: #dc3545; }
            .notification.info { background: #17a2b8; }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// User menu functionality
function showUserMenu() {
    const userMenu = document.getElementById('user-menu');
    const overlay = document.createElement('div');
    overlay.className = 'user-menu-overlay active';
    
    // Toggle menu
    if (userMenu.classList.contains('active')) {
        userMenu.classList.remove('active');
        const existingOverlay = document.querySelector('.user-menu-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    } else {
        userMenu.classList.add('active');
        document.body.appendChild(overlay);
        
        // Close menu when clicking outside
        overlay.addEventListener('click', function() {
            userMenu.classList.remove('active');
            overlay.remove();
        });
    }
}

// Real-time data updates simulation
function startRealTimeUpdates() {
    setInterval(() => {
        updatePrices();
        updateStats();
    }, 5000); // Update every 5 seconds
}

function updatePrices() {
    const priceElements = document.querySelectorAll('.price');
    priceElements.forEach(element => {
        const currentPrice = parseFloat(element.textContent.replace('$', ''));
        const change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
        const newPrice = Math.max(0, currentPrice + change);
        element.textContent = `$${newPrice.toFixed(2)}`;
    });
}

function updateStats() {
    // Update portfolio value with small random changes
    const balanceElements = document.querySelectorAll('.balance');
    balanceElements.forEach(element => {
        const currentValue = parseFloat(element.textContent.replace('$', '').replace(',', ''));
        const change = (Math.random() - 0.5) * 100; // Random change
        const newValue = Math.max(0, currentValue + change);
        element.textContent = `$${newValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    });
}

// Show add alert modal (simplified version)
function showAddAlertModal() {
    const symbol = prompt('Enter symbol (e.g., AAPL):');
    const condition = prompt('Enter condition (e.g., Above $180.00):');
    
    if (symbol && condition) {
        const alertsList = document.querySelector('.alerts-list');
        const newAlert = document.createElement('div');
        newAlert.className = 'alert-item active';
        newAlert.innerHTML = `
            <div class="alert-info">
                <span class="symbol">${symbol}</span>
                <span class="alert-type">Price Alert</span>
                <span class="alert-condition">${condition}</span>
            </div>
            <div class="alert-status">
                <span class="status active">Active</span>
                <button class="delete-alert">×</button>
            </div>
        `;
        
        alertsList.appendChild(newAlert);
        
        // Add delete functionality to new alert
        newAlert.querySelector('.delete-alert').addEventListener('click', function() {
            if (confirm('Delete this alert?')) {
                this.closest('.alert-item').remove();
                showNotification('Alert deleted successfully!', 'info');
            }
        });
        
        showNotification(`Alert for ${symbol} added successfully!`, 'success');
    }
}

console.log('Dashboard script loaded successfully!');