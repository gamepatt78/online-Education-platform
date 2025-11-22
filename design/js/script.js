// Theme Toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Check saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.classList.toggle('dark-mode', savedTheme === 'dark');
  
  themeToggle.addEventListener('click', () => {
    // Toggle dark mode class
    body.classList.toggle('dark-mode');
    
    // Save preference
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
  });
  
  // Prevent toggle from affecting dropdown menus
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menu-btn');
  const sideBar = document.querySelector('.side-bar');
  
  if (menuBtn && sideBar) {
    menuBtn.addEventListener('click', () => {
      sideBar.classList.toggle('active');
    });
  }
    
  // User profile toggle
  const userBtn = document.getElementById('user-btn');
  const profileBox = document.querySelector('.header .profile');
  
  if (userBtn && profileBox) {
    userBtn.addEventListener('click', () => {
      profileBox.classList.toggle('active');
    });
  }
  
  // Search form toggle for mobile
  const searchBtn = document.getElementById('search-btn');
  const searchForm = document.querySelector('.search-form');
  
  if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', () => {
      searchForm.classList.toggle('active');
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    // Close profile box
    if (profileBox && userBtn) {
      if (!profileBox.contains(event.target) && event.target !== userBtn) {
        profileBox.classList.remove('active');
      }
    }
    
    // Close sidebar on mobile
    if (sideBar && menuBtn) {
      if (!sideBar.contains(event.target) && event.target !== menuBtn && window.innerWidth < 991) {
        sideBar.classList.remove('active');
      }
    }
    
    // Close search form on mobile
    if (searchForm && searchBtn) {
      if (!searchForm.contains(event.target) && event.target !== searchBtn && window.innerWidth < 576) {
        searchForm.classList.remove('active');
      }
    }
  });
  
  // Add active class to current page link
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  const navLinks = document.querySelectorAll('.navbar a');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
  
  // Initialize any animations or transitions
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animateElements.length > 0) {
    const checkVisibility = () => {
      animateElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('visible');
        }
      });
    };
    
    window.addEventListener('scroll', checkVisibility);
    checkVisibility(); // Check on initial load
  }

  // Mock Test Dropdown
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownParent = dropdownToggle?.parentElement;

  if (dropdownToggle && dropdownParent) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownParent.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdownParent.contains(e.target)) {
        dropdownParent.classList.remove('active');
      }
    });
  }

  // Dropdown Toggle Functionality
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
          e.preventDefault();
          const dropdownItem = this.closest('.nav-item.dropdown');
          const dropdownMenu = this.nextElementSibling;
          
          // Close other open dropdowns
          document.querySelectorAll('.nav-item.dropdown').forEach(item => {
              if (item !== dropdownItem) {
                  item.classList.remove('active');
                  item.querySelector('.dropdown-menu').style.maxHeight = '0px';
              }
          });
          
          // Toggle current dropdown
          dropdownItem.classList.toggle('active');
          if (dropdownItem.classList.contains('active')) {
              dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + 'px';
          } else {
              dropdownMenu.style.maxHeight = '0px';
          }
      });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-item.dropdown')) {
          document.querySelectorAll('.nav-item.dropdown').forEach(dropdown => {
              dropdown.classList.remove('active');
              dropdown.querySelector('.dropdown-menu').style.maxHeight = '0px';
          });
      }
  });

  // Logout button functionality
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', function() {
      if(confirm('Are you sure you want to logout?')) {
          // Add any cleanup logic here (clear session, cookies etc)
          window.location.href = 'login.html';
      }
  });
});

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.querySelector('.side-bar');

    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Dropdown toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.closest('.nav-item.dropdown');
            const dropdownMenu = toggle.nextElementSibling;
            
            // Close other dropdowns
            document.querySelectorAll('.nav-item.dropdown').forEach(item => {
                if (item !== dropdown) {
                    item.classList.remove('active');
                    const menu = item.querySelector('.dropdown-menu');
                    if (menu) menu.style.maxHeight = '0px';
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + 'px';
            } else {
                dropdownMenu.style.maxHeight = '0px';
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item.dropdown')) {
            document.querySelectorAll('.nav-item.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) menu.style.maxHeight = '0px';
            });
        }
    });
});



// Add form validation for science background
document.getElementById('admissionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const stream = document.getElementById('stream').value;
    const cgpa = parseFloat(document.getElementById('cgpa').value);
    
    // Validate minimum CGPA for science courses
    if (cgpa < 6.0) {
        alert('Minimum CGPA requirement of 6.0 for science courses');
        return;
    }
    
    // Form submission logic here
    console.log('Form submitted successfully');
});

