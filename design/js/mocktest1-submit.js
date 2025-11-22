document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    if (!form) return;

    // Correct answers for each question (update as needed)
    const correctAnswers = [
        'a', // q1
        'b', // q2
        'b', // q3
        'b', // q4
        'a', // q5
        'a', // q6
        'a', // q7
        'b', // q8
        'a', // q9
        'a', // q10
        'a', // q11
        'a', // q12
        'a', // q13
        'a', // q14
        'a', // q15
        'a', // q16
        'a', // q17
        'a', // q18 (if you have q18)
        'a', // q19
        'a'  // q20
    ];

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let correct = 0, wrong = 0, skipped = 0;
        const totalQuestions = correctAnswers.length;

        for (let i = 1; i <= totalQuestions; i++) {
            const qName = 'q' + i;
            const selected = form.querySelector(`input[name="${qName}"]:checked`);
            if (!selected) {
                skipped++;
            } else if (selected.value === correctAnswers[i - 1]) {
                correct++;
            } else {
                wrong++;
            }
        }

        const score = correct;
        // Optional: If you have a timer, replace this with actual time taken
        const timeTaken = "00:00";

        // Store results in localStorage
        localStorage.setItem('score', score);
        localStorage.setItem('correct', correct);
        localStorage.setItem('wrong', wrong);
        localStorage.setItem('skipped', skipped);
        localStorage.setItem('time_taken', timeTaken);

        // Redirect to submit.html
        window.location.href = "submit.html";
    });
});
<script src="js/mocktest1-submit.js"></script>