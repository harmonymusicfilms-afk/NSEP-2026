import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Student, ExamResult, Certificate, Scholarship } from '@/types';
import { formatDateTime, getOrdinal } from './utils';
import { APP_CONFIG } from '@/constants/config';

interface CertificateData {
  student: Student;
  result: ExamResult;
  certificate: Certificate;
  scholarship?: Scholarship;
  totalStudents: number;
}

export async function generateCertificatePDF(data: CertificateData): Promise<jsPDF> {
  const { student, result, certificate, scholarship, totalStudents } = data;
  
  // Create PDF (A4 landscape for certificate)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Colors (institutional blue and gold)
  const primaryBlue = '#1e3a8a';
  const accentGold = '#d97706';
  const darkText = '#1f2937';
  const lightText = '#6b7280';

  // Border design
  pdf.setDrawColor(30, 58, 138); // Primary blue
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  pdf.setDrawColor(217, 119, 6); // Accent gold
  pdf.setLineWidth(0.5);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Header section
  let yPos = 25;

  // Organization logo/seal (decorative circle)
  pdf.setFillColor(30, 58, 138);
  pdf.circle(pageWidth / 2, yPos + 5, 8, 'F');
  
  pdf.setFillColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NSEP', pageWidth / 2, yPos + 7, { align: 'center' });

  yPos += 20;

  // Title
  pdf.setTextColor(30, 58, 138);
  pdf.setFontSize(32);
  pdf.setFont('times', 'bold');
  pdf.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  // Subtitle
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('National Scholarship Examination Programme', pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;

  // Decorative line
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);

  yPos += 15;

  // Main content
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This is to certify that', pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;

  // Student name (prominent)
  pdf.setTextColor(30, 58, 138);
  pdf.setFontSize(24);
  pdf.setFont('times', 'bold');
  pdf.text(student.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;

  // Father's name
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`S/D/W of ${student.fatherName}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  // Achievement text
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const achievementText = `has successfully completed the ${APP_CONFIG.fullName} examination for Class ${student.class}`;
  pdf.text(achievementText, pageWidth / 2, yPos, { align: 'center' });

  yPos += 6;
  pdf.text(`and secured an outstanding rank of ${getOrdinal(result.rank || 0)} position`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 6;
  pdf.text(`out of ${totalStudents} participants with a remarkable score of ${result.totalScore} marks.`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Performance box
  const boxWidth = 180;
  const boxX = (pageWidth - boxWidth) / 2;
  
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(boxX, yPos, boxWidth, 25, 3, 3, 'FD');

  // Performance details in columns
  const col1X = boxX + 15;
  const col2X = boxX + 70;
  const col3X = boxX + 125;
  const detailY = yPos + 8;

  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'normal');

  // Column 1
  pdf.text('Class Rank:', col1X, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 58, 138);
  pdf.text(getOrdinal(result.rank || 0), col1X, detailY + 5);

  // Column 2
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Total Score:', col2X, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 58, 138);
  pdf.text(`${result.totalScore} marks`, col2X, detailY + 5);

  // Column 3
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Accuracy:', col3X, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 58, 138);
  const accuracy = Math.round((result.correctCount / (result.correctCount + result.wrongCount + result.unansweredCount)) * 100);
  pdf.text(`${accuracy}%`, col3X, detailY + 5);

  // Row 2
  const detail2Y = detailY + 12;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Correct:', col1X, detail2Y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94);
  pdf.text(`${result.correctCount}`, col1X, detail2Y + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Wrong:', col2X, detail2Y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(239, 68, 68);
  pdf.text(`${result.wrongCount}`, col2X, detail2Y + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Certificate ID:', col3X, detail2Y);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(8);
  pdf.text(certificate.certificateId, col3X, detail2Y + 5);

  yPos += 35;

  // Scholarship section (if applicable)
  if (scholarship && scholarship.approvalStatus === 'APPROVED') {
    yPos += 5;
    
    pdf.setFillColor(220, 252, 231);
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(1);
    pdf.roundedRect(boxX, yPos, boxWidth, 15, 3, 3, 'FD');

    pdf.setFontSize(11);
    pdf.setTextColor(22, 101, 52);
    pdf.setFont('helvetica', 'bold');
    const scholarshipText = scholarship.amount 
      ? `🏆 Awarded Scholarship: ₹${scholarship.amount.toLocaleString('en-IN')}`
      : `🏆 ${scholarship.scholarshipType} Scholarship Awarded`;
    pdf.text(scholarshipText, pageWidth / 2, yPos + 10, { align: 'center' });

    yPos += 20;
  }

  // QR Code (bottom left)
  const qrSize = 25;
  const qrX = 20;
  const qrY = pageHeight - 35;

  try {
    const verificationUrl = `${window.location.origin}/verify?id=${certificate.certificateId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });
    
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    
    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scan to Verify', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
  } catch (error) {
    console.error('QR code generation failed:', error);
  }

  // Date and signatures section (bottom)
  const signatureY = pageHeight - 30;
  const leftSignX = pageWidth / 4;
  const rightSignX = (3 * pageWidth) / 4;

  // Issue date
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Date of Issue:', leftSignX - 15, signatureY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text(formatDateTime(certificate.issuedAt).split(',')[0], leftSignX - 15, signatureY + 5);

  // Signature lines
  pdf.setDrawColor(107, 114, 128);
  pdf.setLineWidth(0.3);
  pdf.line(leftSignX + 20, signatureY + 8, leftSignX + 60, signatureY + 8);
  pdf.line(rightSignX - 20, signatureY + 8, rightSignX + 20, signatureY + 8);

  // Signature labels
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Director', leftSignX + 40, signatureY + 13, { align: 'center' });
  pdf.text(APP_CONFIG.shortName, leftSignX + 40, signatureY + 17, { align: 'center' });
  
  pdf.text('Authorized Signatory', rightSignX, signatureY + 13, { align: 'center' });
  pdf.text('Academic Board', rightSignX, signatureY + 17, { align: 'center' });

  // Official seal (decorative)
  pdf.setDrawColor(217, 119, 6);
  pdf.setLineWidth(1.5);
  pdf.circle(rightSignX + 45, signatureY, 10);
  pdf.setFontSize(6);
  pdf.setTextColor(217, 119, 6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OFFICIAL', rightSignX + 45, signatureY - 1, { align: 'center' });
  pdf.text('SEAL', rightSignX + 45, signatureY + 3, { align: 'center' });

  // Footer
  pdf.setFontSize(7);
  pdf.setTextColor(156, 163, 175);
  pdf.setFont('helvetica', 'italic');
  const footerText = `This is a computer-generated certificate and does not require a physical signature. Verify authenticity at ${window.location.origin}/verify`;
  pdf.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

  return pdf;
}

export function downloadCertificate(pdf: jsPDF, studentName: string, certificateId: string) {
  const fileName = `NSEP_Certificate_${studentName.replace(/\s+/g, '_')}_${certificateId}.pdf`;
  pdf.save(fileName);
}
