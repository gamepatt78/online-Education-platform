document.addEventListener('DOMContentLoaded', function() {
    const questionForm = document.getElementById('questionForm');
    const addQuestionBtn = document.querySelector('.add-question');
    const questionsList = document.querySelector('.questions-list');
    const formContainer = document.querySelector('.question-form');
    const cancelBtn = document.querySelector('.cancel-btn');

    // Question Bank Array
    let questionBank = JSON.parse(localStorage.getItem('questionBank')) || [];

    // Show/Hide Form
    addQuestionBtn.addEventListener('click', () => {
        formContainer.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        formContainer.classList.add('hidden');
        questionForm.reset();
    });

    // Handle form submission
    questionForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newQuestion = {
            id: Date.now(),
            subject: this.subject.value,
            difficulty: this.grade.value,
            topic: this.topic.value,
            type: this.type.value,
            question: this.question.value,
            answers: [
                this.answer1.value,
                this.answer2.value,
                this.answer3.value,
                this.answer4.value
            ],
            correctAnswer: parseInt(this.correctAnswer.value) - 1,
            dateCreated: new Date().toISOString()
        };

        // Add to question bank
        questionBank.push(newQuestion);
        saveToLocalStorage();
        displayQuestions();

        // Reset and hide form
        this.reset();
        formContainer.classList.add('hidden');

        // Show success message
        showNotification('Question added successfully!');
    });

    // Display questions
    function displayQuestions() {
        questionsList.innerHTML = '';
        
        questionBank.forEach(q => {
            const questionCard = `
                <div class="question-card" data-id="${q.id}">
                    <div class="question-header">
                        <span class="subject-badge">${q.subject}</span>
                        <span class="difficulty-badge ${q.difficulty}">${q.difficulty}</span>
                    </div>
                    <div class="question-content">
                        <p class="question-text">${q.question}</p>
                        <div class="answers-list">
                            ${q.answers.map((answer, index) => `
                                <div class="answer ${index === q.correctAnswer ? 'correct' : ''}">
                                    ${String.fromCharCode(65 + index)}. ${answer}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="question-footer">
                        <span class="topic-tag">${q.topic}</span>
                        <div class="question-actions">
                            <button onclick="editQuestion(${q.id})" class="edit-btn">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteQuestion(${q.id})" class="delete-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            questionsList.insertAdjacentHTML('beforeend', questionCard);
        });
    }

    // Filter questions
    const subjectFilter = document.getElementById('subjectFilter');
    const gradeFilter = document.getElementById('gradeFilter');

    function filterQuestions() {
        const subject = subjectFilter.value;
        const difficulty = gradeFilter.value;
        
        const filteredQuestions = questionBank.filter(q => {
            const subjectMatch = !subject || q.subject === subject;
            const difficultyMatch = !difficulty || q.difficulty === difficulty;
            return subjectMatch && difficultyMatch;
        });

        displayFilteredQuestions(filteredQuestions);
    }

    subjectFilter.addEventListener('change', filterQuestions);
    gradeFilter.addEventListener('change', filterQuestions);

    // Helper functions
    function saveToLocalStorage() {
        localStorage.setItem('questionBank', JSON.stringify(questionBank));
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Delete question
    window.deleteQuestion = function(id) {
        if (confirm('Are you sure you want to delete this question?')) {
            questionBank = questionBank.filter(q => q.id !== id);
            saveToLocalStorage();
            displayQuestions();
            showNotification('Question deleted successfully!');
        }
    };

    // Initial display
    displayQuestions();
});