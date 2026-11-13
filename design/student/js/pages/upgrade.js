const params = new URLSearchParams(window.location.search);
const course = params.get('course');
const price = Number(params.get('price'));
const summary = document.getElementById('course-summary');
const proceedButton = document.getElementById('proceed-payment');
if (course && Number.isFinite(price) && price >= 0) {
  const courseLine = document.createElement('p');
  const courseLabel = document.createElement('strong');
  courseLabel.textContent = 'Course: ';
  courseLine.append(courseLabel, document.createTextNode(course));
  const priceLine = document.createElement('p');
  const priceLabel = document.createElement('strong');
  priceLabel.textContent = 'Price: ';
  priceLine.append(priceLabel, document.createTextNode(`₹${price}`));
  summary.replaceChildren(courseLine, priceLine);
  proceedButton.href = `payment.html?course=${encodeURIComponent(course)}&price=${encodeURIComponent(String(price))}`;
} else {
  summary.textContent = 'No course selected.';
  proceedButton.style.display = 'none';
}