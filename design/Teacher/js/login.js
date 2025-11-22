document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');

    // Temporary credentials for testing
    const TEMP_CREDENTIALS = {
        email: 'Priya@gmail.com',
        password: 'Teacher123'
    };

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const passwordInput = document.getElementById('loginPassword');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Check against temporary credentials
        if (isValidCredentials(email, password)) {
            // Store login state if remember me is checked
            if (rememberMe) {
                localStorage.setItem('teacherLoggedIn', 'true');
                localStorage.setItem('teacherEmail', email);
            } else {
                sessionStorage.setItem('teacherLoggedIn', 'true');
                sessionStorage.setItem('teacherEmail', email);
            }

            // Redirect to home page
            window.location.href = 'home.html';
        } else {
            alert('Invalid credentials!\nHint: Use email: teacher@example.com and password: Teacher123');
        }
    });

    // Credential validation against temporary credentials
    function isValidCredentials(email, password) {
        return email === TEMP_CREDENTIALS.email && password === TEMP_CREDENTIALS.password;
    }

    // Check if user is already logged in
    window.addEventListener('load', function() {
        if (localStorage.getItem('teacherLoggedIn') || sessionStorage.getItem('teacherLoggedIn')) {
            window.location.href = 'home.html';
        }
    });

    // Add temporary credentials hint to the page
    const formContainer = document.querySelector('.login-container');
    if (formContainer) {
        const hintText = document.createElement('div');
        hintText.className = 'credentials-hint';
        hintText.innerHTML = `
            <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 1rem;">
                <strong>Test Credentials:</strong><br>
                Email: ${TEMP_CREDENTIALS.email}<br>
                Password: ${TEMP_CREDENTIALS.password}
            </p>
        `;
        formContainer.appendChild(hintText);
    }
});