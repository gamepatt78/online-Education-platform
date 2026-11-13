document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.getElementById('menu-btn');
  const closeButton = document.getElementById('close-btn');
  const sidebar = document.querySelector('.side-bar');
  const userButton = document.getElementById('user-btn');
  const profile = document.querySelector('.header .profile');
  const searchButton = document.getElementById('search-btn');
  const searchForm = document.querySelector('.search-form');
  const logoutButton = document.getElementById('logout-btn');
  const savedName = localStorage.getItem('userName');
  const savedProfileImage = localStorage.getItem('studentProfileImage');

  if (savedName) {
    document.querySelectorAll('.profile .name').forEach(function (element) {
      element.textContent = savedName;
    });
  }
  if (savedProfileImage) {
    document.querySelectorAll('.profile .image').forEach(function (image) {
      image.src = savedProfileImage;
    });
  }

  function makeKeyboardButton(element, label) {
    if (!element || element.tagName === 'BUTTON') {
      return;
    }

    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-label', label);
    element.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
  }

  function setSidebarOpen(isOpen) {
    if (!sidebar) {
      return;
    }

    sidebar.classList.toggle('active', isOpen);
    document.body.classList.toggle('active', !isOpen);
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    }
  }

  if (menuButton && sidebar) {
    menuButton.classList.remove('fas', 'fa-bars');
    const menuIcon = document.createElement('i');
    menuIcon.className = 'fas fa-compass menu-icon';
    menuIcon.setAttribute('aria-hidden', 'true');
    const menuLabel = document.createElement('span');
    menuLabel.textContent = 'Menu';
    menuButton.replaceChildren(menuIcon, menuLabel);
    makeKeyboardButton(menuButton, 'Open navigation');
    setSidebarOpen(window.matchMedia('(min-width: 992px)').matches);
    menuButton.addEventListener('click', function () {
      setSidebarOpen(!sidebar.classList.contains('active'));
    });
  }

  if (closeButton && sidebar) {
    makeKeyboardButton(closeButton, 'Close navigation');
    closeButton.addEventListener('click', function () {
      setSidebarOpen(false);
    });
  }

  if (userButton && profile) {
    makeKeyboardButton(userButton, 'Toggle profile menu');
    userButton.setAttribute('aria-expanded', 'false');
    userButton.addEventListener('click', function () {
      const isOpen = profile.classList.toggle('active');
      userButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (searchButton && searchForm) {
    makeKeyboardButton(searchButton, 'Toggle search');
    searchButton.setAttribute('aria-expanded', 'false');
    searchButton.addEventListener('click', function () {
      const isOpen = searchForm.classList.toggle('active');
      searchButton.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        const searchInput = searchForm.querySelector('input');
        if (searchInput) searchInput.focus();
      }
    });
  }

  if (logoutButton) {
    if (!logoutButton.querySelector('.logout-label')) {
      const logoutLabel = document.createElement('span');
      logoutLabel.className = 'logout-label';
      logoutLabel.textContent = 'Log out';
      logoutButton.appendChild(logoutLabel);
    }

    makeKeyboardButton(logoutButton, 'Log out');
    logoutButton.addEventListener('click', function () {
      if (window.confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('studentProfileImage');
        [
          'practiceTestResults', 'testId', 'testAnswers', 'timeTaken', 'testStartTime',
          'testInProgressId', 'practiceDraft_mocktest1', 'practiceDraft_mocktest2', 'practiceDraft_mocktest3',
          'score', 'correct', 'wrong', 'skipped', 'time_taken',
          'examData', 'examScore', 'examTotal', 'examTimeTaken'
        ].forEach(function (key) {
          localStorage.removeItem(key);
        });
        window.location.href = '/student/html/login.html';
      }
    });
  }

  const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'home.html';
  document.querySelectorAll('.navbar a').forEach(function (link) {
    const targetPage = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (targetPage === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
    const dropdown = toggle.closest('.nav-item.dropdown');
    const dropdownMenu = dropdown ? dropdown.querySelector('.dropdown-menu') : null;
    if (!dropdown || !dropdownMenu) {
      return;
    }

    toggle.setAttribute('aria-expanded', String(dropdown.classList.contains('active')));
    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      const isOpen = !dropdown.classList.contains('active');

      document.querySelectorAll('.nav-item.dropdown').forEach(function (item) {
        if (item === dropdown) {
          return;
        }

        item.classList.remove('active');
        const menu = item.querySelector('.dropdown-menu');
        const control = item.querySelector('.dropdown-toggle');
        if (menu) menu.style.maxHeight = '0px';
        if (control) control.setAttribute('aria-expanded', 'false');
      });

      dropdown.classList.toggle('active', isOpen);
      dropdownMenu.style.maxHeight = isOpen ? dropdownMenu.scrollHeight + 'px' : '0px';
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });

  document.addEventListener('click', function (event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (!target.closest('.nav-item.dropdown')) {
      document.querySelectorAll('.nav-item.dropdown').forEach(function (dropdown) {
        dropdown.classList.remove('active');
        const menu = dropdown.querySelector('.dropdown-menu');
        const control = dropdown.querySelector('.dropdown-toggle');
        if (menu) menu.style.maxHeight = '0px';
        if (control) control.setAttribute('aria-expanded', 'false');
      });
    }

    if (profile && userButton && !profile.contains(target) && !userButton.contains(target)) {
      profile.classList.remove('active');
      userButton.setAttribute('aria-expanded', 'false');
    }

    if (sidebar && menuButton && window.innerWidth < 991 &&
        !sidebar.contains(target) && !menuButton.contains(target)) {
      setSidebarOpen(false);
    }

    if (searchForm && searchButton && window.innerWidth < 576 &&
        !searchForm.contains(target) && !searchButton.contains(target)) {
      searchForm.classList.remove('active');
      searchButton.setAttribute('aria-expanded', 'false');
    }
  });

  const animateElements = document.querySelectorAll('.animate-on-scroll');
  if (animateElements.length) {
    const checkVisibility = function () {
      animateElements.forEach(function (element) {
        if (element.getBoundingClientRect().top < window.innerHeight - 150) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();
  }

  document.querySelectorAll('.mock-header').forEach(function (header) {
    header.addEventListener('click', function () {
      const items = header.nextElementSibling;
      if (!items) {
        return;
      }

      const isOpen = header.classList.toggle('active');
      items.classList.toggle('active', isOpen);
      const icon = header.querySelector('i');
      if (icon) icon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0)';
    });
  });

  document.querySelectorAll('.mock-item.disabled').forEach(function (test) {
    test.addEventListener('click', function (event) {
      event.preventDefault();
      window.alert('Complete previous tests to unlock this test.');
    });
  });
});
