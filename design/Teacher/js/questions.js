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

    function renderQuestions(questions) {
        questionsList.innerHTML = '';
        
        questions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'question-card';
            const id = Number(q.id);
            if (Number.isSafeInteger(id) && id > 0) card.dataset.id = String(id);

            const header = document.createElement('div');
            header.className = 'question-header';
            const subject = document.createElement('span');
            subject.className = 'subject-badge';
            subject.textContent = String(q.subject || '');
            const difficulty = document.createElement('span');
            const difficultyValue = String(q.difficulty || '');
            const difficultyClass = ['easy', 'medium', 'hard'].includes(difficultyValue.toLowerCase())
                ? difficultyValue.toLowerCase()
                : '';
            difficulty.className = `difficulty-badge${difficultyClass ? ` ${difficultyClass}` : ''}`;
            difficulty.textContent = difficultyValue;
            header.append(subject, difficulty);

            const content = document.createElement('div');
            content.className = 'question-content';
            const questionText = document.createElement('p');
            questionText.className = 'question-text';
            questionText.textContent = String(q.question || '');
            const answers = document.createElement('div');
            answers.className = 'answers-list';
            (Array.isArray(q.answers) ? q.answers : []).forEach((answer, index) => {
                const answerElement = document.createElement('div');
                answerElement.className = `answer${index === Number(q.correctAnswer) ? ' correct' : ''}`;
                answerElement.textContent = `${String.fromCharCode(65 + index)}. ${String(answer || '')}`;
                answers.appendChild(answerElement);
            });
            content.append(questionText, answers);

            const footer = document.createElement('div');
            footer.className = 'question-footer';
            const topic = document.createElement('span');
            topic.className = 'topic-tag';
            topic.textContent = String(q.topic || '');
            const actions = document.createElement('div');
            actions.className = 'question-actions';
            ['edit', 'delete'].forEach(action => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `${action}-btn`;
                button.dataset.action = action;
                button.setAttribute('aria-label', `${action} question`);
                const icon = document.createElement('i');
                icon.className = `fas fa-${action === 'edit' ? 'edit' : 'trash'}`;
                button.appendChild(icon);
                actions.appendChild(button);
            });
            footer.append(topic, actions);

            card.append(header, content, footer);
            questionsList.appendChild(card);
        });
    }

    function displayQuestions() {
        renderQuestions(questionBank);
    }

    questionsList.addEventListener('click', event => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest('button[data-action]');
        const card = button && button.closest('.question-card');
        const id = card ? Number(card.dataset.id) : NaN;
        if (!button || !Number.isSafeInteger(id) || id < 1) return;
        if (button.dataset.action === 'delete') window.deleteQuestion(id);
        if (button.dataset.action === 'edit' && typeof window.editQuestion === 'function') {
            window.editQuestion(id);
        }
    });

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

        renderQuestions(filteredQuestions);
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