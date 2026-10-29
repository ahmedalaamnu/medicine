/**
 * Storage Service for رابعة طب (Fourth Year Medical Study Management)
 * Handles data persistence, default datasets, backup/restore, and migrations.
 */

const STORAGE_KEYS = {
    SUBJECTS: 'rabiaa_med_v1_subjects',
    TASKS: 'rabiaa_med_v1_tasks',
    SETTINGS: 'rabiaa_med_v1_settings',
    ACTIVITY: 'rabiaa_med_v1_activity_history',
    VERSION: 'rabiaa_med_data_version'
};

const CURRENT_VERSION = '1.0.0';
const DEFAULT_EXAM_DATE = '2027-02-19T09:00:00';

const INITIAL_DATASET = {
    settings: {
        examDate: DEFAULT_EXAM_DATE,
        theme: 'navy-gold',
        defaultCalendarView: 'month',
        firstDayOfWeek: 6, // Saturday (standard in many medical schools) or 0 (Sunday)
        autoCompleteLectureOnTask: false,
        notificationsEnabled: false,
        defaultTaskPriority: 'Medium'
    },
    subjects: [
        {
            id: 'sub_pediatrics',
            name: 'Pediatrics',
            code: 'PED-401',
            icon: 'baby',
            priority: 'High',
            rating: 5,
            color: '#D4A62F',
            order: 1,
            categories: [
                {
                    id: 'cat_ped_1',
                    name: 'Neonatology',
                    order: 1,
                    lectures: [
                        { id: 'lec_ped_1_1', title: 'Respiratory Distress', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_1_2', title: 'Neonatal Sepsis & Congenital Infections', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_1_3', title: 'Apgar Score', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_1_4', title: 'Jaundice', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_2',
                    name: 'Nutritional Disorders',
                    order: 2,
                    lectures: [
                        { id: 'lec_ped_2_1', title: 'Growth and Development', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_2_2', title: 'Protein Energy Malnutrition', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_2_3', title: 'Rickets', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_2_4', title: 'Infant Feeding', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_3',
                    name: 'Respiratory',
                    order: 3,
                    lectures: [
                        { id: 'lec_ped_3_1', title: 'Pneumonia', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_3_2', title: 'Pleural Diseases', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_3_3', title: 'Upper Respiratory Diseases', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_4',
                    name: 'Hematology',
                    order: 4,
                    lectures: [
                        { id: 'lec_ped_4_1', title: 'Coagulation Disorders', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_4_2', title: 'Platelet Disorders', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_4_3', title: 'Anemia & Hemolytic Anemia', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_5',
                    name: 'Gastroenterology',
                    order: 5,
                    lectures: [
                        { id: 'lec_ped_5_1', title: 'Oral Cavity', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_5_2', title: 'Constipation & GI Bleeding', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_5_3', title: 'Acute & Chronic Diarrhea', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_5_4', title: 'Vomiting', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_6',
                    name: 'Cardiology',
                    order: 6,
                    lectures: [
                        { id: 'lec_ped_6_1', title: 'Introduction to Pediatric Cardiology', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_6_2', title: 'Acyanotic Congenital Heart Disease', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_6_3', title: 'Congenital Cyanotic Heart Disease', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_6_4', title: 'Heart Failure & Obstructive Lesions', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_6_5', title: 'Rheumatic Heart Disease', order: 5, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_6_6', title: 'Infective Endocarditis', order: 6, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_7',
                    name: 'Nephrology',
                    order: 7,
                    lectures: [
                        { id: 'lec_ped_7_1', title: 'UTI and VUR', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_7_2', title: 'Hematuria & Glomerulonephritis', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_7_3', title: 'Polycystic Kidney Disease', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_7_4', title: 'Proteinuria & Nephrotic Syndrome', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_8',
                    name: 'Neurology',
                    order: 8,
                    lectures: [
                        { id: 'lec_ped_8_1', title: 'Seizures & Epilepsy', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_8_2', title: 'Cerebral Palsy & Neurodegenerative Disorders', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_8_3', title: 'CNS Anomalies', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_8_4', title: 'Neuromuscular Diseases', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_9',
                    name: 'Endocrine & Adolescent Medicine',
                    order: 9,
                    lectures: [
                        { id: 'lec_ped_9_1', title: 'Endocrine Disorders', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_9_2', title: 'Adrenal Gland', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_9_3', title: 'Puberty & Its Abnormalities', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_9_4', title: 'Thyroid & Parathyroid Disorders', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_9_5', title: 'Diabetes Mellitus', order: 5, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_10',
                    name: 'Infections',
                    order: 10,
                    lectures: [
                        { id: 'lec_ped_10_1', title: 'Bacterial Meningitis', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_10_2', title: 'Bacterial Infections', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_10_3', title: 'Viral Infections', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_11',
                    name: 'Allergy',
                    order: 11,
                    lectures: [
                        { id: 'lec_ped_11_1', title: 'Bronchial Asthma', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_12',
                    name: 'Rheumatology',
                    order: 12,
                    lectures: [
                        { id: 'lec_ped_12_1', title: 'Juvenile Idiopathic Arthritis (JIA)', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_12_2', title: 'Childhood SLE', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_12_3', title: 'Vasculitis and HSP', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ped_12_4', title: 'Kawasaki Disease', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_13',
                    name: 'Immunology',
                    order: 13,
                    lectures: [
                        { id: 'lec_ped_13_1', title: 'Approach to Immunodeficiency', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_14',
                    name: 'Oncology',
                    order: 14,
                    lectures: [
                        { id: 'lec_ped_14_1', title: 'Leukemia & Lymphoma', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_15',
                    name: 'Genetics',
                    order: 15,
                    lectures: [
                        { id: 'lec_ped_15_1', title: 'Genetic Syndromes', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' }
                    ]
                },
                {
                    id: 'cat_ped_16',
                    name: 'Hepatology',
                    order: 16,
                    lectures: [
                        { id: 'lec_ped_16_1', title: 'Hepatology', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' }
                    ]
                }
            ]
        },
        {
            id: 'sub_anesthesia',
            name: 'Anesthesia',
            code: 'ANE-402',
            icon: 'syringe',
            priority: 'Medium',
            rating: 4,
            color: '#101D35',
            order: 2,
            categories: [
                {
                    id: 'cat_ane_1',
                    name: 'Anesthesia Contents',
                    order: 1,
                    lectures: [
                        { id: 'lec_ane_1', title: 'Preoperative Care', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_2', title: 'General Anesthesia', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_3', title: 'Regional Anaesthesia', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_4', title: 'Intraoperative Anesthetic Risk', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_5', title: 'Basic Monitoring', order: 5, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_6', title: 'Airway Management', order: 6, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_7', title: 'Basic Life Support', order: 7, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_8', title: 'Postoperative Pain Management', order: 8, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_9', title: 'Postoperative Complications 1 & 2', order: 9, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_10', title: 'Fluid Therapy', order: 10, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_ane_11', title: 'Oxygen Therapy', order: 11, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' }
                    ]
                }
            ]
        },
        {
            id: 'sub_psychiatry',
            name: 'Psychiatry',
            code: 'PSY-403',
            icon: 'brain',
            priority: 'High',
            rating: 4,
            color: '#27966B',
            order: 3,
            categories: [
                {
                    id: 'cat_psy_1',
                    name: 'Psychiatry Contents',
                    order: 1,
                    lectures: [
                        { id: 'lec_psy_1', title: 'Anxiety Disorders', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_2', title: 'Depressive, Bipolar, and Related Disorders', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_3', title: 'Schizophrenia and Other Psychotic Disorders', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_4', title: 'Somatic Symptom and Related Disorders', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_5', title: 'Eating Disorders', order: 5, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_6', title: 'Adjustment Disorders', order: 6, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_7', title: 'Substance Use Disorders', order: 7, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_8', title: 'Suicide', order: 8, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_9', title: 'Psychopharmacology', order: 9, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_psy_10', title: 'Normal Sleep and Sleep Disorders', order: 10, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' }
                    ]
                }
            ]
        },
        {
            id: 'sub_tropical',
            name: 'Tropical Medicine',
            code: 'TRP-404',
            icon: 'microscope',
            priority: 'High',
            rating: 5,
            color: '#B88A20',
            order: 4,
            categories: [
                {
                    id: 'cat_trp_1',
                    name: 'Tropical Medicine Contents',
                    order: 1,
                    lectures: [
                        { id: 'lec_trp_1', title: 'Approach to Fever', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_2', title: 'Travel Medicine & Immunization', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_3', title: 'Nosocomial Infection', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_4', title: 'Heat Disorders', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_5', title: 'Tropical Infections', order: 5, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_6', title: 'H. pylori', order: 6, completed: false, completedAt: null, rating: 0, difficulty: 'Easy', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_7', title: 'Salmonellosis & Brucellosis', order: 7, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_8', title: 'HIV & Opportunistic Infections', order: 8, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_9', title: 'CMV, Tetanus & Rabies', order: 9, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_10', title: 'Gastrointestinal Infections', order: 10, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_11', title: 'Abdominal Tuberculosis', order: 11, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_12', title: 'Fever of Unknown Origin', order: 12, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_13', title: 'Emerging Infections (COVID-19)', order: 13, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_14', title: 'Acute Viral Hepatitis', order: 14, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_15', title: 'Chronic HBV & HCV', order: 15, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_16', title: 'Portal Hypertension', order: 16, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_trp_17', title: 'Acute Liver Failure', order: 17, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                }
            ]
        },
        {
            id: 'sub_rheumatology',
            name: 'Rheumatology',
            code: 'RHE-405',
            icon: 'bone',
            priority: 'Medium',
            rating: 4,
            color: '#172947',
            order: 5,
            categories: [
                {
                    id: 'cat_rhe_1',
                    name: 'Rheumatology Contents',
                    order: 1,
                    lectures: [
                        { id: 'lec_rhe_1', title: 'Rheumatoid Arthritis', order: 1, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_rhe_2', title: 'SLE', order: 2, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_rhe_3', title: 'Spondyloarthropathies', order: 3, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_rhe_4', title: 'Systemic Sclerosis', order: 4, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_rhe_5', title: 'Crystal-Induced Arthritis', order: 5, completed: false, completedAt: null, rating: 0, difficulty: 'Medium', notes: '', reviewStatus: 'Not Started' },
                        { id: 'lec_rhe_6', title: 'Inflammatory Myopathies', order: 6, completed: false, completedAt: null, rating: 0, difficulty: 'Hard', notes: '', reviewStatus: 'Not Started' }
                    ]
                }
            ]
        }
    ],
    tasks: []
};

class StorageService {
    constructor() {
        this.init();
    }

    init() {
        try {
            if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
                // Initial setup
                this.saveSettings(INITIAL_DATASET.settings);
                this.saveSubjects(INITIAL_DATASET.subjects);
                this.saveTasks(INITIAL_DATASET.tasks);
                localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
            } else {
                // Ensure all keys exist
                if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
                    this.saveSettings(INITIAL_DATASET.settings);
                }
                if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
                    this.saveSubjects(INITIAL_DATASET.subjects);
                }
                if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
                    this.saveTasks(INITIAL_DATASET.tasks);
                }
            }
        } catch (err) {
            console.error('Storage initialization failed:', err);
        }
    }

    // --- SUBJECTS ---
    getSubjects() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
            return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(INITIAL_DATASET.subjects));
        } catch (e) {
            console.error('Error reading subjects from localStorage', e);
            return JSON.parse(JSON.stringify(INITIAL_DATASET.subjects));
        }
    }

    saveSubjects(subjects) {
        try {
            localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
            window.dispatchEvent(new CustomEvent('rabiaa:subjects-updated', { detail: { subjects } }));
            return true;
        } catch (e) {
            console.error('Error saving subjects', e);
            return false;
        }
    }

    // --- TASKS ---
    getTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Error reading tasks', e);
            return [];
        }
    }

    saveTasks(tasks) {
        try {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            window.dispatchEvent(new CustomEvent('rabiaa:tasks-updated', { detail: { tasks } }));
            return true;
        } catch (e) {
            console.error('Error saving tasks', e);
            return false;
        }
    }

    // --- SETTINGS ---
    getSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            const defaults = INITIAL_DATASET.settings;
            return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
        } catch (e) {
            console.error('Error reading settings', e);
            return { ...INITIAL_DATASET.settings };
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            window.dispatchEvent(new CustomEvent('rabiaa:settings-updated', { detail: { settings } }));
            return true;
        } catch (e) {
            console.error('Error saving settings', e);
            return false;
        }
    }

    // --- EXPORT & IMPORT ---
    exportJSON() {
        const payload = {
            appName: 'رابعة طب - 4th Year Medical Study Management',
            version: CURRENT_VERSION,
            exportDate: new Date().toISOString(),
            settings: this.getSettings(),
            subjects: this.getSubjects(),
            tasks: this.getTasks()
        };
        return JSON.stringify(payload, null, 2);
    }

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.subjects || !Array.isArray(parsed.subjects)) {
                throw new Error('Invalid format: Missing or invalid subjects array');
            }
            if (parsed.tasks && !Array.isArray(parsed.tasks)) {
                throw new Error('Invalid format: Tasks must be an array');
            }
            if (parsed.settings && typeof parsed.settings !== 'object') {
                throw new Error('Invalid format: Settings must be an object');
            }

            // Save verified data
            if (parsed.settings) this.saveSettings(parsed.settings);
            this.saveSubjects(parsed.subjects);
            if (parsed.tasks) this.saveTasks(parsed.tasks);

            return { success: true };
        } catch (e) {
            console.error('Import validation failed:', e);
            return { success: false, error: e.message };
        }
    }

    exportCSV(type) {
        if (type === 'subjects') {
            const subjects = this.getSubjects();
            const headers = ['Subject ID', 'Subject Name', 'Category Name', 'Lecture ID', 'Lecture Title', 'Difficulty', 'Rating', 'Review Status', 'Completed', 'Completed Date'];
            const rows = [headers];

            subjects.forEach(sub => {
                sub.categories.forEach(cat => {
                    cat.lectures.forEach(lec => {
                        rows.push([
                            `"${sub.id}"`,
                            `"${sub.name}"`,
                            `"${cat.name}"`,
                            `"${lec.id}"`,
                            `"${lec.title.replace(/"/g, '""')}"`,
                            `"${lec.difficulty || 'Unset'}"`,
                            `"${lec.rating || 0}"`,
                            `"${lec.reviewStatus || 'Not Started'}"`,
                            `"${lec.completed ? 'Yes' : 'No'}"`,
                            `"${lec.completedAt || ''}"`
                        ]);
                    });
                });
            });

            return rows.map(r => r.join(',')).join('\n');
        } else if (type === 'tasks') {
            const tasks = this.getTasks();
            const subjects = this.getSubjects();
            const subMap = {};
            subjects.forEach(s => subMap[s.id] = s.name);

            const headers = ['Task ID', 'Title', 'Date', 'Start Time', 'End Time', 'Subject', 'Priority', 'Status', 'Duration (Mins)', 'Notes'];
            const rows = [headers];

            tasks.forEach(t => {
                rows.push([
                    `"${t.id}"`,
                    `"${t.title.replace(/"/g, '""')}"`,
                    `"${t.date}"`,
                    `"${t.startTime || ''}"`,
                    `"${t.endTime || ''}"`,
                    `"${subMap[t.subjectId] || ''}"`,
                    `"${t.priority}"`,
                    `"${t.status}"`,
                    `"${t.duration || 0}"`,
                    `"${(t.notes || '').replace(/"/g, '""')}"`
                ]);
            });

            return rows.map(r => r.join(',')).join('\n');
        }
        return '';
    }

    restoreDefaultSubjects() {
        this.saveSubjects(INITIAL_DATASET.subjects);
        return true;
    }

    wipeAllData() {
        localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.VERSION);
        this.init();
        return true;
    }
}

// Global instance
window.storage = new StorageService();

