/**
 * Task Management & Today's Tasks Module for رابعة طب
 * Synchronized with Calendar and Dashboard statistics.
 */

class TasksManager {
    constructor() {
        this.selectedDate = this.getLocalDateString(new Date());
        this.filterSubject = 'all';
        this.filterPriority = 'all';
        this.filterStatus = 'all';
        this.groupBy = 'time'; // 'time' or 'priority'
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('rabiaa:tasks-updated', () => {
            this.renderTodayTasksPage();
            if (window.calendarManager) {
                window.calendarManager.render();
            }
            if (window.app) {
                window.app.updateDashboardStats();
            }
        });
    }

    getLocalDateString(dateObj) {
        const d = dateObj || new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Task CRUD Operations ---
    createTask(taskData) {
        const tasks = window.storage.getTasks();
        const newTask = {
            id: 'tsk_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            title: taskData.title.trim(),
            description: (taskData.description || '').trim(),
            date: taskData.date || this.getLocalDateString(),
            startTime: taskData.startTime || '',
            endTime: taskData.endTime || '',
            subjectId: taskData.subjectId || null,
            lectureId: taskData.lectureId || null,
            priority: taskData.priority || 'Medium',
            status: 'Pending',
            duration: parseInt(taskData.duration, 10) || 45, // default 45 mins
            notes: (taskData.notes || '').trim(),
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        tasks.push(newTask);
        window.storage.saveTasks(tasks);
        window.app.showToast(`Task created: "${newTask.title}"`, 'success');
        return newTask;
    }

    updateTask(taskId, taskData) {
        const tasks = window.storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return null;

        task.title = taskData.title.trim();
        task.description = (taskData.description || '').trim();
        task.date = taskData.date;
        task.startTime = taskData.startTime || '';
        task.endTime = taskData.endTime || '';
        task.subjectId = taskData.subjectId || null;
        task.lectureId = taskData.lectureId || null;
        task.priority = taskData.priority || 'Medium';
        task.duration = parseInt(taskData.duration, 10) || 45;
        task.notes = (taskData.notes || '').trim();

        window.storage.saveTasks(tasks);
        window.app.showToast(`Updated task: "${task.title}"`, 'success');
        return task;
    }

    deleteTask(taskId) {
        const tasks = window.storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        window.app.showConfirm(
            'Delete Task',
            `Are you sure you want to delete task "${task.title}"?`,
            () => {
                const updated = tasks.filter(t => t.id !== taskId);
                window.storage.saveTasks(updated);
                window.app.showToast(`Deleted task "${task.title}"`, 'success');
            }
        );
    }

    toggleTaskStatus(taskId, isCompleted) {
        const tasks = window.storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        task.status = isCompleted ? 'Completed' : 'Pending';
        task.completedAt = isCompleted ? new Date().toISOString() : null;

        // Check auto-completion of associated lecture
        const settings = window.storage.getSettings();
        if (isCompleted && task.lectureId && task.subjectId) {
            if (settings.autoCompleteLectureOnTask) {
                this.markAssociatedLectureComplete(task.subjectId, task.lectureId, true);
            }
        }

        window.storage.saveTasks(tasks);
        window.app.showToast(isCompleted ? `Task completed: "${task.title}"` : `Task marked pending: "${task.title}"`, 'success');
    }

    markAssociatedLectureComplete(subjectId, lectureId, completed) {
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        let found = false;
        (subject.categories || []).forEach(cat => {
            const lec = (cat.lectures || []).find(l => l.id === lectureId);
            if (lec) {
                lec.completed = completed;
                lec.completedAt = completed ? new Date().toISOString() : null;
                if (completed && lec.reviewStatus === 'Not Started') {
                    lec.reviewStatus = 'Completed';
                }
                found = true;
            }
        });

        if (found) {
            window.storage.saveSubjects(subjects);
            window.app.showToast('Associated lecture automatically completed!', 'info');
        }
    }

    // --- Today's Tasks Page Rendering ---
    renderTodayTasksPage() {
        const container = document.getElementById('today-tasks-container');
        if (!container) return;

        const tasks = window.storage.getTasks();
        const todayStr = this.getLocalDateString();
        const viewingDateStr = this.selectedDate;
        const isCurrentDate = viewingDateStr === todayStr;

        // Header info
        const dateObj = new Date(viewingDateStr + 'T12:00:00');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateFormatted = dateObj.toLocaleDateString('en-US', options);

        const titleEl = document.getElementById('today-view-date-title');
        if (titleEl) {
            titleEl.textContent = isCurrentDate ? `Today's Tasks (${dateFormatted})` : `Tasks for ${dateFormatted}`;
        }

        // Filter tasks for viewing date
        const dayTasks = tasks.filter(t => t.date === viewingDateStr);
        const total = dayTasks.length;
        const completed = dayTasks.filter(t => t.status === 'Completed').length;
        const pending = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update progress in hero
        const statTotal = document.getElementById('today-stat-total');
        const statDone = document.getElementById('today-stat-done');
        const statPending = document.getElementById('today-stat-pending');
        const statPercent = document.getElementById('today-stat-percent');
        const heroProgress = document.getElementById('today-hero-progress');

        if (statTotal) statTotal.textContent = total;
        if (statDone) statDone.textContent = completed;
        if (statPending) statPending.textContent = pending;
        if (statPercent) statPercent.textContent = `${percentage}%`;
        if (heroProgress) heroProgress.style.width = `${percentage}%`;

        // Check for Overdue Tasks (only when viewing today)
        let overdueHTML = '';
        if (isCurrentDate) {
            const overdueTasks = tasks.filter(t => t.date < todayStr && t.status === 'Pending');
            if (overdueTasks.length > 0) {
                overdueHTML = `
                    <div style="background: var(--danger-bg); border: 1px solid var(--danger); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <div style="font-weight: 700; color: var(--danger); display: flex; align-items: center; gap: 8px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span>Attention: ${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}</span>
                            </div>
                            <button class="topbar-btn topbar-btn-outline" style="font-size: 0.75rem; padding: 4px 10px;" onclick="window.tasksManager.rescheduleAllOverdue()">Reschedule to Today</button>
                        </div>
                        <div class="tasks-container">
                            ${overdueTasks.map(t => this.renderTaskCardHTML(t, true)).join('')}
                        </div>
                    </div>
                `;
            }
        }

        // Render tasks list or empty state
        if (dayTasks.length === 0) {
            container.innerHTML = overdueHTML + `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <h4>No Tasks Scheduled for This Day</h4>
                    <p>Plan your revision, lectures, or clinical cases by adding a task.</p>
                    <button class="topbar-btn topbar-btn-primary" onclick="window.tasksManager.openAddTaskModal('${viewingDateStr}')">+ Add Task for This Date</button>
                </div>
            `;
            return;
        }

        // Sort: pending first, then by time/priority
        dayTasks.sort((a, b) => {
            if (a.status !== b.status) return a.status === 'Pending' ? -1 : 1;
            if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
            const pMap = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        });

        container.innerHTML = overdueHTML + `
            <div class="tasks-container">
                ${dayTasks.map(t => this.renderTaskCardHTML(t, false)).join('')}
            </div>
        `;
    }

    renderTaskCardHTML(task, isOverdue) {
        const isCompleted = task.status === 'Completed';
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === task.subjectId);
        const subName = subject ? subject.name : '';

        // Find lecture title if attached
        let lectureTitle = '';
        if (subject && task.lectureId) {
            (subject.categories || []).forEach(cat => {
                const lec = (cat.lectures || []).find(l => l.id === task.lectureId);
                if (lec) lectureTitle = lec.title;
            });
        }

        return `
            <div class="task-item-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" id="task-card-${task.id}">
                <div class="task-checkbox-wrap">
                    <input type="checkbox" class="task-check-input" ${isCompleted ? 'checked' : ''} 
                        onchange="window.tasksManager.toggleTaskStatus('${task.id}', this.checked)"
                        title="${isCompleted ? 'Mark pending' : 'Mark completed'}">
                </div>
                <div class="task-main-info">
                    <div class="task-title-line">${this.escapeHTML(task.title)}</div>
                    ${task.description ? `<div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 6px;">${this.escapeHTML(task.description)}</div>` : ''}
                    <div class="task-meta-line">
                        <span class="priority-badge ${task.priority}">${task.priority}</span>
                        ${subName ? `<span class="meta-pill" style="border-left: 2px solid ${subject.color || '#D4A62F'}; font-weight: 600;">${this.escapeHTML(subName)}</span>` : ''}
                        ${lectureTitle ? `<span class="meta-pill" title="Associated Lecture">📖 ${this.escapeHTML(lectureTitle)}</span>` : ''}
                        ${task.startTime ? `<span class="meta-pill">⏰ ${task.startTime}${task.endTime ? ' - ' + task.endTime : ''}</span>` : ''}
                        ${task.duration ? `<span class="meta-pill">⌛ ${task.duration} mins</span>` : ''}
                        ${isOverdue ? `<span class="meta-pill" style="color: var(--danger); font-weight: 700;">Scheduled: ${task.date}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions-group">
                    <button class="icon-btn" title="Edit Task" onclick="window.tasksManager.openEditTaskModal('${task.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button class="icon-btn danger" title="Delete Task" onclick="window.tasksManager.deleteTask('${task.id}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `;
    }

    // --- Date Navigation on Today's Tasks Page ---
    goToPreviousDay() {
        const cur = new Date(this.selectedDate + 'T12:00:00');
        cur.setDate(cur.getDate() - 1);
        this.selectedDate = this.getLocalDateString(cur);
        this.renderTodayTasksPage();
    }

    goToNextDay() {
        const cur = new Date(this.selectedDate + 'T12:00:00');
        cur.setDate(cur.getDate() + 1);
        this.selectedDate = this.getLocalDateString(cur);
        this.renderTodayTasksPage();
    }

    goToToday() {
        this.selectedDate = this.getLocalDateString();
        this.renderTodayTasksPage();
    }

    rescheduleAllOverdue() {
        const tasks = window.storage.getTasks();
        const todayStr = this.getLocalDateString();
        let count = 0;
        tasks.forEach(t => {
            if (t.date < todayStr && t.status === 'Pending') {
                t.date = todayStr;
                count++;
            }
        });
        if (count > 0) {
            window.storage.saveTasks(tasks);
            window.app.showToast(`Rescheduled ${count} overdue task${count > 1 ? 's' : ''} to today`, 'success');
        }
    }

    // --- Task Modal Handlers ---
    openAddTaskModal(prefilledDate, subjectId, lectureId) {
        document.getElementById('task-modal-title').textContent = 'Create New Study Task';
        document.getElementById('task-form').reset();
        document.getElementById('task-id-input').value = '';
        document.getElementById('task-date-input').value = prefilledDate || this.selectedDate || this.getLocalDateString();
        
        // Populate subject options
        this.populateSubjectSelect(subjectId, lectureId);

        window.app.openModal('task-modal');
    }

    openEditTaskModal(taskId) {
        const tasks = window.storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('task-modal-title').textContent = 'Edit Study Task';
        document.getElementById('task-id-input').value = task.id;
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-desc-input').value = task.description || '';
        document.getElementById('task-date-input').value = task.date;
        document.getElementById('task-start-input').value = task.startTime || '';
        document.getElementById('task-end-input').value = task.endTime || '';
        document.getElementById('task-priority-select').value = task.priority || 'Medium';
        document.getElementById('task-duration-input').value = task.duration || 45;
        document.getElementById('task-notes-input').value = task.notes || '';

        this.populateSubjectSelect(task.subjectId, task.lectureId);

        window.app.openModal('task-modal');
    }

    populateSubjectSelect(selectedSubjectId, selectedLectureId) {
        const subSelect = document.getElementById('task-subject-select');
        const lecSelect = document.getElementById('task-lecture-select');
        if (!subSelect) return;

        const subjects = window.storage.getSubjects();
        subSelect.innerHTML = `<option value="">-- No Subject Assigned --</option>` + 
            subjects.map(s => `<option value="${s.id}" ${s.id === selectedSubjectId ? 'selected' : ''}>${this.escapeHTML(s.name)}</option>`).join('');

        const updateLectures = () => {
            const chosenSubId = subSelect.value;
            const chosenSub = subjects.find(s => s.id === chosenSubId);
            if (!chosenSub || !chosenSub.categories) {
                lecSelect.innerHTML = `<option value="">-- Select Subject First --</option>`;
                lecSelect.disabled = true;
                return;
            }

            let optHTML = `<option value="">-- None / General Subject Study --</option>`;
            chosenSub.categories.forEach(cat => {
                if (cat.lectures && cat.lectures.length > 0) {
                    optHTML += `<optgroup label="${this.escapeHTML(cat.name)}">`;
                    cat.lectures.forEach(l => {
                        optHTML += `<option value="${l.id}" ${l.id === selectedLectureId ? 'selected' : ''}>${this.escapeHTML(l.title)}</option>`;
                    });
                    optHTML += `</optgroup>`;
                }
            });
            lecSelect.innerHTML = optHTML;
            lecSelect.disabled = false;
        };

        subSelect.onchange = updateLectures;
        updateLectures();
    }

    saveTaskForm(event) {
        event.preventDefault();
        const id = document.getElementById('task-id-input').value;
        const title = document.getElementById('task-title-input').value.trim();
        const description = document.getElementById('task-desc-input').value.trim();
        const date = document.getElementById('task-date-input').value;
        const startTime = document.getElementById('task-start-input').value;
        const endTime = document.getElementById('task-end-input').value;
        const subjectId = document.getElementById('task-subject-select').value || null;
        const lectureId = document.getElementById('task-lecture-select').value || null;
        const priority = document.getElementById('task-priority-select').value;
        const duration = parseInt(document.getElementById('task-duration-input').value, 10) || 45;
        const notes = document.getElementById('task-notes-input').value.trim();

        if (!title) {
            window.app.showToast('Please enter a task title', 'error');
            return;
        }

        if (!date) {
            window.app.showToast('Please select a valid date', 'error');
            return;
        }

        const data = { title, description, date, startTime, endTime, subjectId, lectureId, priority, duration, notes };

        if (id) {
            this.updateTask(id, data);
        } else {
            this.createTask(data);
        }

        window.app.closeModal('task-modal');
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
window.tasksManager = new TasksManager();

