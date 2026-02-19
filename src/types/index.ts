// Type Definitions for Scholarship Examination System

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  class: number;
  mobile: string;
  email: string;
  schoolName: string;
  schoolContact: string;
  addressVillage: string;
  addressBlock: string;
  addressTahsil: string;
  addressDistrict: string;
  addressState: string;
  photoUrl?: string;
  centerCode: string;
  referralCode?: string; // Personal referral code for student-to-student referrals
  referredByCenter?: string;
  referredByStudent?: string; // If referred by another student
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  createdAt: string;
  mobileVerified: boolean;
  emailVerified: boolean;
}

export interface Payment {
  id: string;
  studentId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paidAt?: string;
  createdAt: string;
}

export interface CenterReward {
  id: string;
  centerOwnerStudentId: string;
  newStudentId: string;
  paymentId: string;
  rewardAmount: number;
  status: 'PENDING' | 'CREDITED' | 'FAILED';
  createdAt: string;
}

export interface Wallet {
  id: string;
  studentId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'CENTER_REWARD' | 'SCHOLARSHIP_CREDIT' | 'ADMIN_ADJUSTMENT' | 'WITHDRAWAL';
  amount: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  class: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  subject?: string;
  questionFileUrl?: string; // Support for PDF/Image attachments
}

export interface ExamSession {
  id: string;
  studentId: string;
  class: number;
  startedAt: string;
  currentQuestionIndex: number;
  answers: ExamAnswer[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  totalTimeSpent: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionIndex: number | null;
  timeTaken: number;
  answeredAt: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  class: number;
  totalScore: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalTimeTaken: number;
  rank?: number;
  resultStatus: 'PENDING' | 'PUBLISHED';
  createdAt: string;
}

export interface Scholarship {
  id: string;
  studentId: string;
  class: number;
  rank: number;
  scholarshipType: 'AMOUNT' | 'CERTIFICATE' | 'BOTH';
  amount?: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  examResultId: string;
  certificateId: string;
  certificateType: 'PARTICIPATION' | 'MERIT' | 'SCHOLARSHIP';
  pdfUrl?: string;
  qrCode: string;
  issuedAt: string;
  isValid: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  createdAt: string;
  lastLogin?: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  referenceId?: string;
  details?: string;
  createdAt: string;
}

export interface ExamConfigSettings {
  timePerQuestion: 5 | 7;
  demoQuestionCount: number;
  gapBetweenQuestions: number;
  fees: Record<string, number>;
  marksPerCorrect: number;
  marksPerWrong: number;
}

// Form Types
export interface RegistrationFormData {
  name: string;
  fatherName: string;
  class: number;
  mobile: string;
  email: string;
  schoolName: string;
  schoolContact: string;
  addressVillage: string;
  addressBlock: string;
  addressTahsil: string;
  addressDistrict: string;
  addressState: string;
  photoUrl?: string;
  referredByCenter?: string;
}

// Stats Types
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalPayments: number;
  successfulPayments: number;
  totalRevenue: number;
  examsCompleted: number;
  certificatesIssued: number;
  pendingScholarships: number;
  totalCenterRewards: number;
}

export interface ClassWiseStats {
  class: number;
  studentCount: number;
  examsTaken: number;
  avgScore: number;
  topScore: number;
}

// Certificate Template Types
export type CertificateTemplate = 'CLASSIC' | 'MODERN' | 'PRESTIGIOUS' | 'GPHDM';

export interface CertificateTemplateConfig {
  template: CertificateTemplate;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  sealUrl?: string;
  signatureUrl?: string;
  sealText: string;
  institutionName: string;
  tagline: string;
}

export interface CertificateSettings {
  defaultTemplate: CertificateTemplate;
  templates: {
    classic: CertificateTemplateConfig;
    modern: CertificateTemplateConfig;
    prestigious: CertificateTemplateConfig;
    gphdm: CertificateTemplateConfig;
  };
}

// Email System Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  variables: string[]; // e.g., ['studentName', 'rank', 'class', 'score']
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDelivery {
  id: string;
  studentId: string;
  certificateId: string;
  templateId: string;
  recipientEmail: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRY';
  sentAt?: string;
  failedAt?: string;
  errorMessage?: string;
  retryCount: number;
  lastRetryAt?: string;
  createdAt: string;
}

export interface BatchEmailJob {
  id: string;
  name: string;
  templateId: string;
  studentIds: string[];
  totalCount: number;
  sentCount: number;
  failedCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// Referral System Types
export type ReferralCodeType = 'ADMIN_CENTER' | 'CENTER_CODE';

export interface ReferralCode {
  id: string;
  code: string;
  type: ReferralCodeType;
  ownerId: string; // Admin ID or Center ID
  ownerName: string;
  rewardAmount: number; // ₹25 for Admin, ₹50 for Center
  isActive: boolean;
  totalReferrals: number;
  totalEarnings: number;
  createdAt: string;
  createdBy?: string; // Admin who created (for ADMIN_CENTER type)
}

export interface ReferralLog {
  id: string;
  referralCodeId: string;
  referralCode: string;
  referrerId: string;
  referrerRole: 'ADMIN' | 'CENTER';
  newUserId: string;
  newUserName: string;
  amount: number;
  status: 'PENDING' | 'CREDITED' | 'BLOCKED';
  ipAddress?: string;
  createdAt: string;
}



// Center (Approved Centers that can have referral codes)
export interface Center {
  id: string;
  name: string;
  centerType: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAadhaar: string;
  address: string;
  village: string;
  block: string;
  state: string;
  district: string;
  pincode: string;
  centerCode: string; // Unique center referral code
  status: 'PENDING' | 'APPROVED' | 'BLOCKED';
  idProofUrl?: string;
  addressProofUrl?: string;
  centerPhotoUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  totalStudents: number;
  totalEarnings: number;
  createdAt: string;
}

export interface CenterMember {
  id: string;
  centerId: string;
  name: string;
  role: 'OWNER' | 'STAFF' | 'COORDINATOR' | 'VOLUNTEER';
  phone?: string;
  email?: string;
  aadhaarNumber?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// Registration Consent Log
export interface ConsentLog {
  id: string;
  userId: string;
  userType: 'STUDENT' | 'CENTER';
  ipAddress: string;
  consentedAt: string;
  policyVersion: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  referralPolicyAccepted: boolean;
}

// Contact Form Submission
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
}

// Photo Gallery
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: 'CEREMONY' | 'TOPPERS' | 'EVENTS' | 'OTHER';
  year?: number;
  featured: boolean;
  isPublished: boolean;
  createdAt: string;
}
