document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('input[name="search_box"]');
    const videoCards = document.querySelectorAll('.video-card');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        videoCards.forEach(card => {
            const title = card.querySelector('.title');
            if (!title) return;
            if (title.textContent.toLowerCase().includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
