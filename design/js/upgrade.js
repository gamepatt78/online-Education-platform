const params = new URLSearchParams(window.location.search);
const course = params.get('course');
const price = params.get('price');
if (course && price) {
  document.getElementById('course-summary').innerHTML = `
    <p><strong>Course:</strong> ${course}</p>
    <p><strong>Price:</strong> ₹${price}</p>
  `;
  document.getElementById('proceed-payment').href = `payment.html?course=${encodeURIComponent(course)}&price=${encodeURIComponent(price)}`;
} else {
  document.getElementById('course-summary').innerHTML = `<p>No course selected.</p>`;
  document.getElementById('proceed-payment').style.display = 'none';
}