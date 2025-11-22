// Example: Show a welcome message in console
console.log("Home page loaded!");

// Add this to handle mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const menuBtn = document.querySelector('.menu-toggle');
    const sideNav = document.querySelector('.side-nav');
    const logoutBtn = document.querySelector('.logout');

    // Check authentication
    checkAuthentication();

    // Event listeners
    initializeEventListeners();

    // Welcome message
    showWelcomeMessage();

    function checkAuthentication() {
        if (!localStorage.getItem('teacherLoggedIn') && !sessionStorage.getItem('teacherLoggedIn')) {
            window.location.href = 'teacher-login.html';
            return;
        }
    }

    function initializeEventListeners() {
        // Mobile menu toggle
        if (menuBtn && sideNav) {
            menuBtn.addEventListener('click', () => {
                sideNav.classList.toggle('active');
            });
        }

        // Close menu when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                !sideNav.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                sideNav.classList.remove('active');
            }
        });

        // Logout handler
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Set active menu item based on current page
        const currentPage = window.location.pathname.split('/').pop();
        const menuItems = document.querySelectorAll('.side-nav nav a');
        menuItems.forEach(item => {
            if (item.getAttribute('href') === currentPage) {
                item.classList.add('active');
            }
        });
    }

    function handleLogout(e) {
        e.preventDefault();
        
        // Clear storage
        clearAuthStorage();
        
        // Redirect to login page
        window.location.href = 'teacher-login.html';
    }

    function clearAuthStorage() {
        localStorage.removeItem('teacherLoggedIn');
        localStorage.removeItem('teacherEmail');
        sessionStorage.removeItem('teacherLoggedIn');
        sessionStorage.removeItem('teacherEmail');
    }

    function showWelcomeMessage() {
        const teacherEmail = localStorage.getItem('teacherEmail') || sessionStorage.getItem('teacherEmail');
        console.log(`Welcome back, ${teacherEmail}!`);
    }
});