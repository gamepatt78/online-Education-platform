document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    const popupModal = document.getElementById('popupModal');
    const closePopupBtn = document.getElementById('closePopupBtn');

    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            rating: document.getElementById('rating').value,
            feedback: document.getElementById('feedback').value
        };

        // Store feedback in localStorage (for demo purposes)
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        feedbacks.push({
            ...formData,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        // Show success popup
        popupModal.style.display = 'flex';
        
        // Reset form
        feedbackForm.reset();

        // Auto close popup after 3 seconds
        setTimeout(() => {
            popupModal.style.display = 'none';
        }, 3000);
    });

    // Close popup when clicking the close button
    closePopupBtn.addEventListener('click', () => {
        popupModal.style.display = 'none';
    });

    // Close popup when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === popupModal) {
            popupModal.style.display = 'none';
        }
    });
});