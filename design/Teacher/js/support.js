document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-box input');
    const ticketForm = document.getElementById('ticketForm');
    const chatBtn = document.querySelector('.chat-btn');

    // Handle search
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Implement search functionality
        console.log(`Searching for: ${searchTerm}`);
    });

    // Handle ticket submission
    ticketForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(ticketForm);
        
        // Create ticket object
        const ticket = {
            type: formData.get('select'),
            priority: formData.get('select'),
            description: formData.get('textarea'),
            attachments: formData.getAll('file'),
            timestamp: new Date().toISOString(),
            status: 'open'
        };

        // Simulate API call
        console.log('Creating support ticket:', ticket);
        alert('Support ticket created successfully! We will respond shortly.');
        ticketForm.reset();
    });

    // Handle live chat
    chatBtn.addEventListener('click', () => {
        // Implement chat functionality
        const supportAgent = 'John Support';
        alert(`Connecting to support agent: ${supportAgent}`);
    });

    // Track ticket status
    function checkTicketStatus(ticketId) {
        // Simulate API call to check status
        const statuses = ['open', 'in-progress', 'resolved'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        return randomStatus;
    }

    // Auto-save form data
    let formTimeout;
    ticketForm.addEventListener('input', () => {
        clearTimeout(formTimeout);
        formTimeout = setTimeout(() => {
            const formData = new FormData(ticketForm);
            localStorage.setItem('supportDraft', JSON.stringify(Object.fromEntries(formData)));
        }, 1000);
    });

    // Load saved draft
    const savedDraft = localStorage.getItem('supportDraft');
    if (savedDraft) {
        const data = JSON.parse(savedDraft);
        Object.entries(data).forEach(([key, value]) => {
            const field = ticketForm.querySelector(`[name="${key}"]`);
            if (field) field.value = value;
        });
    }
});