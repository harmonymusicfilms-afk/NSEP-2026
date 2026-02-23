import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, FileText, Shield, Users, Gift, Loader2, Copy, Share2, Camera, Upload, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useStudentStore, useAuthStore, useReferralStore, usePaymentStore, useCenterRewardStore } from '@/stores';
import { CLASSES, INDIAN_STATES, getExamFee, APP_CONFIG, POLICY_CONFIG, REFERRAL_CONFIG, RAZORPAY_CONFIG } from '@/constants/config';
import { isValidEmail, isValidMobile, formatCurrency, generateId, generateCenterCode, compressImage } from '@/lib/utils';
import { STATE_DISTRICTS } from '@/constants/districts';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

// MASTER_REFERRAL_CODE moved to config.ts as APP_CONFIG.masterReferralCode

type Step = 'identity' | 'payment' | 'address' | 'consent' | 'review' | 'success';

interface FormData {
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
  referredByCenter: string;
  password?: string;
  photoUrl: string;
}

interface ConsentData {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  referralPolicyAccepted: boolean;
}

const initialFormData: FormData = {
  name: '',
  fatherName: '',
  class: 0,
  mobile: '',
  email: '',
  schoolName: '',
  schoolContact: '',
  addressVillage: '',
  addressBlock: '',
  addressTahsil: '',
  addressDistrict: '',
  addressState: '',
  referredByCenter: '',
  password: '',
  photoUrl: '',
};

// Maximum file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const initialConsentData: ConsentData = {
  termsAccepted: false,
  privacyAccepted: false,
  referralPolicyAccepted: false,
};

// Get user's IP (simulated - in real app would use backend)
const getUserIP = (): string => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

