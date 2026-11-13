document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear all authentication data
        localStorage.removeItem('teacherLoggedIn');
        localStorage.removeItem('teacherEmail');
        localStorage.removeItem('teacher_token');
        sessionStorage.removeItem('teacherLoggedIn');
        sessionStorage.removeItem('teacherEmail');
        sessionStorage.removeItem('teacher_token');
        
        window.location.href = '/teacher/htmlfiles/teacher-login.html';
    });
});