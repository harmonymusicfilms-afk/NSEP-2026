import { APP_CONFIG } from '@/constants/config';
import { formatCurrency, formatDate } from '@/lib/utils';

// Email notification types
export type EmailNotificationType = 
  | 'REGISTRATION_CONFIRMATION'
  | 'PAYMENT_RECEIPT'
  | 'EXAM_REMINDER'
  | 'RESULT_ANNOUNCEMENT'
  | 'CERTIFICATE_ISSUED'
  | 'SCHOLARSHIP_APPROVED'
  | 'CENTER_APPROVED';

interface EmailTemplateData {
  studentName: string;
  studentEmail: string;
  class?: number;
  centerCode?: string;
  paymentId?: string;
  amount?: number;
  examDate?: string;
  rank?: number;
  score?: number;
  certificateId?: string;
  scholarshipAmount?: number;
  centerName?: string;
  [key: string]: any;
}

interface GeneratedEmail {
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

// Email templates in both languages
const emailTemplates: Record<EmailNotificationType, { en: { subject: string; body: string }; hi: { subject: string; body: string } }> = {
  REGISTRATION_CONFIRMATION: {
    en: {
      subject: 'Registration Successful - GPHDM Scholarship Examination',
      body: `
Dear {{studentName}},

Congratulations! Your registration for the ${APP_CONFIG.fullName} has been completed successfully.

Registration Details:
- Name: {{studentName}}
- Class: {{class}}
- Center Code: {{centerCode}}
- Email: {{studentEmail}}

Next Steps:
1. Complete your payment to confirm your examination slot
2. Keep your Center Code safe - you can share it to earn rewards
3. Prepare for the examination

For any queries, contact us at ${APP_CONFIG.supportEmail}

Best regards,
${APP_CONFIG.organization}
      `
    },
    hi: {
      subject: 'पंजीकरण सफल - जीपीएचडीएम छात्रवृत्ति परीक्षा',
      body: `
प्रिय {{studentName}},

बधाई हो! ${APP_CONFIG.fullName} के लिए आपका पंजीकरण सफलतापूर्वक पूरा हो गया है।

पंजीकरण विवरण:
- नाम: {{studentName}}
- कक्षा: {{class}}
- सेंटर कोड: {{centerCode}}
- ईमेल: {{studentEmail}}

अगले कदम:
1. अपनी परीक्षा स्लॉट की पुष्टि के लिए भुगतान करें
2. अपना सेंटर कोड सुरक्षित रखें - इसे साझा करके पुरस्कार प्राप्त करें
3. परीक्षा की तैयारी करें

किसी भी प्रश्न के लिए, ${APP_CONFIG.supportEmail} पर संपर्क करें

सादर,
${APP_CONFIG.organization}
      `
    }
  },
  PAYMENT_RECEIPT: {
    en: {
      subject: 'Payment Confirmation - GPHDM Scholarship Examination',
      body: `
Dear {{studentName}},

Your payment has been received successfully. Below are your payment details:

Payment Details:
- Payment ID: {{paymentId}}
- Amount: {{amount}}
- Date: {{date}}
- Status: SUCCESS

Your examination slot is now confirmed. You will receive exam schedule details shortly.

Important:
- Keep this email for your records
- Your Center Code: {{centerCode}}

For any queries, contact us at ${APP_CONFIG.supportEmail}

Best regards,
${APP_CONFIG.organization}
      `
    },
    hi: {
      subject: 'भुगतान पुष्टि - जीपीएचडीएम छात्रवृत्ति परीक्षा',
      body: `
प्रिय {{studentName}},

आपका भुगतान सफलतापूर्वक प्राप्त हो गया है। नीचे आपके भुगतान का विवरण है:

भुगतान विवरण:
- भुगतान आईडी: {{paymentId}}
- राशि: {{amount}}
- तिथि: {{date}}
- स्थिति: सफल

आपकी परीक्षा स्लॉट अब पुष्ट है। आपको जल्द ही परीक्षा कार्यक्रम का विवरण प्राप्त होगा।

महत्वपूर्ण:
- इस ईमेल को अपने रिकॉर्ड के लिए रखें
- आपका सेंटर कोड: {{centerCode}}

किसी भी प्रश्न के लिए, ${APP_CONFIG.supportEmail} पर संपर्क करें

सादर,
${APP_CONFIG.organization}
      `
    }
  },
  EXAM_REMINDER: {
    en: {
      subject: 'Exam Reminder - GPHDM Scholarship Examination',
      body: `
Dear {{studentName}},

This is a reminder that your examination is scheduled soon.

Examination Details:
- Class: {{class}}
- Date: {{examDate}}
- Duration: 60 questions
- Time per question: 5-7 seconds

Important Instructions:
1. Ensure stable internet connection
2. Use a laptop or computer for best experience
3. Keep your registered mobile handy for OTP verification
4. Start exam on time - late entry not allowed

Login to your dashboard to start the exam: ${APP_CONFIG.supportEmail}

Best of luck!

${APP_CONFIG.organization}
      `
    },
    hi: {
      subject: 'परीक्षा अनुस्मारक - जीपीएचडीएम छात्रवृत्ति परीक्षा',
      body: `
प्रिय {{studentName}},

यह एक अनुस्मारक है कि आपकी परीक्षा जल्द ही निर्धारित है।

परीक्षा विवरण:
- कक्षा: {{class}}
- तिथि: {{examDate}}
- अवधि: 60 प्रश्न
- प्रति प्रश्न समय: 5-7 सेकंड

महत्वपूर्ण निर्देश:
1. स्थिर इंटरनेट कनेक्शन सुनिश्चित करें
2. सर्वोत्तम अनुभव के लिए लैपटॉप या कंप्यूटर का उपयोग करें
3. OTP सत्यापन के लिए पंजीकृत मोबाइल तैयार रखें
4. समय पर परीक्षा शुरू करें - देर से प्रवेश की अनुमति नहीं है

परीक्षा शुरू करने के लिए अपने डैशबोर्ड में लॉगिन करें।

शुभकामनाएं!

${APP_CONFIG.organization}
      `
    }
  },
  RESULT_ANNOUNCEMENT: {
    en: {
      subject: 'Your Results are Available - GPHDM Scholarship Examination',
      body: `
Dear {{studentName}},

Your examination results have been declared! We are pleased to share your performance details.

Result Summary:
- Class: {{class}}
- Score: {{score}} marks
- Rank: {{rank}}
- Status: {{status}}

{{#scholarship}}
Congratulations! You are eligible for a scholarship of {{scholarshipAmount}}.
{{/scholarship}}

To view your detailed results and download your certificate, please login to your student dashboard.

Best regards,
${APP_CONFIG.organization}
      `
    },
    hi: {
      subject: 'आपके परिणाम उपलब्ध हैं - जीपीएचडीएम छात्रवृत्ति परीक्षा',
      body: `
प्रिय {{studentName}},

आपके परीक्षा परिणाम घोषित हो गए हैं! हमें आपके प्रदर्शन का विवरण साझा करते हुए खुशी हो रही है।

परिणाम सारांश:
- कक्षा: {{class}}
- अंक: {{score}}
- रैंक: {{rank}}
- स्थिति: {{status}}

{{#scholarship}}
बधाई हो! आप {{scholarshipAmount}} की छात्रवृत्ति के पात्र हैं।
{{/scholarship}}

अपने विस्तृत परिणाम देखने और प्रमाणपत्र डाउनलोड करने के लिए, कृपया अपने छात्र डैशबोर्ड में लॉगिन करें।

सादर,
${APP_CONFIG.organization}
      `
    }
  },
  CERTIFICATE_ISSUED: {
    en: {
      subject: 'Certificate Issued - GPHDM Scholarship Examination',
      body: `
Dear {{studentName}},

Congratulations! Your certificate has been issued successfully.

Certificate Details:
- Certificate ID: {{certificateId}}
- Type: {{certificateType}}
- Class: {{class}}
- Rank: {{rank}}
- Issue Date: {{date}}

You can download your certificate from your student dashboard or verify it online at any time using the certificate ID.

Verification Link: https://gphdm.edu.in/verify/{{certificateId}}

Best regards,
${APP_CONFIG.organization}
      `
    },
    hi: {
      subject: 'प्रमाणपत्र जारी - जीपीएचडीएम छात्रवृत्ति परीक्षा',
      body: `
प्रिय {{studentName}},

बधाई हो! आपका प्रमाणपत्र सफलतापूर्वक जारी कर दिया गया है।

प्रमाणपत्र विवरण:
- प्रमाणपत्र आईडी: {{certificateId}}
- प्रकार: {{certificateType}}
- कक्षा: {{class}}
- रैंक: {{rank}}
- जारी तिथि: {{date}}

आप अपने छात्र डैशबोर्ड से अपना प्रमाणपत्र डाउनलोड कर सकते हैं या प्रमाणपत्र आईडी का उपयोग करके किसी भी समय ऑनलाइन सत्यापित कर सकते हैं।

सत्यापन लिंक: https://gphdm.edu.in/verify/{{certificateId}}

सादर,
${APP_CONFIG.organization}
      `
    }
  },
  SCHOLARSHIP_APPROVED: {
    en: {
      subject: 'Scholarship Approved - GPHDM',
      body: `
Dear {{studentName}},

Great news! Your scholarship has been approved.

Scholarship Details:
- Amount: {{scholarshipAmount}}
- Rank: {{rank}}
- Class: {{class}}
- Approval Date: {{date}}

The scholarship amount has been credited to your student wallet. You can view your wallet balance and transaction history in your dashboard.

Congratulations on your achievement!

Best regards,
${APP_CONFIG.organization}
      `
    },
    hi: {
      subject: 'छात्रवृत्ति स्वीकृत - जीपीएचडीएम',
      body: `
प्रिय {{studentName}},

शुभ समाचार! आपकी छात्रवृत्ति स्वीकृत हो गई है।

छात्रवृत्ति विवरण:
- राशि: {{scholarshipAmount}}
- रैंक: {{rank}}
- कक्षा: {{class}}
- स्वीकृति तिथि: {{date}}

छात्रवृत्ति राशि आपके छात्र वॉलेट में जमा कर दी गई है। आप अपने डैशबोर्ड में अपना वॉलेट बैलेंस और लेनदेन इतिहास देख सकते हैं।

आपकी उपलब्धि पर बधाई!

सादर,
${APP_CONFIG.organization}
      `
    }
  },
  CENTER_APPROVED: {
    en: {
      subject: 'Center Application Approved - GPHDM',
      body: `
Dear {{centerName}},

Congratulations! Your center registration has been approved.

Center Details:
- Center Name: {{centerName}}
- Center Code: {{centerCode}}
- Status: APPROVED
- Approval Date: {{date}}

You can now start referring students using your unique Center Code. For each successful registration, you will earn ₹50.

Login to your center dashboard to track your referrals and earnings.

Best regards,
${APP_CONFIG.organization}
      `
    },
    hi: {
      subject: 'केंद्र आवेदन स्वीकृत - जीपीएचडीएम',
      body: `
प्रिय {{centerName}},

बधाई हो! आपका केंद्र पंजीकरण स्वीकृत हो गया है।

केंद्र विवरण:
- केंद्र का नाम: {{centerName}}
- सेंटर कोड: {{centerCode}}
- स्थिति: स्वीकृत
- स्वीकृति तिथि: {{date}}

अब आप अपने यूनिक सेंटर कोड का उपयोग करके छात्रों को रेफर करना शुरू कर सकते हैं। प्रत्येक सफल पंजीकरण के लिए, आप ₹50 कमाएंगे।

अपने रेफरल और कमाई को ट्रैक करने के लिए अपने सेंटर डैशबोर्ड में लॉगिन करें।

सादर,
${APP_CONFIG.organization}
      `
    }
  }
};

// Generate email content based on type and language
export function generateEmail(
  type: EmailNotificationType,
  data: EmailTemplateData,
  language: 'en' | 'hi' = 'en'
): GeneratedEmail {
  const template = emailTemplates[type][language];
  
  let subject = template.subject;
  let body = template.body;
  
  // Replace placeholders
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    let displayValue = value;
    
    // Format specific values
    if (key === 'amount' || key === 'scholarshipAmount') {
      displayValue = formatCurrency(value as number);
    } else if (key === 'date') {
      displayValue = formatDate(value as string);
    }
    
    subject = subject.replace(placeholder, String(displayValue));
    body = body.replace(placeholder, String(displayValue));
  });
  
  // Handle conditional blocks
  body = body.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, key, content) => {
    return data[key] ? content : '';
  });
  
  // Create HTML version
  const bodyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px 20px; border: 1px solid #e5e7eb; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        pre { white-space: pre-wrap; font-family: inherit; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${APP_CONFIG.shortName}</h1>
          <p>${APP_CONFIG.fullName}</p>
        </div>
        <div class="content">
          <pre>${body.trim()}</pre>
        </div>
        <div class="footer">
          <p>${APP_CONFIG.organization}</p>
          <p>Email: ${APP_CONFIG.supportEmail} | Phone: ${APP_CONFIG.supportPhone}</p>
          <p>© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return {
    subject,
    bodyHtml,
    bodyText: body.trim()
  };
}

