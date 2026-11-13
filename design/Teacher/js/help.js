document.addEventListener('DOMContentLoaded', () => {
    const supportBtn = document.querySelector('.support-btn');
    if (supportBtn) {
        supportBtn.addEventListener('click', () => {
            window.location.href = 'support-btn.html';
        });
    }
});