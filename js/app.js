/**
 * Main Application Controller for رابعة طب
 * Coordinates navigation, live exam countdown, dashboard statistics, modals, and toasts.
 */

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.countdownTimer = null;
        this.confirmCallback = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initNavigation();
            this.initCountdown();
            this.updateDashboardStats();
            this.initGlobalModalEvents();
            this.initMobileSidebar();

            // Initial view rendering
            if (window.subjectsManager) window.subjectsManager.renderSubjectList();
            if (window.tasksManager) window.tasksManager.renderTodayTasksPage();
            if (window.calendarManager) window.calendarManager.render();
            if (window.analyticsManager) window.analyticsManager.render();
        });

        // Listen for storage changes
        window.addEventListener('rabiaa:subjects-updated', () => this.updateDashboardStats());
        window.addEventListener('rabiaa:tasks-updated', () => this.updateDashboardStats());
        window.addEventListener('rabiaa:settings-updated', () => {
            this.initCountdown();
            this.updateDashboardStats();
        });
    }

    // --- Navigation (Single-Page App Router) ---
    initNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = item.dataset.view;
                if (viewName) this.navigateTo(viewName);
            });
        });

        // Update Topbar current date
        const topbarDate = document.getElementById('topbar-current-date');
        if (topbarDate) {
            const now = new Date();
            const opts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
            topbarDate.textContent = now.toLocaleDateString('en-US', opts);
        }
    }

    navigateTo(viewName) {
        this.currentView = viewName;

        // Update navigation active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Switch active view sections
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.toggle('active', section.id === `view-${viewName}`);
        });

        // Update header page title
        const titles = {
            'dashboard': 'Dashboard',
            'subjects': 'Study Subjects',
            'calendar': 'Academic Calendar',
            'today': "Today's Tasks",
            'progression': 'Topic Progression & Analytics',
            'settings': 'Settings & Preferences'
        };
        const titleEl = document.getElementById('topbar-page-title');
        if (titleEl) titleEl.textContent = titles[viewName] || 'Dashboard';

        // Trigger specific view renders on switch
        if (viewName === 'dashboard') {
            this.updateDashboardStats();
        } else if (viewName === 'subjects' && window.subjectsManager) {
            window.subjectsManager.renderSubjectList();
        } else if (viewName === 'calendar' && window.calendarManager) {
            window.calendarManager.render();
        } else if (viewName === 'today' && window.tasksManager) {
            window.tasksManager.renderTodayTasksPage();
        } else if (viewName === 'progression' && window.analyticsManager) {
            window.analyticsManager.render();
        } else if (viewName === 'settings' && window.settingsManager) {
            window.settingsManager.loadSettingsToUI();
        }

        // Close mobile sidebar if open
        this.closeMobileSidebar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Live Exam Countdown Engine ---
    initCountdown() {
        if (this.countdownTimer) clearInterval(this.countdownTimer);

        const updateClock = () => {
            const settings = window.storage.getSettings();
            const targetDateStr = settings.examDate || DEFAULT_EXAM_DATE;
            const targetDate = new Date(targetDateStr);
            const now = new Date();
            const diffMs = targetDate - now;

            const daysEl = document.getElementById('cd-days');
            const hoursEl = document.getElementById('cd-hours');
            const minsEl = document.getElementById('cd-mins');
            const secsEl = document.getElementById('cd-secs');
            const targetLabel = document.getElementById('cd-target-label');
            const statusBadge = document.getElementById('cd-status-badge');
            const sidebarCountdown = document.getElementById('sidebar-cd-val');

            const formattedTarget = targetDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (targetLabel) targetLabel.textContent = `Target: ${formattedTarget}`;

            if (diffMs <= 0) {
                // Passed or Today
                if (daysEl) daysEl.textContent = '00';
                if (hoursEl) hoursEl.textContent = '00';
                if (minsEl) minsEl.textContent = '00';
                if (secsEl) secsEl.textContent = '00';

                const isToday = now.toDateString() === targetDate.toDateString();
                if (statusBadge) {
                    statusBadge.textContent = isToday ? 'EXAMINATION TODAY!' : 'EXAMINATION CONCLUDED';
                    statusBadge.className = `countdown-status-badge ${isToday ? 'today' : 'passed'}`;
                }
                if (sidebarCountdown) sidebarCountdown.textContent = isToday ? 'Today!' : 'Passed';
                return;
            }

            const totalSeconds = Math.floor(diffMs / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
            if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');

            if (sidebarCountdown) sidebarCountdown.textContent = `${days}d left`;

            if (statusBadge) {
                if (days < 30) {
                    statusBadge.textContent = 'Approaching Exam';
                    statusBadge.className = 'countdown-status-badge approaching';
                } else {
                    statusBadge.textContent = 'On Track';
                    statusBadge.className = 'countdown-status-badge';
                }
            }
        };

        updateClock();
        this.countdownTimer = setInterval(updateClock, 1000);
    }

    openEditExamDateModal() {
        const settings = window.storage.getSettings();
        const input = document.getElementById('modal-exam-date-input');
        if (input && settings.examDate) {
            input.value = settings.examDate.slice(0, 16);
        }
        this.openModal('exam-date-modal');
    }

    saveExamDateModal(event) {
        event.preventDefault();
        const input = document.getElementById('modal-exam-date-input');
        if (!input || !input.value) {
            this.showToast('Please select a valid date and time', 'error');
            return;
        }

        const settings = window.storage.getSettings();
        const raw = input.value;
        settings.examDate = raw.length === 16 ? `${raw}:00` : raw;
        window.storage.saveSettings(settings);

        this.closeModal('exam-date-modal');
        this.showToast('Examination date updated successfully', 'success');
    }

    resetExamDateDefault() {
        const settings = window.storage.getSettings();
        settings.examDate = DEFAULT_EXAM_DATE;
        window.storage.saveSettings(settings);
        this.closeModal('exam-date-modal');
        this.showToast('Reset exam date to February 19, 2027', 'info');
    }

    // --- Dynamic Dashboard Stats Calculation ---
    updateDashboardStats() {
        const subjects = window.storage.getSubjects();
        const tasks = window.storage.getTasks();
        const settings = window.storage.getSettings();

        // Count lectures
        let totalLectures = 0;
        let completedLectures = 0;

        subjects.forEach(sub => {
            (sub.categories || []).forEach(cat => {
                (cat.lectures || []).forEach(lec => {
                    totalLectures++;
                    if (lec.completed) completedLectures++;
                });
            });
        });

        const pendingLectures = totalLectures - completedLectures;
        const overallLecturePct = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

        // Today's tasks
        const todayStr = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(t => t.date === todayStr);
        const tasksCompletedToday = todayTasks.filter(t => t.status === 'Completed').length;
        const tasksRemainingToday = todayTasks.length - tasksCompletedToday;
        const todayPct = todayTasks.length > 0 ? Math.round((tasksCompletedToday / todayTasks.length) * 100) : 0;

        // Study days remaining
        const targetDate = new Date(settings.examDate || DEFAULT_EXAM_DATE);
        const now = new Date();
        const diffTime = targetDate - now;
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        // Update 8 Overview Cards
        const setEl = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setEl('stat-total-subjects', subjects.length);
        setEl('stat-total-lectures', totalLectures);
        setEl('stat-completed-lectures', completedLectures);
        setEl('stat-pending-lectures', pendingLectures);
        setEl('stat-overall-completion', `${overallLecturePct}%`);
        setEl('stat-tasks-done-today', tasksCompletedToday);
        setEl('stat-tasks-remain-today', tasksRemainingToday);
        setEl('stat-days-until-exam', daysLeft);

        // Update Today's Focus Card
        const todayFocusList = document.getElementById('dash-today-tasks-list');
        const todayProgressFill = document.getElementById('dash-today-progress-fill');
        const todayProgressPct = document.getElementById('dash-today-progress-pct');

        if (todayProgressFill) todayProgressFill.style.width = `${todayPct}%`;
        if (todayProgressPct) todayProgressPct.textContent = `${todayPct}%`;

        if (todayFocusList) {
            if (todayTasks.length === 0) {
                todayFocusList.innerHTML = `
                    <div style="text-align: center; padding: 18px 0; color: var(--text-muted); font-size: 0.85rem;">
                        No study tasks scheduled for today.
                        <button style="margin-left: 6px; color: var(--gold-dark); background: none; border: none; font-weight: 600; cursor: pointer;" onclick="window.tasksManager.openAddTaskModal('${todayStr}')">+ Plan Task</button>
                    </div>
                `;
            } else {
                todayFocusList.innerHTML = todayTasks.slice(0, 4).map(t => {
                    const isDone = t.status === 'Completed';
                    return `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--bg-main); border-radius: var(--radius-sm); margin-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                                <input type="checkbox" style="accent-color: var(--gold-rich);" ${isDone ? 'checked' : ''} 
                                    onchange="window.tasksManager.toggleTaskStatus('${t.id}', this.checked)">
                                <span style="font-size: 0.88rem; font-weight: 500; ${isDone ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${window.subjectsManager.escapeHTML(t.title)}</span>
                            </div>
                            <span class="priority-badge ${t.priority}">${t.priority}</span>
                        </div>
                    `;
                }).join('');
            }
        }

        // Priority Incomplete Lectures (Next Study Recommendations)
        const nextLecsList = document.getElementById('dash-next-lectures-list');
        if (nextLecsList) {
            const incompleteLecs = [];
            subjects.forEach(sub => {
                (sub.categories || []).forEach(cat => {
                    (cat.lectures || []).forEach(lec => {
                        if (!lec.completed) {
                            incompleteLecs.push({
                                subjectId: sub.id,
                                subjectName: sub.name,
                                categoryId: cat.id,
                                categoryName: cat.name,
                                lecture: lec
                            });
                        }
                    });
                });
            });

            if (incompleteLecs.length === 0) {
                nextLecsList.innerHTML = `
                    <div style="text-align: center; padding: 18px 0; color: var(--success); font-weight: 600; font-size: 0.9rem;">
                        🎉 All lectures completed! Outstanding dedication.
                    </div>
                `;
            } else {
                nextLecsList.innerHTML = incompleteLecs.slice(0, 4).map(item => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--bg-main); border-radius: var(--radius-sm); margin-bottom: 6px;">
                        <div style="min-width: 0; flex: 1;">
                            <div style="font-size: 0.88rem; font-weight: 600; color: var(--navy-deep); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${window.subjectsManager.escapeHTML(item.lecture.title)}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary);">
                                ${window.subjectsManager.escapeHTML(item.subjectName)} • ${window.subjectsManager.escapeHTML(item.categoryName)}
                            </div>
                        </div>
                        <button class="topbar-btn topbar-btn-outline" style="font-size: 0.72rem; padding: 4px 8px; flex-shrink: 0;"
                            onclick="window.subjectsManager.toggleLectureCompletion('${item.subjectId}', '${item.categoryId}', '${item.lecture.id}', true)">
                            Mark Done
                        </button>
                    </div>
                `).join('');
            }
        }
    }

    // --- Modal Management ---
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            // Auto focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) firstInput.focus();
            }, 50);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    }

    initGlobalModalEvents() {
        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });

        // Close on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    backdrop.classList.remove('open');
                }
            });
        });
    }

    // --- Toast Notifications ---
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = type === 'success' 
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#27966B" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
            : type === 'error'
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D94A4A" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A62F" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

        toast.innerHTML = `
            ${icon}
            <div style="flex: 1;">${window.subjectsManager.escapeHTML(message)}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- Confirmation Dialog ---
    showConfirm(title, message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-modal-title');
        const msgEl = document.getElementById('confirm-modal-message');
        const confirmBtn = document.getElementById('confirm-modal-btn');

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;

        this.confirmCallback = onConfirm;

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                if (typeof this.confirmCallback === 'function') {
                    this.confirmCallback();
                }
                this.closeModal('confirm-modal');
            };
        }

        this.openModal('confirm-modal');
    }

    // --- Mobile Sidebar Drawer ---
    initMobileSidebar() {
        const toggleBtn = document.getElementById('sidebar-toggle-btn');
        const backdrop = document.getElementById('sidebar-backdrop');
        const sidebar = document.getElementById('app-sidebar');

        if (toggleBtn && sidebar && backdrop) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('active');
            });

            backdrop.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    }

    closeMobileSidebar() {
        const backdrop = document.getElementById('sidebar-backdrop');
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
    }
}

// Global Application Instance
window.app = new App();
