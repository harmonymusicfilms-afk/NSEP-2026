import { v4 as uuidv4 } from 'uuid';
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
  ExamQuestion,
} from '@/types';
import { STORAGE_KEYS } from './config';

// Generate unique center code
const generateCenterCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'NSE';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate certificate ID
const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `NSEP${year}${random}`;
};

// Mock Students (20+)
export const mockStudents: Student[] = [
  {
    id: uuidv4(),
    name: 'Aarav Sharma',
    fatherName: 'Rajesh Sharma',
    class: 10,
    mobile: '9876543210',
    email: 'aarav.sharma@email.com',
    schoolName: 'Delhi Public School',
    schoolContact: '9876500001',
    addressVillage: 'Sector 15',
    addressBlock: 'Gurgaon',
    addressTahsil: 'Gurgaon',
    addressDistrict: 'Gurgaon',
    addressState: 'Haryana',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-15T10:30:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Priya Patel',
    fatherName: 'Suresh Patel',
    class: 12,
    mobile: '9876543211',
    email: 'priya.patel@email.com',
    schoolName: 'Kendriya Vidyalaya',
    schoolContact: '9876500002',
    addressVillage: 'Satellite',
    addressBlock: 'Ahmedabad West',
    addressTahsil: 'Ahmedabad',
    addressDistrict: 'Ahmedabad',
    addressState: 'Gujarat',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-14T09:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Rohan Singh',
    fatherName: 'Amarjeet Singh',
    class: 8,
    mobile: '9876543212',
    email: 'rohan.singh@email.com',
    schoolName: 'St. Marys School',
    schoolContact: '9876500003',
    addressVillage: 'Civil Lines',
    addressBlock: 'Ludhiana',
    addressTahsil: 'Ludhiana',
    addressDistrict: 'Ludhiana',
    addressState: 'Punjab',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-13T14:20:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Ananya Verma',
    fatherName: 'Vikram Verma',
    class: 6,
    mobile: '9876543213',
    email: 'ananya.verma@email.com',
    schoolName: 'Modern School',
    schoolContact: '9876500004',
    addressVillage: 'Vasant Kunj',
    addressBlock: 'South Delhi',
    addressTahsil: 'New Delhi',
    addressDistrict: 'South Delhi',
    addressState: 'Delhi',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-12T11:45:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Kabir Khan',
    fatherName: 'Imran Khan',
    class: 11,
    mobile: '9876543214',
    email: 'kabir.khan@email.com',
    schoolName: 'Army Public School',
    schoolContact: '9876500005',
    addressVillage: 'Cantonment',
    addressBlock: 'Pune',
    addressTahsil: 'Pune City',
    addressDistrict: 'Pune',
    addressState: 'Maharashtra',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-11T08:30:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Ishita Reddy',
    fatherName: 'Venkat Reddy',
    class: 9,
    mobile: '9876543215',
    email: 'ishita.reddy@email.com',
    schoolName: 'Narayana School',
    schoolContact: '9876500006',
    addressVillage: 'Banjara Hills',
    addressBlock: 'Hyderabad Central',
    addressTahsil: 'Secunderabad',
    addressDistrict: 'Hyderabad',
    addressState: 'Telangana',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-10T16:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Arjun Nair',
    fatherName: 'Krishna Nair',
    class: 7,
    mobile: '9876543216',
    email: 'arjun.nair@email.com',
    schoolName: 'Chinmaya Vidyalaya',
    schoolContact: '9876500007',
    addressVillage: 'Ernakulam',
    addressBlock: 'Kochi',
    addressTahsil: 'Kanayannur',
    addressDistrict: 'Ernakulam',
    addressState: 'Kerala',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-09T12:15:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Diya Gupta',
    fatherName: 'Anil Gupta',
    class: 5,
    mobile: '9876543217',
    email: 'diya.gupta@email.com',
    schoolName: 'La Martiniere School',
    schoolContact: '9876500008',
    addressVillage: 'Hazratganj',
    addressBlock: 'Lucknow',
    addressTahsil: 'Lucknow',
    addressDistrict: 'Lucknow',
    addressState: 'Uttar Pradesh',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-08T10:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Vihaan Das',
    fatherName: 'Subhash Das',
    class: 4,
    mobile: '9876543218',
    email: 'vihaan.das@email.com',
    schoolName: 'South Point School',
    schoolContact: '9876500009',
    addressVillage: 'Salt Lake',
    addressBlock: 'Bidhannagar',
    addressTahsil: 'Kolkata',
    addressDistrict: 'Kolkata',
    addressState: 'West Bengal',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-07T14:30:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Meera Iyer',
    fatherName: 'Ramesh Iyer',
    class: 3,
    mobile: '9876543219',
    email: 'meera.iyer@email.com',
    schoolName: 'PSBB School',
    schoolContact: '9876500010',
    addressVillage: 'T Nagar',
    addressBlock: 'Chennai Central',
    addressTahsil: 'Mambalam',
    addressDistrict: 'Chennai',
    addressState: 'Tamil Nadu',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-06T09:45:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Reyansh Joshi',
    fatherName: 'Deepak Joshi',
    class: 2,
    mobile: '9876543220',
    email: 'reyansh.joshi@email.com',
    schoolName: 'DAV Public School',
    schoolContact: '9876500011',
    addressVillage: 'Malviya Nagar',
    addressBlock: 'Jaipur',
    addressTahsil: 'Jaipur',
    addressDistrict: 'Jaipur',
    addressState: 'Rajasthan',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-05T11:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Saanvi Mishra',
    fatherName: 'Pradeep Mishra',
    class: 1,
    mobile: '9876543221',
    email: 'saanvi.mishra@email.com',
    schoolName: 'Holy Cross School',
    schoolContact: '9876500012',
    addressVillage: 'Fraser Road',
    addressBlock: 'Patna',
    addressTahsil: 'Patna City',
    addressDistrict: 'Patna',
    addressState: 'Bihar',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-04T08:30:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Aditya Rao',
    fatherName: 'Mohan Rao',
    class: 10,
    mobile: '9876543222',
    email: 'aditya.rao@email.com',
    schoolName: 'Vidya Mandir',
    schoolContact: '9876500013',
    addressVillage: 'Jayanagar',
    addressBlock: 'Bangalore South',
    addressTahsil: 'Bangalore',
    addressDistrict: 'Bangalore Urban',
    addressState: 'Karnataka',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-03T15:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Kavya Desai',
    fatherName: 'Hitesh Desai',
    class: 12,
    mobile: '9876543223',
    email: 'kavya.desai@email.com',
    schoolName: 'Bright Future School',
    schoolContact: '9876500014',
    addressVillage: 'Navrangpura',
    addressBlock: 'Ahmedabad East',
    addressTahsil: 'Ahmedabad',
    addressDistrict: 'Ahmedabad',
    addressState: 'Gujarat',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-02T10:30:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Vivaan Mehta',
    fatherName: 'Sanjay Mehta',
    class: 8,
    mobile: '9876543224',
    email: 'vivaan.mehta@email.com',
    schoolName: 'Ryan International',
    schoolContact: '9876500015',
    addressVillage: 'Andheri',
    addressBlock: 'Mumbai Suburban',
    addressTahsil: 'Mumbai',
    addressDistrict: 'Mumbai',
    addressState: 'Maharashtra',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2025-01-01T09:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Siya Choudhury',
    fatherName: 'Arun Choudhury',
    class: 6,
    mobile: '9876543225',
    email: 'siya.choudhury@email.com',
    schoolName: 'St. Xaviers',
    schoolContact: '9876500016',
    addressVillage: 'Park Street',
    addressBlock: 'Kolkata Central',
    addressTahsil: 'Kolkata',
    addressDistrict: 'Kolkata',
    addressState: 'West Bengal',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2024-12-31T14:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Arnav Pillai',
    fatherName: 'Suresh Pillai',
    class: 11,
    mobile: '9876543226',
    email: 'arnav.pillai@email.com',
    schoolName: 'Loyola School',
    schoolContact: '9876500017',
    addressVillage: 'MG Road',
    addressBlock: 'Thiruvananthapuram',
    addressTahsil: 'Thiruvananthapuram',
    addressDistrict: 'Thiruvananthapuram',
    addressState: 'Kerala',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2024-12-30T11:30:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Myra Saxena',
    fatherName: 'Rohit Saxena',
    class: 9,
    mobile: '9876543227',
    email: 'myra.saxena@email.com',
    schoolName: 'Carmel Convent',
    schoolContact: '9876500018',
    addressVillage: 'Mall Road',
    addressBlock: 'Shimla',
    addressTahsil: 'Shimla',
    addressDistrict: 'Shimla',
    addressState: 'Himachal Pradesh',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2024-12-29T10:00:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Dhruv Kapoor',
    fatherName: 'Manish Kapoor',
    class: 7,
    mobile: '9876543228',
    email: 'dhruv.kapoor@email.com',
    schoolName: 'Springdales School',
    schoolContact: '9876500019',
    addressVillage: 'Pusa Road',
    addressBlock: 'New Delhi',
    addressTahsil: 'New Delhi',
    addressDistrict: 'Central Delhi',
    addressState: 'Delhi',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2024-12-28T16:30:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Anika Sethi',
    fatherName: 'Gaurav Sethi',
    class: 5,
    mobile: '9876543229',
    email: 'anika.sethi@email.com',
    schoolName: 'Heritage School',
    schoolContact: '9876500020',
    addressVillage: 'Sector 62',
    addressBlock: 'Noida',
    addressTahsil: 'Noida',
    addressDistrict: 'Gautam Buddha Nagar',
    addressState: 'Uttar Pradesh',
    centerCode: generateCenterCode(),
    status: 'ACTIVE',
    createdAt: '2024-12-27T09:15:00Z',
    mobileVerified: true,
    emailVerified: true,
  },
  {
    id: uuidv4(),
    name: 'Yash Bhatt',
    fatherName: 'Nitin Bhatt',
    class: 10,
    mobile: '9876543230',
    email: 'yash.bhatt@email.com',
    schoolName: 'Cambridge School',
    schoolContact: '9876500021',
    addressVillage: 'CG Road',
    addressBlock: 'Ahmedabad Central',
    addressTahsil: 'Ahmedabad',
    addressDistrict: 'Ahmedabad',
    addressState: 'Gujarat',
    centerCode: generateCenterCode(),
    status: 'BLOCKED',
    createdAt: '2024-12-26T12:00:00Z',
    mobileVerified: true,
    emailVerified: false,
  },
];

