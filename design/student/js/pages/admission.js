document.querySelector('.login-btn').addEventListener('click', function () {
    window.location.href = 'login.html';
});

document.querySelector('.register-btn').addEventListener('click', function () {
    window.location.href = 'register.html';
});

const admissionForm = document.getElementById('admissionForm');
const dateOfBirthInput = document.getElementById('dob');
const today = new Date();
dateOfBirthInput.max = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
].join('-');

admissionForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const submitButton = this.querySelector('.submit-btn');
    const statusMessage = document.getElementById('submissionStatus');
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';
    this.setAttribute('aria-busy', 'true');

    const admissionData = {
        fullName: document.getElementById('fullName').value,
        dob: dateOfBirthInput.value,
        gender: document.getElementById('gender').value,
        previousDegree: document.getElementById('previousDegree').value,
        cgpa: document.getElementById('cgpa').value,
        yearOfPassing: document.getElementById('yearOfPassing').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    try {
        const response = await fetch('/submit-admission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(admissionData)
        });
        const result = await response.json().catch(() => null);

        if (!response.ok || !result || result.success !== true) {
            const message = result && typeof result.message === 'string'
                ? result.message
                : 'We could not submit your application. Please try again.';
            throw new Error(message);
        }

        statusMessage.className = 'status-message is-visible is-success';
        statusMessage.textContent = result.message || 'Your application was submitted successfully.';
        this.reset();
    } catch (error) {
        console.error('Admission submission failed.');
        statusMessage.className = 'status-message is-visible is-error';
        statusMessage.textContent = error.message || 'Could not reach the server. Please try again.';
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submit application <span aria-hidden="true">→</span>';
        this.removeAttribute('aria-busy');
    }
});
