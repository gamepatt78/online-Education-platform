document.addEventListener('DOMContentLoaded', initializeCoursesPage);

async function initializeCoursesPage() {
  const token = localStorage.getItem('token');
  const message = document.getElementById('courses-message');
  const grid = document.getElementById('courses-grid');
  const search = document.getElementById('course-search');
  const categoryFilter = document.getElementById('course-category');
  const progressFilter = document.getElementById('course-progress');
  const sortBy = document.getElementById('course-sort');
  let courses = [];
  let enrollments = [];

  if (!token) {
    showMessage('Sign in to browse courses and enroll.');
    return;
  }

  search.value = new URLSearchParams(window.location.search).get('search_box') || '';
  [search, categoryFilter, progressFilter, sortBy].forEach(control => {
    control.addEventListener('input', render);
    control.addEventListener('change', render);
  });

  await loadCourses();

  async function loadCourses() {
    try {
      const response = await fetch('/api/students/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await readJson(response);
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || 'Unable to load the course catalog.');
      }
      courses = Array.isArray(result.data) ? result.data : [];
      enrollments = Array.isArray(result.enrollments) ? result.enrollments : [];
      populateCategories();
      render();
    } catch (error) {
      console.error('Unable to load course catalog:', error);
      showMessage(error.message || 'Unable to load courses. Please try again later.');
    }
  }

  function populateCategories() {
    const categories = [...new Set(courses.map(course => course.category).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right));
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  function render() {
    const enrollmentByCourse = new Map(
      enrollments.map(enrollment => [Number(enrollment.course_id), enrollment])
    );
    const query = search.value.trim().toLocaleLowerCase();
    const filteredCourses = courses.filter(course => {
      const titleMatches = String(course.title || '').toLocaleLowerCase().includes(query);
      const categoryMatches = !categoryFilter.value || course.category === categoryFilter.value;
      const state = getCourseState(enrollmentByCourse.get(Number(course.id)));
      const progressMatches = !progressFilter.value || state === progressFilter.value;
      return titleMatches && categoryMatches && progressMatches;
    });

    filteredCourses.sort((left, right) => {
      if (sortBy.value === 'recent') {
        const leftDate = enrollmentByCourse.get(Number(left.id))?.enrolled_at || '';
        const rightDate = enrollmentByCourse.get(Number(right.id))?.enrolled_at || '';
        return rightDate.localeCompare(leftDate);
      }
      return String(left.title || '').localeCompare(String(right.title || ''));
    });

    grid.replaceChildren();
    if (filteredCourses.length === 0) {
      showMessage(courses.length ? 'No courses match your filters.' : 'No published courses are available.');
      return;
    }
    message.textContent = '';
    filteredCourses.forEach(course => {
      grid.appendChild(createCourseCard(course, enrollmentByCourse.get(Number(course.id))));
    });
  }

  function createCourseCard(course, enrollment) {
    const card = document.createElement('article');
    card.className = 'box course-card';
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumb';
    if (typeof course.thumbnail === 'string' && course.thumbnail.startsWith('/assets/')) {
      const image = document.createElement('img');
      image.src = course.thumbnail;
      image.alt = '';
      image.loading = 'lazy';
      thumbnail.appendChild(image);
    } else {
      thumbnail.classList.add('course-thumb-placeholder');
      const icon = document.createElement('i');
      icon.className = 'fas fa-book-open';
      icon.setAttribute('aria-hidden', 'true');
      thumbnail.appendChild(icon);
    }

    const category = document.createElement('p');
    category.className = 'course-category';
    category.textContent = [course.category, course.level].filter(Boolean).join(' · ');
    const title = document.createElement('h2');
    title.className = 'title';
    title.textContent = course.title || 'Untitled course';
    const description = document.createElement('p');
    description.className = 'course-description';
    description.textContent = course.description || 'No course description provided.';
    const details = document.createElement('dl');
    details.className = 'course-details';
    appendCourseDetail(details, 'Instructor', course.instructor || 'Not specified');
    appendCourseDetail(details, 'Duration', course.duration || 'Not specified');
    appendCourseDetail(details, 'Status', enrollment ? getCourseState(enrollment).replace('-', ' ') : 'Not started');

    card.append(thumbnail, category, title, description, details);
    if (enrollment) {
      const progress = Math.min(100, Math.max(0, Number(enrollment.progress) || 0));
      const progressBar = document.createElement('progress');
      progressBar.max = 100;
      progressBar.value = progress;
      progressBar.setAttribute('aria-label', `${course.title} course completion`);
      const progressText = document.createElement('p');
      progressText.className = 'course-progress-text';
      progressText.textContent = `${progress}% complete`;
      const enrolledDate = document.createElement('p');
      enrolledDate.className = 'course-enrolled-date';
      enrolledDate.textContent = `Enrolled ${formatCourseDate(enrollment.enrolled_at)}`;
      const statusLink = document.createElement('a');
      statusLink.className = 'inline-btn';
      statusLink.href = '/student/html/status.html';
      statusLink.textContent = 'View course status';
      card.append(progressBar, progressText, enrolledDate, statusLink);
    } else {
      const enrollButton = document.createElement('button');
      enrollButton.type = 'button';
      enrollButton.className = 'inline-btn enroll-course-btn';
      enrollButton.textContent = 'Enroll';
      enrollButton.addEventListener('click', () => enroll(course.id, enrollButton));
      card.appendChild(enrollButton);
    }
    return card;
  }

  async function enroll(courseId, button) {
    button.disabled = true;
    try {
      const response = await fetch('/api/students/enroll', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });
      const result = await readJson(response);
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to enroll in this course.');
      }
      showMessage(result.message || 'Enrollment successful.');
      await loadCourses();
    } catch (error) {
      console.error('Course enrollment failed:', error);
      showMessage(error.message || 'Enrollment failed. Please try again.');
    } finally {
      button.disabled = false;
    }
  }

  function showMessage(text) {
    message.textContent = text;
  }
}

async function readJson(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('The Student API returned an unexpected response. Restart the Flask app and try again.');
  }
  return response.json();
}

function getCourseState(enrollment) {
  if (!enrollment) return 'not-started';
  if (enrollment.status === 'completed' || Number(enrollment.progress) >= 100) return 'completed';
  return 'in-progress';
}

function appendCourseDetail(list, termText, descriptionText) {
  const term = document.createElement('dt');
  term.textContent = termText;
  const description = document.createElement('dd');
  description.textContent = descriptionText;
  list.append(term, description);
}

function formatCourseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'date unavailable' : date.toLocaleDateString();
}
