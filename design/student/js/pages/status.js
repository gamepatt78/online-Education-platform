document.addEventListener('DOMContentLoaded', loadStudentStatus);

async function loadStudentStatus() {
  const message = document.getElementById('status-message');
  const coursesBody = document.getElementById('status-courses-body');
  const token = localStorage.getItem('token');

  if (!token) {
    showStatusError('Sign in to view your course progress.');
    return;
  }

  try {
    const response = await fetch('/api/students/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('The course service returned an unexpected response. Restart the Flask app and try again.');
    }

    const result = await response.json();
    if (!response.ok || result.success !== true) {
      throw new Error(result.message || 'Unable to load course progress.');
    }

    renderStudentStatus(
      Array.isArray(result.data) ? result.data : [],
      Array.isArray(result.enrollments) ? result.enrollments : []
    );
    message.textContent = '';
  } catch (error) {
    console.error('Unable to load student course status:', error);
    showStatusError(error.message || 'Unable to load course progress. Please try again later.');
  }

  function showStatusError(text) {
    message.textContent = text;
    coursesBody.replaceChildren();
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = text;
    row.appendChild(cell);
    coursesBody.appendChild(row);
  }
}

function renderStudentStatus(courses, enrollments) {
  const coursesBody = document.getElementById('status-courses-body');
  const enrollmentByCourse = new Map(
    enrollments.map(enrollment => [Number(enrollment.course_id), enrollment])
  );
  const completedCount = enrollments.filter(enrollment =>
    enrollment.status === 'completed' || Number(enrollment.progress) >= 100
  ).length;
  const notStartedCount = courses.filter(course =>
    !enrollmentByCourse.has(Number(course.id))
  ).length;

  setStatusCount('total', courses.length);
  setStatusCount('completed', completedCount);
  setStatusCount('not-started', notStartedCount);
  coursesBody.replaceChildren();

  if (courses.length === 0) {
    appendStatusMessageRow(coursesBody, 'No published courses are available yet.');
    renderStatusActivity([]);
    return;
  }

  courses.forEach(course => {
    const enrollment = enrollmentByCourse.get(Number(course.id));
    const progress = enrollment
      ? Math.min(100, Math.max(0, Number(enrollment.progress) || 0))
      : 0;
    const isComplete = Boolean(enrollment) &&
      (enrollment.status === 'completed' || progress >= 100);
    const statusText = isComplete ? 'Completed' : enrollment ? 'In Progress' : 'Not Started';
    const statusClass = isComplete ? 'complete' : enrollment ? 'progress' : 'pending';
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = course.title || 'Untitled course';

    const progressCell = document.createElement('td');
    const track = document.createElement('div');
    track.className = 'progress-track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', String(progress));
    track.setAttribute('aria-label', `${course.title || 'Course'} completion`);
    const fill = document.createElement('span');
    fill.className = 'progress-fill';
    fill.style.width = `${progress}%`;
    track.appendChild(fill);
    progressCell.appendChild(track);

    const completionCell = document.createElement('td');
    completionCell.textContent = `${progress}%`;

    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${statusClass}`;
    statusBadge.textContent = statusText;
    statusCell.appendChild(statusBadge);

    const certificateCell = document.createElement('td');
    if (isComplete) {
      const certificateLink = document.createElement('a');
      certificateLink.href = '/student/html/Certification.html';
      certificateLink.className = 'cert-link';
      certificateLink.textContent = 'View';
      certificateCell.appendChild(certificateLink);
    } else {
      const pending = document.createElement('span');
      pending.className = 'cert-pending';
      pending.textContent = 'Pending';
      certificateCell.appendChild(pending);
    }

    row.append(nameCell, progressCell, completionCell, statusCell, certificateCell);
    coursesBody.appendChild(row);
  });

  renderStatusActivity(enrollments);
}

function setStatusCount(name, value) {
  const target = document.querySelector(`[data-status-count="${name}"]`);
  if (target) target.textContent = String(value);
}

function appendStatusMessageRow(tableBody, text) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 5;
  cell.textContent = text;
  row.appendChild(cell);
  tableBody.appendChild(row);
}

function renderStatusActivity(enrollments) {
  const activity = document.getElementById('status-activity');
  activity.replaceChildren();

  const recentEnrollments = [...enrollments]
    .sort((left, right) => new Date(right.enrolled_at || 0) - new Date(left.enrolled_at || 0))
    .slice(0, 3);

  if (recentEnrollments.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Enroll in a course to see your learning activity here.';
    activity.appendChild(emptyMessage);
    return;
  }

  recentEnrollments.forEach(enrollment => {
    const item = document.createElement('article');
    item.className = 'activity-item';
    const icon = document.createElement('div');
    icon.className = 'activity-icon blue';
    icon.innerHTML = '<i class="fas fa-book-open" aria-hidden="true"></i>';
    const content = document.createElement('div');
    content.className = 'activity-content';
    const title = document.createElement('h4');
    title.textContent = enrollment.course_title || 'Enrolled course';
    const detail = document.createElement('p');
    detail.textContent = `${Math.min(100, Math.max(0, Number(enrollment.progress) || 0))}% complete`;
    content.append(title, detail);
    item.append(icon, content);
    activity.appendChild(item);
  });
}
