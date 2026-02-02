// DOM Elements
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize the login page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    initializeFormHandlers();
    initializePasswordStrength();
    initializeFormValidation();
    initializeSocialLogin();
    
    // Check if user is already logged in
    window.firebaseAuth.onAuthStateChange((user) => {
        if (user) {
            console.log('User already logged in:', user.email);
            showNotification('Welcome back! Redirecting to dashboard...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
});

// Form switching functionality
function switchForm(formType) {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    
    if (formType === 'signup') {
        signinForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        signinForm.classList.add('active');
    }
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize form handlers
function initializeFormHandlers() {
    // Sign In Form Handler
    document.getElementById('signin-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignIn();
    });
    
    // Sign Up Form Handler
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignUp();
    });
}

// Handle Sign In
async function handleSignIn() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    console.log('Attempting sign in for:', email);
    
    // Basic validation
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Show loading
    showLoading('Signing you in...');
    
    try {
        const result = await window.firebaseAuth.signInUser(email, password);
        
        if (result.success) {
            hideLoading();
            showNotification('Sign in successful! Redirecting...', 'success');
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            hideLoading();
            showNotification(getFirebaseErrorMessage(result.error), 'error');
        }
    } catch (error) {
        hideLoading();
        showNotification('An unexpected error occurred. Please try again.', 'error');
        console.error('Sign in error:', error);
    }
}

// Handle Sign Up
async function handleSignUp() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    const newsletter = document.getElementById('newsletter').checked;
    
    console.log('Attempting sign up for:', email);
    
    // Validation
    if (name.length < 2) {
        showNotification('Please enter your full name', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showNotification('Please agree to the Terms of Service', 'error');
        return;
    }
    
    // Show loading
    showLoading('Creating your account...');
    
    try {
        const result = await window.firebaseAuth.createUser(email, password, name);
        
        if (result.success) {
            hideLoading();
            showNotification('Account created successfully! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            hideLoading();
            showNotification(getFirebaseErrorMessage(result.error), 'error');
        }
    } catch (error) {
        hideLoading();
        showNotification('An unexpected error occurred. Please try again.', 'error');
        console.error('Sign up error:', error);
    }
}

// Handle social login
async function handleSocialLogin(provider) {
    if (provider === 'google') {
        showLoading('Connecting to Google...');
        
        try {
            const result = await window.firebaseAuth.signInWithGoogle();
            
            if (result.success) {
                hideLoading();
                showNotification('Google sign in successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                hideLoading();
                showNotification(getFirebaseErrorMessage(result.error), 'error');
            }
        } catch (error) {
            hideLoading();
            showNotification('Google sign in failed. Please try again.', 'error');
            console.error('Google sign in error:', error);
        }
    } else {
        // Apple sign in not implemented yet
        showNotification('Apple sign in coming soon!', 'info');
    }
}

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Firebase error message helper
function getFirebaseErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters long.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/popup-closed-by-user': 'Sign in was cancelled.',
        'auth/cancelled-popup-request': 'Sign in was cancelled.',
        'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Password strength checker
function initializePasswordStrength() {
    const passwordInput = document.getElementById('signup-password');
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            // Update strength bar
            strengthBar.style.width = strength.percentage + '%';
            strengthBar.style.background = strength.color;
            strengthText.textContent = strength.text;
        });
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;
    
    // Lowercase check
    if (/[a-z]/.test(password)) score += 25;
    
    // Number or special character check
    if (/[\d\W]/.test(password)) score += 25;
    
    // Return strength object
    if (score < 50) {
        return { percentage: score, color: '#dc3545', text: 'Weak password' };
    } else if (score < 75) {
        return { percentage: score, color: '#ffc107', text: 'Medium strength' };
    } else if (score < 100) {
        return { percentage: score, color: '#fd7e14', text: 'Good password' };
    } else {
        return { percentage: score, color: '#28a745', text: 'Strong password' };
    }
}

// Form validation
function initializeFormValidation() {
    // Real-time validation for all inputs
    const inputs = document.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            clearInputError(this);
        });
    });
}

// Validate individual input
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    
    // Clear previous errors
    clearInputError(input);
    
    // Required field check
    if (!value) {
        showInputError(input, 'This field is required');
        return false;
    }
    
    // Email validation
    if (type === 'email' && !validateEmail(value)) {
        showInputError(input, 'Please enter a valid email address');
        return false;
    }
    
    // Password validation
    if (type === 'password' && value.length < 6) {
        showInputError(input, 'Password must be at least 6 characters');
        return false;
    }
    
    return true;
}

// Show input error
function showInputError(input, message) {
    const wrapper = input.closest('.input-wrapper');
    const inputGroup = input.closest('.input-group');
    
    wrapper.classList.add('error');
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    inputGroup.appendChild(errorDiv);
}

// Clear input error
function clearInputError(input) {
    const wrapper = input.closest('.input-wrapper');
    const inputGroup = input.closest('.input-group');
    const errorMessage = inputGroup.querySelector('.error-message');
    
    wrapper.classList.remove('error');
    
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Social login handlers
function initializeSocialLogin() {
    const googleBtns = document.querySelectorAll('.social-btn.google');
    const appleBtns = document.querySelectorAll('.social-btn.apple');
    
    googleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            handleSocialLogin('google');
        });
    });
    
    appleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            handleSocialLogin('apple');
        });
    });
}

// Loading functions
function showLoading(message = 'Loading...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = loadingOverlay.querySelector('p');
    
    loadingText.textContent = message;
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.remove('active');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer; font-size: 16px;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Forgot password handler
function handleForgotPassword() {
    const email = prompt('Please enter your email address:');
    
    if (email && validateEmail(email)) {
        showLoading('Sending reset link...');
        
        window.firebaseAuth.resetPassword(email)
            .then(result => {
                hideLoading();
                if (result.success) {
                    showNotification('Password reset link sent to your email!', 'success');
                } else {
                    showNotification(getFirebaseErrorMessage(result.error), 'error');
                }
            })
            .catch(error => {
                hideLoading();
                showNotification('Failed to send reset email. Please try again.', 'error');
                console.error('Password reset error:', error);
            });
    } else if (email) {
        showNotification('Please enter a valid email address', 'error');
    }
}

// Forgot password event listener
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('forgot-password')) {
        e.preventDefault();
        handleForgotPassword();
    }
});

console.log('Login script loaded successfully!');