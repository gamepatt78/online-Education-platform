let allCourses = [];

async function loadCourses() {
  const res = await adminFetch('/courses');
  if (res.success && res.data) {
    allCourses = res.data;
    renderCourses(allCourses);
  }
}

function renderCourses(courses) {
  const tbody = document.getElementById('courses-table-body');
  if (!tbody) return;
  if (!courses.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No courses registered yet.</td></tr>';
    return;
  }

  tbody.innerHTML = courses.map(c => {
    const id = Number.isSafeInteger(Number(c.id)) ? Number(c.id) : 0;
    const published = c.status === 'published';
    return `
    <tr>
      <td>#${escapeHTML(id)}</td>
      <td style="font-weight: 600;">${escapeHTML(c.title)}</td>
      <td>${escapeHTML(c.category)}</td>
      <td>${escapeHTML(c.instructor || 'Unassigned')}</td>
      <td>
        <span class="badge ${published ? 'badge-success' : 'badge-warning'}">
          ${escapeHTML(c.status)}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm ${published ? 'btn-danger' : 'btn-primary'}" data-action="toggle-status" data-id="${id}" data-status="${published ? 'pending' : 'published'}">
            ${published ? 'Unpublish' : 'Approve & Publish'}
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete" data-id="${id}"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

async function toggleCourseStatus(id, newStatus) {
  const res = await adminFetch(`/courses/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus })
  });
  if (res.success) {
    loadCourses();
  }
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to permanently delete this course?')) return;
  const res = await adminFetch(`/courses/${id}`, { method: 'DELETE' });
  if (res.success) {
    loadCourses();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCourses();

  const tbody = document.getElementById('courses-table-body');
  if (tbody) {
    tbody.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const id = Number(button.dataset.id);
      if (!Number.isSafeInteger(id) || id < 1) return;
      if (button.dataset.action === 'toggle-status') toggleCourseStatus(id, button.dataset.status);
      if (button.dataset.action === 'delete') deleteCourse(id);
    });
  }

  const form = document.getElementById('create-course-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('course-title').value;
      const category = document.getElementById('course-category').value;
      const level = document.getElementById('course-level').value;
      const instructor = document.getElementById('course-instructor').value;
      const description = document.getElementById('course-desc').value;

      const res = await adminFetch('/courses', {
        method: 'POST',
        body: JSON.stringify({ title, category, level, instructor, description })
      });

      if (res.success) {
        alert('Course created and published successfully!');
        form.reset();
        loadCourses();
      } else {
        alert(res.message || 'Failed to create course');
      }
    });
  }
});