// Mock Test Navigation
document.addEventListener('DOMContentLoaded', function() {
   const mockHeaders = document.querySelectorAll('.mock-header');
   
   mockHeaders.forEach(header => {
      header.addEventListener('click', function() {
         const items = this.nextElementSibling;
         const icon = this.querySelector('i');
         
         // Toggle active state
         this.classList.toggle('active');
         items.classList.toggle('active');
         
         // Rotate icon
         if (this.classList.contains('active')) {
            icon.style.transform = 'rotate(90deg)';
         } else {
            icon.style.transform = 'rotate(0)';
         }
      });
   });

   // Prevent clicking on locked tests
   const lockedTests = document.querySelectorAll('.mock-item.disabled');
   lockedTests.forEach(test => {
      test.addEventListener('click', function(e) {
         e.preventDefault();
         alert('Complete previous tests to unlock this test.');
      });
   });
});

function initializeCertificates() {
  // Handle certificate view/download buttons
  document.querySelectorAll('.certificate-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.classList.contains('disabled')) {
        e.preventDefault();
        alert('Please complete the course to access the certificate');
      } else if (this.classList.contains('view-btn')) {
        e.preventDefault();
        viewCertificate(this.dataset.certificate);
      }
    });
  });

  // Update completion badges
  document.querySelectorAll('.info-value').forEach(value => {
    const progress = value.textContent.trim();
    const card = value.closest('.certificate-card');
    if (card) {
      const badge = card.querySelector('.completion-badge');
      if (badge) {
        badge.dataset.progress = progress;
      }
    }
  });
}

function viewCertificate(courseId) {
  // Add certificate view logic here
  console.log(`Viewing certificate for ${courseId}`);
}

// Payment tab functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
});

// Add this to your existing script.js
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// Add this to your existing script.js
document.addEventListener('DOMContentLoaded', function() {
    // Upgrade button functionality
    const upgradeButtons = document.querySelectorAll('.upgrade-btn:not(.outline)');
    
    upgradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planName = this.closest('.plan-card').querySelector('.plan-name').textContent;
            if (planName === 'Enterprise') {
                // Open contact form or redirect to sales page
                window.location.href = 'contact-sales.html';
            } else {
                // Show confirmation modal
                if (confirm(`Are you sure you want to upgrade to ${planName} plan?`)) {
                    // Handle plan upgrade
                    console.log(`Upgrading to ${planName} plan`);
                }
            }
        });
    });
});

document.getElementById('feedbackForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    rating: document.getElementById('rating').value,
    feedback: document.getElementById('feedback').value
  };

  fetch('YOUR_SCRIPT_URL', {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json())
  .then(data => {
    alert('Thank you for your feedback!');
    document.getElementById('feedbackForm').reset();
  })
  .catch(() => alert('Failed to submit feedback. Please try again later.'));
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.closest('.nav-item.dropdown');
      const menu = parent.querySelector('.dropdown-menu');
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
      });
      menu.classList.toggle('show');
    });
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item.dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.classList.toggle('dark-mode', savedTheme === 'dark');
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
  });
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menu-btn');
  const sideBar = document.querySelector('.side-bar');
  if (menuBtn && sideBar) {
    menuBtn.addEventListener('click', () => {
      sideBar.classList.toggle('active');
    });
  }
  const userBtn = document.getElementById('user-btn');
  const profileBox = document.querySelector('.header .profile');
  if (userBtn && profileBox) {
    userBtn.addEventListener('click', () => {
      profileBox.classList.toggle('active');
    });
  }
  const searchBtn = document.getElementById('search-btn');
  const searchForm = document.querySelector('.search-form');
  if (searchBtn && searchForm) {
    searchBtn.addEventListener('click', () => {
      searchForm.classList.toggle('active');
    });
  }
  document.addEventListener('click', function(event) {
    if (profileBox && userBtn) {
      if (!profileBox.contains(event.target) && event.target !== userBtn) {
        profileBox.classList.remove('active');
      }
    }
    if (sideBar && menuBtn) {
      if (!sideBar.contains(event.target) && event.target !== menuBtn && window.innerWidth < 991) {
        sideBar.classList.remove('active');
      }
    }
    if (searchForm && searchBtn) {
      if (!searchForm.contains(event.target) && event.target !== searchBtn && window.innerWidth < 576) {
        searchForm.classList.remove('active');
      }
    }
  });
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  if (animateElements.length > 0) {
    const checkVisibility = () => {
      animateElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('visible');
        }
      });
    };
    window.addEventListener('scroll', checkVisibility);
    checkVisibility();
  }
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownParent = dropdownToggle?.parentElement;
  if (dropdownToggle && dropdownParent) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdownParent.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!dropdownParent.contains(e.target)) {
        dropdownParent.classList.remove('active');
      }
    });
  }
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
          e.preventDefault();
          const dropdownItem = this.closest('.nav-item.dropdown');
          const dropdownMenu = this.nextElementSibling;
          document.querySelectorAll('.nav-item.dropdown').forEach(item => {
              if (item !== dropdownItem) {
                  item.classList.remove('active');
                  item.querySelector('.dropdown-menu').style.maxHeight = '0px';
              }
          });
          dropdownItem.classList.toggle('active');
          if (dropdownItem.classList.contains('active')) {
              dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + 'px';
          } else {
              dropdownMenu.style.maxHeight = '0px';
          }
      });
  });
  document.addEventListener('click', function(e) {
      if (!e.target.closest('.nav-item.dropdown')) {
          document.querySelectorAll('.nav-item.dropdown').forEach(dropdown => {
              dropdown.classList.remove('active');
              dropdown.querySelector('.dropdown-menu').style.maxHeight = '0px';
          });
      }
  });
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', function() {
      if(confirm('Are you sure you want to logout?')) {
          window.location.href = 'login.html';
      }
  });
});

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const sidebar = document.querySelector('.side-bar');
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.closest('.nav-item.dropdown');
            const dropdownMenu = toggle.nextElementSibling;
            document.querySelectorAll('.nav-item.dropdown').forEach(item => {
                if (item !== dropdown) {
                    item.classList.remove('active');
                    const menu = item.querySelector('.dropdown-menu');
                    if (menu) menu.style.maxHeight = '0px';
                }
            });
            dropdown.classList.toggle('active');
            if (dropdown.classList.contains('active')) {
                dropdownMenu.style.maxHeight = dropdownMenu.scrollHeight + 'px';
            } else {
                dropdownMenu.style.maxHeight = '0px';
            }
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item.dropdown')) {
            document.querySelectorAll('.nav-item.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) menu.style.maxHeight = '0px';
            });
        }
    });
});

