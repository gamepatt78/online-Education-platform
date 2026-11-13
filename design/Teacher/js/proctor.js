// Modern placeholder for future proctoring interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Example: Highlight flagged students
    document.querySelectorAll('.status-flagged').forEach(el => {
        el.parentElement.parentElement.style.background = '#fff3f3';
    });
});