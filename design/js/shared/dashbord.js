document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.querySelector('.nav-toggle');
  const navigation = document.getElementById('primary-nav');
  const currentYear = document.getElementById('current-year');

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  if (!menuButton || !navigation) {
    return;
  }

  function closeNavigation() {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }

  menuButton.addEventListener('click', function () {
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  navigation.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNavigation);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeNavigation();
      menuButton.focus();
    }
  });
});
