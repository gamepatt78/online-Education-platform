document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearBtn = document.querySelector('.clear-btn');
    const notifications = document.querySelectorAll('.notification-item');
    const markReadBtns = document.querySelectorAll('.mark-read');

    // Filter notifications
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterType = btn.dataset.filter;
            
            notifications.forEach(notification => {
                if (filterType === 'all' || notification.dataset.type === filterType) {
                    notification.style.display = 'flex';
                } else {
                    notification.style.display = 'none';
                }
            });
        });
    });

    // Clear all notifications
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            notifications.forEach(notification => {
                notification.style.display = 'none';
            });
        }
    });

    // Mark notification as read
    markReadBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const notification = e.target.closest('.notification-item');
            notification.classList.remove('unread');
            btn.style.display = 'none';
        });
    });

    // Notification Settings
    const settingsCheckboxes = document.querySelectorAll('.settings-group input[type="checkbox"]');
    settingsCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const setting = checkbox.parentElement.textContent.trim();
            const enabled = checkbox.checked;
            console.log(`${setting} ${enabled ? 'enabled' : 'disabled'}`);
            // Save settings to localStorage
            localStorage.setItem(`notification_${setting}`, enabled);
        });
    });

    // Load saved settings
    function loadSettings() {
        settingsCheckboxes.forEach(checkbox => {
            const setting = checkbox.parentElement.textContent.trim();
            const enabled = localStorage.getItem(`notification_${setting}`);
            if (enabled !== null) {
                checkbox.checked = enabled === 'true';
            }
        });
    }

    loadSettings();
});