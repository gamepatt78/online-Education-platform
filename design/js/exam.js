const form = document.getElementById("examForm");

class ExamManager {
  constructor() {
    this.webcam = null;
    this.stream = null;
    this.timer = 3600; // 60 minutes in seconds
    this.questions = examQuestions;
    this.answers = new Map();
    this.webcamEnabled = true;
    this.currentQuestion = 0;
    this.totalQuestions = this.questions.length;
    this.initializeExam();
  }

  async initializeExam() {
    await this.setupWebcam();
    this.loadQuestions();
    this.startTimer();
    this.setupFormSubmission();
    this.createIndicators();
    this.showQuestion(0);
  }

  setupWebcamToggle() {
    const toggleBtn = document.getElementById('webcam-toggle');
    const webcamOverlay = document.querySelector('.webcam-overlay');
    
    toggleBtn.addEventListener('click', () => {
      if (this.webcamEnabled) {
        // Turn off webcam
        this.stream.getTracks().forEach(track => track.stop());
        this.webcam.srcObject = null;
        toggleBtn.classList.add('off');
        toggleBtn.querySelector('i').className = 'fas fa-video-slash';
        webcamOverlay.textContent = 'Webcam Disabled';
        webcamOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
      } else {
        // Turn on webcam
        this.setupWebcam().then(() => {
          toggleBtn.classList.remove('off');
          toggleBtn.querySelector('i').className = 'fas fa-video';
          webcamOverlay.textContent = 'Webcam Monitoring Active';
          webcamOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        });
      }
      this.webcamEnabled = !this.webcamEnabled;
    });
  }

  async setupWebcam() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480,
          facingMode: 'user'
        },
        audio: false 
      });
      
      this.webcam = document.getElementById('webcam');
      this.webcam.srcObject = this.stream;
      
      const overlay = document.querySelector('.webcam-overlay');
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      overlay.textContent = 'Webcam Monitoring Active';
      
    } catch (err) {
      console.error('Webcam access denied:', err);
      const overlay = document.querySelector('.webcam-overlay');
      overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
      overlay.textContent = 'Webcam Access Denied';
    }
  }

  loadQuestions() {
    const form = document.getElementById('examForm');
    form.innerHTML = ''; // Clear existing content

    this.questions.forEach((q, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question-container';
      questionDiv.innerHTML = `
        <div class="question-header">
          <span class="question-number">Question ${q.id}</span>
          <span class="points">${q.points} points</span>
        </div>
        <p class="question-text">${q.question}</p>
        <div class="options-container">
          ${q.options.map((option, i) => `
            <label class="option-item">
              <input type="radio" name="q${q.id}" value="${i}" required>
              <span class="option-text">${option}</span>
            </label>
          `).join('')}
        </div>
      `;
      form.appendChild(questionDiv);
    });
  }

  startTimer() {
    const timerDisplay = document.getElementById('timer');
    const updateTimer = () => {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (this.timer <= 0) {
        this.submitExam();
      } else {
        this.timer--;
      }
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  setupFormSubmission() {
    const form = document.getElementById('examForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitExam();
    });
  }

  submitExam() {
    // Stop webcam
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // Collect answers
    const formData = new FormData(document.getElementById('examForm'));
    let score = 0;

    for (const [name, value] of formData.entries()) {
      const questionId = parseInt(name.replace('q', ''));
      const question = this.questions.find(q => q.id === questionId);
      
      if (parseInt(value) === question.correct) {
        score += question.points;
      }
    }

    // Store exam data
    localStorage.setItem('examScore', score);
    localStorage.setItem('examTimeTaken', this.getTimeTaken());

    // Redirect to submission page
    window.location.href = 'exam-submit.html';
  }

  // Add this helper method to calculate time taken
  getTimeTaken() {
    const timeSpent = 3600 - this.timer; // Assuming 60 minutes exam
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  showQuestion(index) {
    const container = document.getElementById('questions-container');
    container.style.transform = `translateX(-${index * 100}%)`;
    this.updateIndicators(index);
  }

  updateIndicators(currentIndex) {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === currentIndex);
    });
  }

  createIndicators() {
    const indicatorsContainer = document.getElementById('questionIndicators');
    for (let i = 0; i < this.totalQuestions; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        indicator.addEventListener('click', () => {
            this.currentQuestion = i;
            this.showQuestion(i);
        });
        indicatorsContainer.appendChild(indicator);
    }
  }
}

// Initialize exam when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExamManager();
});

document.getElementById('examForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const total = 10; // Total number of questions
    const correct = 7; // Calculate correct answers here
    
    // Store in localStorage
    localStorage.setItem('totalQuestions', total);
    localStorage.setItem('correctAnswers', correct);
    
    // Redirect to submission page
    window.location.href = `submit_exam.html?total=${total}&correct=${correct}`;
});

function handleSubmit(event) {
    event.preventDefault();
    
    // Get all answers
    const answers = getAllAnswers();
    const totalQuestions = questions.length;
    const correctAnswers = calculateScore(answers);
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Store results
    localStorage.setItem('examResults', JSON.stringify({
        totalQuestions,
        correctAnswers,
        score
    }));

    // Show confirmation dialog
    if (confirm('Are you sure you want to submit the exam?')) {
        // Redirect to submission page with results
        window.location.href = `submit_exam.html?total=${totalQuestions}&correct=${correctAnswers}&score=${score}`;
    }
}

function getAllAnswers() {
    const answers = [];
    const answerElements = document.querySelectorAll('input[type="radio"]:checked');
    answerElements.forEach(element => {
        answers.push({
            questionId: element.name,
            answer: element.value
        });
    });
    return answers;
}

function calculateScore(answers) {
    let correct = 0;
    answers.forEach(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question && question.correctAnswer === answer.answer) {
            correct++;
        }
    });
    return correct;
}

// Add visual feedback when hovering over submit button
const submitBtn = document.getElementById('submitExam');
submitBtn.addEventListener('mouseover', () => {
    if (!isAllQuestionsAnswered()) {
        submitBtn.title = 'Please answer all questions before submitting';
    }
});

function isAllQuestionsAnswered() {
    const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
    return answeredQuestions === questions.length;
}

function handleExamSubmit(event) {
    event.preventDefault();
    
    // Calculate results
    const totalQuestions = questions.length;
    const correctAnswers = calculateCorrectAnswers();
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Confirm submission
    if (confirm('Are you sure you want to submit your exam?')) {
        // Store results in localStorage as backup
        localStorage.setItem('examResults', JSON.stringify({
            totalQuestions,
            correctAnswers,
            score
        }));

        // Redirect to results page with parameters
        window.location.href = `submit_exam.html?total=${totalQuestions}&correct=${correctAnswers}&score=${score}`;
    }
}

function calculateCorrectAnswers() {
    let correct = 0;
    const answers = document.querySelectorAll('input[type="radio"]:checked');
    
    answers.forEach(answer => {
        const questionId = answer.name;
        const question = questions.find(q => q.id === questionId);
        if (question && question.correctAnswer === answer.value) {
            correct++;
        }
    });
    
    return correct;
}

function isWebcamOn() {
  const webcam = document.getElementById('webcam');
  return webcam && webcam.srcObject && webcam.srcObject.active;
}

document.getElementById('examForm').addEventListener('submit', function(e) {
  if (!isWebcamOn()) {
    document.getElementById('webcam-warning').style.display = 'block';
    e.preventDefault();
  } else {
    document.getElementById('webcam-warning').style.display = 'none';
  }
});




