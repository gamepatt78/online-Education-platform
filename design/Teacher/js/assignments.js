document.addEventListener('DOMContentLoaded', initializeAssignments);

async function initializeAssignments() {
  const token = localStorage.getItem('teacher_token') || sessionStorage.getItem('teacher_token');
  const form = document.querySelector('.assignment-form');
  const courseSelect = document.getElementById('subject');
  const list = document.getElementById('assignments-list');
  const message = document.getElementById('assignments-message');
  const submitButton = form.querySelector('[type="submit"]');

  list.replaceChildren();
  courseSelect.replaceChildren(new Option('Select one of your courses', ''));
  const gradebook = document.querySelector('.student-marks');
  gradebook.replaceChildren();
  const gradebookTitle = document.createElement('h2');
  gradebookTitle.textContent = 'Gradebook';
  const gradebookMessage = document.createElement('p');
  gradebookMessage.textContent = 'Gradebook entry is not connected to assignment submissions yet.';
  gradebook.append(gradebookTitle, gradebookMessage);
  if (!token) {
    message.textContent = 'Sign in as a teacher to manage assignments.';
    submitButton.disabled = true;
    return;
  }

  form.addEventListener('submit', createAssignment);
  try {
    const [courses, assignments] = await Promise.all([
      fetchTeacherData('/api/teachers/courses', token),
      fetchTeacherData('/api/teachers/assignments', token)
    ]);
    courses.data.forEach(course => courseSelect.add(new Option(course.title, String(course.id))));
    renderAssignments(assignments.data);
    if (courses.data.length === 0) {
      message.textContent = 'Create a course before publishing assignments.';
      submitButton.disabled = true;
    } else {
      message.textContent = `${assignments.data.length} assignment${assignments.data.length === 1 ? '' : 's'} loaded.`;
    }
  } catch (error) {
    message.textContent = error.message || 'Unable to load assignments.';
    submitButton.disabled = true;
  }

  async function createAssignment(event) {
    event.preventDefault();
    submitButton.disabled = true;
    message.textContent = 'Publishing assignment…';
    try {
      const response = await fetch('/api/teachers/assignments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          course_id: Number(courseSelect.value),
          title: document.getElementById('title').value.trim(),
          description: document.getElementById('description').value.trim(),
          deadline: document.getElementById('due-date').value,
          total_marks: Number(document.getElementById('marks').value)
        })
      });
      const result = await readTeacherJson(response);
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || 'Unable to publish assignment.');
      }
      form.reset();
      await reloadAssignments();
      message.textContent = result.message;
    } catch (error) {
      message.textContent = error.message || 'Unable to publish assignment.';
    } finally {
      submitButton.disabled = false;
    }
  }

  async function reloadAssignments() {
    const assignments = await fetchTeacherData('/api/teachers/assignments', token);
    renderAssignments(assignments.data);
  }

  function renderAssignments(assignments) {
    list.replaceChildren();
    if (assignments.length === 0) {
      list.textContent = 'No assignments have been published yet.';
      return;
    }
    assignments.forEach(assignment => {
      const card = document.createElement('article');
      card.className = 'assignment-card';
      const header = document.createElement('div');
      header.className = 'assignment-header';
      const title = document.createElement('h3');
      title.textContent = assignment.title;
      const dueDate = document.createElement('span');
      dueDate.className = 'due-date';
      dueDate.textContent = assignment.deadline
        ? `Due: ${new Date(`${assignment.deadline}T00:00:00`).toLocaleDateString()}`
        : 'No due date';
      header.append(title, dueDate);
      const courseName = document.createElement('p');
      courseName.textContent = assignment.course_title || 'Course unavailable';
      const description = document.createElement('p');
      description.textContent = assignment.description || 'No description provided.';
      const marks = document.createElement('p');
      marks.textContent = `Total marks: ${assignment.total_marks}`;
      card.append(header, courseName, description, marks);
      list.appendChild(card);
    });
  }
}

async function fetchTeacherData(url, token) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const result = await readTeacherJson(response);
  if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
    throw new Error(result.message || 'Unable to load teacher data.');
  }
  return result;
}

async function readTeacherJson(response) {
  const type = response.headers.get('content-type') || '';
  if (!type.toLowerCase().includes('application/json')) {
    throw new Error('The server returned an unexpected response.');
  }
  return response.json();
}
