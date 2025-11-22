document.addEventListener('DOMContentLoaded', function() {
    // Initialize Charts
    const attendanceChart = new Chart(document.getElementById('attendanceChart'), {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Attendance Rate',
                data: [85, 87, 82, 90],
                borderColor: '#6366f1',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    const performanceChart = new Chart(document.getElementById('performanceChart'), {
        type: 'bar',
        data: {
            labels: ['A', 'B', 'C', 'D', 'F'],
            datasets: [{
                label: 'Grade Distribution',
                data: [30, 25, 20, 15, 10],
                backgroundColor: '#6366f1'
            }]
        }
    });

    const subjectChart = new Chart(document.getElementById('subjectChart'), {
        type: 'radar',
        data: {
            labels: [
                'Programming',
                'Database',
                'Networks',
                'OS',
                'Security',
                'AI',
                'Data Structures'
            ],
            datasets: [{
                label: 'Class Average',
                data: [85, 78, 82, 75, 88, 80, 83],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1'
            }]
        }
    });

    // Handle Report Generation
    const generateBtn = document.querySelector('.generate-btn');
    generateBtn.addEventListener('click', function() {
        const reportType = document.getElementById('report-type').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        // Validate dates
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        // Update charts based on selection
        updateCharts(reportType, startDate, endDate);
    });

    // Handle Export
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.textContent.includes('PDF') ? 'PDF' : 'Excel';
            alert(`Exporting report as ${format}...`);
            // Implement actual export functionality
        });
    });
});

function updateCharts(reportType, startDate, endDate) {
    // Simulate API call and update charts
    console.log(`Generating ${reportType} report from ${startDate} to ${endDate}`);
    // Update charts with new data
}