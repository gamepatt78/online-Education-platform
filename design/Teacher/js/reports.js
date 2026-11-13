document.addEventListener('DOMContentLoaded', initializeTeacherReports);

async function initializeTeacherReports() {
  const token = localStorage.getItem('teacher_token') || sessionStorage.getItem('teacher_token');
  const startDate = document.getElementById('start-date');
  const endDate = document.getElementById('end-date');
  const status = document.getElementById('report-status');
  const generateButton = document.querySelector('.generate-btn');
  const today = new Date();
  const todayString = formatLocalDate(today);
  startDate.value = `${todayString.slice(0, 7)}-01`;
  endDate.value = todayString;

  if (!token) {
    status.textContent = 'Sign in as a teacher to view reports.';
    generateButton.disabled = true;
    return;
  }
  if (typeof Chart !== 'function') {
    status.textContent = 'Charts could not load. Check the connection and reload this page.';
    generateButton.disabled = true;
    return;
  }

  const attendanceChart = new Chart(document.getElementById('attendanceChart'), {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Attendance rate', data: [], borderColor: '#6366f1', tension: 0.3 }] },
    options: { responsive: true, scales: { y: { min: 0, max: 100 } } }
  });
  const performanceChart = new Chart(document.getElementById('performanceChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Submission completion (%)', data: [], backgroundColor: '#6366f1' }] },
    options: { responsive: true, scales: { y: { min: 0, max: 100 } } }
  });
  const subjectChart = new Chart(document.getElementById('subjectChart'), {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Attendance rate', data: [], backgroundColor: 'rgba(99, 102, 241, 0.5)', borderColor: '#6366f1' }] },
    options: { responsive: true, scales: { y: { min: 0, max: 100 } } }
  });

  generateButton.addEventListener('click', loadReport);
  await loadReport();

  async function loadReport() {
    if (!startDate.value || !endDate.value || startDate.value > endDate.value) {
      status.textContent = 'Choose a valid start and end date.';
      return;
    }

    generateButton.disabled = true;
    status.textContent = 'Loading report data…';
    try {
      const params = new URLSearchParams({
        start_date: startDate.value,
        end_date: endDate.value
      });
      const response = await fetch(`/api/teachers/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        throw new Error('The server returned an unexpected response.');
      }
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || 'Unable to load teacher reports.');
      }
      updateCharts(result.data);
      updateStatistics(result.data);
      status.textContent = 'Report data loaded.';
    } catch (error) {
      status.textContent = error.message || 'Unable to load teacher reports.';
    } finally {
      generateButton.disabled = false;
    }
  }

  function updateCharts(data) {
    attendanceChart.data.labels = data.attendance_by_date.map(item => item.date);
    attendanceChart.data.datasets[0].data = data.attendance_by_date.map(item => item.rate);
    attendanceChart.update();

    performanceChart.data.labels = data.assignment_performance.map(item => item.title);
    performanceChart.data.datasets[0].data = data.assignment_performance.map(item =>
      item.expected_submissions
        ? Math.round((item.submissions / item.expected_submissions) * 100)
        : 0
    );
    performanceChart.update();

    subjectChart.data.labels = data.attendance_by_course.map(item => item.course_title);
    subjectChart.data.datasets[0].data = data.attendance_by_course.map(item => item.rate);
    subjectChart.update();
  }

  function updateStatistics(data) {
    document.getElementById('report-attendance-rate').textContent =
      data.attendance_rate === null ? 'No data' : `${data.attendance_rate}%`;
    document.getElementById('report-assignment-rate').textContent =
      data.assignment_completion_rate === null ? 'No data' : `${data.assignment_completion_rate}%`;
    document.getElementById('report-average-score').textContent =
      data.average_score === null ? 'No data' : `${data.average_score}/100`;
  }
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
