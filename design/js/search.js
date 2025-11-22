// Example course data
const courses = [
   { title: "Complete HTML Tutorial", link: "watch-video.html?course=html" },
   { title: "complete CSS tutorial", link: "watch-video1.html?course=CSS" },
   { title: "complete js tutorial", link: "watch-video2.html?course=js" },
   { title: "complete Boostrap tutorial", link: "watch-video3.html?course=Boostrap" },
   { title: "complete JQuery tutorial", link: "watch-video4.html?course=JQuery" },
   { title: "complete SASS tutorial", link: "watch-video5.html?course=SASS" },
   { title: "complete cloud computing tutorials", link: "watch-video6.html?course=cloud-computing" },
   { title: "Data Structures", link: "watch-video.html?course=data-structures" },
   { title: "Cloud Computing", link: "watch-video.html?course=cloud-computing" },
   { title: "dbms", link: "watch-video.html?course=database-management" },
   { title: "Playlist", link: "playlist.html" }
   
];

const params = new URLSearchParams(window.location.search);
const query = params.get('search_box');
const resultsDiv = document.getElementById('search-results');

if (resultsDiv) {
   if (query) {
      // Filter courses by search term (case-insensitive)
      const filtered = courses.filter(course =>
         course.title.toLowerCase().includes(query.toLowerCase())
      );

      let html = `<h2>Results for: <em>${query}</em></h2>`;
      if (filtered.length > 0) {
         html += '<ul class="search-course-list">';
         filtered.forEach(course => {
            html += `<li><a href="${course.link}">${course.title}</a></li>`;
         });
         html += '</ul>';
      } else {
         html += '<p>No courses found.</p>';
      }
      resultsDiv.innerHTML = html;
   } else {
      resultsDiv.innerHTML = `<h2>No search term entered.</h2>`;
   }

   // Always show all course links below the search results
   let allCoursesHtml = `<h3>All Courses</h3><ul class="search-course-list">`;
   courses.forEach(course => {
      allCoursesHtml += `<li><a href="${course.link}">${course.title}</a></li>`;
   });
   allCoursesHtml += '</ul>';
   resultsDiv.innerHTML += allCoursesHtml;
}

// Simple search filter for video titles

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('input[name="search_box"]');
    const videoCards = document.querySelectorAll('.video-card');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        videoCards.forEach(card => {
            const title = card.querySelector('.title').textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

