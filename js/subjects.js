/**
 * Study Subjects Management Module for رابعة طب
 * Handles subject list, lecture syllabus, categories, completion, ratings, and filters.
 */

class SubjectsManager {
    constructor() {
        this.currentSubjectId = null;
        this.filterStatus = 'all';
        this.searchQuery = '';
        this.sortBy = 'order'; // 'order', 'name', 'priority', 'progress'
        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('rabiaa:subjects-updated', () => {
            this.renderSubjectList();
            if (this.currentSubjectId) {
                this.renderSyllabusModal(this.currentSubjectId);
            }
        });
    }

    // --- Subject Calculations ---
    getSubjectStats(subject) {
        let totalLectures = 0;
        let completedLectures = 0;
        let easyCount = 0;
        let mediumCount = 0;
        let hardCount = 0;

        (subject.categories || []).forEach(cat => {
            (cat.lectures || []).forEach(lec => {
                totalLectures++;
                if (lec.completed) completedLectures++;
                if (lec.difficulty === 'Easy') easyCount++;
                else if (lec.difficulty === 'Medium') mediumCount++;
                else if (lec.difficulty === 'Hard') hardCount++;
            });
        });

        const remainingLectures = totalLectures - completedLectures;
        const percentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

        return {
            totalLectures,
            completedLectures,
            remainingLectures,
            percentage,
            easyCount,
            mediumCount,
            hardCount
        };
    }

    getCategoryStats(category) {
        const total = (category.lectures || []).length;
        const completed = (category.lectures || []).filter(l => l.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, remaining: total - completed, percentage };
    }

