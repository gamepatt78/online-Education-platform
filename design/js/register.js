document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  if (!document.getElementById('terms').checked) {
    alert('You must accept the Terms and Conditions');
    return;
  }

  // Collect form data
  const data = {
    name: document.getElementById('fullname').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    dob: document.getElementById('dob').value,
    designation: document.getElementById('designation').value
  };

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    alert(result.message);
    // Optionally redirect or reset form here
    // window.location.href = 'login.html';
    this.reset();
  } catch (error) {
    alert('Registration failed. Please try again.');
  }
});