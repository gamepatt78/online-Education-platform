document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('profile-status');
  const token = localStorage.getItem('token');

  async function readApiResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      const message = response.status === 404
        ? 'The Student API route was not found. Restart the app servers and reload this page.'
        : `The Student API returned an unexpected response (${response.status}).`;
      throw new Error(message);
    }
    return response.json();
  }

  if (!token) {
    status.textContent = 'Sign in to view your student profile.';
    const loginLink = document.createElement('a');
    loginLink.href = '/student/html/login.html';
    loginLink.textContent = ' Open login page';
    status.appendChild(loginLink);
    return;
  }

  const savedImage = localStorage.getItem('studentProfileImage');
  if (savedImage) {
    document.querySelectorAll('img.profile-img, img.profile-image, .profile .image')
      .forEach(image => { image.src = savedImage; });
  }

  try {
    const response = await fetch('/api/students/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await readApiResponse(response);
    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || 'Unable to load your profile.');
    }

    const profile = result.data;
    document.querySelectorAll('.profile-name, .profile .name').forEach(element => {
      element.textContent = profile.name || 'Student';
    });
    ['email', 'phone', 'designation'].forEach(field => {
      const element = document.querySelector(`[data-profile="${field}"]`);
      if (element) element.textContent = profile[field] || '—';
    });
    status.textContent = 'Profile loaded.';

    try {
      const dashboardResponse = await fetch('/api/students/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dashboard = await readApiResponse(dashboardResponse);
      if (!dashboardResponse.ok || !dashboard.success || !dashboard.data) {
        throw new Error(dashboard.message || 'Unable to load course progress.');
      }
      ['enrolled_courses_count', 'completed_courses_count'].forEach(field => {
        const element = document.querySelector(`[data-dashboard="${field}"]`);
        if (element) element.textContent = dashboard.data[field];
      });
    } catch (error) {
      console.error('Student course progress load failed:', error);
      status.textContent = 'Profile loaded, but course progress could not be loaded.';
    }
  } catch (error) {
    console.error('Student profile load failed:', error);
    status.textContent = error.message || 'Unable to load your profile. Please try again.';
  }
});
