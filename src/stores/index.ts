import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Student,
  Payment,
  CenterReward,
  Wallet,
  WalletTransaction,
  ExamResult,
  Scholarship,
  Certificate,
  AdminUser,
  AdminLog,
  ExamSession,
  ExamConfigSettings,
  CertificateSettings,
  CertificateTemplate,
  CertificateTemplateConfig,
  EmailTemplate,
  EmailDelivery,
  BatchEmailJob,
} from '@/types';
import { STORAGE_KEYS, EXAM_CONFIG, EXAM_FEES, CENTER_REWARD, DEFAULT_CERTIFICATE_SETTINGS } from '@/constants/config';
import { generateId, generateCenterCode, generateOrderId, generatePaymentId, generateCertificateId } from '@/lib/utils';
import { sendEmailNotification } from '@/lib/emailNotifications';
import { initializeMockData, mockExamQuestions } from '@/constants/mockData';

// Initialize mock data on first load
initializeMockData();

// Helper to get data from localStorage
const getStoredData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// Helper to set data in localStorage
const setStoredData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Auth Store
interface AuthState {
  currentStudent: Student | null;
  currentAdmin: AdminUser | null;
  isStudentLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  loginStudent: (email: string, mobile: string) => Student | null;
  logoutStudent: () => void;
  loginAdmin: (email: string, password: string) => AdminUser | null;
  logoutAdmin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentStudent: null,
      currentAdmin: null,
      isStudentLoggedIn: false,
      isAdminLoggedIn: false,

      loginStudent: (email: string, mobile: string) => {
        const students: Student[] = getStoredData(STORAGE_KEYS.students, []);
        const student = students.find(
          (s) => s.email === email && s.mobile === mobile && s.status === 'ACTIVE'
        );
        if (student) {
          set({ currentStudent: student, isStudentLoggedIn: true });
          return student;
        }
        return null;
      },

      logoutStudent: () => {
        set({ currentStudent: null, isStudentLoggedIn: false });
      },

      loginAdmin: (email: string, password: string) => {
        const admins: AdminUser[] = getStoredData(STORAGE_KEYS.adminUsers, []);
        const admin = admins.find(
          (a) => a.email === email && a.passwordHash === `hashed_${password}`
        );
        if (admin) {
          // Update last login
          const updatedAdmins = admins.map((a) =>
            a.id === admin.id ? { ...a, lastLogin: new Date().toISOString() } : a
          );
          setStoredData(STORAGE_KEYS.adminUsers, updatedAdmins);
          set({ currentAdmin: admin, isAdminLoggedIn: true });
          return admin;
        }
        return null;
      },

      logoutAdmin: () => {
        set({ currentAdmin: null, isAdminLoggedIn: false });
      },
    }),
    {
      name: 'gphdm-auth-storage',
    }
  )
);

// Student Store
interface StudentState {
  students: Student[];
  loadStudents: () => void;
  addStudent: (data: Omit<Student, 'id' | 'centerCode' | 'status' | 'createdAt' | 'mobileVerified' | 'emailVerified'>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  getStudentById: (id: string) => Student | undefined;
  getStudentByEmail: (email: string) => Student | undefined;
  getStudentByMobile: (mobile: string) => Student | undefined;
  getStudentByCenterCode: (code: string) => Student | undefined;
  blockStudent: (id: string) => void;
  unblockStudent: (id: string) => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],

  loadStudents: () => {
    const students = getStoredData<Student[]>(STORAGE_KEYS.students, []);
    set({ students });
  },

  addStudent: (data) => {
    const students = get().students;
    const newStudent: Student = {
      ...data,
      id: generateId(),
      centerCode: generateCenterCode(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      mobileVerified: false,
      emailVerified: false,
    };
    const updated = [...students, newStudent];
    set({ students: updated });
    setStoredData(STORAGE_KEYS.students, updated);
    
    // Send registration confirmation email
    sendEmailNotification(
      'REGISTRATION_CONFIRMATION',
      newStudent.email,
      {
        studentName: newStudent.name,
        studentEmail: newStudent.email,
        class: newStudent.class,
        centerCode: newStudent.centerCode,
      }
    );
    
    return newStudent;
  },

  updateStudent: (id, data) => {
    const students = get().students.map((s) =>
      s.id === id ? { ...s, ...data } : s
    );
    set({ students });
    setStoredData(STORAGE_KEYS.students, students);
  },

  getStudentById: (id) => get().students.find((s) => s.id === id),
  getStudentByEmail: (email) => get().students.find((s) => s.email === email),
  getStudentByMobile: (mobile) => get().students.find((s) => s.mobile === mobile),
  getStudentByCenterCode: (code) => get().students.find((s) => s.centerCode === code),

  blockStudent: (id) => {
    const students = get().students.map((s) =>
      s.id === id ? { ...s, status: 'BLOCKED' as const } : s
    );
    set({ students });
    setStoredData(STORAGE_KEYS.students, students);
  },

  unblockStudent: (id) => {
    const students = get().students.map((s) =>
      s.id === id ? { ...s, status: 'ACTIVE' as const } : s
    );
    set({ students });
    setStoredData(STORAGE_KEYS.students, students);
  },
}));

