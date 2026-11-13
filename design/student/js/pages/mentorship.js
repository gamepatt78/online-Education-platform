document.addEventListener('DOMContentLoaded', loadMentorshipDirectory);

async function loadMentorshipDirectory() {
  const message = document.getElementById('mentorship-message');
  const count = document.getElementById('mentorship-count');
  const grid = document.getElementById('mentorship-grid');
  const token = localStorage.getItem('token');

  if (!token) {
    showMessage('Sign in to browse instructors and their courses.');
    const login = document.createElement('a');
    login.href = '/student/html/login.html';
    login.textContent = ' Open login page';
    message.appendChild(login);
    count.textContent = 'Sign in required';
    return;
  }

  try {
    const response = await fetch('/api/students/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Error('The Student API returned an unexpected response. Restart the Node app and try again.');
    }

    const result = await response.json();
    if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Unable to load course instructors.');
    }

    const instructors = groupCoursesByInstructor(result.data);
    count.textContent = `${instructors.length} instructor${instructors.length === 1 ? '' : 's'}`;
    if (instructors.length === 0) {
      showMessage('No instructor details are listed on published courses yet.');
      return;
    }

    message.textContent = '';
    instructors.forEach(instructor => grid.appendChild(createInstructorCard(instructor)));
  } catch (error) {
    console.error('Unable to load course instructors:', error);
    showMessage(error.message || 'Instructor information is temporarily unavailable.');
    count.textContent = 'Unavailable';
  }

  function showMessage(text) {
    message.textContent = text;
  }
}

function groupCoursesByInstructor(courses) {
  const instructors = new Map();
  courses.forEach(course => {
    const name = typeof course.instructor === 'string' ? course.instructor.trim() : '';
    if (!name) return;

    const key = name.toLocaleLowerCase();
    if (!instructors.has(key)) {
      instructors.set(key, { name, courses: [] });
    }
    instructors.get(key).courses.push(course);
  });

  return [...instructors.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function createInstructorCard(instructor) {
  const card = document.createElement('article');
  card.className = 'instructor-card';

  const heading = document.createElement('div');
  heading.className = 'instructor-card-heading';
  const icon = document.createElement('span');
  icon.className = 'instructor-avatar';
  icon.setAttribute('aria-hidden', 'true');
  const iconElement = document.createElement('i');
  iconElement.className = 'fas fa-user-tie';
  icon.appendChild(iconElement);

  const identity = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = instructor.name;
  const courseCount = document.createElement('p');
  courseCount.textContent = `${instructor.courses.length} published course${instructor.courses.length === 1 ? '' : 's'}`;
  identity.append(name, courseCount);
  heading.append(icon, identity);

  const courseList = document.createElement('ul');
  courseList.className = 'instructor-course-list';
  instructor.courses.forEach(course => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const title = String(course.title || 'Untitled course');
    const query = new URLSearchParams({ search_box: title });
    link.href = `/student/html/courses.html?${query.toString()}`;
    link.textContent = title;
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-arrow-right';
    arrow.setAttribute('aria-hidden', 'true');
    link.appendChild(arrow);
    item.appendChild(link);
    courseList.appendChild(item);
  });

  card.append(heading, courseList);
  return card;
}
