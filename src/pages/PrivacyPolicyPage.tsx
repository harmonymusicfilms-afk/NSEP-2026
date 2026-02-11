import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Share2,
  UserCheck,
  Cookie,
  Mail,
  AlertCircle,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_CONFIG, POLICY_CONFIG } from '@/constants/config';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-14 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="size-7 text-green-600" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                गोपनीयता नीति
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Version: {POLICY_CONFIG.privacyVersion}</span>
            <span>•</span>
            <span>Last Updated: {POLICY_CONFIG.lastUpdated}</span>
          </div>
        </div>

        {/* Compliance Notice */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="size-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Indian IT Law Compliance</h3>
                <p className="text-green-700 text-sm">
                  This Privacy Policy is compliant with the Information Technology Act, 2000 and 
                  Information Technology (Reasonable Security Practices and Procedures and Sensitive 
                  Personal Data or Information) Rules, 2011.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              {APP_CONFIG.organization} ("{APP_CONFIG.shortName}", "we", "our", or "us") is committed 
              to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our scholarship examination platform.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {APP_CONFIG.organization} आपकी गोपनीयता की रक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है 
              कि जब आप हमारे छात्रवृत्ति परीक्षा प्लेटफ़ॉर्म का उपयोग करते हैं तो हम आपकी जानकारी कैसे एकत्र, 
              उपयोग, प्रकट और सुरक्षित करते हैं।
            </p>
          </CardContent>
        </Card>

        {/* Section 1: Data Collection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="size-5 text-blue-600" />
              1. Information We Collect (एकत्रित जानकारी)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">1.1 Personal Information (व्यक्तिगत जानकारी)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Identity Data:</strong> Full name, father's/guardian's name, date of birth</li>
                <li><strong>Contact Data:</strong> Mobile number, email address, residential address</li>
                <li><strong>Educational Data:</strong> Class/grade, school name, school contact details</li>
                <li><strong>Location Data:</strong> Village, block, tahsil, district, state</li>
                <li><strong>Photo:</strong> Passport-sized photograph (if uploaded)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">1.2 Sensitive Personal Data (संवेदनशील व्यक्तिगत डेटा)</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  As per IT Rules 2011, sensitive personal data includes financial information such as 
                  bank account details and payment card information. We collect this only through our 
                  secure payment gateway (Razorpay) and do not store full card details on our servers.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">1.3 Examination Data (परीक्षा डेटा)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Examination responses and answers</li>
                <li>Scores, rankings, and performance metrics</li>
                <li>Time taken for each question</li>
                <li>Examination session logs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">1.4 Technical Data (तकनीकी डेटा)</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>IP address and geolocation data</li>
                <li>Browser type and version</li>
                <li>Device information (type, operating system)</li>
                <li>Login timestamps and session duration</li>
                <li>Referral source and navigation patterns</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Purpose of Data Usage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="size-5 text-purple-600" />
              2. Purpose of Data Usage (डेटा उपयोग का उद्देश्य)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">We use your information for the following purposes:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Registration', desc: 'To create and manage your student account' },
                { title: 'Examination', desc: 'To conduct examinations and evaluate performance' },
                { title: 'Results', desc: 'To calculate rankings and publish results' },
                { title: 'Certificates', desc: 'To generate and issue certificates' },
                { title: 'Scholarships', desc: 'To process scholarship applications and payments' },
                { title: 'Communication', desc: 'To send important updates, results, and notifications' },
                { title: 'Support', desc: 'To respond to queries and provide assistance' },
                { title: 'Improvement', desc: 'To analyze and improve our services' },
              ].map((item, index) => (
                <div key={index} className="bg-muted rounded-lg p-3">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Data Storage & Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lock className="size-5 text-green-600" />
              3. Data Storage & Security (डेटा संग्रहण और सुरक्षा)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">3.1 Storage Location</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Data is stored on secure servers located in India.</li>
                <li>Cloud infrastructure complies with ISO 27001 standards.</li>
                <li>Regular backups are maintained for data recovery.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">3.2 Security Measures</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 text-green-800 text-sm">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>Role-based access control (RBAC)</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Multi-factor authentication for admin access</li>
                  <li>Firewall protection and intrusion detection</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">3.3 Data Retention</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Personal data: Retained for 5 years from last activity or as required by law.</li>
                <li>Examination records: Retained for 7 years for verification purposes.</li>
                <li>Financial records: Retained as per applicable tax and audit requirements.</li>
                <li>Inactive accounts may be archived after 2 years of inactivity.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Data Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Share2 className="size-5 text-orange-600" />
              4. Data Sharing & Disclosure (डेटा साझाकरण और प्रकटीकरण)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">4.1 We May Share Data With:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Payment Processors:</strong> Razorpay for secure payment processing</li>
                <li><strong>Cloud Providers:</strong> For hosting and infrastructure services</li>
                <li><strong>Email Services:</strong> For sending notifications and certificates</li>
                <li><strong>Legal Authorities:</strong> When required by law or court order</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">4.2 We Do NOT:</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 text-red-700 text-sm">
                  <li>Sell your personal data to third parties</li>
                  <li>Share your data for unrelated marketing purposes</li>
                  <li>Transfer data outside India without adequate safeguards</li>
                  <li>Disclose examination answers or performance to unauthorized parties</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: User Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserCheck className="size-5 text-blue-600" />
              5. Your Rights (आपके अधिकार)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Under the Information Technology Act, 2000 and IT Rules, 2011, you have the following rights:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-700 mb-2">Right to Access</h4>
                <p className="text-sm text-muted-foreground">
                  Request a copy of your personal data stored with us.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">Right to Correction</h4>
                <p className="text-sm text-muted-foreground">
                  Request correction of inaccurate or incomplete data.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-orange-700 mb-2">Right to Withdraw Consent</h4>
                <p className="text-sm text-muted-foreground">
                  Withdraw consent for data processing (subject to legal obligations).
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-red-700 mb-2">Right to Deletion</h4>
                <p className="text-sm text-muted-foreground">
                  Request deletion of data (subject to retention requirements).
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">How to Exercise Your Rights</h4>
              <p className="text-blue-700 text-sm">
                To exercise any of these rights, please send an email to <strong>{APP_CONFIG.supportEmail}</strong> 
                with the subject line "Privacy Rights Request" along with your registered email ID and 
                specific request. We will respond within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cookie className="size-5 text-amber-600" />
              6. Cookies & Tracking (कुकीज़ और ट्रैकिंग)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our platform uses cookies and similar technologies to enhance your experience:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-muted rounded-lg p-3">
                <div className="size-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs font-bold">E</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Essential Cookies</h4>
                  <p className="text-xs text-muted-foreground">Required for login, session management, and security.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted rounded-lg p-3">
                <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-bold">F</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Functional Cookies</h4>
                  <p className="text-xs text-muted-foreground">Remember your preferences and settings.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted rounded-lg p-3">
                <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-xs font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Analytics Cookies</h4>
                  <p className="text-xs text-muted-foreground">Help us understand how you use our platform.</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              You can manage cookie preferences through your browser settings. However, disabling 
              essential cookies may affect platform functionality.
            </p>
          </CardContent>
        </Card>

        {/* Section 7: Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="size-5 text-primary" />
              7. Contact for Privacy Concerns (गोपनीयता चिंताओं के लिए संपर्क)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For any privacy-related concerns, questions, or requests, please contact our 
              Grievance Officer (as required under IT Rules, 2011):
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p><strong>Grievance Officer:</strong> {APP_CONFIG.organization}</p>
              <p><strong>Email:</strong> {APP_CONFIG.supportEmail}</p>
              <p><strong>Phone:</strong> {APP_CONFIG.supportPhone}</p>
              <p><strong>Response Time:</strong> Within 30 days of receiving the request</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 8: Policy Updates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertCircle className="size-5 text-yellow-600" />
              8. Policy Updates (नीति अपडेट)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>We may update this Privacy Policy from time to time.</li>
              <li>Material changes will be notified via email or platform notification.</li>
              <li>Continued use after changes constitutes acceptance of the updated policy.</li>
              <li>We encourage you to review this policy periodically.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>
            By using {APP_CONFIG.shortName}, you acknowledge that you have read and understood 
            this Privacy Policy.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} {APP_CONFIG.organization}. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/terms" className="text-primary hover:underline flex items-center gap-1">
              <FileText className="size-4" />
              Terms of Service
            </Link>
            <Link to="/contact" className="text-primary hover:underline flex items-center gap-1">
              <Mail className="size-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
