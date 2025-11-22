document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registerForm');

  form.onsubmit = async function (e) {
    e.preventDefault();

    if (!document.getElementById('terms').checked) {
      alert('You must accept the Terms and Conditions');
      return;
    }

    const data = {
      name: document.getElementById('fullname').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      dob: document.getElementById('dob').value,
      designation: document.getElementById('designation').value,
      terms: document.getElementById('terms').checked
   
    };

    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message || "Registration completed!");
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Failed to register. Please try again.");
    }
  };
});
