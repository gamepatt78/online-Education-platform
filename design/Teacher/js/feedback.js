document.addEventListener('DOMContentLoaded', function() {
    const subjectFilter = document.getElementById('subjectFilter');
    const dateFilter = document.getElementById('dateFilter');
    const feedbackList = document.querySelector('.feedback-list');
    
    // Handle filters
    function applyFilters() {
        const subject = subjectFilter.value;
        const date = dateFilter.value;
        
        // Simulate API call with filters
        console.log(`Fetching feedback for ${subject || 'all subjects'} in ${date}`);
        
        // Update stats based on filters
        updateStats(subject, date);
    }
    
    subjectFilter.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);
    
    // Handle reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const feedbackItem = this.closest('.feedback-item');
            const subject = feedbackItem.querySelector('h3').textContent;
            // Implement reply functionality
            alert(`Reply to feedback for ${subject}`);
        });
    });
    
    // Handle archive buttons
    document.querySelectorAll('.archive-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const feedbackItem = this.closest('.feedback-item');
            if (confirm('Are you sure you want to archive this feedback?')) {
                feedbackItem.style.opacity = '0.5';
                // Implement archive functionality
                console.log('Feedback archived');
            }
        });
    });
    
    // Pagination
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentPage = 1;
    const totalPages = 5;
    
    function updatePagination() {
        document.querySelector('.feedback-pagination span').textContent = 
            `Page ${currentPage} of ${totalPages}`;
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            // Fetch previous page data
            fetchFeedbackPage(currentPage);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            // Fetch next page data
            fetchFeedbackPage(currentPage);
        }
    });
    
    function fetchFeedbackPage(page) {
        // Simulate API call for pagination
        console.log(`Fetching feedback page ${page}`);
    }
    
    // Initialize
    updatePagination();
});