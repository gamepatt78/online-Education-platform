document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    const calendarDates = document.getElementById('calendarDates');
    const currentMonthElement = document.getElementById('currentMonth');
    const modal = document.getElementById('eventModal');
    const eventForm = document.getElementById('eventForm');
    const addEventBtn = document.getElementById('addEvent');
    
    // Initialize calendar
    function initCalendar() {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        currentMonthElement.textContent = currentDate.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        calendarDates.innerHTML = '';
        
        // Add empty cells for days before first day of month
        for(let i = 0; i < firstDay.getDay(); i++) {
            calendarDates.appendChild(createDateCell(''));
        }
        
        // Add days of month
        for(let i = 1; i <= lastDay.getDate(); i++) {
            const cell = createDateCell(i);
            if(isToday(i)) {
                cell.classList.add('today');
            }
            calendarDates.appendChild(cell);
        }
    }
    
    function createDateCell(day) {
        const cell = document.createElement('div');
        cell.className = 'date-cell';
        cell.textContent = day;
        
        if(day !== '') {
            cell.addEventListener('click', () => {
                showEventModal(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
            });
        }
        
        return cell;
    }
    
    function isToday(day) {
        const today = new Date();
        return day === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getYear() === today.getYear();
    }
    
    // Event Modal Functions
    function showEventModal(date) {
        modal.style.display = 'block';
        document.getElementById('eventDate').value = date.toISOString().split('T')[0];
    }
    
    // Event Handlers
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        initCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        initCalendar();
    });
    
    addEventBtn.addEventListener('click', () => {
        showEventModal(new Date());
    });
    
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const eventData = {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            type: document.getElementById('eventType').value
        };
        
        // Save event data
        saveEvent(eventData);
        modal.style.display = 'none';
        initCalendar();
    });
    
    function saveEvent(eventData) {
        let events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        events.push(eventData);
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        updateEventList();
    }
    
    function updateEventList() {
        const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        const eventList = document.querySelector('.event-list');
        eventList.innerHTML = '';
        
        events.sort((a, b) => new Date(a.date) - new Date(b.date))
             .forEach(event => {
                 const eventElement = document.createElement('div');
                 const eventType = typeof event.type === 'string' && /^[a-z0-9_-]{1,30}$/i.test(event.type)
                     ? event.type
                     : 'event';
                 eventElement.classList.add('event-item', eventType);

                 const title = document.createElement('h4');
                 title.textContent = String(event.title || '');
                 const date = document.createElement('p');
                 date.textContent = new Date(event.date).toLocaleDateString();
                 const time = document.createElement('p');
                 time.textContent = String(event.time || '');

                 eventElement.append(title, date, time);
                 eventList.appendChild(eventElement);
             });
    }
    
    // Initialize
    initCalendar();
    updateEventList();
});