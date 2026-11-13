document.addEventListener('DOMContentLoaded', function() {
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (!forgotForm) return;

    forgotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = document.getElementById('password-reset-message');
        const button = forgotForm.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: document.getElementById('email').value.trim() })
            });
            const data = await response.json();
            message.textContent = data.message || 'Password reset is unavailable.';
        } catch (error) {
            message.textContent = 'Unable to contact the password reset service.';
        } finally {
            button.disabled = false;
        }
    });
});