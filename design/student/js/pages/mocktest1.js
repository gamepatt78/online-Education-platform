document.addEventListener('DOMContentLoaded', function() {
  const mockTest1Questions = [
    {
      question: "What is HTML?",
      options: [
        "Hyper Text Markup Language",
        "High Text Making Language",
        "Hyper Text Making Language",
        "High Text Markup Language"
      ],
      correct: 0
    },
  ];

  function loadMockTest() {
    const form = document.getElementById('mockTestForm');
    mockTest1Questions.forEach((q, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question-container';
      questionDiv.innerHTML = `
        <p class="question-text">${index + 1}. ${q.question}</p>
        <div class="options-container">
          ${q.options.map((opt, i) => `
            <label class="option-item">
              <input type="radio" name="q${index}" value="${i}">
              ${opt}
            </label>
          `).join('')}
        </div>
      `;
      form.appendChild(questionDiv);
    });
  }

  loadMockTest();
});