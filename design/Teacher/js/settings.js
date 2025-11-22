document.addEventListener('DOMContentLoaded', function() {
    // Get all form elements
    const settingsForm = document.querySelectorAll('.settings-form');
    const saveBtn = document.querySelector('.save-btn');
    
    // Save settings
    saveBtn.addEventListener('click', function() {
        const settings = {};
        
        // Collect all switch values
        document.querySelectorAll('.switch input').forEach(input => {
            settings[input.closest('.form-group').querySelector('label').textContent] = input.checked;
        });
        
        // Collect all select values
        document.querySelectorAll('select').forEach(select => {
            settings[select.closest('.form-group').querySelector('label').textContent] = select.value;
        });
        
        // Save to localStorage
        localStorage.setItem('teacherSettings', JSON.stringify(settings));
        
        // Show success message
        alert('Settings saved successfully!');
    });
    
    // Load saved settings
    const savedSettings = localStorage.getItem('teacherSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Apply saved switch values
        document.querySelectorAll('.switch input').forEach(input => {
            const setting = settings[input.closest('.form-group').querySelector('label').textContent];
            if (setting !== undefined) {
                input.checked = setting;
            }
        });
        
        // Apply saved select values
        document.querySelectorAll('select').forEach(select => {
            const setting = settings[select.closest('.form-group').querySelector('label').textContent];
            if (setting !== undefined) {
                select.value = setting;
            }
        });
    }
});