document.addEventListener("DOMContentLoaded", () => {
  const totalQuestions = localStorage.getItem("totalQuestions") || 10;
  const correctAnswers = localStorage.getItem("correctAnswers") || 7;
  const score = localStorage.getItem("score") || 70;

  document.getElementById("total-questions").textContent = totalQuestions;
  document.getElementById("correct-answers").textContent = correctAnswers;
  document.getElementById("score").textContent = `${score}%`;
});
