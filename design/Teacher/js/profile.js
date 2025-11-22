document.addEventListener('DOMContentLoaded', function() {
    const editPhotoBtn = document.querySelector('.edit-photo');
    const profilePhoto = document.querySelector('.profile-photo');
    let fileInput;

    // Create hidden file input
    function createFileInput() {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // Handle file selection
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Handle photo edit button click
    editPhotoBtn.addEventListener('click', function() {
        if (!fileInput) {
            createFileInput();
        }
        fileInput.click();
    });

    // Handle file selection
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            // Update profile photo
            profilePhoto.src = e.target.result;
            
            // Save to localStorage
            localStorage.setItem('teacherProfilePhoto', e.target.result);
            
            showNotification('Profile photo updated successfully', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Load saved profile photo on page load
    function loadSavedPhoto() {
        const savedPhoto = localStorage.getItem('teacherProfilePhoto');
        if (savedPhoto) {
            profilePhoto.src = savedPhoto;
        }
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize
    loadSavedPhoto();
});