import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in INR
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to readable string
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

// Format date with time
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

// Format time in mm:ss
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Generate center code
export function generateCenterCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'NSE';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate student referral code based on user ID
export function generateStudentReferralCode(userId: string): string {
  // Use first 8 characters of user ID (or generate random if needed)
  const shortId = userId.substring(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `STU${shortId}${suffix}`;
}

// Generate certificate ID
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `NSEP${year}${random}`;
}

// Generate Razorpay order ID (mock)
export function generateOrderId(): string {
  return `order_${Math.random().toString(36).substring(2, 15)}`;
}

// Generate Razorpay payment ID (mock)
export function generatePaymentId(): string {
  return `pay_${Math.random().toString(36).substring(2, 15)}`;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate mobile (Indian)
export function isValidMobile(mobile: string): boolean {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Get class range label
export function getClassRangeLabel(classNumber: number): string {
  if (classNumber >= 1 && classNumber <= 5) return 'Primary (1-5)';
  if (classNumber >= 6 && classNumber <= 8) return 'Middle (6-8)';
  if (classNumber >= 9 && classNumber <= 12) return 'Senior (9-12)';
  return 'Unknown';
}

// Get ordinal suffix (1st, 2nd, 3rd, etc.)
export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Get Division based on percentage
export function getDivision(percentage: number): string {
  if (percentage >= 75) return 'Distinction';
  if (percentage >= 60) return 'I Division';
  if (percentage >= 45) return 'II Division';
  if (percentage >= 33) return 'III Division';
  return 'Passed';
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Get status color class
export function getStatusColorClass(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: 'status-active',
    BLOCKED: 'status-blocked',
    SUCCESS: 'status-active',
    PENDING: 'status-pending',
    FAILED: 'status-blocked',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
    CREDITED: 'status-active',
    PUBLISHED: 'status-active',
  };
  return statusMap[status] || 'status-pending';
}

// Get rank badge class
export function getRankBadgeClass(rank: number): string {
  if (rank === 1) return 'gold-gradient';
  if (rank === 2) return 'silver-gradient';
  if (rank === 3) return 'bronze-gradient';
  return 'bg-muted';
}

// Compress image to under specified size (default 2MB)
export async function compressImage(file: File | string, maxSizeMB: number = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Max dimensions to speed up
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      let quality = 0.9;
      let base64 = canvas.toDataURL('image/jpeg', quality);

      // Simple loop to get under size
      // base64 length is approx 1.33 times the actual byte size
      while (base64.length > maxSizeMB * 1024 * 1024 * 1.33 && quality > 0.1) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(base64);
    };
    img.onerror = (err) => {
      console.error('Image load error:', err);
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof file === 'string') {
      img.src = file;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
}
