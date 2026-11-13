document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    const popupModal = document.getElementById('popupModal');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const feedbackStatus = document.getElementById('feedback-status');
    const submitButton = feedbackForm.querySelector('button[type="submit"]');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const token = localStorage.getItem('token');

    if (!token) {
        submitButton.disabled = true;
        feedbackStatus.textContent = 'Sign in to submit feedback.';
        const loginLink = document.createElement('a');
        loginLink.href = '/student/html/login.html';
        loginLink.textContent = ' Open login page';
        feedbackStatus.appendChild(loginLink);
        return;
    }

    submitButton.disabled = true;
    loadFeedbackProfile();

    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!feedbackForm.reportValidity()) return;

        submitButton.disabled = true;
        feedbackStatus.textContent = 'Submitting your feedback...';
        feedbackStatus.className = 'feedback-status';
        try {
            const response = await fetch(feedbackForm.action, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: document.getElementById('subject').value.trim(),
                    rating: document.getElementById('rating').value,
                    feedback: document.getElementById('feedback').value.trim()
                })
            });
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.toLowerCase().includes('application/json')) {
                throw new Error('The feedback service returned an unexpected response. Reload the page and try again.');
            }
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to submit feedback.');
            }

            feedbackForm.reset();
            popupModal.style.display = 'flex';
            popupModal.setAttribute('aria-hidden', 'false');
            feedbackStatus.textContent = '';
            window.setTimeout(() => {
                popupModal.style.display = 'none';
                popupModal.setAttribute('aria-hidden', 'true');
            }, 3000);
        } catch (error) {
            console.error('Feedback submission failed:', error);
            feedbackStatus.textContent = error.message || 'Failed to submit feedback. Please try again.';
            feedbackStatus.classList.add('error');
        } finally {
            submitButton.disabled = false;
        }
    });

    closePopupBtn.addEventListener('click', () => {
        popupModal.style.display = 'none';
        popupModal.setAttribute('aria-hidden', 'true');
    });

    window.addEventListener('click', (e) => {
        if (e.target === popupModal) {
            popupModal.style.display = 'none';
            popupModal.setAttribute('aria-hidden', 'true');
        }
    });

    async function loadFeedbackProfile() {
        try {
            const response = await fetch('/api/students/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.toLowerCase().includes('application/json')) {
                throw new Error('The Student API returned an unexpected response. Restart the Flask app and try again.');
            }
            const result = await response.json();
            if (!response.ok || result.success !== true || !result.data) {
                throw new Error(result.message || 'Unable to load your student profile.');
            }
            nameInput.value = result.data.name || '';
            emailInput.value = result.data.email || '';
            submitButton.disabled = false;
        } catch (error) {
            console.error('Unable to load feedback profile:', error);
            feedbackStatus.textContent = error.message || 'Unable to load your profile. Feedback is unavailable.';
            submitButton.disabled = true;
        }
    }
});