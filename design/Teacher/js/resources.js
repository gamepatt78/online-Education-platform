document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('resourceSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', event => {
        const searchTerm = event.target.value.toLowerCase();
        document.querySelectorAll('.resource-item').forEach(resource => {
            const title = resource.querySelector('h3');
            resource.style.display = title && title.textContent.toLowerCase().includes(searchTerm)
                ? 'flex'
                : 'none';
        });
    });
});
