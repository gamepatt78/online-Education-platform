document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    const addDegreeButton = document.getElementById('addDegree');
    const degreesList = document.getElementById('degreesList');
    const registrationStatus = document.getElementById('registrationStatus');
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    const submitButton = form.querySelector('.submit-btn');
    const today = new Date();
    const currentYear = today.getFullYear();
    const maxDate = [
        currentYear,
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    document.getElementById('regDob').max = maxDate;

    function setDegreeYearBounds(entry) {
        const yearInput = entry.querySelector('[name="year[]"]');
        yearInput.max = String(currentYear);
    }

    function updateRemoveButtons() {
        const entries = degreesList.querySelectorAll('.degree-entry');
        entries.forEach(entry => {
            entry.querySelector('.remove-degree').hidden = entries.length === 1;
        });
    }

    function validateDegreeEntries() {
        for (const entry of degreesList.querySelectorAll('.degree-entry')) {
            const fields = [
                entry.querySelector('[name="degree[]"]'),
                entry.querySelector('[name="university[]"]'),
                entry.querySelector('[name="year[]"]')
            ];
            fields.forEach(field => field.setCustomValidity(''));
            if (fields.every(field => !field.value.trim())) continue;

            const missingField = fields.find(field => !field.value.trim());
            if (missingField) {
                missingField.setCustomValidity('Complete the degree, university, and year for this entry.');
                return false;
            }
        }
        return true;
    }

    function validatePasswordMatch() {
        confirmPasswordInput.setCustomValidity(
            confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value
                ? 'Passwords do not match.'
                : ''
        );
    }

    degreesList.querySelectorAll('.degree-entry').forEach(setDegreeYearBounds);
    updateRemoveButtons();

    addDegreeButton.addEventListener('click', function () {
        const degreeEntry = document.createElement('div');
        degreeEntry.className = 'degree-entry';
        degreeEntry.innerHTML = `
            <div class="form-group">
                <label class="visually-hidden">Degree name</label>
                <input type="text" name="degree[]" placeholder="Degree name" aria-label="Degree name">
            </div>
            <div class="form-group">
                <label class="visually-hidden">University</label>
                <input type="text" name="university[]" placeholder="University" aria-label="University">
            </div>
            <div class="form-group">
                <label class="visually-hidden">Year</label>
                <input type="number" name="year[]" placeholder="Year" min="1950" aria-label="Year">
            </div>
            <button type="button" class="remove-degree" aria-label="Remove degree">Remove</button>
        `;
        degreesList.appendChild(degreeEntry);
        setDegreeYearBounds(degreeEntry);
        updateRemoveButtons();
    });

    degreesList.addEventListener('input', function (event) {
        if (event.target.matches('[name="degree[]"], [name="university[]"], [name="year[]"]')) {
            event.target.setCustomValidity('');
        }
    });

    degreesList.addEventListener('click', function (event) {
        const removeButton = event.target.closest('.remove-degree');
        if (!removeButton) return;

        removeButton.closest('.degree-entry').remove();
        updateRemoveButtons();
    });

    passwordInput.addEventListener('input', validatePasswordMatch);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        validatePasswordMatch();
        if (!validateDegreeEntries()) {
            form.reportValidity();
            return;
        }
        if (!form.reportValidity()) return;

        registrationStatus.className = 'status-message';
        registrationStatus.textContent = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting application…';

        const data = {
            name: document.getElementById('regName').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            phone: document.getElementById('regPhone').value.trim(),
            dob: document.getElementById('regDob').value,
            designation: document.getElementById('regDesignation').value.trim(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value,
            degrees: Array.from(degreesList.querySelectorAll('.degree-entry'))
                .map(entry => ({
                    degree: entry.querySelector('[name="degree[]"]').value.trim(),
                    university: entry.querySelector('[name="university[]"]').value.trim(),
                    year: entry.querySelector('[name="year[]"]').value
                }))
                .filter(item => item.degree || item.university || item.year)
        };

        try {
            const response = await fetch('/api/auth/register-teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json().catch(() => null);
            if (!response.ok || !result || result.success !== true) {
                throw new Error(result && result.message
                    ? result.message
                    : 'Unable to submit your application. Please try again.');
            }

            registrationStatus.className = 'status-message is-success';
            registrationStatus.textContent = result.message;
            form.reset();
            while (degreesList.children.length > 1) {
                degreesList.lastElementChild.remove();
            }
            updateRemoveButtons();
        } catch (error) {
            registrationStatus.className = 'status-message is-error';
            registrationStatus.textContent = error.message || 'Unable to reach the server. Please try again.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit application';
        }
    });
});
