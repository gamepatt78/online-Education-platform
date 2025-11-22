document.addEventListener('DOMContentLoaded', function() {
    const uploadBtn = document.getElementById('uploadBtn');
    const modal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const searchInput = document.getElementById('resourceSearch');

    // Handle resource search
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const resources = document.querySelectorAll('.resource-item');

        resources.forEach(resource => {
            const title = resource.querySelector('h3').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                resource.style.display = 'flex';
            } else {
                resource.style.display = 'none';
            }
        });
    });

    // Handle upload modal
    uploadBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    document.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Handle file upload
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        
        // Here you would typically send the data to a server
        console.log('Uploading resource...', Object.fromEntries(formData));
        
        alert('Resource uploaded successfully!');
        modal.style.display = 'none';
        uploadForm.reset();
    });

    // Handle resource actions
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceTitle = this.closest('.resource-item').querySelector('h3').textContent;
            console.log(`Downloading ${resourceTitle}...`);
            alert('Download started!');
        });
    });

    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceTitle = this.closest('.resource-item').querySelector('h3').textContent;
            // Implement sharing functionality
            alert(`Share ${resourceTitle}`);
        });
    });

    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceTitle = this.closest('.resource-item').querySelector('h3').textContent;
            // Implement video playback
            alert(`Playing ${resourceTitle}`);
        });
    });
});