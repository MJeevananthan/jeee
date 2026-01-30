// Import Firebase functions
import { firebaseAuth, firebaseDB } from './firebase-config.js';

// Global user data
let currentUser = null;
let userData = null;

// Check authentication status
async function checkAuth() {
    return new Promise((resolve) => {
        firebaseAuth.onAuthStateChange(async (user) => {
            if (!user) {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
                resolve(false);
                return;
            }
            
            currentUser = user;
            
            // Get user data from Firestore
            const userDataResult = await firebaseDB.getUserData(user.uid);
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
    
    // Update portfolio stats
    updatePortfolioStats();
}

// Update portfolio statistics
function updatePortfolioStats() {
    if (!userData.portfolio) return;
    
    const portfolio = userData.portfolio;
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        const statValue = card.querySelector('.stat-value');
        const statChange = card.querySelector('.stat-change');
        
        switch(index) {
            case 0: // Portfolio Value
                if (statValue) statValue.textContent = `$${portfolio.balance.toLocaleString()}`;
                break;
            case 1: // Today's P&L
                if (statValue) statValue.textContent = `$${portfolio.totalPnL.toLocaleString()}`;
                break;
            case 2: // Active Signals - keep existing logic
                break;
            case 3: // Win Rate
                if (statValue) statValue.textContent = `${portfolio.winRate.toFixed(1)}%`;
                break;
        }
    });
}

// Logout functionality
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        const result = await firebaseAuth.signOutUser();
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

// Show add alert modal
function showAddAlertModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <h3>Add New Alert</h3>
            <form id="alert-form">
                <div class="form-group">
                    <label>Symbol</label>
                    <input type="text" id="alert-symbol" placeholder="e.g., AAPL" required>
                </div>
                <div class="form-group">
                    <label>Alert Type</label>
                    <select id="alert-type" required>
                        <option value="price">Price Alert</option>
                        <option value="signal">Signal Alert</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Condition</label>
                    <input type="text" id="alert-condition" placeholder="e.g., Above $180.00" required>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit">Add Alert</button>
                </div>
            </form>
        </div>
    `;
    
    // Add modal styles
    if (!document.querySelector('#modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .modal {
                background: white;
                border-radius: 15px;
                padding: 30px;
                width: 90%;
                max-width: 400px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            .modal h3 {
                margin-bottom: 20px;
                color: #333;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                color: #666;
                font-weight: bold;
            }
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
            }
            .form-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            .form-actions button {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            }
            .form-actions button[type="button"] {
                background: #6c757d;
                color: white;
            }
            .form-actions button[type="submit"] {
                background: #667eea;
                color: white;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('alert-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const symbol = document.getElementById('alert-symbol').value;
        const type = document.getElementById('alert-type').value;
        const condition = document.getElementById('alert-condition').value;
        
        // Add new alert to the list
        const alertsList = document.querySelector('.alerts-list');
        const newAlert = document.createElement('div');
        newAlert.className = 'alert-item active';
        newAlert.innerHTML = `
            <div class="alert-info">
                <span class="symbol">${symbol}</span>
                <span class="alert-type">${type === 'price' ? 'Price Alert' : 'Signal Alert'}</span>
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
        
        modal.remove();
        showNotification(`Alert for ${symbol} added successfully!`, 'success');
    });
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

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('[href="#dashboard"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('[href="#signals"]').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('[href="#market"]').click();
                break;
            case '4':
                e.preventDefault();
                document.querySelector('[href="#history"]').click();
                break;
            case '5':
                e.preventDefault();
                document.querySelector('[href="#alerts"]').click();
                break;
        }
    }
});

// Add loading states for better UX
function showLoading(element) {
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    element.disabled = true;
}

function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// Initialize tooltips for better user experience
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Add search functionality
function initializeSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search symbols...';
    searchInput.className = 'search-input';
    
    // Add search input to header if needed
    // document.querySelector('.nav').appendChild(searchInput);
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const symbols = document.querySelectorAll('.symbol');
        
        symbols.forEach(symbol => {
            const card = symbol.closest('.signal-card, .table-row, .alert-item');
            if (card) {
                if (symbol.textContent.toLowerCase().includes(query)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
}

// Performance monitoring
function trackPerformance() {
    const performanceData = {
        pageLoadTime: performance.now(),
        interactions: 0,
        errors: 0
    };
    
    // Track user interactions
    document.addEventListener('click', () => {
        performanceData.interactions++;
    });
    
    // Track errors
    window.addEventListener('error', () => {
        performanceData.errors++;
    });
    
    // Log performance data periodically
    setInterval(() => {
        console.log('Performance Data:', performanceData);
    }, 60000); // Every minute
}

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    initializeSearch();
    trackPerformance();
});

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

// Update user info from Firebase
async function updateUserInfo() {
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

// Initialize user info on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUserInfo();
});

// Close user menu when clicking elsewhere
document.addEventListener('click', function(e) {
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userMenu && !userMenu.contains(e.target) && !userAvatar.contains(e.target)) {
        userMenu.classList.remove('active');
        const overlay = document.querySelector('.user-menu-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
});