// Send email notification (simulated)
export function sendEmailNotification(
  type: EmailNotificationType,
  recipientEmail: string,
  data: EmailTemplateData,
  language: 'en' | 'hi' = 'en'
): { success: boolean; emailId: string } {
  const email = generateEmail(type, data, language);
  
  // Log to localStorage for demo
  const emailLogs = JSON.parse(localStorage.getItem('gphdm_email_notifications') || '[]');
  const emailId = `EMAIL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const emailLog = {
    id: emailId,
    type,
    recipientEmail,
    subject: email.subject,
    status: Math.random() > 0.1 ? 'SENT' : 'FAILED', // 90% success rate
    sentAt: new Date().toISOString(),
    language,
  };
  
  emailLogs.push(emailLog);
  localStorage.setItem('gphdm_email_notifications', JSON.stringify(emailLogs));
  
  console.log(`[Email Notification] ${type} sent to ${recipientEmail}`);
  console.log(`Subject: ${email.subject}`);
  
  return {
    success: emailLog.status === 'SENT',
    emailId
  };
}

// Get email notification history
export function getEmailNotificationHistory(studentId?: string): any[] {
  const emailLogs = JSON.parse(localStorage.getItem('gphdm_email_notifications') || '[]');
  if (studentId) {
    return emailLogs.filter((log: any) => log.studentId === studentId);
  }
  return emailLogs;
}
