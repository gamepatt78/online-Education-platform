document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');

    if (togglePassword) togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPassword');
        const icon = this.querySelector('i');
        const isVisible = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isVisible ? 'text' : 'password');
        this.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
        if (icon) {
            icon.classList.toggle('fa-eye', !isVisible);
            icon.classList.toggle('fa-eye-slash', isVisible);
        }
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok || !data.success || !data.token || data.user.role !== 'teacher') {
                throw new Error(data.message || 'Invalid teacher credentials.');
            }

            localStorage.removeItem('teacherLoggedIn');
            localStorage.removeItem('teacherEmail');
            localStorage.removeItem('teacher_token');
            sessionStorage.removeItem('teacherLoggedIn');
            sessionStorage.removeItem('teacherEmail');
            sessionStorage.removeItem('teacher_token');
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('teacherLoggedIn', 'true');
            storage.setItem('teacherEmail', data.user.email);
            storage.setItem('teacher_token', data.token);
            window.location.href = 'home.html';
        } catch (error) {
            alert(error.message || 'Unable to authenticate. Please try again.');
        }
    });

    window.addEventListener('load', function() {
        const token = localStorage.getItem('teacher_token') || sessionStorage.getItem('teacher_token');
        if (token && (localStorage.getItem('teacherLoggedIn') || sessionStorage.getItem('teacherLoggedIn'))) {
            window.location.href = 'home.html';
        }
    });
});