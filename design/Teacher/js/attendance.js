document.addEventListener('DOMContentLoaded', initializeAttendance);

async function initializeAttendance() {
  const token = localStorage.getItem('teacher_token') || sessionStorage.getItem('teacher_token');
  const courseSelect = document.getElementById('course-select');
  const dateInput = document.getElementById('attendance-date');
  const tbody = document.getElementById('attendance-body');
  const message = document.getElementById('attendance-message');
  const saveButton = document.querySelector('.save-btn');
  const totalElement = document.getElementById('attendance-total');
  const presentElement = document.getElementById('attendance-present');
  const absentElement = document.getElementById('attendance-absent');
  const rateElement = document.getElementById('attendance-rate');

  tbody.replaceChildren();
  dateInput.value = new Date().toISOString().slice(0, 10);
  if (!token) {
    message.textContent = 'Sign in as a teacher to manage attendance.';
    saveButton.disabled = true;
    return;
  }

  courseSelect.addEventListener('change', loadAttendance);
  dateInput.addEventListener('change', loadAttendance);
  saveButton.addEventListener('click', saveAttendance);
  tbody.addEventListener('change', updateSummary);

  try {
    const response = await fetch('/api/teachers/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await readAttendanceJson(response);
    if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Unable to load your courses.');
    }

    result.data.forEach(course => {
      const option = document.createElement('option');
      option.value = String(course.id);
      option.textContent = course.title;
      courseSelect.appendChild(option);
    });
    if (result.data.length === 0) {
      message.textContent = 'Create a course before taking attendance.';
      saveButton.disabled = true;
    } else {
      courseSelect.value = String(result.data[0].id);
      await loadAttendance();
    }
  } catch (error) {
    message.textContent = error.message || 'Unable to load attendance.';
    saveButton.disabled = true;
  }

  async function loadAttendance() {
    const courseId = courseSelect.value;
    if (!courseId || !dateInput.value) return;
    message.textContent = 'Loading attendance…';
    saveButton.disabled = true;
    try {
      const query = new URLSearchParams({ course_id: courseId, date: dateInput.value });
      const response = await fetch(`/api/teachers/attendance?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await readAttendanceJson(response);
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || 'Unable to load attendance.');
      }
      renderRecords(result.data.records);
      message.textContent = result.data.records.length
        ? 'Select a status for each enrolled student, then save.'
        : 'No students are enrolled in this course.';
      saveButton.disabled = result.data.records.length === 0;
    } catch (error) {
      tbody.replaceChildren();
      message.textContent = error.message || 'Unable to load attendance.';
      saveButton.disabled = true;
    }
  }

  function renderRecords(records) {
    tbody.replaceChildren();
    records.forEach(record => {
      const row = document.createElement('tr');
      row.dataset.studentId = record.student_id || '';
      row.dataset.userEmail = record.user_email || '';
      const nameCell = document.createElement('td');
      nameCell.textContent = record.name;
      const statusCell = document.createElement('td');
      const status = document.createElement('select');
      status.className = 'status-select';
      status.required = true;
      [['', 'Select status'], ['present', 'Present'], ['absent', 'Absent'], ['late', 'Late']]
        .forEach(([value, label]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          status.appendChild(option);
        });
      status.value = record.status || '';
      statusCell.appendChild(status);
      const remarksCell = document.createElement('td');
      const remarks = document.createElement('input');
      remarks.type = 'text';
      remarks.maxLength = 300;
      remarks.placeholder = 'Add remarks';
      remarks.value = record.remarks || '';
      remarksCell.appendChild(remarks);
      row.append(nameCell, statusCell, remarksCell);
      tbody.appendChild(row);
    });
    updateSummary();
  }

  function updateSummary() {
    const selects = [...tbody.querySelectorAll('.status-select')];
    const present = selects.filter(select => select.value === 'present' || select.value === 'late').length;
    const absent = selects.filter(select => select.value === 'absent').length;
    const marked = present + absent;
    totalElement.textContent = String(selects.length);
    presentElement.textContent = String(present);
    absentElement.textContent = String(absent);
    rateElement.textContent = marked ? `${Math.round((present / marked) * 100)}%` : '--';
  }

  async function saveAttendance() {
    const rows = [...tbody.querySelectorAll('tr')];
    const records = rows.map(row => ({
      student_id: row.dataset.studentId ? Number(row.dataset.studentId) : null,
      user_email: row.dataset.userEmail,
      status: row.querySelector('.status-select').value,
      remarks: row.querySelector('input').value.trim()
    }));
    if (records.some(record => !record.status)) {
      message.textContent = 'Choose a status for every enrolled student.';
      return;
    }

    saveButton.disabled = true;
    message.textContent = 'Saving attendance…';
    try {
      const response = await fetch('/api/teachers/attendance', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_id: Number(courseSelect.value),
          date: dateInput.value,
          records
        })
      });
      const result = await readAttendanceJson(response);
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || 'Unable to save attendance.');
      }
      message.textContent = result.message;
    } catch (error) {
      message.textContent = error.message || 'Unable to save attendance.';
    } finally {
      saveButton.disabled = false;
    }
  }
}

async function readAttendanceJson(response) {
  const type = response.headers.get('content-type') || '';
  if (!type.toLowerCase().includes('application/json')) {
    throw new Error('The server returned an unexpected response.');
  }
  return response.json();
}
