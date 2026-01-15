// ⚠️ SECURITY NOTE: This is a frontend authentication for demo purposes only
// For production, use backend authentication with secure password hashing

// Admin Credentials (Change these in production!)
const ADMIN_CREDENTIALS = {
    username: "bashana",
    password: "imalshi"
};

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if session has expired
    checkSessionStatus();
});

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Set session
        const sessionData = {
            user: username,
            loginTime: new Date().getTime(),
            authenticated: true
        };
        
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        
        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Redirecting to dashboard...',
            confirmButtonColor: '#667eea',
            allowOutsideClick: false,
            didClose: () => {
                window.location.href = 'admin.html';
            }
        });
    } else {
        // Show error message
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid username or password. Try again!',
            confirmButtonColor: '#667eea'
        });
        
        // Clear password field
        document.getElementById('password').value = '';
    }
}

// Check if user is authenticated
function isAuthenticated() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        const currentTime = new Date().getTime();
        const sessionAge = currentTime - sessionData.loginTime;
        
        // Check if session has expired
        if (sessionAge > SESSION_TIMEOUT) {
            localStorage.removeItem('adminSession');
            return false;
        }
        
        return sessionData.authenticated === true;
    } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('adminSession');
        return false;
    }
}

// Check session status and redirect if needed
function checkSessionStatus() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // If on admin page but not authenticated, redirect to login
    if (currentPage === 'admin.html' || currentPage === '') {
        if (!isAuthenticated()) {
            if (currentPage === 'admin.html') {
                window.location.href = 'login.html';
            }
        }
    }
}

// Logout function
function logout() {
    Swal.fire({
        icon: 'question',
        title: 'Logout?',
        text: 'Are you sure you want to logout?',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#ccc',
        confirmButtonText: 'Yes, Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('adminSession');
            window.location.href = 'login.html';
        }
    });
}

// Get current user info
function getCurrentUser() {
    const session = localStorage.getItem('adminSession');
    if (!session) return null;
    
    try {
        const sessionData = JSON.parse(session);
        return sessionData.user;
    } catch (error) {
        return null;
    }
}
