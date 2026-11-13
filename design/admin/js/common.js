// Admin Central Auth & State Utility
const ADMIN_API = '/api/admin';

function getAdminToken() {
  return localStorage.getItem('admin_token') || '';
}

function checkAdminAuth() {
  const token = localStorage.getItem('admin_token');
  if (!token && !window.location.pathname.endsWith('login.html')) {
    window.location.replace('/admin/html/login.html');
  }
}

function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

async function adminFetch(endpoint, options = {}) {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${ADMIN_API}${endpoint}`, {
      ...options,
      headers
    });
    if ((res.status === 401 || res.status === 403) && !window.location.pathname.endsWith('login.html')) {
      adminLogout();
    }
    return await res.json();
  } catch (err) {
    console.error(`Admin API Error on ${endpoint}:`, err);
    return { success: false, message: 'Network or server error.' };
  }
}

function adminLogout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  window.location.replace('/admin/html/login.html');
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', adminLogout);
  }
});
