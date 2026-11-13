async function loadReports() {
  const res = await adminFetch('/reports');
  if (res.success && res.data) {
    const d = res.data;
    document.getElementById('rep-students').innerText = d.student_count || 0;
    document.getElementById('rep-teachers').innerText = d.teacher_count || 0;
    document.getElementById('rep-admissions').innerText = d.admissions_count || 0;
    document.getElementById('rep-rating').innerText = `${d.average_feedback_rating} / 5.0`;
  }
}

document.addEventListener('DOMContentLoaded', loadReports);
