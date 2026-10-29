# رابعة طب — 4th Year Medical Study Management Web Application

A complete, polished, interactive, and responsive medical study management web application designed specifically for fourth-year medical students.

The application title is written in Arabic as **رابعة طب**, while the complete user interface, navigation, forms, analytics, and settings are rendered in clean, professional English.

---

## 🌟 Key Features

### 1. Visual Identity & Design System
- **Brand Name**: **رابعة طب**
- **Brand Mark**: Custom, luxury geometric number **4** brand mark with faceted cuts and gold gradient detailing.
- **Color Palette**:
  - Deep Navy: `#101D35`
  - Secondary Navy: `#172947`
  - Rich Gold: `#D4A62F`
  - Dark Gold: `#B88A20`
  - Light Gold: `#F2D98A`
  - Main Background: `#F5F6F8`
  - Card Background: `#FFFFFF`
  - Success Green: `#27966B`
  - Danger Red: `#D94A4A`
- **Right Sidebar Layout**: Dark navy sidebar docked on the right side of the screen with smooth active states, responsive collapsible drawer on tablet/mobile with backdrop overlay.

---

### 2. Main Dashboard & Live Exam Countdown
- **Exam Countdown**:
  - Default target: **February 19, 2027 at 09:00 AM**.
  - Live ticking countdown showing **Days, Hours, Minutes, and Seconds** updating automatically every second.
  - "Edit Exam Date" modal to modify the examination date and time with persistence.
  - Quick Reset action back to February 19, 2027.
  - Dynamic status badges: *On Track*, *Approaching Exam* (<30 days), *EXAMINATION TODAY!*, or *Concluded*.
- **8 Dynamic Overview Cards**:
  1. Total Subjects
  2. Total Lectures
  3. Completed Lectures
  4. Pending Lectures
  5. Overall Lecture Completion (%)
  6. Tasks Completed Today
  7. Tasks Remaining Today
  8. Study Days Remaining Until Exam
- **Today's Focus & Quick Actions**:
  - Direct checkboxes to complete today's tasks.
  - Recommended next incomplete lectures to tackle.
  - Shortcuts: Add Task, Add Subject, Add Lecture, Open Calendar, View Analytics, Edit Exam Date.

---

### 3. Study Subjects Management
- **5 Initial Preloaded Medical Subjects**:
  1. **Pediatrics** (16 categories: Neonatology, Nutritional Disorders, Respiratory, Hematology, Gastroenterology, Cardiology, Nephrology, Neurology, Endocrine & Adolescent Medicine, Infections, Allergy, Rheumatology, Immunology, Oncology, Genetics, Hepatology — 45 lectures total).
  2. **Anesthesia** ("Anesthesia Contents" — 11 lectures).
  3. **Psychiatry** ("Psychiatry Contents" — 10 lectures).
  4. **Tropical Medicine** ("Tropical Medicine Contents" — 17 lectures).
  5. **Rheumatology** ("Rheumatology Contents" — 6 lectures).
- **Interactive Syllabus Accordion**:
  - Mark lectures completed / incomplete (with completion timestamp).
  - Star ratings (1 to 5 stars) for lectures and subjects.
  - Difficulty tags: Easy, Medium, Hard (cycle on click).
  - Review Status: Not Started, In Progress, Completed, Needs Revision.
  - Personal lecture notes modal.
  - Subject and category-level progress bars.
  - Add, edit, and delete subjects, categories, and lectures.
  - Filter by completion status and search through subjects and lectures in real-time.

---

### 4. Real Interactive Calendar
- **Views**: Full Month View, Week View, Day View.
- **Controls**: Previous/Next navigation, Today button, Jump-to-Date picker.
- **Day Cells**: Visual task badges color-coded by priority (Urgent, High, Medium, Low) and completion status.
- **Selected-Date Agenda Drawer**: Displays all tasks on the chosen day with direct checkboxes, editing, and deletion.
- **Configurable First Day of Week**: Saturday (standard in medical universities), Sunday, or Monday.

---

### 5. Dedicated "Today's Tasks" Page
- Synchronized with the persistent calendar and subjects database.
- Displays current date and day of the week.
- Hero progress card showing Total, Done, Pending, and Completion %.
- **Overdue Tasks Warning**: Automatically detects uncompleted tasks from past dates and offers a one-click "Reschedule to Today" action.
- Previous-day and Next-day navigation to review past or upcoming schedules without mutating data.

