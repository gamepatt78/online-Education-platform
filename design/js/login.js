document.addEventListener('DOMContentLoaded', function() {
  // Temporary login credentials (demo). Accept password '123' for any demo email,
  // or match explicit demo emails added to `demoEmails`.
  const demoEmails = ['Fatima@gmail.com', 'Frank@gmail.com'];
  const demoPassword = '123';

  const loginForm = document.querySelector('#loginForm');
  const submitBtn = loginForm.querySelector('.submit-btn');

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      const emailVal = (emailInput.value || '').trim();
      const passVal = (passwordInput.value || '').trim();

      // Demo acceptance: either a matching demo email + demo password,
      // or any email with the demo password '123'.
      const isDemoUser = (demoEmails.includes(emailVal) && passVal === demoPassword) || (passVal === demoPassword);

      if (isDemoUser) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', emailVal || 'demo@local');

        alert('Login successful! Redirecting to home page...');
        // Redirect students to the site home page
        window.location.href = 'home.html';
      } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        alert('Invalid credentials!\n\nUse these temporary credentials:\nEmail: Frank@gmail.com\nPassword: 123');
      }
    }, 1000);
  });

  const passwordToggle = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('password');
  
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.classList.remove('fa-eye');
        passwordToggle.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        passwordToggle.classList.remove('fa-eye-slash');
        passwordToggle.classList.add('fa-eye');
      }
    });
  }
});