export function RegisterPage() {
  const [step, setStep] = useState<Step>('identity');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [consentData, setConsentData] = useState<ConsentData>(initialConsentData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [consentError, setConsentError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{ type: string; ownerName: string } | null>(null);
  const [referralType, setReferralType] = useState<'CENTER' | 'STUDENT' | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const [showReferralGate, setShowReferralGate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { loadStudents, addStudent, getStudentByEmail, getStudentByMobile } = useStudentStore();
  const { loginStudent, currentStudent } = useAuthStore();
  const { referralCodes, loadReferralData } = useReferralStore();
  const { createPayment, verifyPayment } = usePaymentStore();
  const { createReward } = useCenterRewardStore();

  useEffect(() => {
    loadStudents();
    loadReferralData();
  }, [loadStudents, loadReferralData]);

  // Resume Incomplete Registration
  useEffect(() => {
    if (currentStudent && currentStudent.status === 'PENDING') {
      setPendingStudentId(currentStudent.id);

      // Populate form data from existing student record
      setFormData({
        name: currentStudent.name || '',
        fatherName: currentStudent.fatherName === 'TBD' ? '' : (currentStudent.fatherName || ''),
        class: currentStudent.class || 0,
        mobile: currentStudent.mobile || '',
        email: currentStudent.email || '',
        schoolName: currentStudent.schoolName === 'TBD' ? '' : (currentStudent.schoolName || ''),
        schoolContact: currentStudent.schoolContact === 'TBD' ? '' : (currentStudent.schoolContact || ''),
        addressVillage: currentStudent.addressVillage === 'TBD' ? '' : (currentStudent.addressVillage || ''),
        addressBlock: currentStudent.addressBlock === 'TBD' ? '' : (currentStudent.addressBlock || ''),
        addressTahsil: currentStudent.addressTahsil === 'TBD' ? '' : (currentStudent.addressTahsil || ''),
        addressDistrict: currentStudent.addressDistrict === 'TBD' ? '' : (currentStudent.addressDistrict || ''),
        addressState: currentStudent.addressState || INDIAN_STATES[0],
        referredByCenter: currentStudent.referredByCenter || currentStudent.referredByStudent || '',
        password: '', // Password cannot be retrieved
        photoUrl: currentStudent.photoUrl || '',
      });

      // If already paid, move to address step
      const paid = usePaymentStore.getState().hasSuccessfulPayment(currentStudent.id);
      if (paid) {
        setPaymentVerified(true);
        setStep('address');
      } else {
        setStep('payment');
      }

      // Also validate referral code if it exists
      const refCode = currentStudent.referredByCenter || currentStudent.referredByStudent;
      if (refCode) {
        validateReferralCode(refCode);
      }
    }
  }, [currentStudent]);

  // Removed auto-trigger for payment to avoid popup blockers

  // Handle referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref');

    // If no ref code and not resuming a pending registration, show the gate
    if (!refCode && !currentStudent) {
      setShowReferralGate(true);
      return;
    }

    setShowReferralGate(false);

    if (refCode) {
      const code = refCode.toUpperCase().trim();
      updateField('referredByCenter', code);
      // Validate the referral code
      validateReferralCode(code);
    }
  }, [searchParams, currentStudent]);

  // Validate referral code
  const validateReferralCode = async (code: string) => {
    if (!code.trim()) return;

    const normalizedCode = code.trim().toUpperCase();

    // Check Master Code
    if (normalizedCode === APP_CONFIG.masterReferralCode) {
      setReferralInfo({
        type: 'Master Referral',
        ownerName: 'NSEP Organization',
      });
      setReferralType('CENTER');
      return;
    }

    // Check if it's a student referral code (STU prefix)
    if (normalizedCode.startsWith('STU') && normalizedCode.length >= 8) {
      // Due to Supabase RLS policies, unauthenticated users cannot read `students` table
      // to fetch the referrer's name. We'll accept valid-looking STU codes here.
      // The backend/payment processor will securely handle the actual reward mapping.
      setReferralInfo({
        type: 'Student Referral',
        ownerName: 'Fellow Student',
      });
      setReferralType('STUDENT');
      return;
    }

    // Check if it's an Admin Center Code (ADM prefix) or Center Code (CC prefix)
    const referralCode = referralCodes.find((r: any) => r.code === code && r.isActive);

    if (referralCode) {
      setReferralInfo({
        type: referralCode.type === 'ADMIN_CENTER' ? 'Admin Referral' : 'Center Referral',
        ownerName: referralCode.ownerName,
      });
      setReferralType('CENTER');
      return;
    }

    // Check if it's a student center code (CC prefix fallback)
    if (normalizedCode.startsWith('CC') && normalizedCode.length >= 6) {
      setReferralInfo({
        type: 'Center Code',
        ownerName: 'Authorized Center',
      });
      setReferralType('CENTER');
      return;
    }

    // Invalid code if nothing matched
    setReferralInfo(null);
    setReferralType(null);
  };

  const steps: { key: Step; label: string; description: string }[] = [
    { key: 'identity', label: 'Identity', description: 'Basic info & Referral' },
    { key: 'payment', label: 'Payment', description: 'Exam donation payment' },
    { key: 'address', label: 'Details', description: 'Address & School' },
    { key: 'consent', label: 'Consent', description: 'Legal agreements' },
    { key: 'review', label: 'Review', description: 'Final confirmation' },
    { key: 'success', label: 'Complete', description: 'Referral link' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // If state changes, reset district
      if (field === 'addressState') {
        newData.addressDistrict = '';
      }

      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateIdentityStep = async (): Promise<boolean> => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Personal checks
    if (!formData.name.trim()) newErrors.name = 'Student name is required';
    if (!formData.class) newErrors.class = 'Class is required';

    // Contact checks
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!isValidMobile(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number (10 digits required)';
    } else {
      const existing = await getStudentByMobile(formData.mobile);
      if (existing) {
        newErrors.mobile = 'Mobile number already registered';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else {
      const existing = await getStudentByEmail(formData.email);
      if (existing) {
        newErrors.email = 'Email already registered';
      }
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Referral Code check
    if (!formData.referredByCenter.trim()) {
      newErrors.referredByCenter = 'Referral code is required to register';
    } else if (!referralInfo) {
      newErrors.referredByCenter = 'Invalid or inactive referral code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const validateAddressStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.addressVillage.trim()) newErrors.addressVillage = 'Village/Locality is required';
    if (!formData.addressBlock.trim()) newErrors.addressBlock = 'Block is required';
    if (!formData.addressTahsil.trim()) newErrors.addressTahsil = 'Tahsil is required';
    if (!formData.addressDistrict.trim()) newErrors.addressDistrict = 'District is required';
    if (!formData.addressState) newErrors.addressState = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateConsentStep = (): boolean => {
    if (!consentData.termsAccepted || !consentData.privacyAccepted || !consentData.referralPolicyAccepted) {
      setConsentError('You must accept all terms and policies to proceed with registration.');
      return false;
    }
    setConsentError('');
    return true;
  };

  const handleNext = async () => {
    if (step === 'identity') {
      if (await validateIdentityStep()) {
        await processIdentityAndMoveToPayment();
      }
    } else if (step === 'payment') {
      if (paymentVerified) {
        setStep('address');
      } else {
        // [DEMO MODE] Allow bypassing if razorpay is not working
        // This is a temporary bypass as requested by the user
        setPaymentVerified(true);
        setStep('address');
        toast({
          title: 'Payment Bypassed (Demo Mode)',
          description: 'Razorpay is disabled. Proceeding to registration.',
        });
      }
    } else if (step === 'address') {
      if (validateAddressStep()) setStep('consent');
    } else if (step === 'consent') {
      if (validateConsentStep()) setStep('review');
    }
  };

  const processIdentityAndMoveToPayment = async () => {
    setIsSubmitting(true);
    try {
      // 1. SignUp with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password || 'password123',
        options: {
          data: {
            full_name: formData.name,
            phone: formData.mobile,
          },
        },
      });

      let userId = authData.user?.id;

      if (authError) {
        // If user already exists, try to sign in instead to resume
        if (authError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password || 'password123',
          });

          if (signInError) {
            // If sign in fails, it might be a wrong password or truly a different person
            throw new Error('This email is already registered. Please login with your password to continue.');
          }
          userId = signInData.user?.id;
        } else {
          throw authError;
        }
      }

      if (!userId) throw new Error('Authentication failed');

      // 2. Check if Student record already exists for this user
      let student = await useStudentStore.getState().getStudentByEmail(formData.email);

      if (!student) {
        // Create PENDING Student record if it doesn't exist
        student = await addStudent({
          name: formData.name.trim(),
          fatherName: formData.fatherName.trim() || 'TBD',
          class: formData.class,
          mobile: formData.mobile.trim(),
          email: formData.email.trim().toLowerCase(),
          schoolName: formData.schoolName.trim() || 'TBD',
          schoolContact: formData.schoolContact.trim() || 'TBD',
          addressVillage: formData.addressVillage.trim() || 'TBD',
          addressBlock: formData.addressBlock.trim() || 'TBD',
          addressTahsil: formData.addressTahsil.trim() || 'TBD',
          addressDistrict: formData.addressDistrict.trim() || 'TBD',
          addressState: formData.addressState || INDIAN_STATES[0],
          referredByCenter: referralType === 'CENTER' ? formData.referredByCenter.trim().toUpperCase() : undefined,
          referredByStudent: referralType === 'STUDENT' ? formData.referredByCenter.trim().toUpperCase() : undefined,
        }, userId);
      }

      if (!student) throw new Error('Student profile creation failed');

      setPendingStudentId(student.id);

      // Check if already paid
      const hasPaid = usePaymentStore.getState().hasSuccessfulPayment(student.id);
      if (hasPaid) {
        setPaymentVerified(true);
        setStep('address');
        toast({ title: 'Welcome back!', description: 'Resuming your registration.' });
      } else {
        setStep('payment');
        toast({ title: 'Account Verified', description: 'Proceed with exam donation payment.' });
      }

    } catch (error: any) {
      console.error('Identity Process Error:', error);
      toast({
        title: 'Registration Status',
        description: error.message || 'Identity verification failed.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!pendingStudentId || isProcessingPayment) return;

    setIsProcessingPayment(true);
    try {
      const amount = getExamFee(formData.class);
      const payment = await createPayment(pendingStudentId, amount);

      if (!payment) throw new Error('Payment initiation failed.');

      const options = {
        key: RAZORPAY_CONFIG.key_id,
        amount: amount * 100,
        currency: 'INR',
        name: APP_CONFIG.name,
        description: `Exam Donation for Class ${formData.class}`,
        order_id: payment.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verified = await verifyPayment(
              payment.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verified) {
              setPaymentVerified(true);
              // Apply reward if center referral
              if (formData.referredByCenter && referralType === 'CENTER') {
                const { getStudentByCenterCode } = useStudentStore.getState();
                const referrer = await getStudentByCenterCode(formData.referredByCenter);
                if (referrer) {
                  await createReward(referrer.id, pendingStudentId, payment.id);
                }
              }
              toast({ title: 'Payment Verified! ✅', description: 'Proceed with finishing your profile.' });
              setStep('address');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast({ variant: 'destructive', title: 'Payment Verification Failed' });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile,
        },
        theme: { color: '#0F172A' },
        modal: {
          ondismiss: function () { setIsProcessingPayment(false); }
        }
      };

      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection or disable ad-blockers.');
      }

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed event:', response.error);
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: response.error.description || 'Payment was unsuccessful.',
        });
        setIsProcessingPayment(false);
      });

      rzp.open();

    } catch (error: any) {
      console.error('Detailed Payment Error:', error);

      let errorMsg = error.message || 'Payment initiation failed.';
      if (errorMsg.includes('Razorpay')) {
        errorMsg = 'Razorpay script failed to load. Please disable ad-blockers and check your internet connection.';
      } else if (errorMsg.includes('initiation')) {
        errorMsg = 'Could not create payment order. This might be a server issue. Please try again in a moment.';
      }

      toast({
        variant: 'destructive',
        title: 'Payment System Error',
        description: errorMsg,
      });
      setIsProcessingPayment(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingStudentId) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: "Invalid File", description: "Only JPG, PNG and WebP are allowed.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File Too Large", description: "Image size must be less than 2MB.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file, 800);
      const fileExt = file.name.split('.').pop();
      const fileName = `${pendingStudentId}_${Date.now()}.${fileExt}`;
      const filePath = `student-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      updateField('photoUrl', publicUrl);

      // Save it immediately so they don't lose it if they refresh
      await useStudentStore.getState().updateStudent(pendingStudentId, { photoUrl: publicUrl });
      toast({ title: "Success", description: "Profile photo uploaded successfully." });
    } catch (error) {
      console.error("Upload error", error);
      toast({ title: "Upload Failed", description: "Could not upload photo.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!formData.photoUrl || !pendingStudentId) return;

    setIsUploading(true);
    try {
      const urlMatches = formData.photoUrl.match(/documents\/(.+)$/);
      if (urlMatches && urlMatches[1]) {
        await supabase.storage.from('documents').remove([urlMatches[1]]);
      }

      updateField('photoUrl', '');
      await useStudentStore.getState().updateStudent(pendingStudentId, { photoUrl: null });
      toast({ title: "Success", description: "Photo removed successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove photo.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('identity');
    else if (step === 'address') setStep('payment');
    else if (step === 'consent') setStep('address');
    else if (step === 'review') setStep('consent');
  };

  const handleSubmit = async () => {
    if (!paymentVerified) {
      toast({ title: 'Payment Required', description: 'You must pay the exam donation to complete registration.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!pendingStudentId) throw new Error('Student profile context lost. Please refresh.');

      // Final update of student record with all form data
      const student = await useStudentStore.getState().updateStudent(pendingStudentId, {
        fatherName: formData.fatherName.trim(),
        schoolName: formData.schoolName.trim(),
        schoolContact: formData.schoolContact.trim(),
        addressVillage: formData.addressVillage.trim(),
        addressBlock: formData.addressBlock.trim(),
        addressTahsil: formData.addressTahsil.trim(),
        addressDistrict: formData.addressDistrict.trim(),
        addressState: formData.addressState,
        status: 'ACTIVE'
      });

      if (!student) throw new Error('Failed to finalize student profile.');

      setRegisteredStudent(student);
      setStep('success');
      toast({ title: 'Registration Finalized! 🎉', description: 'Welcome to NSEP 2026.' });

    } catch (error: any) {
      console.error('Final Submission Error:', error);
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const examFee = formData.class ? getExamFee(formData.class) : 0;

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary mb-4">
            <GraduationCap className="size-8" />
            <span className="font-serif text-xl font-bold">{APP_CONFIG.shortName}</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Student Registration
          </h1>
          <p className="text-muted-foreground mt-1">
            Create your account to access the scholarship examination
          </p>
        </div>

        {/* Progress */}
        {showReferralGate ? (
          <Card className="text-center py-12 px-6 border-2 border-primary/20 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Gift className="size-32" />
            </div>
            <CardHeader className="relative z-10">
              <div className="mx-auto size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Users className="size-10 text-primary" />
              </div>
              <CardTitle className="font-serif text-3xl mb-2">Registration by Referral Only</CardTitle>
              <CardDescription className="text-lg leading-relaxed max-w-md mx-auto">
                To maintain the integrity of our scholarship mission, registration is currently restricted to referrals from authorized centers or fellow students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 relative z-10">
              <div className="p-4 bg-muted rounded-xl space-y-2">
                <p className="text-sm font-semibold text-foreground">How to register?</p>
                <p className="text-sm text-muted-foreground">
                  Ask your teacher, center head, or a friend who is already registered to share their unique registration link with you.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-sm font-medium">Already have a referral code?</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                  <Input
                    placeholder="Enter 12-digit code"
                    id="manual-ref"
                    className="uppercase text-center text-lg font-mono tracking-widest h-12"
                    maxLength={16}
                  />
                  <Button
                    variant="default"
                    className="h-12 px-8 institutional-gradient"
                    onClick={() => {
                      const code = (document.getElementById('manual-ref') as HTMLInputElement).value;
                      if (code) {
                        navigate(`/register?ref=${code.trim().toUpperCase()}`);
                      }
                    }}
                  >
                    Proceed
                  </Button>
                </div>
              </div>

              <div className="pt-8 flex flex-col items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link to="/" className="text-muted-foreground">
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Homepage
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.key} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index < currentStepIndex
                          ? 'bg-accent text-white'
                          : index === currentStepIndex
                            ? 'bg-primary text-white'
                            : 'bg-muted-foreground/20 text-muted-foreground'
                          }`}
                      >
                        {index < currentStepIndex ? <CheckCircle className="size-5" /> : index + 1}
                      </div>
                      <div className="mt-2 text-center hidden sm:block">
                        <div className={`text-xs font-medium ${index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                          {s.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 w-full mx-2 ${index < currentStepIndex ? 'bg-accent' : 'bg-border'
                        }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStepIndex].label} Details</CardTitle>
                <CardDescription>{steps[currentStepIndex].description}</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[70vh] sm:max-h-none overflow-y-auto custom-scrollbar pr-2">
                {/* Identity Step */}
                {step === 'identity' && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Student Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Enter full name"
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number *</Label>
                        <Input
                          id="mobile"
                          value={formData.mobile}
                          onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className={errors.mobile ? 'border-destructive' : ''}
                        />
                        {errors.mobile && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.mobile}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="your.email@example.com"
                          autoComplete="off"
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => updateField('password', e.target.value)}
                          placeholder="Min 6 characters"
                          autoComplete="new-password"
                          className={errors.password ? 'border-destructive' : ''}
                        />
                        {errors.password && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.password}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name / Guardian *</Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={(e) => updateField('fatherName', e.target.value)}
                        placeholder="Enter father's name"
                        className={errors.fatherName ? 'border-destructive' : ''}
                      />
                      {errors.fatherName && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="size-3" /> {errors.fatherName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select
                        value={formData.class ? formData.class.toString() : ''}
                        onValueChange={(value) => updateField('class', parseInt(value))}
                      >
                        <SelectTrigger className={errors.class ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASSES.map((cls) => (
                            <SelectItem key={cls} value={cls.toString()}>
                              Class {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.class && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="size-3" /> {errors.class}
                        </p>
                      )}
                      {formData.class > 0 && (
                        <div className="mt-4">
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="w-full py-8 border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all flex justify-between items-center px-6 group"
                          >
                            <div className="text-left">
                              <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-1">
                                Examination Fee
                              </p>
                              <p className="text-2xl font-black text-green-600">
                                {formatCurrency(getExamFee(formData.class))}
                              </p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 group-hover:bg-green-700">
                                Pay Now & Continue <ArrowRight className="size-3" />
                              </div>
                              <div className="flex items-center gap-1 opacity-60">
                                <Shield className="size-3 text-green-700" />
                                <span className="text-[10px] text-green-800 font-medium">Securely via Razorpay</span>
                              </div>
                            </div>
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">School Name *</Label>
                        <Input
                          id="schoolName"
                          value={formData.schoolName}
                          onChange={(e) => updateField('schoolName', e.target.value)}
                          placeholder="Enter school name"
                          className={errors.schoolName ? 'border-destructive' : ''}
                        />
                        {errors.schoolName && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.schoolName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolContact">School Contact *</Label>
                        <Input
                          id="schoolContact"
                          value={formData.schoolContact}
                          onChange={(e) => updateField('schoolContact', e.target.value)}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className={errors.schoolContact ? 'border-destructive' : ''}
                        />
                        {errors.schoolContact && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.schoolContact}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                      <Label htmlFor="centerCode" className="text-sm font-semibold mb-2 block italic text-primary">
                        Referral Code (Mandatory) *
                      </Label>
                      <Input
                        id="centerCode"
                        value={formData.referredByCenter}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          updateField('referredByCenter', val);
                          validateReferralCode(val);
                        }}
                        placeholder="e.g., CC-XXXX or NSEP2026"
                        className={errors.referredByCenter ? 'border-destructive' : 'bg-white'}
                      />
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-[10px] text-blue-600 underline"
                        onClick={() => {
                          updateField('referredByCenter', APP_CONFIG.masterReferralCode);
                          validateReferralCode(APP_CONFIG.masterReferralCode);
                        }}
                      >
                        Don't have a code? Use Master Code: {APP_CONFIG.masterReferralCode}
                      </Button>
                      {errors.referredByCenter && (
                        <p className="text-xs text-destructive mt-1 font-semibold">{errors.referredByCenter}</p>
                      )}
                      {referralInfo && (
                        <div className="mt-2 text-[10px] text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle className="size-3" /> {referralInfo.type}: {referralInfo.ownerName}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Step */}
                {step === 'payment' && (
                  <div className="space-y-6 text-center py-4">
                    <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Shield className="size-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Exam Fee Payment</h3>
                      <p className="text-sm text-muted-foreground">To register for {APP_CONFIG.shortName}, you must pay the exam fee.</p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg inline-block">
                      <p className="text-sm text-muted-foreground">Total Payable Amount</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(getExamFee(formData.class))}</p>
                    </div>

                    {paymentVerified ? (
                      <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2">
                        <CheckCircle className="size-5" />
                        <p className="font-semibold">Payment Successful!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Button
                            className="w-full h-12 text-lg institutional-gradient"
                            onClick={handlePayment}
                            disabled={isProcessingPayment}
                          >
                            {isProcessingPayment ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Pay with Razorpay'
                            )}
                          </Button>

                          {isProcessingPayment && (
                            <p className="text-[10px] text-muted-foreground animate-pulse">
                              If the payment window doesn't open within 5 seconds, please click "Retry Payment" below or refresh the page.
                            </p>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                          onClick={async () => {
                            if (!pendingStudentId) return;
                            setIsProcessingPayment(true);
                            try {
                              setPaymentVerified(true);
                              toast({ title: 'Confirmation Success! ✅', description: 'Proceeding to registration.' });
                              setStep('address');
                            } finally {
                              setIsProcessingPayment(false);
                            }
                          }}
                        >
                          Confirm Offline/Direct Payment
                        </Button>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Your registration status is currently PENDING until payment is confirmed.
                    </p>
                  </div>
                )}

                {/* Address Step */}
                {step === 'address' && (
                  <div className="space-y-4">
                    {/* Photo Upload Section */}
                    <div className="border-b pb-6 mb-4">
                      <Label className="text-base font-semibold mb-3 block">Profile Photo (Optional)</Label>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group shrink-0">
                          <div className="size-24 rounded-full border-4 border-muted overflow-hidden bg-muted flex items-center justify-center relative shadow-sm">
                            {formData.photoUrl ? (
                              <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="size-10 text-muted-foreground" />
                            )}
                            {isUploading && (
                              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                <Loader2 className="size-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                          {formData.photoUrl && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 size-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={handleRemovePhoto}
                              disabled={isUploading}
                            >
                              <X className="size-3" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3 flex-1 text-center sm:text-left">
                          <p className="text-sm text-muted-foreground">
                            Upload a recent passport-size photograph. This will be used for your admit card and certificate.
                          </p>
                          <div className="flex justify-center sm:justify-start">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handlePhotoUpload}
                              disabled={isUploading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="gap-2"
                            >
                              <Camera className="size-4" />
                              {formData.photoUrl ? 'Change Photo' : 'Upload Photo'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Primary Location Selection First */}
                    <div className="grid sm:grid-cols-2 gap-4 border-b pb-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Select
                          value={formData.addressState}
                          onValueChange={(value) => updateField('addressState', value)}
                        >
                          <SelectTrigger id="state" className={errors.addressState ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.addressState && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.addressState}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">District *</Label>
                        {formData.addressState && STATE_DISTRICTS[formData.addressState] ? (
                          <Select
                            value={formData.addressDistrict}
                            onValueChange={(value) => updateField('addressDistrict', value)}
                          >
                            <SelectTrigger id="district" className={errors.addressDistrict ? 'border-destructive' : ''}>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATE_DISTRICTS[formData.addressState].map((dist) => (
                                <SelectItem key={dist} value={dist}>
                                  {dist}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="district"
                            value={formData.addressDistrict}
                            onChange={(e) => updateField('addressDistrict', e.target.value)}
                            placeholder={formData.addressState ? "Enter district" : "Select state first"}
                            disabled={!formData.addressState}
                            className={errors.addressDistrict ? 'border-destructive' : ''}
                          />
                        )}
                        {errors.addressDistrict && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.addressDistrict}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="village">Village / Locality *</Label>
                        <Input
                          id="village"
                          value={formData.addressVillage}
                          onChange={(e) => updateField('addressVillage', e.target.value)}
                          placeholder="Enter village or locality"
                          className={errors.addressVillage ? 'border-destructive' : ''}
                        />
                        {errors.addressVillage && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.addressVillage}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="block">Block *</Label>
                        <Input
                          id="block"
                          value={formData.addressBlock}
                          onChange={(e) => updateField('addressBlock', e.target.value)}
                          placeholder="Enter block"
                          className={errors.addressBlock ? 'border-destructive' : ''}
                        />
                        {errors.addressBlock && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.addressBlock}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tahsil">Tahsil *</Label>
                        <Input
                          id="tahsil"
                          value={formData.addressTahsil}
                          onChange={(e) => updateField('addressTahsil', e.target.value)}
                          placeholder="Enter tahsil"
                          className={errors.addressTahsil ? 'border-destructive' : ''}
                        />
                        {errors.addressTahsil && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3" /> {errors.addressTahsil}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Consent Step */}
                {step === 'consent' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Legal Consent Required</h3>
                      <p className="text-sm text-blue-700">
                        Please read and accept all terms and policies to proceed with registration.
                        Your consent will be logged as per Indian IT regulations.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Terms of Service */}
                      <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="terms"
                          checked={consentData.termsAccepted}
                          onCheckedChange={(checked) => {
                            setConsentData(prev => ({ ...prev, termsAccepted: !!checked }));
                            setConsentError('');
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor="terms" className="flex items-center gap-2 cursor-pointer">
                            <FileText className="size-4 text-blue-600" />
                            <span className="font-medium">Terms of Service</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            I have read and agree to the{' '}
                            <Link to="/terms" target="_blank" className="text-primary hover:underline">
                              Terms of Service
                            </Link>
                            , including examination rules, refund policy, and code of conduct.
                          </p>
                        </div>
                      </div>

                      {/* Privacy Policy */}
                      <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="privacy"
                          checked={consentData.privacyAccepted}
                          onCheckedChange={(checked) => {
                            setConsentData(prev => ({ ...prev, privacyAccepted: !!checked }));
                            setConsentError('');
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor="privacy" className="flex items-center gap-2 cursor-pointer">
                            <Shield className="size-4 text-green-600" />
                            <span className="font-medium">Privacy Policy</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            I have read and agree to the{' '}
                            <Link to="/privacy" target="_blank" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                            , including data collection, storage, and processing practices.
                          </p>
                        </div>
                      </div>

                      {/* Referral Policy */}
                      <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="referral"
                          checked={consentData.referralPolicyAccepted}
                          onCheckedChange={(checked) => {
                            setConsentData(prev => ({ ...prev, referralPolicyAccepted: !!checked }));
                            setConsentError('');
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor="referral" className="flex items-center gap-2 cursor-pointer">
                            <Users className="size-4 text-orange-600" />
                            <span className="font-medium">Referral Policy</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            I understand and agree to the CenterCode referral program terms, including that
                            self-referrals are prohibited and may result in account suspension.
                          </p>
                        </div>
                      </div>
                    </div>

                    {consentError && (
                      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        <AlertCircle className="size-4" />
                        {consentError}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                      <p>
                        <strong>Note:</strong> By accepting these terms, you consent to the collection and processing
                        of your data as described in our policies. Your consent details (IP address, timestamp,
                        policy version) will be logged for compliance purposes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Success Step */}
                {step === 'success' && registeredStudent && (
                  <div className="space-y-8 py-4 text-center">
                    <div className="relative mx-auto size-24">
                      <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                      <div className="relative size-24 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="size-12 text-green-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-3xl font-serif font-bold text-foreground">Registration Successful!</h2>
                      <p className="text-muted-foreground">Welcome to the NSEP 2026 community.</p>
                    </div>

                    <Card className="border-2 border-primary/20 bg-primary/5 shadow-inner">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-center gap-2">
                          <Gift className="size-5 text-primary" />
                          Your Referral Reward Program
                        </CardTitle>
                        <CardDescription>
                          Share your code with friends and earn rewards for every successful registration!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Your Referral Link</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              readOnly
                              value={`${window.location.origin}/register?ref=${registeredStudent.referralCode}`}
                              className="font-mono text-center bg-white border-2 select-all"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/register?ref=${registeredStudent.referralCode}`);
                                toast({ title: 'Copied!', description: 'Referral link copied to clipboard.' });
                              }}
                            >
                              <Copy className="size-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            className="bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center gap-2"
                            onClick={() => {
                              const text = `Hi! I just registered for the NSEP 2026 Scholarship Exam. Use my referral link to register and get started: ${window.location.origin}/register?ref=${registeredStudent.referralCode}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                          >
                            <Share2 className="size-4" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="default"
                            className="institutional-gradient"
                            onClick={async () => {
                              await loginStudent(registeredStudent.email, registeredStudent.mobile);
                              navigate('/dashboard');
                            }}
                          >
                            Go to Dashboard
                            <ArrowRight className="size-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <p className="text-sm text-muted-foreground italic">
                      TIP: You can find your referral link and reward status anytime in your student dashboard.
                    </p>
                  </div>
                )}
                {step === 'review' && (
                  <div className="space-y-6">
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold">Personal Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{formData.name}</span>
                        <span className="text-muted-foreground">Father's Name / Guardian:</span>
                        <span>{formData.fatherName}</span>
                        <span className="text-muted-foreground">Class:</span>
                        <span>Class {formData.class}</span>
                        <span className="text-muted-foreground">School:</span>
                        <span>{formData.schoolName}</span>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold">Contact Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-muted-foreground">Mobile:</span>
                        <span>{formData.mobile}</span>
                        <span className="text-muted-foreground">Email:</span>
                        <span>{formData.email}</span>
                        {formData.referredByCenter && (
                          <>
                            <span className="text-muted-foreground">Referral Code:</span>
                            <span>{formData.referredByCenter}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold">Address</h3>
                      <p className="text-sm">
                        {formData.addressVillage}, {formData.addressBlock}, {formData.addressTahsil},{' '}
                        {formData.addressDistrict}, {formData.addressState}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-green-800">Legal Consent</h3>
                      <div className="text-sm text-green-700 space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="size-4" />
                          <span>Terms of Service accepted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="size-4" />
                          <span>Privacy Policy accepted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="size-4" />
                          <span>Referral Policy accepted</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Examination Fee</p>
                          <p className="text-sm text-muted-foreground">Class {formData.class} Category</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(examFee)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-6 border-t">
                  {step !== 'identity' ? (
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="size-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step !== 'review' && step !== 'success' ? (
                    <Button
                      onClick={handleNext}
                      disabled={isSubmitting || (step === 'identity' && isProcessingPayment)}
                    >
                      {step === 'identity' && formData.class > 0
                        ? `Pay ${formatCurrency(examFee)} & Continue`
                        : step === 'payment' ? 'Confirm Payment & Next' : 'Next'}
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  ) : step === 'review' ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="institutional-gradient"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finalizing...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <CheckCircle className="size-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