---

### 6. Topic Progression & Academic Analytics
- **Performance KPIs**:
  - Overall Lecture Completion (%)
  - Overall Task Completion (%)
  - Completed & Remaining Lecture counts
  - Completed Tasks count
  - Total Study Time (hours/mins) based on task durations
  - Current Study Streak & Best Study Streak (based on actual local dates of activity)
  - Highest-Progress Subject & Subject Requiring Most Attention
- **7 Responsive Native SVG & Canvas Charts (Zero External Dependencies)**:
  1. *Daily Study Activity*: Bar chart over 7, 30, or 90 days.
  2. *Lecture Completion Trend*: Cumulative progression curve towards the exam.
  3. *Subject Progress Comparison*: Horizontal progress bars.
  4. *Task Completion Rate*: Donut chart with completion percentage.
  5. *Study Time Distribution*: Breakdown of study hours by subject.
  6. *Weekly Productivity*: Activity distribution across days of the week.
  7. *Lecture Difficulty Overview*: Breakdown of Easy, Medium, and Hard ratings.

---

### 7. Persistence, Backup & Settings
- **Local Storage Architecture**: Versioned keys (`rabiaa_med_v1_*`) ensure existing data is never wiped upon reload or version deployment.
- **Full Backup & Restore**:
  - Export all application data as a formatted JSON backup file.
  - Import JSON backup with schema validation and error handling.
  - Export CSV reports for Subjects & Lectures or Tasks.
  - Restore Default Curriculum button.
  - Reset All Data action with confirmation modal.
- **Preferences**:
  - Theme choices: *Navy & Rich Gold* (Default), *Dark Navy & Slate*, *Warm Academic & Gold*.
  - Default calendar view and first day of week.
  - Optional toggle: Auto-complete lecture when associated task is marked completed.
  - Browser Notifications toggle with permission request.

---

## 🚀 How to Run Locally

Because this application is built with standard vanilla HTML5, CSS3, and modern JavaScript without build steps or npm dependencies:

1. **Directly in Browser**:
   - Double-click `index.html` or drag it into any modern web browser (Edge, Chrome, Firefox, Safari).
2. **Via Local Static Server** (Optional):
   - With Python: `python -m http.server 8000`
   - With Node `npx serve .`
   - With VS Code Live Server extension: right-click `index.html` -> "Open with Live Server".

---

## 🌐 How to Deploy Online

This project is completely ready for static hosting with zero server configuration:

### GitHub Pages
1. Push this folder to a GitHub repository.
2. In your repository on GitHub, navigate to **Settings > Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Netlify
1. Drag and drop the `medicine` folder directly into the [Netlify Drop](https://app.netlify.com/drop) zone.
2. The website will be deployed instantly with a live URL and free SSL certificate.

---

## 📂 File Structure

```
c:/medicine/
│
├── index.html            # Main Single-Page Application interface and modals
├── README.md             # Comprehensive documentation and deployment guide
│
├── css/
│   └── styles.css        # Premium Navy & Gold CSS3 design system and responsive rules
│
└── js/
    ├── storage.js        # Persistent storage service, initial medical dataset, backup/restore
    ├── subjects.js       # Subjects and lectures syllabus manager, categories, ratings, notes
    ├── tasks.js          # Synchronized task CRUD, Today's Tasks view, overdue handlers
    ├── calendar.js       # Month, Week, Day views, real date logic, agenda drawer
    ├── analytics.js      # Topic Progression KPIs, streaks, and native SVG charts
    ├── settings.js       # User preferences, exam schedule, theme toggles, CSV/JSON backups
    └── app.js            # App orchestrator, SPA navigation, live countdown, toasts & modals
```

---

## 🔒 Data Privacy & Multi-User Architecture Notice

- **Personal Local Storage**: All application data is currently stored privately in the student's browser `localStorage`. No data is uploaded to any untrusted external server.
- **Multi-Device Sync**: If classmates open the application, each student starts with their own private dataset. For seamless cross-device synchronization between mobile and desktop in future updates, a cloud database (such as Supabase or Firebase) can be integrated by updating `js/storage.js` without altering the user interface or business logic.

