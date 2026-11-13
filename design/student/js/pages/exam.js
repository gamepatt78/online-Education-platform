class ExamManager {
  constructor() {
    this.form = document.getElementById('examForm');
    this.webcam = document.getElementById('webcam');
    this.webcamStream = null;
    this.remainingSeconds = 3600;
    this.timerInterval = null;
    this.submitted = false;
    this.questions = examQuestions;
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);

    this.loadQuestions();
    this.startTimer();
    this.setupFormSubmission();
    this.setupWebcamToggle();
    window.addEventListener('beforeunload', () => this.stopWebcam());
  }

  loadQuestions() {
    this.form.replaceChildren();

    this.questions.forEach(question => {
      const container = document.createElement('section');
      container.className = 'question-container';

      const header = document.createElement('div');
      header.className = 'question-header';
      const number = document.createElement('span');
      number.className = 'question-number';
      number.textContent = `Question ${question.id}`;
      const points = document.createElement('span');
      points.className = 'points';
      points.textContent = `${question.points} points`;
      header.append(number, points);

      const prompt = document.createElement('p');
      prompt.className = 'question-text';
      prompt.textContent = question.question;
      container.append(header, prompt);

      const options = document.createElement('div');
      options.className = 'options-container';
      question.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'option-item';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `q${question.id}`;
        input.value = String(index);
        const text = document.createElement('span');
        text.className = 'option-text';
        text.textContent = option;
        label.append(input, text);
        options.appendChild(label);
      });

      container.appendChild(options);
      this.form.appendChild(container);
    });
  }

  startTimer() {
    const timerDisplay = document.getElementById('timer');
    const render = () => {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    render();
    this.timerInterval = window.setInterval(() => {
      this.remainingSeconds -= 1;
      render();
      if (this.remainingSeconds <= 0) this.submitExam(true);
    }, 1000);
  }

  setupFormSubmission() {
    this.form.addEventListener('submit', event => {
      event.preventDefault();
      this.submitExam();
    });
  }

  setupWebcamToggle() {
    const toggleButton = document.getElementById('webcam-toggle');
    const overlay = document.querySelector('.webcam-overlay');
    const warning = document.getElementById('webcam-warning');
    if (!toggleButton) return;

    const setToggleState = enabled => {
      toggleButton.classList.toggle('off', !enabled);
      toggleButton.setAttribute('aria-label', enabled ? 'Disable webcam' : 'Enable webcam');
      toggleButton.setAttribute('aria-pressed', String(enabled));
      const icon = toggleButton.querySelector('i');
      if (icon) icon.className = enabled ? 'fas fa-video' : 'fas fa-video-slash';
    };

    toggleButton.addEventListener('click', async () => {
      if (this.webcamStream) {
        this.stopWebcam();
        overlay.textContent = 'Webcam Disabled';
        setToggleState(false);
        return;
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not available in this browser.');
        }
        this.webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });
        this.webcam.srcObject = this.webcamStream;
        await this.webcam.play();
        warning.style.display = 'none';
        overlay.textContent = 'Webcam Enabled';
        setToggleState(true);
      } catch (error) {
        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
          warning.textContent = 'Camera permission was denied. Allow camera access in your browser settings, then try again.';
        } else if (error.name === 'NotFoundError') {
          warning.textContent = 'No camera was found on this device.';
        } else {
          warning.textContent = error.message || 'Unable to start the camera.';
        }
        warning.style.display = 'block';
        overlay.textContent = 'Webcam Disabled';
        this.stopWebcam();
        setToggleState(false);
      }
    });
  }

  stopWebcam() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
    }
    if (this.webcam) this.webcam.srcObject = null;
  }

  async submitExam(timerExpired = false) {
    if (this.submitted) return;
    if (!timerExpired && !window.confirm('Are you sure you want to submit the exam?')) return;

    this.submitted = true;
    window.clearInterval(this.timerInterval);
    this.stopWebcam();
    const submitButton = document.querySelector('.submit-btn');
    const status = document.getElementById('exam-save-status');
    submitButton.disabled = true;
    status.textContent = 'Saving your practice result…';

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const answers = this.questions.map(question => {
      const selected = this.form.querySelector(`input[name="q${question.id}"]:checked`);
      const selectedIndex = selected ? Number(selected.value) : null;
      const correct = selectedIndex === question.correct;
      if (!selected) skippedCount += 1;
      else if (correct) correctCount += 1;
      else wrongCount += 1;
      if (correct) score += question.points;

      return {
        question: question.question,
        userAnswer: selected ? question.options[selectedIndex] : 'Skipped',
        correctAnswer: question.options[question.correct],
        correct,
        points: correct ? question.points : 0
      };
    });

    const timeTakenSeconds = Math.max(0, Math.min(3600, 3600 - this.remainingSeconds));
    const timeTaken = `${Math.floor(timeTakenSeconds / 60)}:${String(timeTakenSeconds % 60).padStart(2, '0')}`;
    localStorage.setItem('examScore', String(score));
    localStorage.setItem('examTotal', String(this.totalPoints));
    localStorage.setItem('examTimeTaken', timeTaken);
    localStorage.setItem('examData', JSON.stringify({
      score,
      totalPoints: this.totalPoints,
      timeTaken,
      answers
    }));

    const token = localStorage.getItem('token');
    if (!token) {
      status.textContent = 'Sign in as a student before submitting this practice result.';
      this.submitted = false;
      submitButton.disabled = false;
      return;
    }

    try {
      const response = await fetch('/api/students/exam-results', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score, totalPoints: this.totalPoints, timeTakenSeconds, answers })
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        throw new Error('The server returned an unexpected response.');
      }
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || 'Unable to save the practice result.');
      }
      window.location.href = '/student/html/exam-submit.html';
    } catch (error) {
      status.textContent = error.message || 'Unable to save the practice result. Please try again.';
      this.submitted = false;
      submitButton.disabled = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ExamManager();
});
