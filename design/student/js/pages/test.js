const practiceAnswerKeys = {
    mocktest1: ['a', 'b', 'b', 'b', 'a', 'a', 'a', 'b', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
    mocktest2: ['a', 'a', 'a', 'a', 'a', 'c', 'a', 'b', 'd', 'a', 'b', 'a', 'a', 'a', 'c', 'b', 'a', 'a', 'a', 'a'],
    mocktest3: ['c', 'b', 'a', 'b', 'c', 'c', 'd', 'b', 'c', 'd', 'd', 'd', 'd', 'c', 'd', 'd', 'b', 'c', 'd', 'c']
};

class Timer {
    constructor(duration, display, onComplete) {
        this.duration = duration;
        this.display = display;
        this.onComplete = onComplete;
        this.running = false;
        this.timeLeft = duration;
        this.endTime = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.endTime = Date.now() + this.timeLeft * 1000;
        this.updateRemaining();

        this.interval = setInterval(() => {
            this.updateRemaining();
        }, 1000);
    }

    updateRemaining() {
        this.timeLeft = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
        this.updateDisplay();

        if (this.timeLeft <= 300) {
            this.display.parentElement.classList.add('warning');
        }
        if (this.timeLeft <= 60) {
            this.display.parentElement.classList.remove('warning');
            this.display.parentElement.classList.add('danger');
        }

        if (this.timeLeft === 0 && this.running) {
            this.stop();
            this.onComplete();
        }
    }

    stop() {
        clearInterval(this.interval);
        this.running = false;
    }

    reset() {
        this.timeLeft = this.duration;
        this.endTime = null;
        this.updateDisplay();
        this.display.parentElement.classList.remove('warning', 'danger');
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getTimeLeft() {
        return this.timeLeft;
    }
}

// Initialize timer when document loads
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-test');
    const confirmStartBtn = document.getElementById('confirm-start');
    const overlay = document.getElementById('test-overlay');
    const timer = document.querySelector('.timer');
    const questions = document.querySelectorAll('.question');
    const timerDisplay = document.getElementById('countdown');
    const timeRemaining = document.getElementById('time-remaining');
    const submitButton = document.getElementById('submit');

    if (!startBtn || !confirmStartBtn || !overlay || !timer || !timerDisplay || !submitButton) {
        return;
    }

    const testMatch = window.location.pathname.match(/mocktest[123]/i);
    const testId = testMatch ? testMatch[0].toLowerCase() : null;
    const answerKey = testId ? practiceAnswerKeys[testId] : null;
    const hasAnswerOptions = answerKey && questions.length === answerKey.length &&
        Array.from(questions).every((question, index) =>
            question.querySelector('input[type="radio"][value="' + answerKey[index] + '"]')
        );
    if (!hasAnswerOptions) {
        startBtn.disabled = true;
        confirmStartBtn.disabled = true;
        const errorMessage = document.createElement('p');
        errorMessage.setAttribute('role', 'alert');
        errorMessage.textContent = 'This practice test is temporarily unavailable because its questions are not configured correctly.';
        const testContent = document.querySelector('.test-content');
        if (testContent) testContent.prepend(errorMessage);
        return;
    }

    let testSubmitted = false;
    let testStarted = false;
    submitButton.disabled = true;
    const timerInstance = new Timer(2700, timerDisplay, () => submitTest(true));
    window.testTimer = timerInstance;

    questions.forEach(question => {
        question.querySelectorAll('input[type="radio"]').forEach(input => {
            input.disabled = true;
        });
    });

    // Start button click
    startBtn.addEventListener('click', () => {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
    });

    // Confirm start click
    confirmStartBtn.addEventListener('click', () => {
        // Hide overlay and start button
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        startBtn.style.display = 'none';

        // Show timer and enable questions
        timer.style.display = 'flex';
        questions.forEach(question => {
            question.querySelectorAll('input[type="radio"]').forEach(input => {
                input.disabled = false;
            });
        });
        localStorage.setItem('testInProgressId', testId);
        localStorage.setItem('testStartTime', String(Date.now()));
        testStarted = true;
        submitButton.disabled = false;
        timerInstance.start();
    });

    // Initialize variables
    let currentSection = 'html-basics';
    let currentQuestion = 1;

    // Get DOM elements
    const sections = document.querySelectorAll('.question-section');
    const sectionBtns = document.querySelectorAll('.section-btn');

    // Update both displays
    if (timeRemaining) window.setInterval(() => {
        if (timeRemaining) {
            timeRemaining.textContent = timerDisplay.textContent;
        }
    }, 1000);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && timerInstance.running) timerInstance.updateRemaining();
    });

    // Handle beforeunload event
    window.addEventListener('beforeunload', (e) => {
        if (timerInstance.running && timerInstance.timeLeft > 0) {
            e.preventDefault();
            e.returnValue = 'Your test progress is saved in this browser and will resume when you return.';
        }
    });

    // Section Navigation
    sectionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            switchSection(sectionId);
        });
    });

    function switchSection(sectionId) {
        // Update active section button
        sectionBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Hide all sections and show selected section
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(sectionId);
        activeSection.style.display = 'block';
        activeSection.classList.add('active');

        // Reset question counter
        currentQuestion = 1;
        currentSection = sectionId;
        showQuestion(currentQuestion);
    }

    // Question Navigation
    function showQuestion(num) {
        const activeSection = document.querySelector('.question-section.active');
        const questions = activeSection.querySelectorAll('.question');

        questions.forEach(q => q.classList.remove('active'));
        questions[num - 1].classList.add('active');

        // Update navigation buttons
        document.getElementById('prev').disabled = num === 1;
        document.getElementById('next').disabled = num === questions.length;
    }

    // Navigation button handlers
    document.getElementById('prev').addEventListener('click', () => {
        if (currentQuestion > 1) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });

    document.getElementById('next').addEventListener('click', () => {
        const activeSection = document.querySelector('.question-section.active');
        const totalQuestions = activeSection.querySelectorAll('.question').length;
        if (currentQuestion < totalQuestions) {
            currentQuestion++;
            showQuestion(currentQuestion);
        }
    });

    document.getElementById('mark').addEventListener('click', () => {
        const activeQuestion = document.querySelector('.question.active');
        activeQuestion.classList.toggle('marked');
        document.getElementById('mark').classList.toggle('active');
    });

    document.getElementById('submit').addEventListener('click', submitTest);

    function saveDraft() {
        const draft = Array.from(questions).map(question => {
            const selected = question.querySelector('input[type="radio"]:checked');
            return selected ? selected.value : null;
        });
        localStorage.setItem('practiceDraft_' + testId, JSON.stringify(draft));
    }

    function restoreDraft() {
        const startedAt = Number(localStorage.getItem('testStartTime'));
        if (localStorage.getItem('testInProgressId') !== testId || !Number.isFinite(startedAt) || startedAt <= 0) {
            return false;
        }

        const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
        timerInstance.timeLeft = Math.max(0, timerInstance.duration - elapsedSeconds);
        const draftText = localStorage.getItem('practiceDraft_' + testId);
        if (draftText) {
            try {
                const draft = JSON.parse(draftText);
                if (!Array.isArray(draft) || draft.length !== questions.length ||
                    draft.some((answer, index) => answer !== null &&
                        !questions[index].querySelector('input[type="radio"][value="' + answer + '"]'))) {
                    throw new Error('Saved answers do not match this test.');
                }
                draft.forEach((answer, index) => {
                    if (answer !== null) {
                        questions[index].querySelector('input[type="radio"][value="' + answer + '"]').checked = true;
                    }
                });
            } catch (error) {
                console.error('Practice test progress could not be restored:', error);
                const message = document.createElement('p');
                message.setAttribute('role', 'alert');
                message.textContent = 'Saved answers could not be restored. Your test timer has resumed with blank answers.';
                document.querySelector('.test-content').prepend(message);
            }
        }

        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        startBtn.style.display = 'none';
        timer.style.display = 'flex';
        testStarted = true;
        submitButton.disabled = false;
        questions.forEach(question => {
            question.querySelectorAll('input[type="radio"]').forEach(input => {
                input.disabled = false;
            });
        });
        timerInstance.start();
        return true;
    }

    questions.forEach(question => {
        question.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', saveDraft);
        });
    });

    function submitTest(timerExpired = false) {
        if (testSubmitted || !testStarted) return;
        if (!timerExpired && !window.confirm('Are you sure you want to submit this test?')) return;
        testSubmitted = true;
        submitButton.disabled = true;
        timerInstance.stop();
        const startTime = Number(localStorage.getItem('testStartTime'));
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        const timeTaken = Math.min(timerInstance.duration, elapsedSeconds);

        const answers = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            answers[input.name] = input.value;
        });

        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        const questionResults = Array.from(questions).map((question, index) => {
            const selected = question.querySelector('input[type="radio"]:checked');
            const isCorrect = Boolean(selected && selected.value === answerKey[index]);
            if (!selected) skipped++;
            else if (isCorrect) correct++;
            else wrong++;

            return {
                question: question.querySelector('p') ? question.querySelector('p').textContent.trim() : '',
                userAnswer: selected ? selected.closest('label').textContent.trim() : 'Skipped',
                correctAnswer: question.querySelector('input[type="radio"][value="' + answerKey[index] + '"]')
                    .closest('label').textContent.trim(),
                correct: isCorrect
            };
        });

        localStorage.setItem('testAnswers', JSON.stringify(answers));
        localStorage.setItem('timeTaken', timeTaken);
        localStorage.setItem('score', String(correct));
        localStorage.setItem('correct', String(correct));
        localStorage.setItem('wrong', String(wrong));
        localStorage.setItem('skipped', String(skipped));
        localStorage.setItem('time_taken', `${String(Math.floor(timeTaken / 60)).padStart(2, '0')}:${String(timeTaken % 60).padStart(2, '0')}`);
        localStorage.setItem('testId', testId);
        localStorage.setItem('practiceTestResults', JSON.stringify(questionResults));
        localStorage.removeItem('testStartTime');
        localStorage.removeItem('testInProgressId');
        localStorage.removeItem('practiceDraft_' + testId);

        window.location.href = '/student/html/submit.html';
    }

    switchSection('html-basics');
    restoreDraft();
});