// Payment Store
interface PaymentState {
  payments: Payment[];
  loadPayments: () => void;
  createPayment: (studentId: string, amount: number) => Payment;
  verifyPayment: (paymentId: string, razorpayPaymentId: string, signature: string) => Payment | null;
  failPayment: (paymentId: string) => void;
  getPaymentsByStudent: (studentId: string) => Payment[];
  hasSuccessfulPayment: (studentId: string) => boolean;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],

  loadPayments: () => {
    const payments = getStoredData<Payment[]>(STORAGE_KEYS.payments, []);
    set({ payments });
  },

  createPayment: (studentId, amount) => {
    const payments = get().payments;
    const newPayment: Payment = {
      id: generateId(),
      studentId,
      razorpayOrderId: generateOrderId(),
      amount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    const updated = [...payments, newPayment];
    set({ payments: updated });
    setStoredData(STORAGE_KEYS.payments, updated);
    return newPayment;
  },

  verifyPayment: (paymentId, razorpayPaymentId, signature) => {
    const payments = get().payments;
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return null;

    const updatedPayment: Payment = {
      ...payment,
      razorpayPaymentId,
      razorpaySignature: signature,
      status: 'SUCCESS',
      paidAt: new Date().toISOString(),
    };

    const updated = payments.map((p) => (p.id === paymentId ? updatedPayment : p));
    set({ payments: updated });
    setStoredData(STORAGE_KEYS.payments, updated);
    
    // Send payment receipt email
    const students = getStoredData<Student[]>(STORAGE_KEYS.students, []);
    const student = students.find(s => s.id === payment.studentId);
    if (student) {
      sendEmailNotification(
        'PAYMENT_RECEIPT',
        student.email,
        {
          studentName: student.name,
          studentEmail: student.email,
          paymentId: razorpayPaymentId,
          amount: payment.amount,
          date: new Date().toISOString(),
          centerCode: student.centerCode,
        }
      );
    }
    
    return updatedPayment;
  },

  failPayment: (paymentId) => {
    const payments = get().payments.map((p) =>
      p.id === paymentId ? { ...p, status: 'FAILED' as const } : p
    );
    set({ payments });
    setStoredData(STORAGE_KEYS.payments, payments);
  },

  getPaymentsByStudent: (studentId) => get().payments.filter((p) => p.studentId === studentId),
  hasSuccessfulPayment: (studentId) =>
    get().payments.some((p) => p.studentId === studentId && p.status === 'SUCCESS'),
}));

// Wallet Store
interface WalletState {
  wallets: Wallet[];
  transactions: WalletTransaction[];
  loadWallets: () => void;
  getOrCreateWallet: (studentId: string) => Wallet;
  creditWallet: (studentId: string, amount: number, type: WalletTransaction['type'], reason: string, referenceId?: string) => void;
  getWalletByStudent: (studentId: string) => Wallet | undefined;
  getTransactionsByWallet: (walletId: string) => WalletTransaction[];
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  transactions: [],

  loadWallets: () => {
    const wallets = getStoredData<Wallet[]>(STORAGE_KEYS.wallets, []);
    const transactions = getStoredData<WalletTransaction[]>(STORAGE_KEYS.walletTransactions, []);
    set({ wallets, transactions });
  },

  getOrCreateWallet: (studentId) => {
    let wallet = get().wallets.find((w) => w.studentId === studentId);
    if (!wallet) {
      wallet = {
        id: generateId(),
        studentId,
        balance: 0,
      };
      const updated = [...get().wallets, wallet];
      set({ wallets: updated });
      setStoredData(STORAGE_KEYS.wallets, updated);
    }
    return wallet;
  },

