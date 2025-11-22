document.querySelector('.login-btn').addEventListener('click', function () {
    window.location.href = 'login.html';
});

document.querySelector('.register-btn').addEventListener('click', function () {
    window.location.href = 'register.html';
});

document.getElementById('admissionForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitButton = this.querySelector('.submit-btn');
    const statusMessage = document.getElementById('submissionStatus');
    statusMessage.textContent = ''; // Clear previous messages
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const admissionData = {
        fullName: document.getElementById('fullName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        previousDegree: document.getElementById('previousDegree').value,
        cgpa: document.getElementById('cgpa').value,
        yearOfPassing: document.getElementById('yearOfPassing').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    try {
        const response = await fetch("http://localhost:5000/submit-admission", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(admissionData)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        statusMessage.style.color = 'green';
        statusMessage.textContent = result.message || "Application submitted successfully!";
        this.reset(); // Reset the form after success
    } catch (err) {
        console.error("Submission failed", err);
        statusMessage.style.color = 'red';
        statusMessage.textContent = "Submission failed. Please try again.";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
    }
});
