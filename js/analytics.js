/**
 * Topic Progression & Academic Analytics Module for رابعة طب
 * Native SVG & Canvas charts without external libraries.
 * Real, data-driven analytics and study streak calculations.
 */

class AnalyticsManager {
    constructor() {
        this.dateRange = '30'; // '7', '30', '90', 'all'
        this.selectedSubject = 'all';
        this.init();
    }

    init() {
        window.addEventListener('rabiaa:subjects-updated', () => this.render());
        window.addEventListener('rabiaa:tasks-updated', () => this.render());
    }

    setDateRange(range) {
        this.dateRange = range;
        document.querySelectorAll('.analytics-range-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.range === range);
        });
        this.render();
    }

    setSubjectFilter(subId) {
        this.selectedSubject = subId;
        this.render();
    }

    // --- Calculations & KPIs ---
    getKPIs() {
        const subjects = window.storage.getSubjects();
        const tasks = window.storage.getTasks();

        let totalLectures = 0;
        let completedLectures = 0;
        let highProgressSub = { name: 'None', progress: -1 };
        let lowProgressSub = { name: 'None', progress: 101 };

        subjects.forEach(sub => {
            let subTotal = 0;
            let subCompleted = 0;
            (sub.categories || []).forEach(cat => {
                (cat.lectures || []).forEach(lec => {
                    subTotal++;
                    if (lec.completed) subCompleted++;
                });
            });

            totalLectures += subTotal;
            completedLectures += subCompleted;

            const subPct = subTotal > 0 ? (subCompleted / subTotal) * 100 : 0;
            if (subTotal > 0) {
                if (subPct > highProgressSub.progress) {
                    highProgressSub = { name: sub.name, progress: Math.round(subPct) };
                }
                if (subPct < lowProgressSub.progress) {
                    lowProgressSub = { name: sub.name, progress: Math.round(subPct) };
                }
            }
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const remainingLectures = totalLectures - completedLectures;
        const overallLecturePct = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
        const overallTaskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Total Study Time (from completed tasks with durations)
        let totalStudyMinutes = 0;
        tasks.filter(t => t.status === 'Completed').forEach(t => {
            totalStudyMinutes += (t.duration || 45);
        });

        const studyHours = Math.floor(totalStudyMinutes / 60);
        const studyMins = totalStudyMinutes % 60;
        const studyTimeFormatted = studyHours > 0 ? `${studyHours}h ${studyMins}m` : `${studyMins}m`;

        // Streak calculation
        const streaks = this.calculateStudyStreaks(tasks, subjects);

        return {
            overallLecturePct,
            overallTaskPct,
            completedLectures,
            remainingLectures,
            totalLectures,
            completedTasks,
            totalTasks,
            studyTimeFormatted,
            totalStudyMinutes,
            currentStreak: streaks.current,
            bestStreak: streaks.best,
            highProgressSub: highProgressSub.progress >= 0 ? highProgressSub.name : 'N/A',
            lowProgressSub: lowProgressSub.progress <= 100 ? lowProgressSub.name : 'N/A'
        };
    }

    calculateStudyStreaks(tasks, subjects) {
        // Collect all distinct activity dates (YYYY-MM-DD)
        const activeDatesSet = new Set();

        tasks.forEach(t => {
            if (t.status === 'Completed' && t.completedAt) {
                activeDatesSet.add(t.completedAt.split('T')[0]);
            }
        });

        subjects.forEach(sub => {
            (sub.categories || []).forEach(cat => {
                (cat.lectures || []).forEach(lec => {
                    if (lec.completed && lec.completedAt) {
                        activeDatesSet.add(lec.completedAt.split('T')[0]);
                    }
                });
            });
        });

        const sortedDates = Array.from(activeDatesSet).sort();
        if (sortedDates.length === 0) return { current: 0, best: 0 };

        // Calculate best streak
        let best = 1;
        let currentStreakCount = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i - 1] + 'T12:00:00');
            const curr = new Date(sortedDates[i] + 'T12:00:00');
            const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreakCount++;
                if (currentStreakCount > best) best = currentStreakCount;
            } else if (diffDays > 1) {
                currentStreakCount = 1;
            }
        }

        // Calculate current streak relative to today
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayObj = new Date();
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

        let current = 0;
        if (activeDatesSet.has(todayStr) || activeDatesSet.has(yesterdayStr)) {
            // Trace backward from latest
            let checkDate = activeDatesSet.has(todayStr) ? new Date() : yesterdayObj;
            while (true) {
                const dateKey = checkDate.toISOString().split('T')[0];
                if (activeDatesSet.has(dateKey)) {
                    current++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        return { current, best: Math.max(best, current) };
    }

    // --- Main Render ---
    render() {
        this.renderKPIs();
        this.renderDailyActivityChart();
        this.renderLectureCompletionTrendChart();
        this.renderSubjectProgressChart();
        this.renderTaskCompletionDonut();
        this.renderStudyTimeDistributionChart();
        this.renderWeeklyProductivityChart();
        this.renderDifficultyBreakdownChart();
    }

    renderKPIs() {
        const kpis = this.getKPIs();
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('kpi-lecture-pct', `${kpis.overallLecturePct}%`);
        setVal('kpi-task-pct', `${kpis.overallTaskPct}%`);
        setVal('kpi-completed-lectures', kpis.completedLectures);
        setVal('kpi-remaining-lectures', kpis.remainingLectures);
        setVal('kpi-completed-tasks', kpis.completedTasks);
        setVal('kpi-study-time', kpis.studyTimeFormatted);
        setVal('kpi-current-streak', `${kpis.currentStreak} Days`);
        setVal('kpi-best-streak', `${kpis.bestStreak} Days`);
        setVal('kpi-highest-subject', kpis.highProgressSub);
        setVal('kpi-attention-subject', kpis.lowProgressSub);
    }

    // --- 1. Daily Study Activity Chart (SVG Bar Chart) ---
    renderDailyActivityChart() {
        const container = document.getElementById('chart-daily-activity');
        if (!container) return;

        const tasks = window.storage.getTasks();
        const daysCount = parseInt(this.dateRange, 10) || 30;
        
        // Generate daily buckets
        const buckets = [];
        const now = new Date();
        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            buckets.push({ date: key, label: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 });
        }

        // Populate completed tasks
        tasks.forEach(t => {
            if (t.status === 'Completed' && t.completedAt) {
                const key = t.completedAt.split('T')[0];
                const found = buckets.find(b => b.date === key);
                if (found) found.count++;
            }
        });

        const maxVal = Math.max(1, ...buckets.map(b => b.count));
        const width = 600;
        const height = 220;
        const padding = 35;
        const chartW = width - padding * 2;
        const chartH = height - padding * 2;
        const barWidth = Math.max(3, (chartW / buckets.length) - 4);

        let barsSVG = '';
        buckets.forEach((b, idx) => {
            const barH = (b.count / maxVal) * chartH;
            const x = padding + (idx * (chartW / buckets.length)) + 2;
            const y = height - padding - barH;

            barsSVG += `
                <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${b.count > 0 ? '#D4A62F' : '#EAECEF'}" rx="3">
                    <title>${b.date}: ${b.count} tasks completed</title>
                </rect>
            `;
            // Labels for subset of bars to prevent crowding
            if (idx % Math.ceil(buckets.length / 7) === 0 || idx === buckets.length - 1) {
                barsSVG += `<text x="${x + barWidth / 2}" y="${height - 10}" font-size="10" fill="#788396" text-anchor="middle">${b.label}</text>`;
            }
        });

        container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <!-- Grid Lines -->
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#EAECEF" stroke-width="1"/>
                <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#EAECEF" stroke-width="1" stroke-dasharray="3,3"/>
                <text x="${padding - 8}" y="${height - padding}" font-size="10" fill="#788396" text-anchor="end">0</text>
                <text x="${padding - 8}" y="${padding + 5}" font-size="10" fill="#788396" text-anchor="end">${maxVal}</text>
                ${barsSVG}
            </svg>
        `;
    }

    // --- 2. Lecture Completion Trend (SVG Cumulative Curve) ---
    renderLectureCompletionTrendChart() {
        const container = document.getElementById('chart-lecture-trend');
        if (!container) return;

        const subjects = window.storage.getSubjects();
        const lectureDates = [];

        subjects.forEach(s => {
            (s.categories || []).forEach(c => {
                (c.lectures || []).forEach(l => {
                    if (l.completed && l.completedAt) {
                        lectureDates.push(l.completedAt.split('T')[0]);
                    }
                });
            });
        });

        if (lectureDates.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 24px;">
                    <p>No completed lectures recorded yet. Start marking lectures complete to see your progression curve.</p>
                </div>
            `;
            return;
        }

        lectureDates.sort();
        const dateCounts = {};
        lectureDates.forEach(d => dateCounts[d] = (dateCounts[d] || 0) + 1);

        const keys = Object.keys(dateCounts);
        let cumulative = 0;
        const points = keys.map(k => {
            cumulative += dateCounts[k];
            return { date: k, total: cumulative };
        });

        const width = 600;
        const height = 220;
        const padding = 40;
        const chartW = width - padding * 2;
        const chartH = height - padding * 2;
        const maxVal = Math.max(1, cumulative);

        const coords = points.map((p, idx) => {
            const x = points.length === 1 ? padding + chartW / 2 : padding + (idx / (points.length - 1)) * chartW;
            const y = height - padding - ((p.total / maxVal) * chartH);
            return `${x},${y}`;
        });

        const pathD = `M ${coords.join(' L ')}`;
        const areaD = `M ${coords[0].split(',')[0]},${height - padding} L ${coords.join(' L ')} L ${coords[coords.length - 1].split(',')[0]},${height - padding} Z`;

        container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#D4A62F" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#D4A62F" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>
                <path d="${areaD}" fill="url(#curveGrad)"/>
                <path d="${pathD}" fill="none" stroke="#D4A62F" stroke-width="3"/>
                ${points.map((p, idx) => {
                    const parts = coords[idx].split(',');
                    return `<circle cx="${parts[0]}" cy="${parts[1]}" r="4" fill="#101D35" stroke="#D4A62F" stroke-width="2">
                        <title>${p.date}: ${p.total} completed lectures</title>
                    </circle>`;
                }).join('')}
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#EAECEF" stroke-width="1"/>
                <text x="${padding}" y="${height - 12}" font-size="10" fill="#788396">${points[0].date}</text>
                <text x="${width - padding}" y="${height - 12}" font-size="10" fill="#788396" text-anchor="end">${points[points.length - 1].date}</text>
            </svg>
        `;
    }

    // --- 3. Subject Progress Comparison (Horizontal Bar Chart) ---
    renderSubjectProgressChart() {
        const container = document.getElementById('chart-subject-progress');
        if (!container) return;

        const subjects = window.storage.getSubjects();
        if (subjects.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No subjects found.</p></div>`;
            return;
        }

        let html = `<div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">`;
        subjects.forEach(s => {
            let total = 0;
            let done = 0;
            (s.categories || []).forEach(c => {
                (c.lectures || []).forEach(l => {
                    total++;
                    if (l.completed) done++;
                });
            });
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            html += `
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">
                        <span style="color: var(--navy-deep);">${s.name}</span>
                        <span style="color: var(--text-secondary);">${done}/${total} (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 10px; background: var(--bg-muted); border-radius: var(--radius-full); overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: ${pct === 100 ? 'var(--success)' : (s.color || 'var(--gold-rich)')}; border-radius: var(--radius-full); transition: width 0.4s ease;"></div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    }

    // --- 4. Task Completion Rate (Donut Chart) ---
    renderTaskCompletionDonut() {
        const container = document.getElementById('chart-task-completion');
        if (!container) return;

        const tasks = window.storage.getTasks();
        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'Completed').length;
        const pending = total - done;

        if (total === 0) {
            container.innerHTML = `<div class="empty-state"><p>No tasks created yet.</p></div>`;
            return;
        }

        const donePct = Math.round((done / total) * 100);
        const radius = 60;
        const circ = 2 * Math.PI * radius;
        const offset = circ - (donePct / 100) * circ;

        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap;">
                <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#EAECEF" stroke-width="18"/>
                    <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#27966B" stroke-width="18"
                        stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
                        transform="rotate(-90 80 80)" style="transition: stroke-dashoffset 0.5s ease;"/>
                    <text x="80" y="85" font-size="22" font-weight="800" fill="#101D35" text-anchor="middle">${donePct}%</text>
                    <text x="80" y="102" font-size="10" font-weight="600" fill="#788396" text-anchor="middle">COMPLETED</text>
                </svg>
                <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; border-radius: 3px; background: #27966B;"></span>
                        <span style="font-weight: 600;">Completed: ${done}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; border-radius: 3px; background: #EAECEF;"></span>
                        <span style="font-weight: 600;">Pending: ${pending}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // --- 5. Study Time Distribution (Donut / Breakdown) ---
    renderStudyTimeDistributionChart() {
        const container = document.getElementById('chart-study-distribution');
        if (!container) return;

        const tasks = window.storage.getTasks();
        const subjects = window.storage.getSubjects();
        const subMinutes = {};

        tasks.filter(t => t.status === 'Completed').forEach(t => {
            const sid = t.subjectId || 'unassigned';
            subMinutes[sid] = (subMinutes[sid] || 0) + (t.duration || 45);
        });

        const totalMinutes = Object.values(subMinutes).reduce((a, b) => a + b, 0);

        if (totalMinutes === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No completed tasks with recorded study time yet.</p>
                </div>
            `;
            return;
        }

        let html = `<div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">`;
        subjects.forEach(s => {
            const mins = subMinutes[s.id] || 0;
            const pct = Math.round((mins / totalMinutes) * 100);
            const hrs = (mins / 60).toFixed(1);

            html += `
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: var(--navy-deep);">${s.name}</span>
                        <span style="color: var(--text-secondary);">${hrs} hrs (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--bg-muted); border-radius: var(--radius-full); overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: ${s.color || '#D4A62F'}; border-radius: var(--radius-full);"></div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    }

    // --- 6. Weekly Productivity (Day-of-Week Bar Chart) ---
    renderWeeklyProductivityChart() {
        const container = document.getElementById('chart-weekly-productivity');
        if (!container) return;

        const tasks = window.storage.getTasks();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];

        tasks.forEach(t => {
            if (t.status === 'Completed' && t.completedAt) {
                const dayIdx = new Date(t.completedAt).getDay();
                dayCounts[dayIdx]++;
            }
        });

        const maxVal = Math.max(1, ...dayCounts);
        const width = 450;
        const height = 180;
        const padding = 30;
        const chartW = width - padding * 2;
        const chartH = height - padding * 2;
        const colWidth = chartW / 7;

        let bars = '';
        dayCounts.forEach((count, i) => {
            const barH = (count / maxVal) * chartH;
            const x = padding + (i * colWidth) + 8;
            const y = height - padding - barH;

            bars += `
                <rect x="${x}" y="${y}" width="${colWidth - 16}" height="${barH}" fill="#101D35" rx="4">
                    <title>${days[i]}: ${count} tasks completed</title>
                </rect>
                <text x="${x + (colWidth - 16) / 2}" y="${height - 10}" font-size="11" font-weight="600" fill="#788396" text-anchor="middle">${days[i]}</text>
                ${count > 0 ? `<text x="${x + (colWidth - 16) / 2}" y="${y - 4}" font-size="10" font-weight="700" fill="#D4A62F" text-anchor="middle">${count}</text>` : ''}
            `;
        });

        container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#EAECEF" stroke-width="1"/>
                ${bars}
            </svg>
        `;
    }

    // --- 7. Difficulty Breakdown ---
    renderDifficultyBreakdownChart() {
        const container = document.getElementById('chart-difficulty-breakdown');
        if (!container) return;

        const subjects = window.storage.getSubjects();
        let easy = 0, medium = 0, hard = 0;

        subjects.forEach(s => {
            (s.categories || []).forEach(c => {
                (c.lectures || []).forEach(l => {
                    if (l.difficulty === 'Easy') easy++;
                    else if (l.difficulty === 'Medium') medium++;
                    else if (l.difficulty === 'Hard') hard++;
                });
            });
        });

        const total = easy + medium + hard;
        if (total === 0) {
            container.innerHTML = `<div class="empty-state"><p>No lectures rated with difficulty yet.</p></div>`;
            return;
        }

        const easyPct = Math.round((easy / total) * 100);
        const medPct = Math.round((medium / total) * 100);
        const hardPct = Math.round((hard / total) * 100);

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">
                        <span style="color: var(--success);">Easy Lectures</span>
                        <span>${easy} (${easyPct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--bg-muted); border-radius: var(--radius-full); overflow: hidden;">
                        <div style="width: ${easyPct}%; height: 100%; background: var(--success); border-radius: var(--radius-full);"></div>
                    </div>
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">
                        <span style="color: var(--warning);">Medium Lectures</span>
                        <span>${medium} (${medPct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--bg-muted); border-radius: var(--radius-full); overflow: hidden;">
                        <div style="width: ${medPct}%; height: 100%; background: var(--warning); border-radius: var(--radius-full);"></div>
                    </div>
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">
                        <span style="color: var(--danger);">Hard Lectures</span>
                        <span>${hard} (${hardPct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--bg-muted); border-radius: var(--radius-full); overflow: hidden;">
                        <div style="width: ${hardPct}%; height: 100%; background: var(--danger); border-radius: var(--radius-full);"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global instance
window.analyticsManager = new AnalyticsManager();

