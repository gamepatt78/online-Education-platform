document.addEventListener('DOMContentLoaded', loadHomeDashboard);

async function loadHomeDashboard() {
  const message = document.getElementById('dashboard-message');
  const token = localStorage.getItem('token');
  if (!token) {
    message.textContent = 'Sign in to load your dashboard data.';
    addLoginLink(message);
    document.getElementById('continue-learning-message').textContent =
      'Sign in to view your enrolled courses.';
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  try {
    const result = await readDashboardResponse(
      await fetch('/api/students/dashboard', { headers })
    );
    const dashboard = result.data;
    setDashboardStat('enrolled_courses_count', dashboard.enrolled_courses_count);
    setDashboardStat('certificates_earned_count', dashboard.certificates_earned_count);
    setDashboardStat('pending_activities_count', dashboard.pending_activities_count);
    message.textContent = '';
  } catch (error) {
    console.error('Unable to load dashboard statistics:', error);
    message.textContent = error.message || 'Dashboard statistics are temporarily unavailable.';
  }

  try {
    const result = await readDashboardResponse(
      await fetch('/api/students/courses', { headers })
    );
    renderContinueLearning(
      Array.isArray(result.data) ? result.data : [],
      Array.isArray(result.enrollments) ? result.enrollments : []
    );
  } catch (error) {
    console.error('Unable to load enrolled courses:', error);
    document.getElementById('continue-learning-message').textContent =
      error.message || 'Your learning progress is temporarily unavailable.';
  }
}

async function readDashboardResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('The Student API returned an unexpected response. Restart the Flask app and try again.');
  }
  const result = await response.json();
  if (!response.ok || result.success !== true || !result.data) {
    throw new Error(result.message || 'Unable to load student data.');
  }
  return result;
}

function setDashboardStat(name, value) {
  const element = document.querySelector(`[data-dashboard-stat="${name}"]`);
  if (element) element.textContent = Number.isFinite(Number(value)) ? String(value) : '0';
}

function renderContinueLearning(courses, enrollments) {
  const message = document.getElementById('continue-learning-message');
  const list = document.getElementById('continue-learning-list');
  const courseById = new Map(courses.map(course => [Number(course.id), course]));
  const inProgress = enrollments
    .filter(enrollment => enrollment.status !== 'completed' && Number(enrollment.progress) < 100)
    .sort((left, right) => new Date(right.enrolled_at || 0) - new Date(left.enrolled_at || 0));

  list.replaceChildren();
  if (inProgress.length === 0) {
    message.textContent = 'No courses in progress yet.';
    const browseLink = document.createElement('a');
    browseLink.className = 'inline-btn';
    browseLink.href = '/student/html/courses.html';
    browseLink.textContent = 'Browse Courses';
    list.appendChild(browseLink);
    return;
  }

  message.textContent = 'Lesson-level resume tracking is not available yet. View each course’s current progress.';
  inProgress.forEach(enrollment => {
    const course = courseById.get(Number(enrollment.course_id));
    const card = document.createElement('article');
    card.className = 'continue-learning-card';
    const title = document.createElement('h3');
    title.textContent = course ? course.title : enrollment.course_title || 'Enrolled course';
    const progress = Math.min(100, Math.max(0, Number(enrollment.progress) || 0));
    const progressLabel = document.createElement('p');
    progressLabel.textContent = `${progress}% complete`;
    const progressBar = document.createElement('progress');
    progressBar.max = 100;
    progressBar.value = progress;
    progressBar.setAttribute('aria-label', `${title.textContent} course completion`);
    const link = document.createElement('a');
    link.className = 'inline-btn';
    link.href = '/student/html/status.html';
    link.textContent = 'View course status';
    card.append(title, progressBar, progressLabel, link);
    list.appendChild(card);
  });
}

function addLoginLink(message) {
  const login = document.createElement('a');
  login.href = '/student/html/login.html';
  login.textContent = ' Open login page';
  message.appendChild(login);
}
