document.getElementById('upgrade-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const selected = document.querySelector('input[name="course"]:checked');
  if (selected) {
    const label = selected.nextElementSibling;
    const course = selected.value;
    const price = label.querySelector('span').innerText.replace('₹','');
    window.location.href = `upgrade.html?course=${encodeURIComponent(course)}&price=${encodeURIComponent(price)}`;
  }
});