/**
 * Interactive Calendar Module for رابعة طب
 * Supports Month View, Week View, Day View, Date Jump, Day Agenda Drawer, and Filters.
 */

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = this.formatDate(new Date());
        this.currentView = 'month'; // 'month', 'week', 'day'
        this.filterSubject = 'all';
        this.filterPriority = 'all';
        this.filterStatus = 'all';
        this.init();
    }

    init() {
        // Load default view from settings if set
        const settings = window.storage.getSettings();
        if (settings && settings.defaultCalendarView) {
            this.currentView = settings.defaultCalendarView;
        }

        window.addEventListener('rabiaa:tasks-updated', () => {
            this.render();
        });
    }

    formatDate(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // --- Navigation & View Switching ---
    setView(viewName) {
        this.currentView = viewName;
        document.querySelectorAll('.cal-view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        this.render();
    }

    prev() {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() - 1);
        }
        this.render();
    }

    next() {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + 1);
        }
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = this.formatDate(new Date());
        this.render();
    }

    jumpToDate(dateString) {
        if (!dateString) return;
        const target = new Date(dateString + 'T12:00:00');
        if (!isNaN(target.getTime())) {
            this.currentDate = target;
            this.selectedDate = dateString;
            this.render();
        }
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.render();
    }

    // --- Filter Tasks ---
    getFilteredTasks() {
        const allTasks = window.storage.getTasks();
        return allTasks.filter(t => {
            if (this.filterSubject !== 'all' && t.subjectId !== this.filterSubject) return false;
            if (this.filterPriority !== 'all' && t.priority !== this.filterPriority) return false;
            if (this.filterStatus !== 'all' && t.status !== this.filterStatus) return false;
            return true;
        });
    }

    // --- Render Orchestrator ---
    render() {
        const titleEl = document.getElementById('cal-month-title');
        const gridEl = document.getElementById('cal-grid-container');
        if (!gridEl) return;

        const options = { month: 'long', year: 'numeric' };
        if (titleEl) {
            if (this.currentView === 'month') {
                titleEl.textContent = this.currentDate.toLocaleDateString('en-US', options);
            } else if (this.currentView === 'week') {
                const weekRange = this.getWeekRange(this.currentDate);
                titleEl.textContent = `${weekRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            } else {
                titleEl.textContent = this.currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            }
        }

        if (this.currentView === 'month') {
            this.renderMonthView(gridEl);
        } else if (this.currentView === 'week') {
            this.renderWeekView(gridEl);
        } else {
            this.renderDayView(gridEl);
        }

        this.renderAgendaSidebar();
    }

    // --- Month View ---
    renderMonthView(container) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const settings = window.storage.getSettings();
        const firstDayOfWeekSetting = parseInt(settings.firstDayOfWeek, 10) || 6; // default 6 (Saturday)

        // Day of week labels in order
        const allDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const orderedDayNames = [];
        for (let i = 0; i < 7; i++) {
            orderedDayNames.push(allDayNames[(firstDayOfWeekSetting + i) % 7]);
        }

        const startDayIndex = (firstDayOfMonth.getDay() - firstDayOfWeekSetting + 7) % 7;
        const totalDaysInMonth = lastDayOfMonth.getDate();

        const todayStr = this.formatDate(new Date());
        const tasks = this.getFilteredTasks();

        let html = `<div class="calendar-grid">`;

        // Render header
        orderedDayNames.forEach(d => {
            html += `<div class="cal-day-header">${d}</div>`;
        });

        // Days from previous month
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const pDay = prevMonthLastDate - i;
            const pDate = new Date(year, month - 1, pDay);
            const pDateStr = this.formatDate(pDate);
            html += this.renderCalendarCell(pDateStr, pDay, true, false, false, tasks);
        }

        // Current month days
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const curDate = new Date(year, month, day);
            const dateStr = this.formatDate(curDate);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === this.selectedDate;
            html += this.renderCalendarCell(dateStr, day, false, isToday, isSelected, tasks);
        }

        // Fill remaining days of grid row
        const totalRendered = startDayIndex + totalDaysInMonth;
        const remainingCells = (7 - (totalRendered % 7)) % 7;
        for (let day = 1; day <= remainingCells; day++) {
            const nDate = new Date(year, month + 1, day);
            const nDateStr = this.formatDate(nDate);
            html += this.renderCalendarCell(nDateStr, day, true, false, false, tasks);
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    renderCalendarCell(dateStr, dayNum, isOtherMonth, isToday, isSelected, allTasks) {
        const dayTasks = allTasks.filter(t => t.date === dateStr);
        const cellClasses = [
            'cal-cell',
            isOtherMonth ? 'other-month' : '',
            isToday ? 'today' : '',
            isSelected ? 'selected' : ''
        ].filter(Boolean).join(' ');

        let tasksHTML = '';
        if (dayTasks.length > 0) {
            tasksHTML = `<div class="cal-tasks-list">`;
            dayTasks.slice(0, 3).forEach(t => {
                const isDone = t.status === 'Completed';
                tasksHTML += `
                    <div class="cal-task-pill priority-${t.priority} ${isDone ? 'completed' : ''}" title="${this.escapeHTML(t.title)}">
                        ${t.startTime ? t.startTime + ' ' : ''}${this.escapeHTML(t.title)}
                    </div>
                `;
            });
            if (dayTasks.length > 3) {
                tasksHTML += `<div style="font-size: 0.68rem; color: var(--gold-dark); font-weight: 700; padding: 1px 4px;">+${dayTasks.length - 3} more</div>`;
            }
            tasksHTML += `</div>`;
        }

        return `
            <div class="${cellClasses}" onclick="window.calendarManager.selectDate('${dateStr}')">
                <div class="cal-date-number">${dayNum}</div>
                ${tasksHTML}
            </div>
        `;
    }

    // --- Week View ---
    getWeekRange(dateObj) {
        const settings = window.storage.getSettings();
        const firstDayOfWeek = parseInt(settings.firstDayOfWeek, 10) || 6;
        const d = new Date(dateObj);
        const day = d.getDay();
        const diff = (day - firstDayOfWeek + 7) % 7;
        
        const start = new Date(d);
        start.setDate(d.getDate() - diff);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
    }

    renderWeekView(container) {
        const week = this.getWeekRange(this.currentDate);
        const tasks = this.getFilteredTasks();
        const todayStr = this.formatDate(new Date());

        let html = `<div class="calendar-grid" style="grid-template-columns: repeat(7, 1fr);">`;

        const days = [];
        for (let i = 0; i < 7; i++) {
            const current = new Date(week.start);
            current.setDate(week.start.getDate() + i);
            days.push(current);
        }

        days.forEach(d => {
            const dateStr = this.formatDate(d);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            html += `<div class="cal-day-header">${dayName} ${d.getDate()}</div>`;
        });

        days.forEach(d => {
            const dateStr = this.formatDate(d);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === this.selectedDate;
            const dayTasks = tasks.filter(t => t.date === dateStr);

            html += `
                <div class="cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" style="min-height: 240px;" onclick="window.calendarManager.selectDate('${dateStr}')">
                    <div class="cal-date-number">${d.getDate()}</div>
                    <div class="cal-tasks-list">
                        ${dayTasks.map(t => `
                            <div class="cal-task-pill priority-${t.priority} ${t.status === 'Completed' ? 'completed' : ''}" style="white-space: normal; margin-bottom: 4px;">
                                <div style="font-weight: 700;">${t.startTime || 'All day'}</div>
                                <div>${this.escapeHTML(t.title)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    // --- Day View ---
    renderDayView(container) {
        const dateStr = this.formatDate(this.currentDate);
        const tasks = this.getFilteredTasks().filter(t => t.date === dateStr);
        const formatted = this.currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        let html = `
            <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 20px; border: 1px solid var(--bg-muted);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--bg-muted); padding-bottom: 14px;">
                    <div>
                        <h3 style="font-size: 1.2rem; color: var(--navy-deep);">${formatted}</h3>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">${tasks.length} task${tasks.length === 1 ? '' : 's'} scheduled</span>
                    </div>
                    <button class="topbar-btn topbar-btn-primary" onclick="window.tasksManager.openAddTaskModal('${dateStr}')">+ Add Task</button>
                </div>
        `;

        if (tasks.length === 0) {
            html += `
                <div class="empty-state">
                    <h4>No Tasks For This Day</h4>
                    <p>Click below to schedule study activities or lectures.</p>
                    <button class="topbar-btn topbar-btn-primary" onclick="window.tasksManager.openAddTaskModal('${dateStr}')">+ Add Task</button>
                </div>
            `;
        } else {
            html += `<div class="tasks-container">`;
            tasks.forEach(t => {
                html += window.tasksManager.renderTaskCardHTML(t, false);
            });
            html += `</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    // --- Agenda Sidebar (Selected Date) ---
    renderAgendaSidebar() {
        const titleEl = document.getElementById('agenda-date-title');
        const subtitleEl = document.getElementById('agenda-date-subtitle');
        const container = document.getElementById('agenda-tasks-list');
        if (!container) return;

        const selDateObj = new Date(this.selectedDate + 'T12:00:00');
        const formatted = selDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        if (titleEl) titleEl.textContent = formatted;

        const tasks = this.getFilteredTasks().filter(t => t.date === this.selectedDate);
        if (subtitleEl) subtitleEl.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 24px 10px; color: var(--text-muted); font-size: 0.85rem;">
                    <div>No tasks on this date</div>
                    <button class="topbar-btn topbar-btn-outline" style="margin-top: 10px; font-size: 0.8rem;" onclick="window.tasksManager.openAddTaskModal('${this.selectedDate}')">+ Schedule Task</button>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(t => {
            const isDone = t.status === 'Completed';
            return `
                <div style="background: var(--bg-main); border-radius: var(--radius-sm); padding: 10px 12px; border-left: 3px solid var(--gold-rich); display: flex; align-items: flex-start; gap: 10px;">
                    <input type="checkbox" style="margin-top: 3px; accent-color: var(--gold-rich);" ${isDone ? 'checked' : ''} 
                        onchange="window.tasksManager.toggleTaskStatus('${t.id}', this.checked)">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 0.9rem; font-weight: 600; color: var(--navy-deep); ${isDone ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${this.escapeHTML(t.title)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                            ${t.startTime ? '⏰ ' + t.startTime + ' | ' : ''}
                            <span class="priority-badge ${t.priority}">${t.priority}</span>
                        </div>
                    </div>
                    <button class="icon-btn danger" style="width: 26px; height: 26px;" onclick="window.tasksManager.deleteTask('${t.id}')">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            `;
        }).join('');
    }

    escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Global instance
window.calendarManager = new CalendarManager();

