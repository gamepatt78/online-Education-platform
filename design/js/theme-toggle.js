document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.toggle('dark-mode', savedTheme === 'dark');
    } else {
        body.classList.toggle('dark-mode', prefersDark.matches);
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        const thumb = themeToggle.querySelector('.toggle-thumb');
        thumb.style.animation = 'none';
        thumb.offsetHeight; 
        thumb.style.animation = '';
        
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { isDark: body.classList.contains('dark-mode') }
        }));
    });

    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            body.classList.toggle('dark-mode', e.matches);
        }
    });
});