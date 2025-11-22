document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('dark');
    
    const toggles = document.querySelectorAll('.theme-toggle, #toggle-btn');
    toggles.forEach(toggle => toggle.remove());
});