// Mock Payments
export const mockPayments: Payment[] = mockStudents.slice(0, 15).map((student, index) => ({
  id: uuidv4(),
  studentId: student.id,
  razorpayOrderId: `order_${Math.random().toString(36).substring(2, 15)}`,
  razorpayPaymentId: index < 12 ? `pay_${Math.random().toString(36).substring(2, 15)}` : undefined,
  razorpaySignature: index < 12 ? `sig_${Math.random().toString(36).substring(2, 20)}` : undefined,
  amount: student.class <= 5 ? 250 : student.class <= 8 ? 300 : 350,
  status: index < 12 ? 'SUCCESS' : index < 14 ? 'PENDING' : 'FAILED',
  paidAt: index < 12 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock Wallets
export const mockWallets: Wallet[] = mockStudents.map((student) => ({
  id: uuidv4(),
  studentId: student.id,
  balance: Math.floor(Math.random() * 5) * 50,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Mock Wallet Transactions
export const mockWalletTransactions: WalletTransaction[] = [];
mockWallets.forEach((wallet) => {
  if (wallet.balance > 0) {
    const transactions = wallet.balance / 50;
    for (let i = 0; i < transactions; i++) {
      mockWalletTransactions.push({
        id: uuidv4(),
        walletId: wallet.id,
        type: 'CENTER_REWARD',
        amount: 50,
        reason: 'Center code referral reward',
        referenceId: uuidv4(),
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }
});

// Mock Exam Results
export const mockExamResults: ExamResult[] = mockStudents.slice(0, 12).map((student, index) => ({
  id: uuidv4(),
  studentId: student.id,
  class: student.class,
  totalScore: Math.floor(Math.random() * 180) + 60,
  correctCount: Math.floor(Math.random() * 45) + 15,
  wrongCount: Math.floor(Math.random() * 20),
  unansweredCount: Math.floor(Math.random() * 10),
  totalTimeTaken: Math.floor(Math.random() * 300) + 200,
  rank: index + 1,
  resultStatus: index < 10 ? 'PUBLISHED' : 'PENDING',
  createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock Center Rewards
export const mockCenterRewards: CenterReward[] = mockWalletTransactions.map((tx) => ({
  id: uuidv4(),
  centerOwnerStudentId: mockStudents[Math.floor(Math.random() * mockStudents.length)].id,
  newStudentId: mockStudents[Math.floor(Math.random() * mockStudents.length)].id,
  paymentId: mockPayments[Math.floor(Math.random() * mockPayments.length)].id,
  rewardAmount: 50,
  status: 'CREDITED',
  createdAt: tx.createdAt,
}));

// Mock Scholarships
export const mockScholarships: Scholarship[] = mockExamResults.slice(0, 8).map((result, index) => ({
  id: uuidv4(),
  studentId: result.studentId,
  class: result.class,
  rank: result.rank || index + 1,
  scholarshipType: index < 3 ? 'BOTH' : index < 6 ? 'AMOUNT' : 'CERTIFICATE',
  amount: index < 3 ? [10000, 7500, 5000][index] : index < 6 ? [3000, 2000, 1500][index - 3] : undefined,
  approvalStatus: index < 5 ? 'APPROVED' : index < 7 ? 'PENDING' : 'REJECTED',
  approvedBy: index < 5 ? 'admin-001' : undefined,
  approvedAt: index < 5 ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  rejectionReason: index === 7 ? 'Document verification failed' : undefined,
  createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock Certificates
export const mockCertificates: Certificate[] = mockScholarships
  .filter((s) => s.approvalStatus === 'APPROVED')
  .map((scholarship) => ({
    id: uuidv4(),
    studentId: scholarship.studentId,
    examResultId: mockExamResults.find((r) => r.studentId === scholarship.studentId)?.id || '',
    certificateId: generateCertificateId(),
    certificateType: scholarship.rank <= 3 ? 'SCHOLARSHIP' : 'MERIT',
    qrCode: `https://nsep.edu.in/verify/${generateCertificateId()}`,
    issuedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
    isValid: true,
  }));

// Mock Admin Users
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-001',
    name: 'Dr. Ramesh Kumar',
    email: 'admin@gphdm.edu.in',
    passwordHash: 'hashed_admin123',
    role: 'SUPER_ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'admin-002',
    name: 'Ms. Priya Sharma',
    email: 'priya@gphdm.edu.in',
    passwordHash: 'hashed_priya123',
    role: 'ADMIN',
    createdAt: '2024-06-01T00:00:00Z',
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'admin-003',
    name: 'Mr. Arun Verma',
    email: 'arun@gphdm.edu.in',
    passwordHash: 'hashed_arun123',
    role: 'MODERATOR',
    createdAt: '2024-09-01T00:00:00Z',
  },
];

// Mock Admin Logs
export const mockAdminLogs: AdminLog[] = [
  {
    id: uuidv4(),
    adminId: 'admin-001',
    action: 'SCHOLARSHIP_APPROVED',
    referenceId: mockScholarships[0]?.id,
    details: 'Approved scholarship for rank 1 student',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    adminId: 'admin-001',
    action: 'CERTIFICATE_ISSUED',
    referenceId: mockCertificates[0]?.id,
    details: 'Generated merit certificate',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    adminId: 'admin-002',
    action: 'STUDENT_BLOCKED',
    referenceId: mockStudents[20]?.id,
    details: 'Blocked student due to policy violation',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    adminId: 'admin-001',
    action: 'FEE_UPDATED',
    details: 'Updated exam donations for class 9-12',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Exam Questions (Sample for each class level)
export const mockExamQuestions: ExamQuestion[] = [];

const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'General Knowledge'];
const questionTemplates = [
  { q: 'What is the result of {a} + {b}?', type: 'math' },
  { q: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Venus', 'Jupiter'], correct: 1 },
  { q: 'What is the capital of India?', options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], correct: 2 },
  { q: 'H2O is the chemical formula for:', options: ['Salt', 'Sugar', 'Water', 'Oxygen'], correct: 2 },
  { q: 'Who wrote the Indian National Anthem?', options: ['Bankim Chandra', 'Rabindranath Tagore', 'Sarojini Naidu', 'Mahatma Gandhi'], correct: 1 },
  { q: 'Which is the largest mammal?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'], correct: 1 },
  { q: 'The process of photosynthesis occurs in:', options: ['Roots', 'Stems', 'Leaves', 'Flowers'], correct: 2 },
  { q: 'Which river is the longest in India?', options: ['Yamuna', 'Ganga', 'Brahmaputra', 'Godavari'], correct: 1 },
  { q: 'How many states are there in India?', options: ['26', '28', '29', '30'], correct: 1 },
  { q: 'Which vitamin is produced by sunlight?', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], correct: 3 },
];

// Generate 60 questions per class
for (let classLevel = 1; classLevel <= 12; classLevel++) {
  for (let i = 0; i < 60; i++) {
    const template = questionTemplates[i % questionTemplates.length];
    const subject = subjects[i % subjects.length];

    if (template.type === 'math') {
      const a = Math.floor(Math.random() * 50) + 1;
      const b = Math.floor(Math.random() * 50) + 1;
      const correctAnswer = a + b;
      const options = [
        correctAnswer.toString(),
        (correctAnswer + Math.floor(Math.random() * 10) + 1).toString(),
        (correctAnswer - Math.floor(Math.random() * 10) - 1).toString(),
        (correctAnswer + Math.floor(Math.random() * 20) + 5).toString(),
      ].sort(() => Math.random() - 0.5);

      mockExamQuestions.push({
        id: `q-${classLevel}-${i}`,
        class: classLevel,
        questionText: template.q.replace('{a}', a.toString()).replace('{b}', b.toString()),
        options,
        correctOptionIndex: options.indexOf(correctAnswer.toString()),
        subject,
      });
    } else {
      mockExamQuestions.push({
        id: `q-${classLevel}-${i}`,
        class: classLevel,
        questionText: template.q,
        options: template.options || [],
        correctOptionIndex: template.correct || 0,
        subject,
      });
    }
  }
}

// Initialize local storage with mock data
export const initializeMockData = () => {
  const keys = [
    { key: STORAGE_KEYS.students, data: mockStudents },
    { key: STORAGE_KEYS.payments, data: mockPayments },
    { key: STORAGE_KEYS.centerRewards, data: mockCenterRewards },
    { key: STORAGE_KEYS.wallets, data: mockWallets },
    { key: STORAGE_KEYS.walletTransactions, data: mockWalletTransactions },
    { key: STORAGE_KEYS.examResults, data: mockExamResults },
    { key: STORAGE_KEYS.scholarships, data: mockScholarships },
    { key: STORAGE_KEYS.certificates, data: mockCertificates },
    { key: STORAGE_KEYS.adminUsers, data: mockAdminUsers },
    { key: STORAGE_KEYS.adminLogs, data: mockAdminLogs },
  ];

  keys.forEach(({ key, data }) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  });
};
