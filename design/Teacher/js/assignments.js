document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuBtn = document.querySelector('.menu-toggle');
    const sideNav = document.querySelector('.side-nav');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sideNav.classList.toggle('active');
        });
    }

    // Mark current page as active in navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.side-nav nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Calculate totals when marks are entered
    const tbody = document.querySelector('tbody');
    
    if (tbody) {
        tbody.addEventListener('input', function(e) {
            if (e.target.tagName === 'INPUT') {
                calculateTotal(e.target.closest('tr'));
            }
        });
    }

    // Function to calculate total marks
    function calculateTotal(row) {
        const inputs = row.querySelectorAll('input');
        let total = 0;
        
        inputs.forEach(input => {
            const value = parseInt(input.value) || 0;
            if (value >= 0 && value <= 30) {
                total += value;
            }
        });
        
        const totalElement = row.querySelector('.total');
        if (totalElement) {
            totalElement.textContent = `${total}/210`;
        }
    }

    // Save marks
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            alert('Marks saved successfully!');
        });
    }
});