document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear all authentication data
        localStorage.removeItem('teacherLoggedIn');
        localStorage.removeItem('teacherEmail');
        sessionStorage.removeItem('teacherLoggedIn');
        sessionStorage.removeItem('teacherEmail');
        
        // Redirect to dashboard
        window.location.href = '../../dashbord.html';
    });
});