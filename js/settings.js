/**
 * Settings & Preferences Module for رابعة طب
 * Manages configuration, exam date, themes, backups, and restores.
 */

class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('DOMContentLoaded', () => {
            this.loadSettingsToUI();
            this.applyTheme();
        });
    }

    loadSettingsToUI() {
        const settings = window.storage.getSettings();

        // Exam Date & Time
        const examDateInput = document.getElementById('setting-exam-date');
        if (examDateInput && settings.examDate) {
            // Cut to 'YYYY-MM-DDTHH:MM' for datetime-local input
            examDateInput.value = settings.examDate.slice(0, 16);
        }

        // Theme
        const themeSelect = document.getElementById('setting-theme-select');
        if (themeSelect) themeSelect.value = settings.theme || 'navy-gold';

        // Default Calendar View
        const calViewSelect = document.getElementById('setting-calview-select');
        if (calViewSelect) calViewSelect.value = settings.defaultCalendarView || 'month';

        // First Day of Week
        const dayOfWeekSelect = document.getElementById('setting-firstday-select');
        if (dayOfWeekSelect) dayOfWeekSelect.value = settings.firstDayOfWeek ?? 6;

        // Auto-complete Lecture Switch
        const autoLecSwitch = document.getElementById('setting-autocomplete-lec');
        if (autoLecSwitch) autoLecSwitch.checked = !!settings.autoCompleteLectureOnTask;

        // Notifications Switch
        const notifSwitch = document.getElementById('setting-notif-switch');
        if (notifSwitch) notifSwitch.checked = !!settings.notificationsEnabled;

        // Default Priority
        const prioritySelect = document.getElementById('setting-default-priority');
        if (prioritySelect) prioritySelect.value = settings.defaultTaskPriority || 'Medium';
    }

    saveSettingsForm(event) {
        if (event) event.preventDefault();

        const currentSettings = window.storage.getSettings();

        const examDateVal = document.getElementById('setting-exam-date').value;
        const themeVal = document.getElementById('setting-theme-select').value;
        const calViewVal = document.getElementById('setting-calview-select').value;
        const firstDayVal = parseInt(document.getElementById('setting-firstday-select').value, 10);
        const autoLecVal = document.getElementById('setting-autocomplete-lec').checked;
        const notifVal = document.getElementById('setting-notif-switch').checked;
        const priorityVal = document.getElementById('setting-default-priority').value;

        const updated = {
            ...currentSettings,
            examDate: examDateVal ? (examDateVal.length === 16 ? `${examDateVal}:00` : examDateVal) : currentSettings.examDate,
            theme: themeVal,
            defaultCalendarView: calViewVal,
            firstDayOfWeek: isNaN(firstDayVal) ? 6 : firstDayVal,
            autoCompleteLectureOnTask: autoLecVal,
            notificationsEnabled: notifVal,
            defaultTaskPriority: priorityVal
        };

        window.storage.saveSettings(updated);
        this.applyTheme(themeVal);

        if (window.calendarManager) {
            window.calendarManager.render();
        }

        window.app.showToast('Settings saved successfully', 'success');
    }

    applyTheme(themeName) {
        const theme = themeName || window.storage.getSettings().theme || 'navy-gold';
        document.body.classList.remove('theme-slate-dark', 'theme-warm-academic');

        if (theme === 'slate-dark') {
            document.body.classList.add('theme-slate-dark');
        } else if (theme === 'warm-academic') {
            document.body.classList.add('theme-warm-academic');
        }
    }

    resetExamDate() {
        const currentSettings = window.storage.getSettings();
        currentSettings.examDate = DEFAULT_EXAM_DATE;
        window.storage.saveSettings(currentSettings);

        const examDateInput = document.getElementById('setting-exam-date');
        if (examDateInput) examDateInput.value = DEFAULT_EXAM_DATE.slice(0, 16);

        window.app.showToast('Exam date reset to February 19, 2027', 'info');
    }

    requestNotificationPermission() {
        const switchEl = document.getElementById('setting-notif-switch');
        if (!('Notification' in window)) {
            window.app.showToast('Notifications are not supported by this browser', 'error');
            if (switchEl) switchEl.checked = false;
            return;
        }

        if (switchEl && switchEl.checked) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    window.app.showToast('Notification permission granted', 'success');
                    new Notification('رابعة طب', {
                        body: 'Daily medical study alerts enabled.',
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="56,12 20,62 34,62 64,22" fill="%23D4A62F"/><polygon points="12,62 88,62 82,72 20,72" fill="%23D4A62F"/><polygon points="58,16 72,16 72,88 58,88" fill="%23D4A62F"/></svg>'
                    });
                } else {
                    switchEl.checked = false;
                    window.app.showToast('Notification permission denied', 'warning');
                }
            });
        }
    }

    // --- Export / Import Handlers ---
    exportJSON() {
        const json = window.storage.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rabiaa_med_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.app.showToast('Application backup downloaded (JSON)', 'success');
    }

    triggerImportFile() {
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) fileInput.click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const res = window.storage.importJSON(content);
            if (res.success) {
                this.loadSettingsToUI();
                this.applyTheme();
                window.app.showToast('Backup restored successfully!', 'success');
            } else {
                window.app.showToast(`Import failed: ${res.error}`, 'error');
            }
            // Reset input
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    exportCSV(type) {
        const csv = window.storage.exportCSV(type);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rabiaa_med_${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        window.app.showToast(`Exported ${type} to CSV`, 'success');
    }

    restoreDefaultSubjects() {
        window.app.showConfirm(
            'Restore Default Curriculum',
            'Are you sure you want to restore the official initial subjects (Pediatrics, Anesthesia, Psychiatry, Tropical Medicine, Rheumatology)? Custom added subjects will be overwritten.',
            () => {
                window.storage.restoreDefaultSubjects();
                window.app.showToast('Default medical curriculum restored', 'success');
            }
        );
    }

    resetAllData() {
        window.app.showConfirm(
            'Reset All Application Data',
            'DANGER: This will delete all customized subjects, lectures, completion history, tasks, and settings, and reset the app to initial state. Are you sure?',
            () => {
                window.storage.wipeAllData();
                this.loadSettingsToUI();
                this.applyTheme();
                window.app.showToast('All application data reset', 'info');
            }
        );
    }
}

// Global instance
window.settingsManager = new SettingsManager();
