async function loadCategories() {
  const res = await adminFetch('/categories');
  const tbody = document.getElementById('categories-table-body');
  if (res.success && res.data) {
    if (!res.data.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No categories found.</td></tr>';
      return;
    }
    tbody.innerHTML = res.data.map(c => {
      const id = Number.isSafeInteger(Number(c.id)) ? Number(c.id) : 0;
      return `
      <tr>
        <td>#${escapeHTML(id)}</td>
        <td style="font-weight: 600;"><i class="${escapeHTML(c.icon || 'fas fa-tag')}" style="margin-right: 8px; color: #0284c7;"></i>${escapeHTML(c.name)}</td>
        <td><code>${escapeHTML(c.slug)}</code></td>
        <td>${escapeHTML(c.description || 'N/A')}</td>
        <td>
          <button class="btn btn-sm btn-danger" data-action="delete" data-id="${id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    }).join('');
  }
}

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to remove this category?')) return;
  const res = await adminFetch(`/categories/${id}`, { method: 'DELETE' });
  if (res.success) {
    loadCategories();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  const tbody = document.getElementById('categories-table-body');
  if (tbody) {
    tbody.addEventListener('click', event => {
      const button = event.target.closest('button[data-action="delete"]');
      if (!button) return;
      const id = Number(button.dataset.id);
      if (Number.isSafeInteger(id) && id > 0) deleteCategory(id);
    });
  }
  const form = document.getElementById('create-category-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('cat-name').value;
      const description = document.getElementById('cat-desc').value;
      const res = await adminFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name, description })
      });
      if (res.success) {
        form.reset();
        loadCategories();
      }
    });
  }
});
