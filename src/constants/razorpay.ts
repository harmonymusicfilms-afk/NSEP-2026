// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_RwZZrz8X7LH619',
  keySecret: '', // Never expose in frontend
  currency: 'INR',
  name: 'National Scholarship Examination Portal',
  description: 'Examination Fee Payment',
  logo: '/logo.png',
  theme: {
    color: '#1e3a5f',
  },
  prefill: {
    method: 'upi',
  },
  config: {
    display: {
      blocks: {
        banks: {
          name: 'All payment methods',
          instruments: [
            {
              method: 'upi',
            },
            {
              method: 'card',
            },
            {
              method: 'netbanking',
            },
            {
              method: 'wallet',
            },
          ],
        },
      },
      sequence: ['block.banks'],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
};

// Mock signature verification (In production, this MUST be done on server)
export function generateMockSignature(orderId: string, paymentId: string): string {
  // This is a MOCK implementation for demo purposes only
  // Real implementation requires HMAC SHA256 with key_secret on server
  return `mock_signature_${orderId}_${paymentId}`;
}

// Razorpay script loader
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
