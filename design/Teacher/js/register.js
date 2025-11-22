document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const addDegreeBtn = document.getElementById('addDegree');
    const degreesList = document.getElementById('degreesList');

    // Add new degree fields
    addDegreeBtn.addEventListener('click', function() {
        const degreeEntry = document.createElement('div');
        degreeEntry.className = 'degree-entry';
        degreeEntry.innerHTML = `
            <input type="text" name="degree[]" placeholder="Degree Name" required>
            <input type="text" name="university[]" placeholder="University" required>
            <input type="number" name="year[]" placeholder="Year" min="1950" max="2025" required>
            <button type="button" class="remove-degree">
                <i class="fas fa-minus-circle"></i>
            </button>
        `;
        degreesList.appendChild(degreeEntry);
        updateRemoveButtons();
    });

    // Remove degree fields
    degreesList.addEventListener('click', function(e) {
        if (e.target.closest('.remove-degree')) {
            e.target.closest('.degree-entry').remove();
            updateRemoveButtons();
        }
    });

    // Update remove buttons visibility
    function updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-degree');
        removeButtons.forEach(button => {
            button.style.display = degreesList.children.length > 1 ? 'inline-block' : 'none';
        });
    }

    // Form validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Phone validation
        const phone = document.getElementById('regPhone').value;
        if (!/^\d{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        // Email validation
        const email = document.getElementById('regEmail').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            dob: formData.get('dob'),
            designation: formData.get('designation'),
            degrees: Array.from(document.querySelectorAll('.degree-entry')).map(entry => ({
                degree: entry.querySelector('[name="degree[]"]').value,
                university: entry.querySelector('[name="university[]"]').value,
                year: entry.querySelector('[name="year[]"]').value
            }))
        };

        console.log('Form Data:', data);
        // Here you would typically send the data to your server
        alert('Registration successful!');
    });
});