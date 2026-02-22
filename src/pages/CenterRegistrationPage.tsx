import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  User,
  MapPin,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Upload,
  Shield,
  Phone,
  Mail,
  Camera,
  Gift,
  Users,
  Copy,
} from 'lucide-react';
import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { INDIAN_STATES, APP_CONFIG, REFERRAL_CONFIG } from '@/constants/config';
import { isValidEmail, isValidMobile, generateId, formatCurrency, generateCenterCode } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import logoImg from '@/assets/gphdm-logo.png';

type Step = 'details' | 'owner' | 'address' | 'documents' | 'review' | 'success';

interface CenterFormData {
  centerName: string;
  centerType: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAadhaar: string;
  fullAddress: string;
  village: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  idProofUrl: string;
  addressProofUrl: string;
  centerPhotoUrl: string;
  idProofName?: string;
  addressProofName?: string;
  centerPhotoName?: string;
  password?: string;
}

const initialFormData: CenterFormData = {
  centerName: '',
  centerType: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  ownerAadhaar: '',
  fullAddress: '',
  village: '',
  block: '',
  district: '',
  state: '',
  pincode: '',
  idProofUrl: '',
  addressProofUrl: '',
  centerPhotoUrl: '',
  password: '',
};

const centerTypes = [
  'School',
  'Coaching Center',
  'Tuition Center',
  'NGO',
  'Community Center',
  'Other',
];

