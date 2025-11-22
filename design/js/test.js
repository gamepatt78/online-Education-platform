class Timer {
    constructor(duration, display, onComplete) {
        this.duration = duration;
        this.display = display;
        this.onComplete = onComplete;
        this.running = false;
        this.timeLeft = duration;
    }

    start() {
        if (this.running) return;
        this.running = true;
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            // Warning states
            if (this.timeLeft <= 300) { // 5 minutes remaining
                this.display.parentElement.classList.add('warning');
            }
            if (this.timeLeft <= 60) { // 1 minute remaining
                this.display.parentElement.classList.remove('warning');
                this.display.parentElement.classList.add('danger');
            }

            if (this.timeLeft <= 0) {
                this.stop();
                this.onComplete();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.interval);
        this.running = false;
    }

    reset() {
        this.timeLeft = this.duration;
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
    
    // Initially disable all questions
    questions.forEach(q => q.style.pointerEvents = 'none');
    
    // Start button click
    startBtn.addEventListener('click', () => {
        overlay.style.display = 'flex';
    });
    
    // Confirm start click
    confirmStartBtn.addEventListener('click', () => {
        // Hide overlay and start button
        overlay.style.display = 'none';
        startBtn.style.display = 'none';
        
        // Show timer and enable questions
        timer.style.display = 'flex';
        questions.forEach(q => q.style.pointerEvents = 'auto');
        
        // Start the timer
        startTimer();
    });
    
    function startTimer() {
        let timeLeft = 45 * 60; // 45 minutes in seconds
        const countdown = document.getElementById('countdown');
        
        const timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            countdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft === 0) {
                clearInterval(timerInterval);
                submitTest();
            }
            
            timeLeft--;
        }, 1000);
        
        // Store start time
        localStorage.setItem('testStartTime', Date.now());
    }

    // Initialize variables
    let currentSection = 'html-basics';
    let currentQuestion = 1;

    // Get DOM elements
    const sections = document.querySelectorAll('.question-section');
    const sectionBtns = document.querySelectorAll('.section-btn');
    const timerDisplay = document.getElementById('countdown');
    const timeRemaining = document.getElementById('time-remaining');

    // Create timer instance (45 minutes = 2700 seconds)
    const timerInstance = new Timer(2700, timerDisplay, () => {
        // Auto-submit when time is up
        if (confirm('Time is up! Your test will be submitted automatically.')) {
            submitTest();
        }
    });

    // Start the timer
    timerInstance.start();

    // Update both displays
    setInterval(() => {
        if (timeRemaining) {
            timeRemaining.textContent = timerDisplay.textContent;
        }
    }, 1000);

    // Add timer to window object to access it from other functions
    window.testTimer = timerInstance;

    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Store timestamp when page becomes hidden
            localStorage.setItem('timerPaused', Date.now());
        } else {
            // Adjust timer when page becomes visible again
            const pausedTime = localStorage.getItem('timerPaused');
            if (pausedTime) {
                const timeDiff = Math.floor((Date.now() - pausedTime) / 1000);
                timerInstance.timeLeft = Math.max(0, timerInstance.timeLeft - timeDiff);
                timerInstance.updateDisplay();
                localStorage.removeItem('timerPaused');
            }
        }
    });

    // Handle beforeunload event
    window.addEventListener('beforeunload', (e) => {
        if (timerInstance.running && timerInstance.timeLeft > 0) {
            e.preventDefault();
            e.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
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

    function submitTest() {
        const startTime = parseInt(localStorage.getItem('testStartTime'));
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        
        const answers = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            answers[input.name] = input.value;
        });
        
        localStorage.setItem('testAnswers', JSON.stringify(answers));
        localStorage.setItem('timeTaken', timeTaken);
        
        window.location.href = 'submit.html';
    }

    switchSection('html-basics');
});