document.getElementById('admissionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const stream = document.getElementById('stream').value;
    const cgpa = parseFloat(document.getElementById('cgpa').value);
    if (cgpa < 6.0) {
        alert('Minimum CGPA requirement of 6.0 for science courses');
        return;
    }
    console.log('Form submitted successfully');
});

document.addEventListener('DOMContentLoaded', function() {
   const mockHeaders = document.querySelectorAll('.mock-header');
   mockHeaders.forEach(header => {
      header.addEventListener('click', function() {
         const items = this.nextElementSibling;
         const icon = this.querySelector('i');
         this.classList.toggle('active');
         items.classList.toggle('active');
         if (this.classList.contains('active')) {
            icon.style.transform = 'rotate(90deg)';
         } else {
            icon.style.transform = 'rotate(0)';
         }
      });
   });
   const lockedTests = document.querySelectorAll('.mock-item.disabled');
   lockedTests.forEach(test => {
      test.addEventListener('click', function(e) {
         e.preventDefault();
         alert('Complete previous tests to unlock this test.');
      });
   });
});

function initializeCertificates() {
  document.querySelectorAll('.certificate-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.classList.contains('disabled')) {
        e.preventDefault();
        alert('Please complete the course to access the certificate');
      } else if (this.classList.contains('view-btn')) {
        e.preventDefault();
        viewCertificate(this.dataset.certificate);
      }
    });
  });
  document.querySelectorAll('.info-value').forEach(value => {
    const progress = value.textContent.trim();
    const card = value.closest('.certificate-card');
    if (card) {
      const badge = card.querySelector('.completion-badge');
      if (badge) {
        badge.dataset.progress = progress;
      }
    }
  });
}

function viewCertificate(courseId) {
  console.log(`Viewing certificate for ${courseId}`);
}

document.addEventListener('DOMContentLoaded', function() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const upgradeButtons = document.querySelectorAll('.upgrade-btn:not(.outline)');
    upgradeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planName = this.closest('.plan-card').querySelector('.plan-name').textContent;
            if (planName === 'Enterprise') {
                window.location.href = 'contact-sales.html';
            } else {
                if (confirm(`Are you sure you want to upgrade to ${planName} plan?`)) {
                    console.log(`Upgrading to ${planName} plan`);
                }
            }
        });
    });
});

document.getElementById('feedbackForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    rating: document.getElementById('rating').value,
    feedback: document.getElementById('feedback').value
  };
  fetch('YOUR_SCRIPT_URL', {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json())
  .then(data => {
    alert('Thank you for your feedback!');
    document.getElementById('feedbackForm').reset();
  })
  .catch(() => alert('Failed to submit feedback. Please try again later.'));
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.closest('.nav-item.dropdown');
      const menu = parent.querySelector('.dropdown-menu');
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
      });
      menu.classList.toggle('show');
    });
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item.dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    }
  });
});
