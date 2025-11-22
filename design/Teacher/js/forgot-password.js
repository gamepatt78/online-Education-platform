document.addEventListener('DOMContentLoaded', function() {
    const forgotForm = document.getElementById('forgotPasswordForm');

    forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.querySelector('#email').value;
        
        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Simulate API call for password reset
        console.log('Requesting password reset for:', email);
        
        // Show success message
        alert('If an account exists with this email, you will receive password reset instructions shortly.');
        
        // Reset form
        forgotForm.reset();
    });
});