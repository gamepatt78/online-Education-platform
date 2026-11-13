document.addEventListener('DOMContentLoaded', loadExamResults);

async function loadExamResults() {
    let examData = {};
    try {
        examData = JSON.parse(localStorage.getItem('examData') || '{}');
    } catch (error) {
        console.error('Unable to read saved practice results.');
    }

    const resultStatus = document.getElementById('results-status');
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('/api/students/exam-results', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.toLowerCase().includes('application/json')) {
                throw new Error('Unexpected response type.');
            }
            const result = await response.json();
            if (!response.ok || result.success !== true || !Array.isArray(result.data)) {
                throw new Error('Unable to load account results.');
            }
            if (result.data.length > 0) {
                const saved = result.data[0];
                examData = {
                    score: saved.score,
                    totalPoints: saved.total_points,
                    timeTaken: formatExamDuration(saved.time_taken_seconds),
                    answers: saved.answers
                };
                localStorage.setItem('examData', JSON.stringify(examData));
                resultStatus.textContent = 'Loaded from your account. Results are browser-calculated and unverified.';
            } else {
                resultStatus.textContent = 'No saved account results. Showing a recent browser copy, if available.';
            }
        } catch (error) {
            resultStatus.textContent = 'Account results could not be loaded. Showing a recent browser copy, if available.';
        }
    } else {
        resultStatus.textContent = 'Sign in to load saved account results. Showing a recent browser copy, if available.';
    }

    const totalPoints = Number(examData.totalPoints) || 0;
    const score = Number(examData.score) || 0;
    const hasResults = Array.isArray(examData.answers) && examData.answers.length > 0;
    document.getElementById('totalScore').textContent = hasResults ? `${score}/${totalPoints}` : '--/--';
    document.getElementById('percentage').textContent =
        `${hasResults && totalPoints ? ((score / totalPoints) * 100).toFixed(1) : '--'}%`;
    document.getElementById('timeTaken').textContent = hasResults ? String(examData.timeTaken || '--:--') : '--:--';
    const emptyState = document.getElementById('resultsEmpty');
    if (emptyState) emptyState.hidden = hasResults;

    const questionsList = document.getElementById('questionsList');
    if (questionsList && Array.isArray(examData.answers)) {
        examData.answers.forEach((answer, index) => {
            const questionDiv = document.createElement('div');
            const isCorrect = answer.correct === true;
            questionDiv.className = `question-result ${isCorrect ? 'correct' : 'incorrect'}`;

            const header = document.createElement('div');
            header.className = 'question-header';
            const number = document.createElement('span');
            number.className = 'question-number';
            number.textContent = `Question ${index + 1}`;
            const points = document.createElement('span');
            points.className = 'points';
            points.textContent = `${Number(answer.points) || 0} points`;
            header.append(number, points);

            const question = document.createElement('p');
            question.className = 'question-text';
            question.textContent = String(answer.question || '');
            const details = document.createElement('div');
            details.className = 'answer-details';
            const userAnswer = document.createElement('p');
            userAnswer.className = `your-answer ${isCorrect ? 'correct' : 'incorrect'}`;
            userAnswer.textContent = `Your answer: ${String(answer.userAnswer || 'Skipped')}`;
            details.appendChild(userAnswer);
            if (!isCorrect) {
                const correctAnswer = document.createElement('p');
                correctAnswer.className = 'correct-answer';
                correctAnswer.textContent = `Correct answer: ${String(answer.correctAnswer || '')}`;
                details.appendChild(correctAnswer);
            }

            questionDiv.append(header, question, details);
            questionsList.appendChild(questionDiv);
        });
    }

    const downloadButton = document.getElementById('downloadResults');
    if (downloadButton) {
      downloadButton.disabled = !hasResults;
      if (hasResults) downloadButton.addEventListener('click', function() {
        const resultsText = `
            Exam Results Summary
            ------------------
            Total Score: ${examData.score}/${totalPoints}
            Percentage: ${totalPoints ? ((Number(examData.score) / totalPoints) * 100).toFixed(1) : '--'}%
            Time Taken: ${examData.timeTaken}

            Question Analysis
            ----------------
            ${Array.isArray(examData.answers) ? examData.answers.map((answer, index) => `
            Question ${index + 1}: ${answer.correct ? 'Correct' : 'Incorrect'}
            Your Answer: ${answer.userAnswer}
            ${!answer.correct ? `Correct Answer: ${answer.correctAnswer}` : ''}
            Points: ${answer.correct ? '5' : '0'}
            `).join('\n') : ''}
        `.trim();

        const blob = new Blob([resultsText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exam-results.txt';
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
}

function formatExamDuration(seconds) {
    const totalSeconds = Math.max(0, Number(seconds) || 0);
    return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
}