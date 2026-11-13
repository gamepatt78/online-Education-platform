(() => {
    const legacySection = document.querySelector('.watch-video1');

    if (legacySection && !document.getElementById('course-video')) {
        const cards = Array.from(legacySection.querySelectorAll('.video-card'));
        const legacyLessons = cards.map((card, index) => {
            const iframe = card.querySelector('iframe');
            if (!iframe) return null;

            const titleElement = card.querySelector('.title, h3');
            const source = iframe.dataset.videoId || iframe.getAttribute('src') || '';
            const videoMatch = source.match(/(?:^|\/embed\/)([A-Za-z0-9_-]{11})(?:[?&#]|$)/);
            const title = iframe.title.trim()
                ? iframe.title.trim()
                : titleElement && titleElement.textContent.trim();

            if (!videoMatch || !title) return null;

            return {
                lessonNumber: index + 1,
                videoId: videoMatch[1],
                videoTitle: title
            };
        }).filter(Boolean);

        if (legacyLessons.length === 0) {
            console.error('This course has no valid YouTube lessons configured.');
            return;
        }

        const courseTitle = legacySection.dataset.courseTitle || 'Course videos';
        const playlistHref = legacySection.dataset.playlistHref || '/student/html/courses.html';
        const layout = document.createElement('main');
        layout.className = 'watch-layout';
        layout.dataset.courseTitle = courseTitle;
        layout.setAttribute('aria-label', `${courseTitle} course video and playlist`);
        layout.innerHTML = `
            <section class="watch-main" aria-labelledby="watch-title">
                <div class="watch-player">
                    <iframe
                        id="course-video"
                        class="course-video"
                        title=""
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        referrerpolicy="strict-origin-when-cross-origin"
                        loading="eager"
                        allowfullscreen
                    ></iframe>
                    <button class="watch-player-play" id="watch-player-play" type="button" aria-label="Play selected lesson">
                        <span class="watch-player-play-icon"><i class="fas fa-play" aria-hidden="true"></i></span>
                        <span>Play lesson</span>
                    </button>
                </div>
                <div class="watch-video-details">
                    <div>
                        <p class="watch-eyebrow"><i class="fas fa-graduation-cap" aria-hidden="true"></i> <span class="watch-course-name"></span> <span aria-hidden="true">/</span> <span id="watch-part"></span></p>
                        <h1 id="watch-title"></h1>
                        <p class="watch-description">Choose a lesson from the watch list to play it here.</p>
                    </div>
                    <div class="watch-video-actions">
                        <a class="watch-back-link"><i class="fas fa-arrow-left" aria-hidden="true"></i> Course overview</a>
                    </div>
                </div>
            </section>
            <aside class="watch-playlist" aria-labelledby="watch-list-title">
                <div class="watch-playlist-header">
                    <div>
                        <p class="watch-eyebrow">KEEP LEARNING</p>
                        <h2 id="watch-list-title">Watch list</h2>
                    </div>
                    <span class="watch-count"></span>
                </div>
                <div class="watch-playlist-list" id="watch-playlist-list"></div>
            </aside>
            <p class="visually-hidden" id="watch-announcement" role="status" aria-live="polite"></p>
        `;

        layout.querySelector('.watch-course-name').textContent = courseTitle.toUpperCase();
        layout.querySelector('.watch-back-link').href = playlistHref;

        const list = layout.querySelector('#watch-playlist-list');
        legacyLessons.forEach(({ lessonNumber, videoId, videoTitle }) => {
            const button = document.createElement('button');
            const formattedNumber = String(lessonNumber).padStart(2, '0');
            button.className = 'watch-lesson';
            button.type = 'button';
            button.dataset.lesson = String(lessonNumber);
            button.dataset.videoId = videoId;
            button.dataset.videoTitle = videoTitle;
            button.setAttribute('aria-current', 'false');
            button.innerHTML = `
                <span class="watch-lesson-thumbnail">
                    <i class="fas fa-play watch-lesson-placeholder" aria-hidden="true"></i>
                    <span>${formattedNumber}</span>
                </span>
                <span class="watch-lesson-copy">
                    <span>LESSON ${formattedNumber}</span>
                    <strong></strong>
                    <small class="watch-lesson-status" hidden></small>
                </span>
                <i class="fas fa-play" aria-hidden="true"></i>
            `;
            button.querySelector('strong').textContent = videoTitle;
            list.appendChild(button);
        });

        layout.querySelector('.watch-count').textContent =
            `${legacyLessons.length} ${legacyLessons.length === 1 ? 'lesson' : 'lessons'}`;
        legacySection.replaceWith(layout);
    }

    const player = document.getElementById('course-video');
    const playButton = document.getElementById('watch-player-play');
    const title = document.getElementById('watch-title');
    const part = document.getElementById('watch-part');
    const announcement = document.getElementById('watch-announcement');
    const lessons = Array.from(document.querySelectorAll('.watch-lesson'));

    if (!player || !playButton || !title || !part || !announcement || lessons.length === 0) return;

    const layout = document.querySelector('.watch-layout');
    const courseTitle = layout && layout.dataset.courseTitle
        ? layout.dataset.courseTitle
        : 'HTML Foundations';

    function selectLesson(lesson, updateAddress = true, autoplay = false) {
        const lessonNumber = Number(lesson.dataset.lesson);
        const videoId = lesson.dataset.videoId;
        const videoTitle = lesson.dataset.videoTitle;

        if (!Number.isSafeInteger(lessonNumber) || !videoId || !videoTitle) return;

        lessons.forEach(item => {
            const isActive = item === lesson;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-current', isActive ? 'true' : 'false');
            const status = item.querySelector('.watch-lesson-status');
            if (status) {
                status.hidden = !isActive;
                status.textContent = isActive ? 'Now playing' : '';
            }
        });

        player.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?controls=1&playsinline=1&rel=0${autoplay ? '&autoplay=1' : ''}`;
        player.title = videoTitle;
        player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        playButton.hidden = autoplay;
        title.textContent = videoTitle;
        part.textContent = `LESSON ${String(lessonNumber).padStart(2, '0')}`;
        announcement.textContent = `Now playing ${videoTitle}`;
        document.title = `${videoTitle} - ${courseTitle}`;

        if (updateAddress) {
            window.history.replaceState(null, '', `${window.location.pathname}?lesson=${lessonNumber}`);
        }
    }

    lessons.forEach(lesson => {
        lesson.addEventListener('click', () => selectLesson(lesson));
    });

    playButton.addEventListener('click', () => {
        const selectedLesson = lessons.find(lesson => lesson.classList.contains('is-active'));
        if (selectedLesson) selectLesson(selectedLesson, true, true);
    });

    const requestedLesson = Number(new URLSearchParams(window.location.search).get('lesson'));
    const initialLesson = lessons.find(lesson => Number(lesson.dataset.lesson) === requestedLesson) || lessons[0];
    selectLesson(initialLesson, false);
})();
