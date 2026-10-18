/**
 * VoiceStudy AI — Subject Library & Taxonomy
 * 
 * Comprehensive, extensible directory of academic and competitive subjects
 * organized across 10 primary curricula categories.
 * 
 * Note: VoiceStudy AI uses general-purpose LLM multi-agent reasoning (Lyzr Agent Studio)
 * and semantic vector retrieval (Qdrant) across all listed subjects. No claim of
 * proprietary domain-specific fine-tuning is made.
 */

export const SUBJECT_CATEGORIES = [
  {
    id: 'cs-it',
    name: 'Computer Science and IT',
    icon: 'Cpu',
    description: 'Algorithms, data structures, systems, architectures, software development, and AI.',
    accentColor: '#38BDF8',
    subjects: [
      { id: 'dbms', name: 'Database Systems (DBMS)', popular: true, defaultTopic: 'Concurrency Control & 2PL' },
      { id: 'os', name: 'Operating Systems', popular: true, defaultTopic: 'Virtual Memory & Paging' },
      { id: 'networks', name: 'Computer Networks', popular: true, defaultTopic: 'TCP/IP Handshake & Congestion Control' },
      { id: 'dsa', name: 'Data Structures and Algorithms', popular: true, defaultTopic: 'Graph Traversal & Dynamic Programming' },
      { id: 'software-eng', name: 'Software Engineering', defaultTopic: 'SOLID Principles & Microservices Architecture' },
      { id: 'ai-ml', name: 'Artificial Intelligence and ML', defaultTopic: 'Supervised Learning & Neural Networks' },
      { id: 'cybersecurity', name: 'Cybersecurity & Cryptography', defaultTopic: 'Public Key Infrastructure (PKI) & Encryption' },
      { id: 'web-tech', name: 'Web Technologies and Cloud', defaultTopic: 'REST APIs & Distributed Systems' },
      { id: 'python', name: 'Python Programming', defaultTopic: 'Object-Oriented Programming and Asynchronous I/O' }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: 'Atom',
    description: 'Core physical, chemical, and biological sciences with experimental principles.',
    accentColor: '#10B981',
    subjects: [
      { id: 'physics', name: 'Physics', popular: true, defaultTopic: 'Electromagnetism & Thermodynamics' },
      { id: 'chemistry', name: 'Chemistry', popular: true, defaultTopic: 'Chemical Bonding & Reaction Kinetics' },
      { id: 'biology', name: 'Biology', popular: true, defaultTopic: 'Cellular Respiration & Genetics' },
      { id: 'environmental-sci', name: 'Environmental Science', defaultTopic: 'Ecosystem Dynamics & Climate Cycles' },
      { id: 'astronomy', name: 'Astronomy & Astrophysics', defaultTopic: 'Stellar Evolution & Gravitational Waves' }
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'Binary',
    description: 'Pure and applied mathematics from linear algebra to probability and calculus.',
    accentColor: '#8B5CF6',
    subjects: [
      { id: 'calculus', name: 'Calculus and Analysis', popular: true, defaultTopic: 'Multivariable Integration & Taylor Series' },
      { id: 'linear-algebra', name: 'Linear Algebra', popular: true, defaultTopic: 'Eigenvalues, Eigenvectors & SVD' },
      { id: 'probability-stats', name: 'Probability and Statistics', popular: true, defaultTopic: 'Bayesian Inference & Distributions' },
      { id: 'discrete-math', name: 'Discrete Mathematics', defaultTopic: 'Graph Theory, Combinatorics & Logic' },
      { id: 'differential-eq', name: 'Differential Equations', defaultTopic: 'Ordinary and Partial Differential Equations' }
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: 'Wrench',
    description: 'Foundations of engineering disciplines, hardware design, and applied physics.',
    accentColor: '#F59E0B',
    subjects: [
      { id: 'mech-eng', name: 'Mechanical Engineering', defaultTopic: 'Thermodynamics & Fluid Mechanics' },
      { id: 'ee-eng', name: 'Electrical & Electronics', defaultTopic: 'Circuit Analysis, Signals & Systems' },
      { id: 'civil-eng', name: 'Civil Engineering', defaultTopic: 'Structural Mechanics & Geotechnical Engineering' },
      { id: 'chem-eng', name: 'Chemical Engineering', defaultTopic: 'Mass Transfer & Chemical Reactor Design' },
      { id: 'ece-eng', name: 'Electronics and Communication', defaultTopic: 'Digital Signal Processing & Modulation' }
    ]
  },
  {
    id: 'pharmacy-healthcare',
    name: 'Pharmacy and Healthcare',
    icon: 'Stethoscope',
    description: 'Pharmaceutical sciences, clinical anatomy, pathology, and healthcare fundamentals.',
    accentColor: '#EC4899',
    subjects: [
      { id: 'pharmacology', name: 'Pharmacology', popular: true, defaultTopic: 'Pharmacokinetics & Receptor Mechanisms' },
      { id: 'anatomy-physiology', name: 'Human Anatomy and Physiology', defaultTopic: 'Cardiovascular & Nervous Systems' },
      { id: 'biochemistry', name: 'Medical Biochemistry', defaultTopic: 'Enzymatic Pathways & Metabolic Cycles' },
      { id: 'clinical-pathology', name: 'Clinical Pathology', defaultTopic: 'Diagnostic Biomarkers & Disease Etiology' },
      { id: 'medicinal-chem', name: 'Medicinal Chemistry', defaultTopic: 'Drug Design & Structure-Activity Relationships' }
    ]
  },
  {
    id: 'commerce',
    name: 'Commerce',
    icon: 'BadgeDollarSign',
    description: 'Accounting, economics, corporate taxation, auditing, and financial reporting.',
    accentColor: '#14B8A6',
    subjects: [
      { id: 'financial-accounting', name: 'Financial Accounting', popular: true, defaultTopic: 'Balance Sheets & Cash Flow Statements' },
      { id: 'business-law', name: 'Business Law', defaultTopic: 'Contract Act & Corporate Compliance' },
      { id: 'economics', name: 'Micro and Macroeconomics', defaultTopic: 'Market Structures & Monetary Policy' },
      { id: 'cost-accounting', name: 'Cost and Management Accounting', defaultTopic: 'Marginal Costing & Variance Analysis' },
      { id: 'auditing-tax', name: 'Auditing and Taxation', defaultTopic: 'Corporate Tax Assessment & Audit Standards' }
    ]
  },
  {
    id: 'arts-humanities',
    name: 'Arts and Humanities',
    icon: 'BookOpen',
    description: 'Human culture, history, governance, sociology, and philosophical inquiry.',
    accentColor: '#6366F1',
    subjects: [
      { id: 'world-history', name: 'World History', defaultTopic: 'Industrial Revolutions & Modern Geopolitics' },
      { id: 'political-science', name: 'Political Science', defaultTopic: 'Constitutional Frameworks & International Relations' },
      { id: 'sociology', name: 'Sociology', defaultTopic: 'Social Stratification & Cultural Institutions' },
      { id: 'philosophy', name: 'Philosophy and Ethics', defaultTopic: 'Epistemology & Moral Theories' },
      { id: 'psychology', name: 'Psychology', defaultTopic: 'Cognitive Biases, Memory & Learning Theories' }
    ]
  },
  {
    id: 'management',
    name: 'Management',
    icon: 'Briefcase',
    description: 'Organizational strategy, marketing, human resources, and business leadership.',
    accentColor: '#0284C7',
    subjects: [
      { id: 'marketing-mgmt', name: 'Marketing Management', defaultTopic: 'Consumer Behavior & Brand Positioning' },
      { id: 'hrm', name: 'Human Resource Management', defaultTopic: 'Talent Acquisition & Performance Appraisal' },
      { id: 'org-behavior', name: 'Organizational Behavior', defaultTopic: 'Leadership Styles & Group Dynamics' },
      { id: 'strategic-mgmt', name: 'Strategic Management', defaultTopic: 'Competitive Advantage & Porters Five Forces' },
      { id: 'financial-mgmt', name: 'Financial Management', defaultTopic: 'Capital Budgeting & Cost of Capital' }
    ]
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: 'Languages',
    description: 'Linguistic structures, grammar, composition, phonetics, and literary analysis.',
    accentColor: '#84CC16',
    subjects: [
      { id: 'english-lit', name: 'English Literature and Grammar', defaultTopic: 'Syntax Analysis & Critical Literary Theory' },
      { id: 'spanish', name: 'Spanish Language Studies', defaultTopic: 'Subjunctive Mood & Advanced Verb Conjugation' },
      { id: 'french', name: 'French Language Studies', defaultTopic: 'Grammatical Agreements & Pronunciation Rules' },
      { id: 'german', name: 'German Language Studies', defaultTopic: 'Case System (Nominative, Accusative, Dative, Genitive)' },
      { id: 'linguistics', name: 'Linguistics and Phonetics', defaultTopic: 'Phonology, Morphology & Pragmatics' }
    ]
  },
  {
    id: 'competitive-exams',
    name: 'Competitive Exams',
    icon: 'Trophy',
    description: 'Aptitude, quantitative reasoning, verbal ability, and standard exam preparation.',
    accentColor: '#F43F5E',
    subjects: [
      { id: 'general-aptitude', name: 'General Aptitude and Reasoning', popular: true, defaultTopic: 'Logical Deductions, Puzzles & Syllogisms' },
      { id: 'quant-ability', name: 'Quantitative Ability', popular: true, defaultTopic: 'Speed Math, Permutations & Number Systems' },
      { id: 'general-studies', name: 'General Studies and Current Affairs', defaultTopic: 'Modern History & Environmental Policy' },
      { id: 'verbal-ability', name: 'Verbal Ability and Comprehension', defaultTopic: 'Reading Comprehension & Critical Reasoning' },
      { id: 'technical-core', name: 'Technical Core Exam Review', defaultTopic: 'GATE/GRE Engineering Problem Solving' }
    ]
  }
];

/**
 * Returns a flat list of all subjects with their parent category metadata
 */
export function getAllSubjects() {
  const result = [];
  SUBJECT_CATEGORIES.forEach(cat => {
    cat.subjects.forEach(sub => {
      result.push({
        ...sub,
        categoryId: cat.id,
        categoryName: cat.name,
        accentColor: cat.accentColor
      });
    });
  });
  return result;
}

/**
 * Search subjects and categories by query string
 */
export function searchSubjects(query) {
  if (!query || !query.trim()) return getAllSubjects();
  const q = query.toLowerCase().trim();
  return getAllSubjects().filter(sub => 
    sub.name.toLowerCase().includes(q) ||
    sub.categoryName.toLowerCase().includes(q) ||
    (sub.defaultTopic && sub.defaultTopic.toLowerCase().includes(q))
  );
}

/**
 * Find category for a given subject name
 */
export function findCategoryForSubject(subjectName) {
  if (!subjectName) return null;
  const target = subjectName.toLowerCase().trim();
  for (const cat of SUBJECT_CATEGORIES) {
    for (const sub of cat.subjects) {
      if (sub.name.toLowerCase().trim() === target || target.includes(sub.name.toLowerCase().trim())) {
        return cat;
      }
    }
  }
  return null;
}
