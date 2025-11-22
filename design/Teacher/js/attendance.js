document.addEventListener('DOMContentLoaded', function() {
    // Get all elements we need
    const tbody = document.querySelector('tbody');
    const saveBtn = document.querySelector('.save-btn');
    const dateInput = document.getElementById('attendance-date');
    const subjectSelect = document.getElementById('subject-select');
    const totalStudentsElement = document.querySelector('.summary-card p');
    const presentTodayElement = document.querySelector('.summary-card:nth-child(2) p');
    const absentTodayElement = document.querySelector('.summary-card:nth-child(3) p');
    const attendanceRateElement = document.querySelector('.summary-card:nth-child(4) p');

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Function to calculate individual student's attendance percentage
    function calculateStudentPercentage(present, absent) {
        const total = present + absent;
        if (total === 0) return 0;
        return ((present / total) * 100).toFixed(1);
    }

    // Function to update attendance summary
    function updateAttendanceSummary() {
        const statusSelects = document.querySelectorAll('.status-select');
        let presentCount = 0;
        let absentCount = 0;

        statusSelects.forEach(select => {
            if (select.value === 'present') {
                presentCount++;
            } else if (select.value === 'absent') {
                absentCount++;
            }
        });

        const totalStudents = statusSelects.length;
        const attendanceRate = ((presentCount / totalStudents) * 100).toFixed(1);

        // Update summary cards
        totalStudentsElement.textContent = totalStudents;
        presentTodayElement.textContent = presentCount;
        absentTodayElement.textContent = absentCount;
        attendanceRateElement.textContent = `${attendanceRate}%`;
    }

    // Function to update individual student's attendance
    function updateStudentAttendance(row) {
        const presentCell = row.cells[3];
        const absentCell = row.cells[4];
        const percentageCell = row.cells[5];

        const present = parseInt(presentCell.textContent);
        const absent = parseInt(absentCell.textContent);
        const percentage = calculateStudentPercentage(present, absent);

        percentageCell.textContent = `${percentage}%`;
    }

    // Add event listeners for status changes
    tbody.addEventListener('change', function(e) {
        if (e.target.classList.contains('status-select')) {
            updateAttendanceSummary();
        }
    });

    // Calculate all percentages on page load
    function initializeAttendance() {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => updateStudentAttendance(row));
        updateAttendanceSummary();
    }

    // Add event listeners for date and subject changes
    dateInput.addEventListener('change', function() {
        console.log('Date changed:', dateInput.value);
        updateAttendanceSummary();
    });

    subjectSelect.addEventListener('change', function() {
        console.log('Subject changed:', subjectSelect.value);
        updateAttendanceSummary();
    });

    // Save attendance data
    saveBtn.addEventListener('click', function() {
        if (!dateInput.value) {
            alert('Please select a date!');
            return;
        }
        if (!subjectSelect.value) {
            alert('Please select a subject!');
            return;
        }

        const data = {
            date: dateInput.value,
            subject: subjectSelect.value,
            students: []
        };

        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const studentData = {
                name: row.cells[0].textContent.trim(),
                status: row.querySelector('.status-select').value,
                remarks: row.querySelector('input[type="text"]').value,
                totalPresent: row.cells[3].textContent,
                totalAbsent: row.cells[4].textContent,
                percentage: row.cells[5].textContent
            };
            data.students.push(studentData);
        });

        // Store in localStorage for persistence
        const storageKey = `attendance_${data.date}_${data.subject}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        console.log('Attendance Data:', data);
        alert('Attendance saved successfully!');
    });

    // Initialize on page load
    initializeAttendance();
});