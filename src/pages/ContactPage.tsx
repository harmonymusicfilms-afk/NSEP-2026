import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const waMessage = `*New GPHDM Inquiry*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone || 'N/A'}%0A*Subject:* ${formData.subject}%0A*Message:* ${formData.message}`;
    const waNumber = APP_CONFIG.supportPhone.replace(/\D/g, '');
    const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

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

    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1000);
  };

  const filteredFAQs = faqCategory === 'all'
    ? faqData
    : faqData.filter(faq => faq.category === faqCategory);

  const faqCategories = ['all', ...new Set(faqData.map(faq => faq.category))];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all mb-8 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 premium-text-gradient">Contact Us</h1>
            <p className="text-xl text-white/70 max-w-2xl leading-relaxed italic">
              संपर्क करें - We're here to help. Reach out to us for any queries, feedback, or support.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="glass-card-heavy rounded-[2.5rem] p-8 lg:p-12 border border-white/10">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-primary/20 rounded-2xl">
                  <MessageSquare className="size-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white">Send Us a Message</h2>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <div className="size-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="size-12 text-green-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Message Sent Successfully!</h3>
                  <p className="text-white/60 mb-10 text-lg">
                    Thank you for contacting us. We will respond within 24-48 working hours.
                  </p>
                  <Button
                    size="lg"
                    className="rounded-full px-10 h-14 font-bold institutional-gradient shadow-xl"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-white/80 font-bold ml-1">Full Name *</Label>
                      <Input
                        id="name"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-primary/50 transition-all placeholder:text-white/20"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-white/80 font-bold ml-1">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-primary/50 transition-all placeholder:text-white/20"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-white/80 font-bold ml-1">Phone Number</Label>
                      <Input
                        id="phone"
                        className="h-14 bg-white/5 border-white/10 rounded-2xl text-white focus:border-primary/50 transition-all placeholder:text-white/20"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="subject" className="text-white/80 font-bold ml-1">Subject</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => handleInputChange('subject', value)}
                      >
                        <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-white">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent className="glass-card-heavy border-white/10 text-white">
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

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-white/80 font-bold ml-1">Message *</Label>
                    <Textarea
                      id="message"
                      className="bg-white/5 border-white/10 rounded-[2rem] text-white focus:border-primary/50 transition-all placeholder:text-white/20 p-6"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Describe your query or concern in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:scale-[1.02] transition-transform"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="size-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="size-5" />
                        Send via WhatsApp
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Information */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {[
                { icon: Mail, title: 'Email', value: APP_CONFIG.supportEmail, href: `mailto:${APP_CONFIG.supportEmail}`, color: 'bg-blue-500/20 text-blue-400' },
                { icon: Phone, title: 'Phone', value: APP_CONFIG.supportPhone, href: `tel:${APP_CONFIG.supportPhone}`, color: 'bg-green-500/20 text-green-400' },
                { icon: MapPin, title: 'Address', value: 'Uttar Pradesh, India', href: '#', color: 'bg-purple-500/20 text-purple-400' }
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-6 rounded-3xl flex items-center gap-6 hover:bg-white/10 transition-all group">
                  <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="size-8" />
                  </div>
                  <div>
                    <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{item.title}</h4>
                    <a href={item.href} className="text-white text-lg font-bold break-all hover:text-primary transition-colors italic">
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Working Hours */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="size-6 text-accent" />
                  <h3 className="text-xl font-bold text-white">Working Hours</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { days: 'Monday - Friday', hours: '10:00 AM - 6:00 PM', variant: 'text-white/80' },
                    { days: 'Saturday', hours: '10:00 AM - 2:00 PM', variant: 'text-white/80' },
                    { days: 'Sunday', hours: 'Closed', variant: 'text-red-400 font-bold' }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                      <span className="text-white/50">{row.days}</span>
                      <span className={row.variant}>{row.hours}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  * 24-48 Working Hours response time
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Location & FAQ */}
        <div className="mt-20 grid lg:grid-cols-2 gap-12">
          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-heavy rounded-[3rem] p-8 lg:p-12 overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-10">
              <HelpCircle className="size-8 text-primary" />
              <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {faqCategories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${faqCategory === category
                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,165,0,0.3)]'
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  onClick={() => setFaqCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-4 h-[500px] overflow-y-auto custom-scrollbar pr-4">
              {filteredFAQs.map((faq, index) => (
                <div key={index} className="glass-card rounded-2xl overflow-hidden border-white/5">
                  <button
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 text-primary font-bold">
                        {index + 1}
                      </div>
                      <span className="font-bold text-white/80 leading-tight">{faq.question}</span>
                    </div>
                    {expandedFAQ === index ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-white/20" />}
                  </button>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-6 pb-6 pt-0 ml-14"
                    >
                      <p className="text-white/50 text-sm leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-[3rem] p-4 group"
          >
            <div className="relative h-full min-h-[500px] rounded-[2.5rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 pointer-events-none group-hover:opacity-0 transition-opacity" />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.3825624747!2d80.77769943260427!3d26.8486230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd991f32b16b%3A0x93ccba8909978be7!2sLucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="GPHDM Office Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