  creditWallet: (studentId, amount, type, reason, referenceId) => {
    const wallet = get().getOrCreateWallet(studentId);
    const updatedWallet = { ...wallet, balance: wallet.balance + amount };
    
    const wallets = get().wallets.map((w) => (w.id === wallet.id ? updatedWallet : w));
    
    const transaction: WalletTransaction = {
      id: generateId(),
      walletId: wallet.id,
      type,
      amount,
      reason,
      referenceId,
      createdAt: new Date().toISOString(),
    };
    const transactions = [...get().transactions, transaction];

    set({ wallets, transactions });
    setStoredData(STORAGE_KEYS.wallets, wallets);
    setStoredData(STORAGE_KEYS.walletTransactions, transactions);
  },

  getWalletByStudent: (studentId) => get().wallets.find((w) => w.studentId === studentId),
  getTransactionsByWallet: (walletId) => get().transactions.filter((t) => t.walletId === walletId),
}));

// Center Reward Store
interface CenterRewardState {
  rewards: CenterReward[];
  loadRewards: () => void;
  createReward: (centerOwnerStudentId: string, newStudentId: string, paymentId: string) => void;
  getRewardsByOwner: (ownerId: string) => CenterReward[];
}

export const useCenterRewardStore = create<CenterRewardState>((set, get) => ({
  rewards: [],

  loadRewards: () => {
    const rewards = getStoredData<CenterReward[]>(STORAGE_KEYS.centerRewards, []);
    set({ rewards });
  },

  createReward: (centerOwnerStudentId, newStudentId, paymentId) => {
    const reward: CenterReward = {
      id: generateId(),
      centerOwnerStudentId,
      newStudentId,
      paymentId,
      rewardAmount: CENTER_REWARD.amount,
      status: 'CREDITED',
      createdAt: new Date().toISOString(),
    };

    const rewards = [...get().rewards, reward];
    set({ rewards });
    setStoredData(STORAGE_KEYS.centerRewards, rewards);

    // Credit wallet
    useWalletStore.getState().creditWallet(
      centerOwnerStudentId,
      CENTER_REWARD.amount,
      'CENTER_REWARD',
      `Center code reward from new student registration`,
      reward.id
    );
  },

  getRewardsByOwner: (ownerId) => get().rewards.filter((r) => r.centerOwnerStudentId === ownerId),
}));

// Exam Store
interface ExamState {
  config: ExamConfigSettings;
  sessions: ExamSession[];
  results: ExamResult[];
  loadExamData: () => void;
  updateConfig: (config: Partial<ExamConfigSettings>) => void;
  startExam: (studentId: string, classLevel: number) => ExamSession;
  submitAnswer: (sessionId: string, questionId: string, selectedIndex: number | null, timeTaken: number) => void;
  completeExam: (sessionId: string) => ExamResult;
  getSessionByStudent: (studentId: string) => ExamSession | undefined;
  getResultByStudent: (studentId: string) => ExamResult | undefined;
  getQuestionsForClass: (classLevel: number) => typeof mockExamQuestions;
  hasCompletedExam: (studentId: string) => boolean;
  publishResults: (classLevel: number) => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  config: {
    timePerQuestion: EXAM_CONFIG.defaultTimePerQuestion as 5 | 7,
    demoQuestionCount: EXAM_CONFIG.demoQuestionCount,
    fees: EXAM_FEES,
    marksPerCorrect: EXAM_CONFIG.marksPerCorrect,
    marksPerWrong: EXAM_CONFIG.marksPerWrong,
  },
  sessions: [],
  results: [],

  loadExamData: () => {
    const config = getStoredData<ExamConfigSettings>(STORAGE_KEYS.examConfig, get().config);
    const sessions = getStoredData<ExamSession[]>(STORAGE_KEYS.examSessions, []);
    const results = getStoredData<ExamResult[]>(STORAGE_KEYS.examResults, []);
    set({ config, sessions, results });
  },

  updateConfig: (newConfig) => {
    const config = { ...get().config, ...newConfig };
    set({ config });
    setStoredData(STORAGE_KEYS.examConfig, config);
  },

