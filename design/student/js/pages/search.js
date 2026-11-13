document.addEventListener('DOMContentLoaded', loadCourseSearchResults);

const youtubeLessons = [{
  title: 'Complete HTML tutorial (Part 03)',
  course: 'HTML Foundations',
  videoId: 'fRJtaFgf1NY',
  videoUrl: 'https://youtu.be/fRJtaFgf1NY',
  watchUrl: '/student/html/watch-video.html?lesson=3'
}];

async function loadCourseSearchResults() {
  const status = document.getElementById('search-status');
  const resultsContainer = document.getElementById('search-results');
  const query = (new URLSearchParams(window.location.search).get('search_box') || '').trim();
  const token = localStorage.getItem('token');

  if (!query) {
    status.textContent = 'Enter a search term to find published courses.';
    return;
  }
  const normalizedQuery = query.toLocaleLowerCase();
  const matchingLessons = youtubeLessons.filter(lesson =>
    [lesson.title, lesson.course, lesson.videoId, lesson.videoUrl]
      .some(value => value.toLocaleLowerCase().includes(normalizedQuery))
  );
  if (!token) {
    resultsContainer.replaceChildren();
    matchingLessons.forEach(lesson => resultsContainer.appendChild(createLessonResult(lesson)));
    status.textContent = matchingLessons.length
      ? 'Matching lessons are available below. Sign in to search the course catalog.'
      : 'Sign in to search the course catalog.';
    appendLoginLink(status);
    return;
  }

  try {
    const response = await fetch('/api/students/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Error('The Student API returned an unexpected response. Restart the Flask app and try again.');
    }
    const result = await response.json();
    if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
      throw new Error(result.message || 'Unable to search the course catalog.');
    }

    const matches = result.data.filter(course =>
      [course.title, course.description, course.category, course.instructor]
        .some(value => String(value || '').toLocaleLowerCase().includes(normalizedQuery))
    );
    resultsContainer.replaceChildren();

    if (matches.length === 0 && matchingLessons.length === 0) {
      status.textContent = `No published courses matched “${query}”.`;
      return;
    }

    status.textContent = `${matches.length} course${matches.length === 1 ? '' : 's'} and ${matchingLessons.length} lesson${matchingLessons.length === 1 ? '' : 's'} found.`;
    matches.forEach(course => {
      const article = document.createElement('article');
      article.className = 'search-result-card';
      const title = document.createElement('h2');
      title.textContent = course.title || 'Untitled course';
      const description = document.createElement('p');
      description.textContent = course.description || 'No description provided.';
      const metadata = document.createElement('p');
      metadata.textContent = [course.category, course.instructor].filter(Boolean).join(' · ');
      const link = document.createElement('a');
      const params = new URLSearchParams({ search_box: course.title || query });
      link.href = `/student/html/courses.html?${params.toString()}`;
      link.className = 'inline-btn';
      link.textContent = 'View in course catalog';
      article.append(title, description, metadata, link);
      resultsContainer.appendChild(article);
    });
    matchingLessons.forEach(lesson => resultsContainer.appendChild(createLessonResult(lesson)));
  } catch (error) {
    console.error('Course search failed:', error);
    status.textContent = error.message || 'Course search is temporarily unavailable.';
  }
}

function createLessonResult(lesson) {
  const article = document.createElement('article');
  article.className = 'search-result-card';
  const title = document.createElement('h2');
  title.textContent = lesson.title;
  const description = document.createElement('p');
  description.textContent = `${lesson.course} · YouTube lesson`;
  const watchLink = document.createElement('a');
  watchLink.href = lesson.watchUrl;
  watchLink.className = 'inline-btn';
  watchLink.textContent = 'Watch lesson';
  const youtubeLink = document.createElement('a');
  youtubeLink.href = lesson.videoUrl;
  youtubeLink.target = '_blank';
  youtubeLink.rel = 'noopener noreferrer';
  youtubeLink.textContent = 'Open on YouTube';
  article.append(title, description, watchLink, youtubeLink);
  return article;
}

function appendLoginLink(container) {
  const login = document.createElement('a');
  login.href = '/student/html/login.html';
  login.textContent = ' Open login page';
  container.appendChild(login);
}
