async function loadEnrollments() {
  const res = await adminFetch('/enrollments');
  const tbody = document.getElementById('enrollments-table-body');
  if (res.success && res.data) {
    if (!res.data.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No enrollments recorded yet.</td></tr>';
      return;
    }
    tbody.innerHTML = res.data.map(e => {
      const progress = Math.min(100, Math.max(0, Number(e.progress) || 0));
      const status = e.status === 'completed' ? 'completed' : 'active';
      const enrolledAt = e.enrolled_at && !Number.isNaN(new Date(e.enrolled_at).getTime())
        ? new Date(e.enrolled_at).toLocaleDateString()
        : 'N/A';
      return `
      <tr>
        <td>#ENR-${escapeHTML(e.id)}</td>
        <td style="font-weight: 600;">${escapeHTML(e.user_email || 'N/A')}</td>
        <td>${escapeHTML(e.course_title || 'N/A')}</td>
        <td>
          <div style="background: #e2e8f0; border-radius: 999px; height: 8px; width: 120px; overflow: hidden; display: inline-block; vertical-align: middle; margin-right: 8px;">
            <div style="background: #0284c7; height: 100%; width: ${progress}%;"></div>
          </div>
          <span>${progress}%</span>
        </td>
        <td>
          <span class="badge ${status === 'completed' ? 'badge-success' : 'badge-info'}">
            ${status}
          </span>
        </td>
        <td>${escapeHTML(enrolledAt)}</td>
      </tr>
    `;
    }).join('');
  }
}

document.addEventListener('DOMContentLoaded', loadEnrollments);