    // --- Render Subject Cards Grid ---
    renderSubjectList() {
        const container = document.getElementById('subjects-grid');
        if (!container) return;

        let subjects = window.storage.getSubjects();

        // Filter by Search Query
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            subjects = subjects.filter(s => {
                const matchSubject = s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q));
                const matchLecture = (s.categories || []).some(c => 
                    c.name.toLowerCase().includes(q) || 
                    (c.lectures || []).some(l => l.title.toLowerCase().includes(q))
                );
                return matchSubject || matchLecture;
            });
        }

        // Filter by completion status
        if (this.filterStatus !== 'all') {
            subjects = subjects.filter(s => {
                const stats = this.getSubjectStats(s);
                if (this.filterStatus === 'completed') return stats.percentage === 100 && stats.totalLectures > 0;
                if (this.filterStatus === 'in-progress') return stats.percentage > 0 && stats.percentage < 100;
                if (this.filterStatus === 'not-started') return stats.percentage === 0;
                return true;
            });
        }

        // Sort
        subjects.sort((a, b) => {
            if (this.sortBy === 'name') return a.name.localeCompare(b.name);
            if (this.sortBy === 'priority') {
                const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
            }
            if (this.sortBy === 'progress') {
                const statsA = this.getSubjectStats(a);
                const statsB = this.getSubjectStats(b);
                return statsB.percentage - statsA.percentage;
            }
            return (a.order || 0) - (b.order || 0);
        });

        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                    <h4>No Subjects Found</h4>
                    <p>Try adjusting your search query or status filter, or add a new subject.</p>
                    <button class="topbar-btn topbar-btn-primary" onclick="window.subjectsManager.openAddSubjectModal()">+ Add Subject</button>
                </div>
            `;
            return;
        }

        container.innerHTML = subjects.map(s => {
            const stats = this.getSubjectStats(s);
            const priorityClass = (s.priority || 'Medium').toLowerCase();
            const ratingStars = this.renderStarsHTML(s.rating || 0, true, 'window.subjectsManager.setSubjectRating', s.id);

            return `
                <div class="subject-card" data-id="${s.id}">
                    <div>
                        <div class="subject-card-header">
                            <div class="subject-badge-wrap">
                                <div class="subject-icon-box" style="border-left: 3px solid ${s.color || '#D4A62F'}">
                                    ${this.getSubjectIconSVG(s.icon || 'book')}
                                </div>
                                <div class="subject-title-wrap">
                                    <h3>${this.escapeHTML(s.name)}</h3>
                                    <span class="subject-code">${this.escapeHTML(s.code || 'MED-400')}</span>
                                </div>
                            </div>
                            <span class="subject-priority-pill ${priorityClass}">${s.priority || 'Medium'}</span>
                        </div>

                        <div class="subject-stats-row">
                            <div class="subject-stat-col">
                                <div class="subject-stat-num">${stats.totalLectures}</div>
                                <div class="subject-stat-label">Total</div>
                            </div>
                            <div class="subject-stat-col">
                                <div class="subject-stat-num" style="color: var(--success);">${stats.completedLectures}</div>
                                <div class="subject-stat-label">Done</div>
                            </div>
                            <div class="subject-stat-col">
                                <div class="subject-stat-num" style="color: var(--warning);">${stats.remainingLectures}</div>
                                <div class="subject-stat-label">Pending</div>
                            </div>
                        </div>

                        <div class="progress-container">
                            <div class="progress-bar-meta">
                                <span>Progress</span>
                                <span>${stats.percentage}%</span>
                            </div>
                            <div class="progress-track">
                                <div class="progress-fill ${stats.percentage === 100 ? 'complete' : ''}" style="width: ${stats.percentage}%;"></div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">Personal Rating</span>
                            <div class="star-rating">${ratingStars}</div>
                        </div>
                    </div>

                    <div class="subject-card-footer">
                        <button class="btn-open-syllabus" onclick="window.subjectsManager.openSyllabusModal('${s.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            Lectures & Syllabus
                        </button>
                        <div class="card-action-icons">
                            <button class="icon-btn" title="Edit Subject" onclick="window.subjectsManager.openEditSubjectModal('${s.id}')">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </button>
                            <button class="icon-btn danger" title="Delete Subject" onclick="window.subjectsManager.deleteSubject('${s.id}')">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- Syllabus Modal ---
    openSyllabusModal(subjectId) {
        this.currentSubjectId = subjectId;
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const modal = document.getElementById('syllabus-modal');
        const modalTitle = document.getElementById('syllabus-modal-title');
        const modalBody = document.getElementById('syllabus-modal-body');

        if (modalTitle) modalTitle.textContent = `${subject.name} - Lectures Syllabus`;
        this.renderSyllabusModalContent(subject, modalBody);

        window.app.openModal('syllabus-modal');
    }

    renderSyllabusModalContent(subject, container) {
        if (!container) return;
        const stats = this.getSubjectStats(subject);

        let html = `
            <div style="background: var(--bg-main); padding: 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--navy-deep);">${this.escapeHTML(subject.name)}</div>
                    <div style="font-size: 0.82rem; color: var(--text-secondary);">${stats.completedLectures} of ${stats.totalLectures} completed (${stats.percentage}%)</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="topbar-btn topbar-btn-primary" onclick="window.subjectsManager.openAddCategoryModal('${subject.id}')">+ Add Category</button>
                </div>
            </div>

            <div class="category-accordion" id="syllabus-accordion">
        `;

        if (!subject.categories || subject.categories.length === 0) {
            html += `
                <div class="empty-state">
                    <h4>No categories yet</h4>
                    <p>Add a category to begin organizing lectures for ${this.escapeHTML(subject.name)}.</p>
                </div>
            `;
        } else {
            subject.categories.forEach((cat, cIdx) => {
                const catStats = this.getCategoryStats(cat);
                html += `
                    <div class="category-block open" id="cat-block-${cat.id}">
                        <div class="category-header" onclick="window.subjectsManager.toggleCategoryBlock('${cat.id}')">
                            <div class="cat-title-left">
                                <svg class="cat-expand-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                                <span class="cat-name">${cIdx + 1}. ${this.escapeHTML(cat.name)}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;" onclick="event.stopPropagation()">
                                <span class="cat-progress-badge">${catStats.completed}/${catStats.total} Done (${catStats.percentage}%)</span>
                                <button class="icon-btn" title="Add Lecture" onclick="window.subjectsManager.openAddLectureModal('${subject.id}', '${cat.id}')">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </button>
                                <button class="icon-btn" title="Rename Category" onclick="window.subjectsManager.openEditCategoryModal('${subject.id}', '${cat.id}')">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                </button>
                                <button class="icon-btn danger" title="Delete Category" onclick="window.subjectsManager.deleteCategory('${subject.id}', '${cat.id}')">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        </div>
                        <div class="category-body">
                            ${this.renderLecturesListHTML(subject.id, cat.id, cat.lectures || [])}
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    renderLecturesListHTML(subjectId, categoryId, lectures) {
        if (!lectures || lectures.length === 0) {
            return `
                <div style="text-align: center; padding: 12px; color: var(--text-muted); font-size: 0.85rem;">
                    No lectures in this category yet.
                    <button style="margin-left: 8px; color: var(--gold-dark); background: none; border: none; font-weight: 600; cursor: pointer;" onclick="window.subjectsManager.openAddLectureModal('${subjectId}', '${categoryId}')">+ Add Lecture</button>
                </div>
            `;
        }

        return lectures.map((lec, idx) => {
            const isCompleted = !!lec.completed;
            const diffClass = lec.difficulty || 'Unset';
            const ratingStars = this.renderStarsHTML(lec.rating || 0, true, 'window.subjectsManager.setLectureRating', subjectId, categoryId, lec.id);
            const formattedDate = lec.completedAt ? new Date(lec.completedAt).toLocaleDateString() : '';

            return `
                <div class="lecture-row ${isCompleted ? 'completed' : ''}" id="lec-row-${lec.id}">
                    <input type="checkbox" class="lecture-checkbox" ${isCompleted ? 'checked' : ''} 
                        onchange="window.subjectsManager.toggleLectureCompletion('${subjectId}', '${categoryId}', '${lec.id}', this.checked)"
                        title="${isCompleted ? 'Mark as incomplete' : 'Mark as completed'}">
                    
                    <div class="lecture-info">
                        <span class="lecture-title">${idx + 1}. ${this.escapeHTML(lec.title)}</span>
                        ${isCompleted && formattedDate ? `<span class="lecture-date-tag">Completed on ${formattedDate}</span>` : ''}
                        ${lec.notes ? `<span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Note: ${this.escapeHTML(lec.notes)}</span>` : ''}
                    </div>

                    <!-- Review Status Pill -->
                    <select class="form-select" style="padding: 3px 6px; font-size: 0.72rem; width: auto;"
                        onchange="window.subjectsManager.setLectureReviewStatus('${subjectId}', '${categoryId}', '${lec.id}', this.value)">
                        <option value="Not Started" ${lec.reviewStatus === 'Not Started' ? 'selected' : ''}>Not Started</option>
                        <option value="In Progress" ${lec.reviewStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${lec.reviewStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Needs Revision" ${lec.reviewStatus === 'Needs Revision' ? 'selected' : ''}>Needs Revision</option>
                    </select>

                    <!-- Difficulty -->
                    <span class="difficulty-pill ${diffClass}" title="Click to cycle difficulty" onclick="window.subjectsManager.cycleLectureDifficulty('${subjectId}', '${categoryId}', '${lec.id}')">
                        ${diffClass}
                    </span>

                    <!-- Star Rating -->
                    <div class="star-rating">${ratingStars}</div>

                    <!-- Actions -->
                    <div style="display: flex; gap: 4px;">
                        <button class="icon-btn" title="Add Note" onclick="window.subjectsManager.openLectureNotesModal('${subjectId}', '${categoryId}', '${lec.id}')">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </button>
                        <button class="icon-btn danger" title="Delete Lecture" onclick="window.subjectsManager.deleteLecture('${subjectId}', '${categoryId}', '${lec.id}')">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleCategoryBlock(categoryId) {
        const el = document.getElementById(`cat-block-${categoryId}`);
        if (el) el.classList.toggle('open');
    }

    // --- Completion & Toggles ---
    toggleLectureCompletion(subjectId, categoryId, lectureId, completed) {
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;
        const category = (subject.categories || []).find(c => c.id === categoryId);
        if (!category) return;
        const lecture = (category.lectures || []).find(l => l.id === lectureId);
        if (!lecture) return;

        lecture.completed = completed;
        lecture.completedAt = completed ? new Date().toISOString() : null;
        if (completed && lecture.reviewStatus === 'Not Started') {
            lecture.reviewStatus = 'Completed';
        } else if (!completed && lecture.reviewStatus === 'Completed') {
            lecture.reviewStatus = 'In Progress';
        }

        window.storage.saveSubjects(subjects);
        window.app.showToast(completed ? `Completed: "${lecture.title}"` : `Marked incomplete: "${lecture.title}"`, 'success');
    }

    setLectureRating(subjectId, categoryId, lectureId, rating) {
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;
        const category = (subject.categories || []).find(c => c.id === categoryId);
        if (!category) return;
        const lecture = (category.lectures || []).find(l => l.id === lectureId);
        if (!lecture) return;

        lecture.rating = rating;
        window.storage.saveSubjects(subjects);
    }

    setSubjectRating(subjectId, rating) {
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        subject.rating = rating;
        window.storage.saveSubjects(subjects);
    }

    cycleLectureDifficulty(subjectId, categoryId, lectureId) {
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;
        const category = (subject.categories || []).find(c => c.id === categoryId);
        if (!category) return;
        const lecture = (category.lectures || []).find(l => l.id === lectureId);
        if (!lecture) return;

        const cycle = { 'Easy': 'Medium', 'Medium': 'Hard', 'Hard': 'Easy', 'Unset': 'Medium' };
        lecture.difficulty = cycle[lecture.difficulty || 'Unset'] || 'Medium';

        window.storage.saveSubjects(subjects);
        window.app.showToast(`Difficulty set to ${lecture.difficulty}`, 'info');
    }

    setLectureReviewStatus(subjectId, categoryId, lectureId, status) {
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;
        const category = (subject.categories || []).find(c => c.id === categoryId);
        if (!category) return;
        const lecture = (category.lectures || []).find(l => l.id === lectureId);
        if (!lecture) return;

        lecture.reviewStatus = status;
        if (status === 'Completed' && !lecture.completed) {
            lecture.completed = true;
            lecture.completedAt = new Date().toISOString();
        } else if (status === 'Not Started' && lecture.completed) {
            lecture.completed = false;
            lecture.completedAt = null;
        }

        window.storage.saveSubjects(subjects);
    }

    // --- Modal Handlers: Subject CRUD ---
    openAddSubjectModal() {
        document.getElementById('subject-modal-title').textContent = 'Add New Subject';
        document.getElementById('subject-form').reset();
        document.getElementById('subject-id-input').value = '';
        window.app.openModal('subject-modal');
    }

    openEditSubjectModal(subjectId) {
        const subjects = window.storage.getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        document.getElementById('subject-modal-title').textContent = 'Edit Subject';
        document.getElementById('subject-id-input').value = subject.id;
        document.getElementById('subject-name-input').value = subject.name;
        document.getElementById('subject-code-input').value = subject.code || '';
        document.getElementById('subject-priority-select').value = subject.priority || 'Medium';
        document.getElementById('subject-color-input').value = subject.color || '#D4A62F';
        document.getElementById('subject-icon-select').value = subject.icon || 'book';

        window.app.openModal('subject-modal');
    }

    saveSubjectForm(event) {
        event.preventDefault();
        const id = document.getElementById('subject-id-input').value;
        const name = document.getElementById('subject-name-input').value.trim();
        const code = document.getElementById('subject-code-input').value.trim();
        const priority = document.getElementById('subject-priority-select').value;
        const color = document.getElementById('subject-color-input').value;
        const icon = document.getElementById('subject-icon-select').value;

        if (!name) {
            window.app.showToast('Please enter a subject name', 'error');
            return;
        }

        const subjects = window.storage.getSubjects();

        if (id) {
            // Update
            const sub = subjects.find(s => s.id === id);
            if (sub) {
                sub.name = name;
                sub.code = code;
                sub.priority = priority;
                sub.color = color;
                sub.icon = icon;
                window.app.showToast(`Updated "${name}"`, 'success');
            }
        } else {
            // Create
            const newSub = {
                id: 'sub_' + Date.now(),
                name,
                code: code || 'MED-' + Math.floor(400 + Math.random() * 99),
                icon: icon || 'book',
                priority: priority || 'Medium',
                rating: 0,
                color: color || '#D4A62F',
                order: subjects.length + 1,
                categories: []
            };
            subjects.push(newSub);
            window.app.showToast(`Added new subject "${name}"`, 'success');
        }

        window.storage.saveSubjects(subjects);
        window.app.closeModal('subject-modal');
    }

    deleteSubject(subjectId) {
        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;

        window.app.showConfirm(
            'Delete Subject',
            `Are you sure you want to delete "${sub.name}" and all its categories and lectures? This cannot be undone.`,
            () => {
                const updated = subjects.filter(s => s.id !== subjectId);
                window.storage.saveSubjects(updated);
                window.app.showToast(`Deleted subject "${sub.name}"`, 'success');
                if (this.currentSubjectId === subjectId) {
                    window.app.closeModal('syllabus-modal');
                }
            }
        );
    }

    // --- Modal Handlers: Category CRUD ---
    openAddCategoryModal(subjectId) {
        document.getElementById('cat-subject-id').value = subjectId;
        document.getElementById('cat-id-input').value = '';
        document.getElementById('cat-name-input').value = '';
        document.getElementById('category-modal-title').textContent = 'Add Category';
        window.app.openModal('category-modal');
    }

    openEditCategoryModal(subjectId, categoryId) {
        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;
        const cat = (sub.categories || []).find(c => c.id === categoryId);
        if (!cat) return;

        document.getElementById('cat-subject-id').value = subjectId;
        document.getElementById('cat-id-input').value = categoryId;
        document.getElementById('cat-name-input').value = cat.name;
        document.getElementById('category-modal-title').textContent = 'Edit Category Name';
        window.app.openModal('category-modal');
    }

    saveCategoryForm(event) {
        event.preventDefault();
        const subjectId = document.getElementById('cat-subject-id').value;
        const categoryId = document.getElementById('cat-id-input').value;
        const name = document.getElementById('cat-name-input').value.trim();

        if (!name) {
            window.app.showToast('Please enter a category name', 'error');
            return;
        }

        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;
        if (!sub.categories) sub.categories = [];

        if (categoryId) {
            const cat = sub.categories.find(c => c.id === categoryId);
            if (cat) cat.name = name;
            window.app.showToast(`Updated category "${name}"`, 'success');
        } else {
            sub.categories.push({
                id: 'cat_' + Date.now(),
                name,
                order: sub.categories.length + 1,
                lectures: []
            });
            window.app.showToast(`Added category "${name}"`, 'success');
        }

        window.storage.saveSubjects(subjects);
        window.app.closeModal('category-modal');
    }

    deleteCategory(subjectId, categoryId) {
        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;
        const cat = (sub.categories || []).find(c => c.id === categoryId);
        if (!cat) return;

        window.app.showConfirm(
            'Delete Category',
            `Delete category "${cat.name}" and its lectures?`,
            () => {
                sub.categories = sub.categories.filter(c => c.id !== categoryId);
                window.storage.saveSubjects(subjects);
                window.app.showToast(`Deleted category "${cat.name}"`, 'success');
            }
        );
    }

    // --- Modal Handlers: Lecture CRUD ---
    openAddLectureModal(subjectId, categoryId) {
        document.getElementById('lec-subject-id').value = subjectId;
        document.getElementById('lec-category-id').value = categoryId;
        document.getElementById('lec-id-input').value = '';
        document.getElementById('lec-title-input').value = '';
        document.getElementById('lec-difficulty-select').value = 'Medium';
        document.getElementById('lec-notes-input').value = '';
        window.app.openModal('lecture-modal');
    }

    saveLectureForm(event) {
        event.preventDefault();
        const subjectId = document.getElementById('lec-subject-id').value;
        const categoryId = document.getElementById('lec-category-id').value;
        const lectureId = document.getElementById('lec-id-input').value;
        const title = document.getElementById('lec-title-input').value.trim();
        const difficulty = document.getElementById('lec-difficulty-select').value;
        const notes = document.getElementById('lec-notes-input').value.trim();

        if (!title) {
            window.app.showToast('Please enter a lecture title', 'error');
            return;
        }

        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;
        const cat = (sub.categories || []).find(c => c.id === categoryId);
        if (!cat) return;
        if (!cat.lectures) cat.lectures = [];

        if (lectureId) {
            const lec = cat.lectures.find(l => l.id === lectureId);
            if (lec) {
                lec.title = title;
                lec.difficulty = difficulty;
                lec.notes = notes;
            }
            window.app.showToast(`Updated lecture "${title}"`, 'success');
        } else {
            cat.lectures.push({
                id: 'lec_' + Date.now(),
                title,
                order: cat.lectures.length + 1,
                completed: false,
                completedAt: null,
                rating: 0,
                difficulty,
                notes,
                reviewStatus: 'Not Started'
            });
            window.app.showToast(`Added lecture "${title}"`, 'success');
        }

        window.storage.saveSubjects(subjects);
        window.app.closeModal('lecture-modal');
    }

    deleteLecture(subjectId, categoryId, lectureId) {
        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;
        const cat = (sub.categories || []).find(c => c.id === categoryId);
        if (!cat) return;
        const lec = (cat.lectures || []).find(l => l.id === lectureId);
        if (!lec) return;

        window.app.showConfirm(
            'Delete Lecture',
            `Delete lecture "${lec.title}"?`,
            () => {
                cat.lectures = cat.lectures.filter(l => l.id !== lectureId);
                window.storage.saveSubjects(subjects);
                window.app.showToast(`Deleted "${lec.title}"`, 'success');
            }
        );
    }

    openLectureNotesModal(subjectId, categoryId, lectureId) {
        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;
        const cat = (sub.categories || []).find(c => c.id === categoryId);
        if (!cat) return;
        const lec = (cat.lectures || []).find(l => l.id === lectureId);
        if (!lec) return;

        document.getElementById('lec-notes-subject-id').value = subjectId;
        document.getElementById('lec-notes-category-id').value = categoryId;
        document.getElementById('lec-notes-lecture-id').value = lectureId;
        document.getElementById('lec-notes-text').value = lec.notes || '';
        document.getElementById('lecture-notes-title').textContent = `Notes: ${lec.title}`;

        window.app.openModal('lecture-notes-modal');
    }

    saveLectureNotesForm(event) {
        event.preventDefault();
        const subjectId = document.getElementById('lec-notes-subject-id').value;
        const categoryId = document.getElementById('lec-notes-category-id').value;
        const lectureId = document.getElementById('lec-notes-lecture-id').value;
        const notes = document.getElementById('lec-notes-text').value.trim();

        const subjects = window.storage.getSubjects();
        const sub = subjects.find(s => s.id === subjectId);
        if (!sub) return;
        const cat = (sub.categories || []).find(c => c.id === categoryId);
        if (!cat) return;
        const lec = (cat.lectures || []).find(l => l.id === lectureId);
        if (!lec) return;

        lec.notes = notes;
        window.storage.saveSubjects(subjects);
        window.app.closeModal('lecture-notes-modal');
        window.app.showToast('Notes updated', 'success');
    }

    // --- Helpers ---
    renderStarsHTML(currentRating, clickable, callbackFnName, ...args) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= currentRating;
            const fullArgs = [...args, i].map(a => typeof a === 'string' ? `'${a}'` : a).join(', ');
            const onclick = clickable ? `onclick="${callbackFnName}(${fullArgs})"` : '';
            stars += `
                <svg class="${isFilled ? 'filled' : ''}" viewBox="0 0 24 24" ${onclick}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            `;
        }
        return stars;
    }

    getSubjectIconSVG(iconName) {
        switch (iconName) {
            case 'baby': // Pediatrics
                return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>`;
            case 'syringe': // Anesthesia
                return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>`;
            case 'brain': // Psychiatry
                return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>`;
            case 'microscope': // Tropical
                return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`;
            case 'bone': // Rheumatology
                return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 10c.7-.7 1.6-1 2.5-1a3.5 3.5 0 1 0-3.5 3.5c0 .9-.3 1.8-1 2.5l-5 5c-.7.7-1.6 1-2.5 1A3.5 3.5 0 1 0 11 17.5c0-.9.3-1.8 1-2.5l5-5z"/></svg>`;
            default:
                return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
        }
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
window.subjectsManager = new SubjectsManager();