export function CenterRegistrationPage() {
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState<CenterFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CenterFormData, string>>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const [generatedCenterCode, setGeneratedCenterCode] = useState('');
  const [showReferralGate, setShowReferralGate] = useState(false);

  const idProofRef = useRef<HTMLInputElement>(null);
  const addressProofRef = useRef<HTMLInputElement>(null);
  const centerPhotoRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    console.log("NSEP Debug - Form Data Updated:", formData);
  }, [formData]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (!refCode) {
      setShowReferralGate(true);
    } else {
      setShowReferralGate(false);
    }
  }, [searchParams]);

  const steps: { key: Step; label: string; labelHi: string; icon: typeof Building2 }[] = [
    { key: 'details', label: 'Center Details', labelHi: 'केंद्र विवरण', icon: Building2 },
    { key: 'owner', label: 'Owner Info', labelHi: 'स्वामी जानकारी', icon: User },
    { key: 'address', label: 'Address', labelHi: 'पता', icon: MapPin },
    { key: 'documents', label: 'Documents', labelHi: 'दस्तावेज़', icon: FileText },
    { key: 'review', label: 'Review', labelHi: 'समीक्षा', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const updateField = (field: keyof CenterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateDetailsStep = (): boolean => {
    const newErrors: Partial<Record<keyof CenterFormData, string>> = {};
    if (!formData.centerName.trim()) newErrors.centerName = 'Center name is required';
    if (!formData.centerType) newErrors.centerType = 'Center type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOwnerStep = (): boolean => {
    const newErrors: Partial<Record<keyof CenterFormData, string>> = {};
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerPhone.trim()) {
      newErrors.ownerPhone = 'Phone is required';
    } else if (!isValidMobile(formData.ownerPhone)) {
      newErrors.ownerPhone = 'Invalid phone number';
    }
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Email is required';
    } else if (!isValidEmail(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Invalid email format';
    }
    if (!formData.ownerAadhaar.trim()) {
      newErrors.ownerAadhaar = 'Aadhaar number is required';
    } else if (formData.ownerAadhaar.length !== 12) {
      newErrors.ownerAadhaar = 'Aadhaar must be 12 digits';
    }
    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddressStep = (): boolean => {
    const newErrors: Partial<Record<keyof CenterFormData, string>> = {};
    if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Address is required';
    if (!formData.village.trim()) newErrors.village = 'Village/Town is required';
    if (!formData.block.trim()) newErrors.block = 'Block is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDocumentsStep = (): boolean => {
    const newErrors: Partial<Record<keyof CenterFormData, string>> = {};
    if (!formData.idProofUrl) newErrors.idProofUrl = 'ID Proof is required';
    if (!formData.addressProofUrl) newErrors.addressProofUrl = 'Address Proof is required';
    if (!formData.centerPhotoUrl) newErrors.centerPhotoUrl = 'Center Photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 'details' && validateDetailsStep()) setStep('owner');
    else if (step === 'owner' && validateOwnerStep()) setStep('address');
    else if (step === 'address' && validateAddressStep()) setStep('documents');
    else if (step === 'documents' && validateDocumentsStep()) setStep('review');
  };

  const handleBack = () => {
    if (step === 'owner') setStep('details');
    else if (step === 'address') setStep('owner');
    else if (step === 'documents') setStep('address');
    else if (step === 'review') setStep('documents');
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setTermsError('You must accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    // Removed artificial delay for snappy UX

    // Generate center code
    const centerCode = generateCenterCode();

    // Create center record
    const center = {
      id: generateId(),
      name: formData.centerName,
      centerType: formData.centerType,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      ownerPhone: formData.ownerPhone,
      ownerAadhaar: formData.ownerAadhaar,
      address: formData.fullAddress,
      village: formData.village,
      block: formData.block,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
      centerCode,
      status: 'PENDING',
      totalStudents: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString(),
      idProofUrl: formData.idProofUrl,
      addressProofUrl: formData.addressProofUrl,
      centerPhotoUrl: formData.centerPhotoUrl,
    };

    // 4. Save to Supabase (Real Database)
    try {
      // a. Sign up the user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.ownerEmail,
        password: formData.password || 'password123',
        options: {
          data: {
            full_name: formData.ownerName,
            role: 'CENTER',
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user?.id;

      // b. Insert center record
      const { error } = await supabase
        .from('centers')
        .insert([{
          id: center.id,
          user_id: userId,
          name: center.name,
          center_type: center.centerType,
          owner_name: center.ownerName,
          email: center.ownerEmail,
          phone: center.ownerPhone,
          owner_aadhaar: center.ownerAadhaar,
          address: center.address,
          village: center.village,
          block: center.block,
          district: center.district,
          state: center.state,
          pincode: center.pincode,
          center_code: center.centerCode,
          status: 'PENDING',
          id_proof_url: center.idProofUrl,
          address_proof_url: center.addressProofUrl,
          center_photo_url: center.centerPhotoUrl,
        }]);

      if (error) throw error;

      console.log('Center registered successfully in Supabase');
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({
        title: 'Registration Error',
        description: err.message || 'An error occurred during registration.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // 5. Save to localStorage (Safely - as secondary/redundant or for local testing)
    let storedCenters: any[] = [];
    try {
      const item = localStorage.getItem('gphdm_centers');
      if (item) {
        storedCenters = JSON.parse(item);
        if (!Array.isArray(storedCenters)) storedCenters = [];
      }
    } catch (error) {
      console.error('Error parsing stored centers:', error);
      storedCenters = [];
    }

    storedCenters.push(center);
    localStorage.setItem('gphdm_centers', JSON.stringify(storedCenters));

    toast({
      title: language === 'hi' ? 'आवेदन जमा!' : 'Application Submitted!',
      description: language === 'hi'
        ? `आपका आवेदन जमा हो गया है। आपका केंद्र कोड ${centerCode} है।`
        : `Your application has been submitted. Your Center Code is ${centerCode}.`,
    });

    setGeneratedCenterCode(centerCode);
    setIsSubmitting(false);
    setStep('success');
    navigate('#success'); // Avoid navigation away
  };

  const handleFileSelect = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof CenterFormData) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB for base64 safety)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({
        ...prev,
        [field]: base64String,
        [`${field}Name`]: file.name
      }));

      toast({
        title: language === 'hi' ? 'दस्तावेज़ चुना गया' : 'Document Selected',
        description: file.name,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  const removeFile = (field: keyof CenterFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: '',
      [`${field}Name`]: undefined
    }));
  };

  if (showReferralGate) {
    return (
      <div className="min-h-screen bg-muted py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="text-center py-12 px-6 border-2 border-primary/20 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Gift className="size-32" />
            </div>
            <CardHeader className="relative z-10">
              <div className="mx-auto size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Users className="size-10 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl mb-2">
                {language === 'hi' ? 'केवल रेफ़रल द्वारा पंजीकरण' : 'Registration by Referral Only'}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {language === 'hi'
                  ? 'केंद्र पंजीकरण वर्तमान में केवल आधिकारिक रेफ़रल के माध्यम से उपलब्ध है।'
                  : 'Center registration is currently restricted to referrals from authorized partners or admins.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="p-4 bg-muted rounded-xl space-y-2 text-left">
                <p className="text-sm font-semibold text-foreground italic">
                  {language === 'hi' ? 'रेफ़रल कोड दर्ज करें:' : 'Enter your referral code:'}
                </p>
                <div className="flex gap-2">
                  <Input
                    id="center-ref-input"
                    className="uppercase font-mono text-center tracking-widest h-11"
                    placeholder="CODE"
                  />
                  <Button
                    variant="default"
                    className="institutional-gradient px-6"
                    onClick={() => {
                      const val = (document.getElementById('center-ref-input') as HTMLInputElement).value;
                      if (val) {
                        navigate(`/center-registration?ref=${val.trim().toUpperCase()}`);
                      }
                    }}
                  >
                    OK
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="ghost" asChild>
                  <Link to="/" className="text-muted-foreground">
                    <ArrowLeft className="size-4 mr-2" />
                    {language === 'hi' ? 'मुखपृष्ठ पर वापस' : 'Back to Homepage'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary mb-4">
            <img src={logoImg} alt="GPHDM" className="h-10 w-auto" />
            <span className="font-serif text-xl font-bold">{APP_CONFIG.shortName}</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {language === 'hi' ? 'केंद्र पंजीकरण (v2)' : 'Center Registration (v2)'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'hi'
              ? 'अनुमोदित परीक्षा केंद्र बनने के लिए आवेदन करें'
              : 'Apply to become an approved examination center'}
          </p>
        </div>

        {/* Benefits Banner */}
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="size-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">
                  {language === 'hi' ? 'केंद्र लाभ' : 'Center Benefits'}
                </h3>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  <li>• {language === 'hi' ? `प्रति सफल पंजीकरण ${formatCurrency(REFERRAL_CONFIG.centerCodeReward)} कमाएं` : `Earn ${formatCurrency(REFERRAL_CONFIG.centerCodeReward)} per successful registration`}</li>
                  <li>• {language === 'hi' ? 'अपना यूनिक सेंटर कोड प्राप्त करें' : 'Get your unique Center Code'}</li>
                  <li>• {language === 'hi' ? 'रियल-टाइम डैशबोर्ड एक्सेस' : 'Real-time dashboard access'}</li>
                  <li>• {language === 'hi' ? 'प्राथमिकता समर्थन' : 'Priority support'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center transition-colors ${index < currentStepIndex
                      ? 'bg-green-600 text-white'
                      : index === currentStepIndex
                        ? 'bg-primary text-white'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}
                  >
                    {index < currentStepIndex ? <CheckCircle className="size-5" /> : <s.icon className="size-5" />}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <div className={`text-xs font-medium ${index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {language === 'hi' ? s.labelHi : s.label}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-full mx-2 ${index < currentStepIndex ? 'bg-green-600' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStepIndex].icon;
                return <StepIcon className="size-5" />;
              })()}
              {language === 'hi' ? steps[currentStepIndex].labelHi : steps[currentStepIndex].label}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] sm:max-h-none overflow-y-auto custom-scrollbar pr-2">
            {/* Details Step */}
            {step === 'details' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="centerName">
                    {language === 'hi' ? 'केंद्र का नाम' : 'Center Name'} *
                  </Label>
                  <Input
                    id="centerName"
                    value={formData.centerName}
                    onChange={(e) => updateField('centerName', e.target.value)}
                    placeholder={language === 'hi' ? 'अपने केंद्र का नाम दर्ज करें' : 'Enter your center name'}
                    className={errors.centerName ? 'border-destructive' : ''}
                  />
                  {errors.centerName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.centerName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centerType">
                    {language === 'hi' ? 'केंद्र का प्रकार' : 'Center Type'} *
                  </Label>
                  <Select value={formData.centerType} onValueChange={(v) => updateField('centerType', v)}>
                    <SelectTrigger className={errors.centerType ? 'border-destructive' : ''}>
                      <SelectValue placeholder={language === 'hi' ? 'प्रकार चुनें' : 'Select type'} />
                    </SelectTrigger>
                    <SelectContent>
                      {centerTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.centerType && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.centerType}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">
                    {language === 'hi' ? 'पात्रता मानदंड' : 'Eligibility Criteria'}
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {language === 'hi' ? 'वैध पहचान प्रमाण आवश्यक' : 'Valid ID proof required'}</li>
                    <li>• {language === 'hi' ? 'स्थायी केंद्र पता' : 'Permanent center address'}</li>
                    <li>• {language === 'hi' ? 'कम से कम 10 छात्रों को रेफर करने की क्षमता' : 'Ability to refer at least 10 students'}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Owner Step */}
            {step === 'owner' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">
                    {language === 'hi' ? 'स्वामी का नाम' : 'Owner Full Name'} *
                  </Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => updateField('ownerName', e.target.value)}
                    placeholder={language === 'hi' ? 'पूरा नाम दर्ज करें' : 'Enter full name'}
                    className={errors.ownerName ? 'border-destructive' : ''}
                  />
                  {errors.ownerName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.ownerName}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">
                      <Phone className="size-4 inline mr-1" />
                      {language === 'hi' ? 'फोन नंबर' : 'Phone Number'} *
                    </Label>
                    <Input
                      id="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={(e) => updateField('ownerPhone', e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className={errors.ownerPhone ? 'border-destructive' : ''}
                    />
                    {errors.ownerPhone && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.ownerPhone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">
                      <Mail className="size-4 inline mr-1" />
                      {language === 'hi' ? 'ईमेल' : 'Email'} *
                    </Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => updateField('ownerEmail', e.target.value)}
                      placeholder="email@example.com"
                      autoComplete="off"
                      className={errors.ownerEmail ? 'border-destructive' : ''}
                    />
                    {errors.ownerEmail && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.ownerEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerAadhaar">
                    {language === 'hi' ? 'आधार नंबर' : 'Aadhaar Number'} *
                  </Label>
                  <Input
                    id="ownerAadhaar"
                    value={formData.ownerAadhaar}
                    onChange={(e) => updateField('ownerAadhaar', e.target.value.replace(/\D/g, ''))}
                    placeholder="12-digit Aadhaar"
                    maxLength={12}
                    className={errors.ownerAadhaar ? 'border-destructive' : ''}
                  />
                  {errors.ownerAadhaar && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.ownerAadhaar}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? 'सत्यापन और KYC के लिए आवश्यक' : 'Required for verification and KYC'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {language === 'hi' ? 'पासवर्ड सेट करें' : 'Set Password'} *
                  </Label>
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
            )}

            {/* Address Step */}
            {step === 'address' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullAddress">
                    {language === 'hi' ? 'पूरा पता' : 'Full Address'} *
                  </Label>
                  <Textarea
                    id="fullAddress"
                    value={formData.fullAddress}
                    onChange={(e) => updateField('fullAddress', e.target.value)}
                    placeholder={language === 'hi' ? 'केंद्र का पूरा पता' : 'Complete center address'}
                    rows={3}
                    className={errors.fullAddress ? 'border-destructive' : ''}
                  />
                  {errors.fullAddress && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.fullAddress}
                    </p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="village">{language === 'hi' ? 'गांव/शहर' : 'Village/Town'} *</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => updateField('village', e.target.value)}
                      className={errors.village ? 'border-destructive' : ''}
                    />
                    {errors.village && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.village}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block">{language === 'hi' ? 'ब्लॉक' : 'Block'} *</Label>
                    <Input
                      id="block"
                      value={formData.block}
                      onChange={(e) => updateField('block', e.target.value)}
                      className={errors.block ? 'border-destructive' : ''}
                    />
                    {errors.block && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.block}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">{language === 'hi' ? 'जिला' : 'District'} *</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className={errors.district ? 'border-destructive' : ''}
                    />
                    {errors.district && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.district}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">{language === 'hi' ? 'पिनकोड' : 'Pincode'} *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      className={errors.pincode ? 'border-destructive' : ''}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">{language === 'hi' ? 'राज्य' : 'State'} *</Label>
                  <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                    <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                      <SelectValue placeholder={language === 'hi' ? 'राज्य चुनें' : 'Select state'} />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" /> {errors.state}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Documents Step */}
            {step === 'documents' && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    {language === 'hi'
                      ? 'दस्तावेज़ अपलोड वैकल्पिक है लेकिन तेज़ अनुमोदन के लिए अनुशंसित है।'
                      : 'Document upload is optional but recommended for faster approval.'}
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Hidden Inputs */}
                  <input
                    type="file"
                    ref={idProofRef}
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'idProofUrl')}
                  />
                  <input
                    type="file"
                    ref={addressProofRef}
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'addressProofUrl')}
                  />
                  <input
                    type="file"
                    ref={centerPhotoRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'centerPhotoUrl')}
                  />

                  {/* ID Proof */}
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${errors.idProofUrl ? 'border-destructive/50 bg-red-50/10' : 'hover:border-primary/50'}`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{language === 'hi' ? 'पहचान प्रमाण' : 'ID Proof'} *</h4>
                          <p className="text-sm text-muted-foreground">
                            {language === 'hi' ? 'आधार/पैन/वोटर ID' : 'Aadhaar/PAN/Voter ID'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={formData.idProofUrl ? "secondary" : "outline"}
                          onClick={() => handleFileSelect(idProofRef)}
                        >
                          <Upload className="size-4 mr-2" />
                          {formData.idProofUrl
                            ? (language === 'hi' ? 'बदलें' : 'Change')
                            : (language === 'hi' ? 'अपलोड करें' : 'Upload')}
                        </Button>
                      </div>

                      {formData.idProofUrl && (
                        <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-md border border-green-100">
                          <div className="size-12 rounded border bg-white overflow-hidden flex-shrink-0">
                            <img src={formData.idProofUrl} alt="ID Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-800 truncate">
                              {(formData as any).idProofName || (language === 'hi' ? 'दस्तावेज़ चुना गया' : 'Document selected')}
                            </p>
                            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                              <CheckCircle className="size-3" />
                              {language === 'hi' ? 'अपलोड किया गया' : 'Uploaded'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            onClick={() => removeFile('idProofUrl')}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                      {errors.idProofUrl && <p className="text-xs text-destructive">{errors.idProofUrl}</p>}
                    </div>
                  </div>

                  {/* Address Proof */}
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${errors.addressProofUrl ? 'border-destructive/50 bg-red-50/10' : 'hover:border-primary/50'}`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{language === 'hi' ? 'पता प्रमाण' : 'Address Proof'} *</h4>
                          <p className="text-sm text-muted-foreground">
                            {language === 'hi' ? 'बिजली बिल/राशन कार्ड' : 'Electricity bill/Ration card'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={formData.addressProofUrl ? "secondary" : "outline"}
                          onClick={() => handleFileSelect(addressProofRef)}
                        >
                          <Upload className="size-4 mr-2" />
                          {formData.addressProofUrl
                            ? (language === 'hi' ? 'बदलें' : 'Change')
                            : (language === 'hi' ? 'अपलोड करें' : 'Upload')}
                        </Button>
                      </div>

                      {formData.addressProofUrl && (
                        <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-md border border-green-100">
                          <div className="size-12 rounded border bg-white overflow-hidden flex-shrink-0">
                            <img src={formData.addressProofUrl} alt="Address Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-800 truncate">
                              {(formData as any).addressProofName || (language === 'hi' ? 'पते का प्रमाण चुना गया' : 'Address proof selected')}
                            </p>
                            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                              <CheckCircle className="size-3" />
                              {language === 'hi' ? 'अपलोड किया गया' : 'Uploaded'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            onClick={() => removeFile('addressProofUrl')}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                      {errors.addressProofUrl && <p className="text-xs text-destructive">{errors.addressProofUrl}</p>}
                    </div>
                  </div>

                  {/* Center Photo */}
                  <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${errors.centerPhotoUrl ? 'border-destructive/50 bg-red-50/10' : 'hover:border-primary/50'}`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{language === 'hi' ? 'केंद्र फोटो' : 'Center Photo'} *</h4>
                          <p className="text-sm text-muted-foreground">
                            {language === 'hi' ? 'केंद्र की तस्वीर' : 'Photo of center premises'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={formData.centerPhotoUrl ? "secondary" : "outline"}
                          onClick={() => handleFileSelect(centerPhotoRef)}
                        >
                          <Camera className="size-4 mr-2" />
                          {formData.centerPhotoUrl
                            ? (language === 'hi' ? 'बदलें' : 'Change')
                            : (language === 'hi' ? 'अपलोड करें' : 'Upload')}
                        </Button>
                      </div>

                      {formData.centerPhotoUrl && (
                        <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-md border border-green-100">
                          <div className="size-12 rounded border bg-white overflow-hidden flex-shrink-0">
                            <img src={formData.centerPhotoUrl} alt="Center Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-800 truncate">
                              {(formData as any).centerPhotoName || (language === 'hi' ? 'केंद्र फोटो चुनी गई' : 'Center photo selected')}
                            </p>
                            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                              <CheckCircle className="size-3" />
                              {language === 'hi' ? 'अपलोड किया गया' : 'Uploaded'}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            onClick={() => removeFile('centerPhotoUrl')}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                      {errors.centerPhotoUrl && <p className="text-xs text-destructive">{errors.centerPhotoUrl}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
              <div className="space-y-6">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="size-4" />
                    {language === 'hi' ? 'केंद्र विवरण' : 'Center Details'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">{language === 'hi' ? 'नाम:' : 'Name:'}</span>
                    <span>{formData.centerName}</span>
                    <span className="text-muted-foreground">{language === 'hi' ? 'प्रकार:' : 'Type:'}</span>
                    <span>{formData.centerType}</span>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="size-4" />
                    {language === 'hi' ? 'स्वामी जानकारी' : 'Owner Information'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">{language === 'hi' ? 'नाम:' : 'Name:'}</span>
                    <span>{formData.ownerName}</span>
                    <span className="text-muted-foreground">{language === 'hi' ? 'फोन:' : 'Phone:'}</span>
                    <span>{formData.ownerPhone}</span>
                    <span className="text-muted-foreground">{language === 'hi' ? 'ईमेल:' : 'Email:'}</span>
                    <span>{formData.ownerEmail}</span>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="size-4" />
                    {language === 'hi' ? 'पता' : 'Address'}
                  </h3>
                  <p className="text-sm">
                    {formData.fullAddress}, {formData.village}, {formData.block}, {formData.district}, {formData.state} - {formData.pincode}
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="size-4" />
                    {language === 'hi' ? 'दस्तावेज़' : 'Documents'}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className={`px-2 py-1 rounded ${formData.idProofUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {language === 'hi' ? 'पहचान प्रमाण' : 'ID Proof'}: {formData.idProofUrl ? '✓' : '—'}
                    </span>
                    <span className={`px-2 py-1 rounded ${formData.addressProofUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {language === 'hi' ? 'पता प्रमाण' : 'Address Proof'}: {formData.addressProofUrl ? '✓' : '—'}
                    </span>
                    <span className={`px-2 py-1 rounded ${formData.centerPhotoUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {language === 'hi' ? 'केंद्र फोटो' : 'Center Photo'}: {formData.centerPhotoUrl ? '✓' : '—'}
                    </span>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => {
                      setTermsAccepted(!!checked);
                      setTermsError('');
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="cursor-pointer">
                      {language === 'hi'
                        ? 'मैं केंद्र साझेदारी नियम और शर्तों से सहमत हूं'
                        : 'I agree to the Center Partnership Terms and Conditions'}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'hi'
                        ? 'इसमें रेफरल नीतियां, भुगतान शर्तें और आचार संहिता शामिल है।'
                        : 'This includes referral policies, payment terms, and code of conduct.'}
                    </p>
                  </div>
                </div>
                {termsError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="size-4" /> {termsError}
                  </p>
                )}
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto size-24 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-100/50">
                  <CheckCircle className="size-12 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    {language === 'hi' ? 'पंजीकरण सफल!' : 'Registration Successful!'}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'hi'
                      ? 'आपका केंद्र आवेदन सफलतापूर्वक जमा कर दिया गया है।'
                      : 'Your center application has been submitted successfully.'}
                  </p>
                </div>

                <div className="bg-muted p-6 rounded-xl border-2 border-dashed border-primary/20 max-w-sm mx-auto hover:bg-muted/80 transition-colors">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    {language === 'hi' ? 'आपका केंद्र कोड' : 'YOUR CENTER CODE'}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-mono font-bold text-primary tracking-wider select-all">
                      {generatedCenterCode}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCenterCode);
                        toast({ title: "Copied! 📋", description: "Center code copied to clipboard" });
                      }}
                    >
                      <Copy className="size-5" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4 font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="size-3" />
                    {language === 'hi' ? 'कृपया इस कोड को सुरक्षित रखें' : 'Please save this code securely'}
                  </p>
                </div>

                <div className="pt-6 space-y-3">
                  <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                    {language === 'hi'
                      ? 'आपका खाता अनुमोदन के लिए भेजा गया है। अनुमोदन के बाद आप लॉगिन कर सकेंगे।'
                      : 'Your account has been sent for approval. You will be able to login after verification.'}
                  </p>
                  <Link to="/">
                    <Button className="w-full institutional-gradient h-12 text-lg shadow-lg">
                      {language === 'hi' ? 'होम पेज पर जाएं' : 'Return to Homepage'}
                      <ArrowRight className="ml-2 size-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation (Hidden on Success) */}
            {step !== 'success' && (
              <div className="flex justify-between mt-6 pt-6 border-t">
                {step !== 'details' ? (
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="size-4 mr-2" />
                    {language === 'hi' ? 'पीछे' : 'Back'}
                  </Button>
                ) : (
                  <Link to="/">
                    <Button variant="ghost">
                      <ArrowLeft className="size-4 mr-2" />
                      {language === 'hi' ? 'होम' : 'Home'}
                    </Button>
                  </Link>
                )}

                {step !== 'review' ? (
                  <Button onClick={handleNext}>
                    {language === 'hi' ? 'आगे' : 'Next'}
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {language === 'hi' ? 'जमा हो रहा है...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        {language === 'hi' ? 'आवेदन जमा करें' : 'Submit Application'}
                        <CheckCircle className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
