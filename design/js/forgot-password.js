document.getElementById('forgotPasswordForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const errorDiv = document.getElementById('forgotPasswordError');

  try {
    const res = await fetch('http://localhost:5000/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const result = await res.json();

    if (res.ok && result.success) {
      alert(result.message || 'Password reset instructions have been sent to your email.');
      window.location.href = '/login.html';
    } else {
      errorDiv.textContent = result.message || 'Failed to send password reset instructions.';
    }

  } catch (err) {
    console.error('Error:', err);
    errorDiv.textContent = 'Something went wrong. Try again.';
  }
});
