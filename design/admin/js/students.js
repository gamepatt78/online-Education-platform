let allStudents = [];

async function loadStudents() {
  const res = await adminFetch('/students');
  if (res.success && res.data) {
    allStudents = res.data;
    renderStudents(allStudents);
    document.getElementById('student-count-badge').innerText = `Total Students: ${allStudents.length}`;
  }
}

function renderStudents(students) {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;
  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No students found.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(s => {
    const id = Number.isSafeInteger(Number(s.id)) ? Number(s.id) : 0;
    const active = s.is_active !== false;
    return `
    <tr>
      <td>#${escapeHTML(id)}</td>
      <td style="font-weight: 600;">${escapeHTML(s.name)}</td>
      <td>${escapeHTML(s.email)}</td>
      <td>${escapeHTML(s.phone || 'N/A')}</td>
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

async function toggleStatus(id) {
  const res = await adminFetch('/students/toggle-status', {
    method: 'POST',
    body: JSON.stringify({ id })
  });
  if (res.success) {
    loadStudents();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  const tbody = document.getElementById('students-table-body');
  if (tbody) {
    tbody.addEventListener('click', event => {
      const button = event.target.closest('button[data-action="toggle-status"]');
      if (!button) return;
      const id = Number(button.dataset.id);
      if (Number.isSafeInteger(id) && id > 0) toggleStatus(id);
    });
  }
  const search = document.getElementById('student-search');
  if (search) {
    search.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = allStudents.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
      renderStudents(filtered);
    });
  }
});
