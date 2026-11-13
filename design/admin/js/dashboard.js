document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await adminFetch('/stats');
    if (res.success && res.data) {
      const d = res.data;
      document.getElementById('stat-students').innerText = d.total_students || 0;
      document.getElementById('stat-teachers').innerText = d.total_teachers || 0;
      document.getElementById('stat-courses').innerText = d.total_courses || 0;
      document.getElementById('stat-enrollments').innerText = d.total_enrollments || 0;

      const tbody = document.getElementById('recent-courses-table');
      if (d.recent_courses && d.recent_courses.length > 0) {
        tbody.innerHTML = d.recent_courses.map(c => `
          <tr>
            <td style="font-weight: 600;">${escapeHTML(c.title)}</td>
            <td>${escapeHTML(c.category)}</td>
            <td>${escapeHTML(c.instructor || 'Staff')}</td>
            <td>
              <span class="badge ${c.status === 'published' ? 'badge-success' : 'badge-warning'}">
                ${escapeHTML(c.status)}
              </span>
            </td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No courses recorded yet.</td></tr>';
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
  }
});
