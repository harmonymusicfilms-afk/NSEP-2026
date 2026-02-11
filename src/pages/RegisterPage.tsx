import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, FileText, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useStudentStore, useAuthStore } from '@/stores';
import { CLASSES, INDIAN_STATES, getExamFee, APP_CONFIG, POLICY_CONFIG, REFERRAL_CONFIG } from '@/constants/config';
import { isValidEmail, isValidMobile, formatCurrency, generateId } from '@/lib/utils';

type Step = 'personal' | 'contact' | 'address' | 'consent' | 'review';

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
  referredByCenterCode: string;
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
  referredByCenterCode: '',
};

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
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [consentData, setConsentData] = useState<ConsentData>(initialConsentData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [consentError, setConsentError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralInfo, setReferralInfo] = useState<{ type: string; ownerName: string } | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadStudents, addStudent, getStudentByEmail, getStudentByMobile, getStudentByCenterCode } = useStudentStore();
  const { loginStudent } = useAuthStore();

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const steps: { key: Step; label: string; description: string }[] = [
    { key: 'personal', label: 'Personal', description: 'Student & school details' },
    { key: 'contact', label: 'Contact', description: 'Mobile & email' },
    { key: 'address', label: 'Address', description: 'Location details' },
    { key: 'consent', label: 'Consent', description: 'Legal agreements' },
    { key: 'review', label: 'Review', description: 'Confirm & submit' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePersonalStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Student name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name / Guardian is required";
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
    if (!formData.schoolContact.trim()) {
      newErrors.schoolContact = 'School contact is required';
    } else if (!isValidMobile(formData.schoolContact)) {
      newErrors.schoolContact = 'Invalid school contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContactStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!isValidMobile(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number (10 digits required)';
    } else if (getStudentByMobile(formData.mobile)) {
      newErrors.mobile = 'Mobile number already registered';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (getStudentByEmail(formData.email)) {
      newErrors.email = 'Email already registered';
    }

    // Validate referral code if provided
    if (formData.referredByCenterCode.trim()) {
      const code = formData.referredByCenterCode.trim().toUpperCase();
      
      // Check if it's an Admin Center Code (ADM prefix) or Center Code (CC prefix)
      const referralCodes = JSON.parse(localStorage.getItem('gphdm_referral_codes') || '[]');
      const referralCode = referralCodes.find((r: any) => r.code === code && r.isActive);
      
      if (referralCode) {
        setReferralInfo({
          type: referralCode.type === 'ADMIN_CENTER' ? 'Admin Referral' : 'Center Code',
          ownerName: referralCode.ownerName,
        });
      } else {
        // Fallback: Check student center codes
        const referrer = getStudentByCenterCode(code);
        if (!referrer) {
          newErrors.referredByCenterCode = 'Invalid referral code';
          setReferralInfo(null);
        } else {
          setReferralInfo({
            type: 'Center Code',
            ownerName: referrer.name,
          });
        }
      }
    } else {
      setReferralInfo(null);
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

  const handleNext = () => {
    if (step === 'personal' && validatePersonalStep()) {
      setStep('contact');
    } else if (step === 'contact' && validateContactStep()) {
      setStep('address');
    } else if (step === 'address' && validateAddressStep()) {
      setStep('consent');
    } else if (step === 'consent' && validateConsentStep()) {
      setStep('review');
    }
  };

  const handleBack = () => {
    if (step === 'contact') setStep('personal');
    else if (step === 'address') setStep('contact');
    else if (step === 'consent') setStep('address');
    else if (step === 'review') setStep('consent');
  };

  const handleSubmit = async () => {
    // Final validation of consent
    if (!consentData.termsAccepted || !consentData.privacyAccepted || !consentData.referralPolicyAccepted) {
      toast({
        title: 'Consent Required',
        description: 'You must accept all terms and policies to register.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Log consent
    const consentLog = {
      id: generateId(),
      userId: '', // Will be updated after student creation
      userType: 'STUDENT',
      ipAddress: getUserIP(),
      consentedAt: new Date().toISOString(),
      policyVersion: POLICY_CONFIG.termsVersion,
      termsAccepted: consentData.termsAccepted,
      privacyAccepted: consentData.privacyAccepted,
      referralPolicyAccepted: consentData.referralPolicyAccepted,
    };

    const newStudent = addStudent({
      name: formData.name.trim(),
      fatherName: formData.fatherName.trim(),
      class: formData.class,
      mobile: formData.mobile.trim(),
      email: formData.email.trim().toLowerCase(),
      schoolName: formData.schoolName.trim(),
      schoolContact: formData.schoolContact.trim(),
      addressVillage: formData.addressVillage.trim(),
      addressBlock: formData.addressBlock.trim(),
      addressTahsil: formData.addressTahsil.trim(),
      addressDistrict: formData.addressDistrict.trim(),
      addressState: formData.addressState,
      referredByCenterCode: formData.referredByCenterCode.trim().toUpperCase() || undefined,
    });

    // Update consent log with user ID and save
    consentLog.userId = newStudent.id;
    const consentLogs = JSON.parse(localStorage.getItem('gphdm_consent_logs') || '[]');
    consentLogs.push(consentLog);
    localStorage.setItem('gphdm_consent_logs', JSON.stringify(consentLogs));

    // Auto login
    loginStudent(newStudent.email, newStudent.mobile);

    toast({
      title: 'Registration Successful!',
      description: `Your center code is ${newStudent.centerCode}. Proceed to payment.`,
    });

    setIsSubmitting(false);
    navigate('/dashboard');
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index < currentStepIndex
                        ? 'bg-accent text-white'
                        : index === currentStepIndex
                        ? 'bg-primary text-white'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle className="size-5" /> : index + 1}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <div className={`text-xs font-medium ${
                      index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {s.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-full mx-2 ${
                    index < currentStepIndex ? 'bg-accent' : 'bg-border'
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
          <CardContent>
            {/* Personal Step */}
            {step === 'personal' && (
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
                    <p className="text-sm text-muted-foreground">
                      Exam Fee: <span className="font-semibold text-primary">{formatCurrency(examFee)}</span>
                    </p>
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
              </div>
            )}

            {/* Contact Step */}
            {step === 'contact' && (
              <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">
                    OTP verification will be sent to this number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centerCode">Referral Code (Optional)</Label>
                  <Input
                    id="centerCode"
                    value={formData.referredByCenterCode}
                    onChange={(e) => updateField('referredByCenterCode', e.target.value.toUpperCase())}
                    placeholder="Enter referral code if you have one"
                    maxLength={12}
                    className={errors.referredByCenterCode ? 'border-destructive' : ''}
                  />
                  {errors.referredByCenterCode && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.referredByCenterCode}
                    </p>
                  )}
                  {referralInfo && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                      <CheckCircle className="size-3" />
                      <span>{referralInfo.type} by {referralInfo.ownerName}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter Admin Center Code (ADM...) or Center Code (CC...) if referred
                  </p>
                </div>
              </div>
            )}

            {/* Address Step */}
            {step === 'address' && (
              <div className="space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={formData.addressDistrict}
                      onChange={(e) => updateField('addressDistrict', e.target.value)}
                      placeholder="Enter district"
                      className={errors.addressDistrict ? 'border-destructive' : ''}
                    />
                    {errors.addressDistrict && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.addressDistrict}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.addressState}
                    onValueChange={(value) => updateField('addressState', value)}
                  >
                    <SelectTrigger className={errors.addressState ? 'border-destructive' : ''}>
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

            {/* Review Step */}
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
                    {formData.referredByCenterCode && (
                      <>
                        <span className="text-muted-foreground">Referral Code:</span>
                        <span>{formData.referredByCenterCode}</span>
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
              {step !== 'personal' ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step !== 'review' ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Registering...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <CheckCircle className="size-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
