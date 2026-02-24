import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { APP_CONFIG } from '@/constants/config';
import { generateId } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Registration',
    question: 'How do I register for the scholarship examination?',
    answer: 'Click on "Register Now" button on the homepage. Fill in all required details including personal information, contact details, and address. After registration, proceed to payment to complete the process.',
  },
  {
    category: 'Registration',
    question: 'Can I edit my registration details after submission?',
    answer: 'Minor corrections (like spelling) can be requested via email to our support team. Major changes (class, school) are not permitted after payment is completed.',
  },
  {
    category: 'Examination',
    question: 'When are the examination dates?',
    answer: 'Examination dates are announced on our website and communicated via email. Login to your dashboard to check scheduled examination windows for your class.',
  },
  {
    category: 'Examination',
    question: 'Can I retake the examination if I fail?',
    answer: 'No, each student is allowed only one attempt per academic year. There is no provision for re-examination. All students who complete the exam receive a participation certificate.',
  },
  {
    category: 'Results',
    question: 'When will the results be declared?',
    answer: 'Results are typically declared within 7-15 working days after the examination period ends. You will receive an email notification and can check results on your student dashboard.',
  },
  {
    category: 'Results',
    question: 'How are class rankings calculated?',
    answer: 'Rankings are based on: 1) Total score, 2) Number of correct answers, 3) Time taken. In case of tie, the student with higher accuracy and faster completion gets preference.',
  },
  {
    category: 'Certificate',
    question: 'How do I verify my certificate authenticity?',
    answer: 'Visit the "Verify Certificate" page on our website. Enter your Certificate ID or scan the QR code on your certificate. The system will confirm if the certificate is genuine.',
  },
  {
    category: 'Certificate',
    question: 'When will I receive my certificate?',
    answer: 'Certificates are generated automatically after results are published. You can download your certificate from the student dashboard. Physical certificates (if applicable) are mailed within 30 days.',
  },
  {
    category: 'Refund',
    question: 'Can I get a refund after payment?',
    answer: 'Registration fees are generally non-refundable. Refunds are only processed in case of technical errors (double payment) or examination cancellation by GPHDM. Contact support within 7 days of payment.',
  },
  {
    category: 'Refund',
    question: 'How long does refund processing take?',
    answer: 'Approved refunds are processed within 15-30 working days. The amount is credited to the original payment method. Transaction charges may be deducted.',
  },
  {
    category: 'Center',
    question: 'How do I become a registered center?',
    answer: 'Click on "Center Registration" and fill the application form with your center details. Applications are reviewed by our team. Approved centers receive a unique Center Code for referrals.',
  },
  {
    category: 'Center',
    question: 'How do referral rewards work?',
    answer: 'Approved centers earn ₹50 for each successful student registration using their Center Code. Rewards are credited to your wallet after the referred student completes payment. Minimum ₹500 balance required for withdrawal.',
  },
];

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Construct WhatsApp message
    const waMessage = `*New GPHDM Inquiry*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone || 'N/A'}%0A*Subject:* ${formData.subject}%0A*Message:* ${formData.message}`;
    const waNumber = APP_CONFIG.supportPhone.replace(/\D/g, '');
    const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

    // Save to localStorage (in real app, this would be an API call)
    const submissions = JSON.parse(localStorage.getItem('gphdm_contact_submissions') || '[]');
    submissions.push({
      id: generateId(),
      ...formData,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('gphdm_contact_submissions', JSON.stringify(submissions));

    setIsSubmitting(false);
    setIsSubmitted(true);

    toast({
      title: 'Message Ready!',
      description: 'Opening WhatsApp to send your inquiry...',
    });

    // Open WhatsApp
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1000);
  };

  const filteredFAQs = faqCategory === 'all'
    ? faqData
    : faqData.filter(faq => faq.category === faqCategory);

  const faqCategories = ['all', ...new Set(faqData.map(faq => faq.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <h1 className="font-serif text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            संपर्क करें - We're here to help. Reach out to us for any queries, feedback, or support.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" />
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="size-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for contacting us. We will respond within 24-48 working hours.
                    </p>
                    <Button onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(value) => handleInputChange('subject', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registration">Registration Query</SelectItem>
                            <SelectItem value="examination">Examination Related</SelectItem>
                            <SelectItem value="results">Results & Rankings</SelectItem>
                            <SelectItem value="certificate">Certificate Verification</SelectItem>
                            <SelectItem value="refund">Refund Request</SelectItem>
                            <SelectItem value="center">Center Registration</SelectItem>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Describe your query or concern in detail..."
                        rows={5}
                        required
                      />
                    </div>

                    {/* Simple Math CAPTCHA */}
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        By submitting this form, you agree to our Privacy Policy and Terms of Service.
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="size-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Office Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="size-5 text-primary" />
                  Office Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Email</h4>
                    <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-primary hover:underline">
                      {APP_CONFIG.supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="size-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Phone</h4>
                    <a href={`tel:${APP_CONFIG.supportPhone}`} className="text-primary hover:underline">
                      {APP_CONFIG.supportPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Address</h4>
                    <p className="text-muted-foreground text-sm">
                      {APP_CONFIG.organization}<br />
                      Uttar Pradesh, India - 201301
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-orange-600" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span className="font-medium">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium">10:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium text-red-600">Closed</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    * Response time: 24-48 working hours<br />
                    * Emergency support available during examination periods
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Link to="/verify" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <CheckCircle className="size-4" />
                    Verify Certificate
                  </Link>
                  <Link to="/terms" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <AlertCircle className="size-4" />
                    Terms of Service
                  </Link>
                  <Link to="/privacy" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <AlertCircle className="size-4" />
                    Privacy Policy
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Google Maps Embed */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-red-600" />
              Our Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.3825624747!2d80.77769943260427!3d26.8486230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd991f32b16b%3A0x93ccba8909978be7!2sLucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="GPHDM Office Location"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              Frequently Asked Questions (FAQ)
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              {faqCategories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={faqCategory === category ? 'default' : 'outline'}
                  onClick={() => setFaqCategory(category)}
                >
                  {category === 'all' ? 'All' : category}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredFAQs.map((faq, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                        {faq.category}
                      </span>
                      <span className="font-medium text-sm">{faq.question}</span>
                    </div>
                    {expandedFAQ === index ? (
                      <ChevronUp className="size-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-muted-foreground text-sm pl-[76px]">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