  startExam: (studentId, classLevel) => {
    const session: ExamSession = {
      id: generateId(),
      studentId,
      classLevel,
      startedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      answers: [],
      status: 'IN_PROGRESS',
      totalTimeSpent: 0,
    };

    const sessions = [...get().sessions, session];
    set({ sessions });
    setStoredData(STORAGE_KEYS.examSessions, sessions);
    return session;
  },

  submitAnswer: (sessionId, questionId, selectedIndex, timeTaken) => {
    const sessions = get().sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          answers: [
            ...s.answers,
            {
              questionId,
              selectedOptionIndex: selectedIndex,
              timeTaken,
              answeredAt: new Date().toISOString(),
            },
          ],
          currentQuestionIndex: s.currentQuestionIndex + 1,
          totalTimeSpent: s.totalTimeSpent + timeTaken,
        };
      }
      return s;
    });
    set({ sessions });
    setStoredData(STORAGE_KEYS.examSessions, sessions);
  },

  completeExam: (sessionId) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    const questions = mockExamQuestions.filter((q) => q.classLevel === session.classLevel);
    const questionCount = get().config.demoQuestionCount;
    const relevantQuestions = questions.slice(0, questionCount);

    let correctCount = 0;
    let wrongCount = 0;

    session.answers.forEach((answer) => {
      const question = relevantQuestions.find((q) => q.id === answer.questionId);
      if (question) {
        if (answer.selectedOptionIndex === question.correctOptionIndex) {
          correctCount++;
        } else if (answer.selectedOptionIndex !== null) {
          wrongCount++;
        }
      }
    });

    const unansweredCount = questionCount - correctCount - wrongCount;
    const totalScore = correctCount * get().config.marksPerCorrect + wrongCount * get().config.marksPerWrong;

    const result: ExamResult = {
      id: generateId(),
      studentId: session.studentId,
      class: session.classLevel,
      totalScore,
      correctCount,
      wrongCount,
      unansweredCount,
      totalTimeTaken: session.totalTimeSpent,
      resultStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Update session status
    const sessions = get().sessions.map((s) =>
      s.id === sessionId ? { ...s, status: 'COMPLETED' as const } : s
    );

    const results = [...get().results, result];
    set({ sessions, results });
    setStoredData(STORAGE_KEYS.examSessions, sessions);
    setStoredData(STORAGE_KEYS.examResults, results);

    return result;
  },

  getSessionByStudent: (studentId) => get().sessions.find((s) => s.studentId === studentId),
  getResultByStudent: (studentId) => get().results.find((r) => r.studentId === studentId),
  getQuestionsForClass: (classLevel) => mockExamQuestions.filter((q) => q.classLevel === classLevel),
  hasCompletedExam: (studentId) => get().results.some((r) => r.studentId === studentId),

  publishResults: (classLevel) => {
    // Get all results for this class and rank them
    const classResults = get().results
      .filter((r) => r.class === classLevel)
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
        return a.totalTimeTaken - b.totalTimeTaken;
      });

    const updatedResults = get().results.map((r) => {
      if (r.class === classLevel) {
        const rank = classResults.findIndex((cr) => cr.id === r.id) + 1;
        return { ...r, rank, resultStatus: 'PUBLISHED' as const };
      }
      return r;
    });

    set({ results: updatedResults });
    setStoredData(STORAGE_KEYS.examResults, updatedResults);
  },
}));

// Scholarship Store
interface ScholarshipState {
  scholarships: Scholarship[];
  loadScholarships: () => void;
  createScholarship: (studentId: string, classLevel: number, rank: number) => Scholarship;
  approveScholarship: (id: string, adminId: string, type: Scholarship['scholarshipType'], amount?: number) => void;
  rejectScholarship: (id: string, adminId: string, reason: string) => void;
  getScholarshipByStudent: (studentId: string) => Scholarship | undefined;
}

