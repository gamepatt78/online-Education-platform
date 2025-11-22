document.addEventListener('DOMContentLoaded', function() {
    const examData = JSON.parse(localStorage.getItem('examData') || '{}');
    
    document.getElementById('totalScore').textContent = `${examData.score || '--'}/200`;
    document.getElementById('percentage').textContent = 
        `${examData.score ? ((examData.score / 200) * 100).toFixed(1) : '--'}%`;
    document.getElementById('timeTaken').textContent = examData.timeTaken || '--:--';

    const questionsList = document.getElementById('questionsList');
    if (examData.answers) {
        examData.answers.forEach((answer, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = `question-result ${answer.correct ? 'correct' : 'incorrect'}`;
            questionDiv.innerHTML = `
                <div class="question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="points">${answer.correct ? '5' : '0'} points</span>
                </div>
                <p class="question-text">${answer.question}</p>
                <div class="answer-details">
                    <p class="your-answer ${answer.correct ? 'correct' : 'incorrect'}">
                        Your answer: ${answer.userAnswer}
                    </p>
                    ${!answer.correct ? `
                        <p class="correct-answer">
                            Correct answer: ${answer.correctAnswer}
                        </p>
                    ` : ''}
                </div>
            `;
            questionsList.appendChild(questionDiv);
        });
    }

    document.getElementById('downloadResults').addEventListener('click', function() {
        const resultsText = `
            Exam Results Summary
            ------------------
            Total Score: ${examData.score}/200
            Percentage: ${((examData.score / 200) * 100).toFixed(1)}%
            Time Taken: ${examData.timeTaken}
            
            Question Analysis
            ----------------
            ${examData.answers?.map((answer, index) => `
            Question ${index + 1}: ${answer.correct ? 'Correct' : 'Incorrect'}
            Your Answer: ${answer.userAnswer}
            ${!answer.correct ? `Correct Answer: ${answer.correctAnswer}` : ''}
            Points: ${answer.correct ? '5' : '0'}
            `).join('\n')}
        `.trim();

        const blob = new Blob([resultsText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exam-results.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    });
});