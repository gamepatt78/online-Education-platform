// Simulate login status (for demo, set to true after login)
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Show/hide courses based on login status
window.onload = function() {
    const coursesSection = document.getElementById('coursesSection');
    const dashboardActions = document.getElementById('dashboardActions');
    const loginBtn = document.getElementById('loginBtn');

    if (isLoggedIn()) {
        coursesSection.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
    } else {
        coursesSection.style.display = 'none';
        if (loginBtn) {
            loginBtn.onclick = function() {
                // Simulate login for demo
                localStorage.setItem('isLoggedIn', 'true');
                window.location.reload();
            };
        }
    }
};

// Example: You can add dashboard interactivity here if needed
console.log("Dashboard loaded!");