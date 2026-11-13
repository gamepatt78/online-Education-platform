/**
 * Authenticates students with the server.
 */
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('#loginForm');
  const submitBtn = document.querySelector('#loginBtn') || loginForm.querySelector('.submit-btn');

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const emailVal = (emailInput.value || '').trim();
    const passVal = passwordInput.value || '';

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: passVal })
      });

      const data = await response.json();

      if (response.ok && data.success && data.token && data.user.role === 'student') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);

        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 800);
        return;
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      showToast(err.message || 'Unable to authenticate. Please try again.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Password Visibility Toggle
  const passwordToggle = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('password');

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.classList.remove('fa-eye');
        passwordToggle.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        passwordToggle.classList.remove('fa-eye-slash');
        passwordToggle.classList.add('fa-eye');
      }
    });
  }
});

// Toast notification helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 14px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4f46e5'};
    color: #fff;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    transition: all 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
