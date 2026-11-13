let allTeachers = [];

async function loadTeachers() {
  const res = await adminFetch('/teachers');
  if (res.success && res.data) {
    allTeachers = res.data;
    renderTeachers(allTeachers);
    document.getElementById('teacher-count-badge').innerText = `Total Faculty: ${allTeachers.length}`;
  }
}

function renderTeachers(teachers) {
  const tbody = document.getElementById('teachers-table-body');
  if (!tbody) return;
  if (!teachers.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No teachers found.</td></tr>';
    return;
  }

  tbody.innerHTML = teachers.map(t => {
    const id = Number.isSafeInteger(Number(t.id)) ? Number(t.id) : 0;
    const active = t.is_active !== false;
    return `
    <tr>
      <td>#${escapeHTML(id)}</td>
      <td style="font-weight: 600;">${escapeHTML(t.name)}</td>
      <td>${escapeHTML(t.email)}</td>
      <td>${escapeHTML(t.designation || 'Instructor')}</td>
      <td>
        <span class="badge ${active ? 'badge-success' : 'badge-danger'}">
          ${active ? 'Active' : 'Deactivated'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm ${active ? 'btn-danger' : 'btn-primary'}" data-action="toggle-status" data-id="${id}">
          ${active ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  `;
  }).join('');
}

async function toggleTeacherStatus(id) {
  const res = await adminFetch('/teachers/toggle-status', {
    method: 'POST',
    body: JSON.stringify({ id })
  });
  if (res.success) {
    loadTeachers();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTeachers();
  const tbody = document.getElementById('teachers-table-body');
  if (tbody) {
    tbody.addEventListener('click', event => {
      const button = event.target.closest('button[data-action="toggle-status"]');
      if (!button) return;
      const id = Number(button.dataset.id);
      if (Number.isSafeInteger(id) && id > 0) toggleTeacherStatus(id);
    });
  }
  const search = document.getElementById('teacher-search');
  if (search) {
    search.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = allTeachers.filter(t =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q))
      );
      renderTeachers(filtered);
    });
  }
});