export const useScholarshipStore = create<ScholarshipState>((set, get) => ({
  scholarships: [],

  loadScholarships: () => {
    const scholarships = getStoredData<Scholarship[]>(STORAGE_KEYS.scholarships, []);
    set({ scholarships });
  },

  createScholarship: (studentId, classLevel, rank) => {
    const scholarship: Scholarship = {
      id: generateId(),
      studentId,
      class: classLevel,
      rank,
      scholarshipType: 'CERTIFICATE',
      approvalStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const scholarships = [...get().scholarships, scholarship];
    set({ scholarships });
    setStoredData(STORAGE_KEYS.scholarships, scholarships);
    return scholarship;
  },

  approveScholarship: (id, adminId, type, amount) => {
    const scholarships = get().scholarships.map((s) =>
      s.id === id
        ? {
            ...s,
            scholarshipType: type,
            amount,
            approvalStatus: 'APPROVED' as const,
            approvedBy: adminId,
            approvedAt: new Date().toISOString(),
          }
        : s
    );
    set({ scholarships });
    setStoredData(STORAGE_KEYS.scholarships, scholarships);

    // Credit wallet if amount is provided
    const scholarship = scholarships.find((s) => s.id === id);
    if (scholarship && amount) {
      useWalletStore.getState().creditWallet(
        scholarship.studentId,
        amount,
        'SCHOLARSHIP_CREDIT',
        `Scholarship award - Rank ${scholarship.rank}`,
        id
      );
    }
  },

  rejectScholarship: (id, adminId, reason) => {
    const scholarships = get().scholarships.map((s) =>
      s.id === id
        ? {
            ...s,
            approvalStatus: 'REJECTED' as const,
            approvedBy: adminId,
            approvedAt: new Date().toISOString(),
            rejectionReason: reason,
          }
        : s
    );
    set({ scholarships });
    setStoredData(STORAGE_KEYS.scholarships, scholarships);
  },

  getScholarshipByStudent: (studentId) => get().scholarships.find((s) => s.studentId === studentId),
}));

// Certificate Store
interface CertificateState {
  certificates: Certificate[];
  settings: CertificateSettings;
  loadCertificates: () => void;
  loadSettings: () => void;
  updateSettings: (settings: CertificateSettings) => void;
  updateTemplateConfig: (template: CertificateTemplate, config: Partial<CertificateTemplateConfig>) => void;
  setDefaultTemplate: (template: CertificateTemplate) => void;
  generateCertificate: (studentId: string, examResultId: string, type: Certificate['certificateType']) => Certificate;
  getCertificateByStudent: (studentId: string) => Certificate | undefined;
  getCertificateById: (certificateId: string) => Certificate | undefined;
  verifyCertificate: (certificateId: string) => { isValid: boolean; certificate?: Certificate; student?: Student };
}

export const useCertificateStore = create<CertificateState>((set, get) => ({
  certificates: [],
  settings: DEFAULT_CERTIFICATE_SETTINGS,

  loadCertificates: () => {
    const certificates = getStoredData<Certificate[]>(STORAGE_KEYS.certificates, []);
    set({ certificates });
  },

  loadSettings: () => {
    const settings = getStoredData<CertificateSettings>(STORAGE_KEYS.certificateSettings, DEFAULT_CERTIFICATE_SETTINGS);
    set({ settings });
  },

  updateSettings: (settings) => {
    set({ settings });
    setStoredData(STORAGE_KEYS.certificateSettings, settings);
  },

  updateTemplateConfig: (template, config) => {
    const currentSettings = get().settings;
    const templateKey = template.toLowerCase() as 'classic' | 'modern' | 'prestigious';
    const updatedSettings = {
      ...currentSettings,
      templates: {
        ...currentSettings.templates,
        [templateKey]: {
          ...currentSettings.templates[templateKey],
          ...config,
        },
      },
    };
    set({ settings: updatedSettings });
    setStoredData(STORAGE_KEYS.certificateSettings, updatedSettings);
  },

  setDefaultTemplate: (template) => {
    const currentSettings = get().settings;
    const updatedSettings = {
      ...currentSettings,
      defaultTemplate: template,
    };
    set({ settings: updatedSettings });
    setStoredData(STORAGE_KEYS.certificateSettings, updatedSettings);
  },

  generateCertificate: (studentId, examResultId, type) => {
    const certId = generateCertificateId();
    const certificate: Certificate = {
      id: generateId(),
      studentId,
      examResultId,
      certificateId: certId,
      certificateType: type,
      qrCode: `https://nsep.edu.in/verify/${certId}`,
      issuedAt: new Date().toISOString(),
      isValid: true,
    };

    const certificates = [...get().certificates, certificate];
    set({ certificates });
    setStoredData(STORAGE_KEYS.certificates, certificates);
    
    // Send certificate issued email
    const students = getStoredData<Student[]>(STORAGE_KEYS.students, []);
    const results = getStoredData<ExamResult[]>(STORAGE_KEYS.examResults, []);
    const student = students.find(s => s.id === studentId);
    const result = results.find(r => r.id === examResultId);
    
    if (student && result) {
      sendEmailNotification(
        'CERTIFICATE_ISSUED',
        student.email,
        {
          studentName: student.name,
          studentEmail: student.email,
          certificateId: certId,
          certificateType: type,
          class: student.class,
          rank: result.rank || 0,
          date: new Date().toISOString(),
        }
      );
    }
    
    return certificate;
  },

  getCertificateByStudent: (studentId) => get().certificates.find((c) => c.studentId === studentId),
  getCertificateById: (certificateId) => get().certificates.find((c) => c.certificateId === certificateId),

  verifyCertificate: (certificateId) => {
    const certificate = get().certificates.find((c) => c.certificateId === certificateId);
    if (!certificate || !certificate.isValid) {
      return { isValid: false };
    }

    const students = getStoredData<Student[]>(STORAGE_KEYS.students, []);
    const student = students.find((s) => s.id === certificate.studentId);

    return { isValid: true, certificate, student };
  },
}));

// Admin Log Store
interface AdminLogState {
  logs: AdminLog[];
  loadLogs: () => void;
  addLog: (adminId: string, action: string, referenceId?: string, details?: string) => void;
}

export const useAdminLogStore = create<AdminLogState>((set, get) => ({
  logs: [],

  loadLogs: () => {
    const logs = getStoredData<AdminLog[]>(STORAGE_KEYS.adminLogs, []);
    set({ logs });
  },

  addLog: (adminId, action, referenceId, details) => {
    const log: AdminLog = {
      id: generateId(),
      adminId,
      action,
      referenceId,
      details,
      createdAt: new Date().toISOString(),
    };

    const logs = [...get().logs, log];
    set({ logs });
    setStoredData(STORAGE_KEYS.adminLogs, logs);
  },
}));

// Email Store
interface EmailState {
  templates: EmailTemplate[];
  deliveries: EmailDelivery[];
  loadEmailData: () => void;
  createTemplate: (name: string, subject: string, bodyHtml: string) => EmailTemplate;
  updateTemplate: (id: string, data: Partial<EmailTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setDefaultTemplate: (id: string) => void;
  sendEmail: (studentId: string, certificateId: string, templateId: string) => EmailDelivery;
  sendBulkEmails: (studentIds: string[], templateId: string) => void;
  resendEmail: (deliveryId: string) => void;
  getDeliveriesByStudent: (studentId: string) => EmailDelivery[];
}

export const useEmailStore = create<EmailState>((set, get) => ({
  templates: [],
  deliveries: [],

  loadEmailData: () => {
    let templates = getStoredData<EmailTemplate[]>(STORAGE_KEYS.emailTemplates, []);
    
    // Create default template if none exists
    if (templates.length === 0) {
      const defaultTemplate: EmailTemplate = {
        id: generateId(),
        name: 'Default Certificate Email',
        subject: 'Congratulations! Your GPHDM Certificate - Rank {{rank}}',
        bodyHtml: `Dear {{studentName}},\n\nCongratulations on your outstanding performance in the GPHDM National Scholarship Examination!\n\nWe are delighted to inform you that you have achieved Rank {{rank}} in Class {{class}} with a score of {{score}} marks.\n\nYour certificate is attached to this email. You can also verify it online at any time using your certificate ID: {{certificateId}}\n\n{{#scholarship}}\nAdditionally, you have been awarded a scholarship of ₹{{scholarshipAmount}}. This amount will be credited to your student wallet.\n{{/scholarship}}\n\nWe commend your dedication and hard work. Keep up the excellent work!\n\nBest regards,\nGram Panchayat Help Desk Mission\nGPHDM Team`,
        variables: ['studentName', 'rank', 'class', 'score', 'certificateId', 'scholarship', 'scholarshipAmount'],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      templates = [defaultTemplate];
      setStoredData(STORAGE_KEYS.emailTemplates, templates);
    }

    const deliveries = getStoredData<EmailDelivery[]>(STORAGE_KEYS.emailDeliveries, []);
    set({ templates, deliveries });
  },

  createTemplate: (name, subject, bodyHtml) => {
    const variables = extractVariables(bodyHtml);
    const template: EmailTemplate = {
      id: generateId(),
      name,
      subject,
      bodyHtml,
      variables,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const templates = [...get().templates, template];
    set({ templates });
    setStoredData(STORAGE_KEYS.emailTemplates, templates);
    return template;
  },

  updateTemplate: (id, data) => {
    const templates = get().templates.map((t) => {
      if (t.id === id) {
        const updated = { ...t, ...data, updatedAt: new Date().toISOString() };
        if (data.bodyHtml) {
          updated.variables = extractVariables(data.bodyHtml);
        }
        return updated;
      }
      return t;
    });
    set({ templates });
    setStoredData(STORAGE_KEYS.emailTemplates, templates);
  },

  deleteTemplate: (id) => {
    const templates = get().templates.filter((t) => t.id !== id);
    set({ templates });
    setStoredData(STORAGE_KEYS.emailTemplates, templates);
  },

  setDefaultTemplate: (id) => {
    const templates = get().templates.map((t) => ({
      ...t,
      isDefault: t.id === id,
    }));
    set({ templates });
    setStoredData(STORAGE_KEYS.emailTemplates, templates);
  },

  sendEmail: (studentId, certificateId, templateId) => {
    const students = getStoredData<Student[]>(STORAGE_KEYS.students, []);
    const student = students.find((s) => s.id === studentId);
    const template = get().templates.find((t) => t.id === templateId);

    if (!student || !template) {
      throw new Error('Student or template not found');
    }

    // Simulate email sending with 90% success rate
    const success = Math.random() > 0.1;

    const delivery: EmailDelivery = {
      id: generateId(),
      studentId,
      certificateId,
      templateId,
      recipientEmail: student.email,
      subject: template.subject,
      status: success ? 'SENT' : 'FAILED',
      sentAt: success ? new Date().toISOString() : undefined,
      failedAt: !success ? new Date().toISOString() : undefined,
      errorMessage: !success ? 'Simulated delivery failure' : undefined,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    const deliveries = [...get().deliveries, delivery];
    set({ deliveries });
    setStoredData(STORAGE_KEYS.emailDeliveries, deliveries);
    return delivery;
  },

  sendBulkEmails: (studentIds, templateId) => {
    const students = getStoredData<Student[]>(STORAGE_KEYS.students, []);
    const certificates = getStoredData<Certificate[]>(STORAGE_KEYS.certificates, []);
    const template = get().templates.find((t) => t.id === templateId);

    if (!template) return;

    const newDeliveries: EmailDelivery[] = [];

    studentIds.forEach((studentId) => {
      const student = students.find((s) => s.id === studentId);
      const cert = certificates.find((c) => c.studentId === studentId);

      if (student && cert) {
        const success = Math.random() > 0.1;

        const delivery: EmailDelivery = {
          id: generateId(),
          studentId,
          certificateId: cert.certificateId,
          templateId,
          recipientEmail: student.email,
          subject: template.subject,
          status: success ? 'SENT' : 'FAILED',
          sentAt: success ? new Date().toISOString() : undefined,
          failedAt: !success ? new Date().toISOString() : undefined,
          errorMessage: !success ? 'Simulated delivery failure' : undefined,
          retryCount: 0,
          createdAt: new Date().toISOString(),
        };

        newDeliveries.push(delivery);
      }
    });

    const deliveries = [...get().deliveries, ...newDeliveries];
    set({ deliveries });
    setStoredData(STORAGE_KEYS.emailDeliveries, deliveries);
  },

  resendEmail: (deliveryId) => {
    const success = Math.random() > 0.2; // 80% success on retry

    const deliveries = get().deliveries.map((d) => {
      if (d.id === deliveryId) {
        return {
          ...d,
          status: success ? 'SENT' : 'RETRY' as const,
          sentAt: success ? new Date().toISOString() : d.sentAt,
          retryCount: d.retryCount + 1,
          lastRetryAt: new Date().toISOString(),
          errorMessage: success ? undefined : 'Retry failed',
        };
      }
      return d;
    });

    set({ deliveries });
    setStoredData(STORAGE_KEYS.emailDeliveries, deliveries);
  },

  getDeliveriesByStudent: (studentId) => get().deliveries.filter((d) => d.studentId === studentId),
}));

// Helper function to extract template variables
function extractVariables(text: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = text.matchAll(regex);
  const variables = new Set<string>();
  for (const match of matches) {
    variables.add(match[1]);
  }
  return Array.from(variables);
}
