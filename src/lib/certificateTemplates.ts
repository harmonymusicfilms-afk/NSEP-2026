import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Student, ExamResult, Certificate, Scholarship, CertificateTemplateConfig } from '@/types';
import { formatDateTime, getOrdinal } from './utils';

interface CertificateData {
  student: Student;
  result: ExamResult;
  certificate: Certificate;
  scholarship?: Scholarship;
  totalStudents: number;
}

// Utility to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 30, g: 58, b: 138 };
}

// Generate QR code
async function generateQRCode(certificateId: string): Promise<string> {
  try {
    const verificationUrl = `${window.location.origin}/verify?id=${certificateId}`;
    return await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    return '';
  }
}

// CLASSIC TEMPLATE - Traditional, formal, government-style
export async function generateClassicCertificate(
  data: CertificateData,
  config: CertificateTemplateConfig
): Promise<jsPDF> {
  const { student, result, certificate, scholarship, totalStudents } = data;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const primary = hexToRgb(config.primaryColor);
  const accent = hexToRgb(config.accentColor);

  // Double border frame
  pdf.setDrawColor(primary.r, primary.g, primary.b);
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(0.5);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  let yPos = 25;

  // Institution seal/logo (circle)
  pdf.setFillColor(primary.r, primary.g, primary.b);
  pdf.circle(pageWidth / 2, yPos + 5, 8, 'F');
  pdf.setFillColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(config.sealText, pageWidth / 2, yPos + 7, { align: 'center' });

  yPos += 20;

  // Title
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(32);
  pdf.setFont('times', 'bold');
  pdf.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  // Institution name
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(config.institutionName, pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;

  // Decorative line
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);

  yPos += 15;

  // Content
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This is to certify that', pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;

  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(24);
  pdf.setFont('times', 'bold');
  pdf.text(student.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;

  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`S/D/W of ${student.fatherName}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`has successfully completed the examination for Class ${student.class}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  pdf.text(`and secured ${getOrdinal(result.rank || 0)} position out of ${totalStudents} participants`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  pdf.text(`with a remarkable score of ${result.totalScore} marks.`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Performance box
  const boxWidth = 180;
  const boxX = (pageWidth - boxWidth) / 2;
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(boxX, yPos, boxWidth, 25, 3, 3, 'FD');

  const col1X = boxX + 15;
  const col2X = boxX + 70;
  const col3X = boxX + 125;
  const detailY = yPos + 8;

  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Rank:', col1X, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.text(getOrdinal(result.rank || 0), col1X, detailY + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Score:', col2X, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.text(`${result.totalScore}`, col2X, detailY + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Accuracy:', col3X, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primary.r, primary.g, primary.b);
  const accuracy = Math.round((result.correctCount / (result.correctCount + result.wrongCount + result.unansweredCount)) * 100);
  pdf.text(`${accuracy}%`, col3X, detailY + 5);

  yPos += 35;

  // Scholarship
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

  // QR Code
  const qrSize = 25;
  const qrX = 20;
  const qrY = pageHeight - 35;
  const qrDataUrl = await generateQRCode(certificate.certificateId);
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scan to Verify', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
  }

  // Signatures
  const signatureY = pageHeight - 30;
  const leftSignX = pageWidth / 4;
  const rightSignX = (3 * pageWidth) / 4;

  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Date:', leftSignX - 15, signatureY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(31, 41, 55);
  pdf.text(formatDateTime(certificate.issuedAt).split(',')[0], leftSignX - 15, signatureY + 5);

  pdf.setDrawColor(107, 114, 128);
  pdf.setLineWidth(0.3);
  pdf.line(leftSignX + 20, signatureY + 8, leftSignX + 60, signatureY + 8);
  pdf.line(rightSignX - 20, signatureY + 8, rightSignX + 20, signatureY + 8);

  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Director', leftSignX + 40, signatureY + 13, { align: 'center' });
  pdf.text('Authorized Signatory', rightSignX, signatureY + 13, { align: 'center' });

  // Official seal
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(1.5);
  pdf.circle(rightSignX + 45, signatureY, 10);
  pdf.setFontSize(6);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OFFICIAL', rightSignX + 45, signatureY - 1, { align: 'center' });
  pdf.text('SEAL', rightSignX + 45, signatureY + 3, { align: 'center' });

  return pdf;
}

// MODERN TEMPLATE - Clean, minimalist, contemporary design
export async function generateModernCertificate(
  data: CertificateData,
  config: CertificateTemplateConfig
): Promise<jsPDF> {
  const { student, result, certificate, scholarship, totalStudents } = data;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const primary = hexToRgb(config.primaryColor);
  const accent = hexToRgb(config.accentColor);

  // Gradient-style header bar
  pdf.setFillColor(primary.r, primary.g, primary.b);
  pdf.rect(0, 0, pageWidth, 40, 'F');

  // Accent stripe
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 37, pageWidth, 3, 'F');

  // Title in header
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE', pageWidth / 2, 15, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(config.institutionName, pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.text(config.tagline, pageWidth / 2, 32, { align: 'center' });

  let yPos = 60;

  // Content area with clean typography
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This certifies that', pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  // Student name - bold and large
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(student.name, pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;

  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Child of / Ward of ${student.fatherName}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Achievement text
  pdf.setTextColor(60, 60, 60);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`has achieved exceptional results in the Class ${student.class} Examination`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  pdf.text(`securing Rank ${result.rank || 0} among ${totalStudents} participants`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;

  // Stats cards
  const cardWidth = 55;
  const cardHeight = 35;
  const cardGap = 8;
  const totalCardsWidth = cardWidth * 3 + cardGap * 2;
  const startX = (pageWidth - totalCardsWidth) / 2;

  // Card 1: Rank
  pdf.setFillColor(primary.r, primary.g, primary.b, 0.1);
  pdf.setDrawColor(primary.r, primary.g, primary.b);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(startX, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(getOrdinal(result.rank || 0), startX + cardWidth / 2, yPos + 15, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('CLASS RANK', startX + cardWidth / 2, yPos + 25, { align: 'center' });

  // Card 2: Score
  pdf.setFillColor(accent.r, accent.g, accent.b, 0.1);
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.roundedRect(startX + cardWidth + cardGap, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(result.totalScore.toString(), startX + cardWidth + cardGap + cardWidth / 2, yPos + 15, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('TOTAL SCORE', startX + cardWidth + cardGap + cardWidth / 2, yPos + 25, { align: 'center' });

  // Card 3: Accuracy
  const accuracy = Math.round((result.correctCount / (result.correctCount + result.wrongCount + result.unansweredCount)) * 100);
  pdf.setFillColor(34, 197, 94, 0.1);
  pdf.setDrawColor(34, 197, 94);
  pdf.roundedRect(startX + (cardWidth + cardGap) * 2, yPos, cardWidth, cardHeight, 2, 2, 'FD');
  
  pdf.setTextColor(34, 197, 94);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${accuracy}%`, startX + (cardWidth + cardGap) * 2 + cardWidth / 2, yPos + 15, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('ACCURACY', startX + (cardWidth + cardGap) * 2 + cardWidth / 2, yPos + 25, { align: 'center' });

  yPos += 50;

  // Scholarship ribbon
  if (scholarship && scholarship.approvalStatus === 'APPROVED') {
    pdf.setFillColor(accent.r, accent.g, accent.b);
    pdf.rect(0, yPos, pageWidth, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const scholarshipText = scholarship.amount
      ? `★ SCHOLARSHIP AWARDED: ₹${scholarship.amount.toLocaleString('en-IN')} ★`
      : `★ ${scholarship.scholarshipType} SCHOLARSHIP ★`;
    pdf.text(scholarshipText, pageWidth / 2, yPos + 8, { align: 'center' });
    
    yPos += 18;
  }

  // Footer section
  const footerY = pageHeight - 35;
  
  // QR Code
  const qrSize = 20;
  const qrX = 15;
  const qrDataUrl = await generateQRCode(certificate.certificateId);
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', qrX, footerY, qrSize, qrSize);
  }

  // Certificate details
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Certificate ID: ${certificate.certificateId}`, qrX + qrSize + 5, footerY + 5);
  pdf.text(`Issue Date: ${formatDateTime(certificate.issuedAt).split(',')[0]}`, qrX + qrSize + 5, footerY + 12);

  // Signature line
  const signX = pageWidth - 60;
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.line(signX, footerY + 10, signX + 45, footerY + 10);
  
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Authorized Signature', signX + 22.5, footerY + 15, { align: 'center' });

  return pdf;
}

// PRESTIGIOUS TEMPLATE - Elegant, ornate, premium design
export async function generatePrestigiousCertificate(
  data: CertificateData,
  config: CertificateTemplateConfig
): Promise<jsPDF> {
  const { student, result, certificate, scholarship, totalStudents } = data;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const primary = hexToRgb(config.primaryColor);
  const accent = hexToRgb(config.accentColor);

  // Ornate border with multiple layers
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(3);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

  pdf.setDrawColor(primary.r, primary.g, primary.b);
  pdf.setLineWidth(0.5);
  pdf.rect(11, 11, pageWidth - 22, pageHeight - 22);

  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(0.3);
  pdf.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Decorative corners (simple geometric patterns)
  pdf.setFillColor(accent.r, accent.g, accent.b);
  // Top-left corner
  pdf.triangle(15, 15, 25, 15, 15, 25, 'F');
  // Top-right corner
  pdf.triangle(pageWidth - 15, 15, pageWidth - 25, 15, pageWidth - 15, 25, 'F');
  // Bottom-left corner
  pdf.triangle(15, pageHeight - 15, 25, pageHeight - 15, 15, pageHeight - 25, 'F');
  // Bottom-right corner
  pdf.triangle(pageWidth - 15, pageHeight - 15, pageWidth - 25, pageHeight - 15, pageWidth - 15, pageHeight - 25, 'F');

  let yPos = 30;

  // Emblem/crest
  pdf.setFillColor(primary.r, primary.g, primary.b);
  pdf.circle(pageWidth / 2, yPos, 12, 'F');
  
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.circle(pageWidth / 2, yPos, 10, 'F');
  
  pdf.setFillColor(255, 255, 255);
  pdf.circle(pageWidth / 2, yPos, 8, 'F');
  
  pdf.setFillColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(config.sealText, pageWidth / 2, yPos + 1.5, { align: 'center' });

  yPos += 20;

  // Decorative line
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 60, yPos, pageWidth / 2 - 10, yPos);
  pdf.line(pageWidth / 2 + 10, yPos, pageWidth / 2 + 60, yPos);
  
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.circle(pageWidth / 2, yPos, 1.5, 'F');

  yPos += 8;

  // Title with elegance
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(34);
  pdf.setFont('times', 'bold');
  pdf.text('Certificate of Excellence', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;

  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.setFontSize(11);
  pdf.setFont('times', 'italic');
  pdf.text(config.institutionName, pageWidth / 2, yPos, { align: 'center' });

  yPos += 5;

  pdf.setFontSize(9);
  pdf.text(config.tagline, pageWidth / 2, yPos, { align: 'center' });

  yPos += 18;

  // Formal text
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(10);
  pdf.setFont('times', 'italic');
  pdf.text('In recognition of outstanding academic achievement', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;

  pdf.text('this certificate is proudly presented to', pageWidth / 2, yPos, { align: 'center' });

  yPos += 14;

  // Student name with underline
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(26);
  pdf.setFont('times', 'bold');
  pdf.text(student.name, pageWidth / 2, yPos, { align: 'center' });

  // Decorative underline
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(0.8);
  pdf.line(pageWidth / 2 - 70, yPos + 2, pageWidth / 2 + 70, yPos + 2);

  yPos += 10;

  pdf.setTextColor(80, 80, 80);
  pdf.setFontSize(9);
  pdf.setFont('times', 'italic');
  pdf.text(`S/D/Ward of ${student.fatherName}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  // Achievement description
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(10);
  pdf.setFont('times', 'normal');
  pdf.text(`For demonstrating exceptional knowledge and securing the esteemed`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  pdf.setFont('times', 'bold');
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text(`${getOrdinal(result.rank || 0)} Rank`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  pdf.setFont('times', 'normal');
  pdf.setTextColor(40, 40, 40);
  pdf.text(`in the Class ${student.class} GPHDM Scholarship Examination`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  pdf.text(`out of ${totalStudents} distinguished participants with a score of ${result.totalScore} marks`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Achievement panel with gold accent
  const panelWidth = 160;
  const panelX = (pageWidth - panelWidth) / 2;
  
  pdf.setFillColor(accent.r, accent.g, accent.b, 0.15);
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(1);
  pdf.roundedRect(panelX, yPos, panelWidth, 22, 1, 1, 'FD');

  const itemY = yPos + 8;
  const item1X = panelX + 25;
  const item2X = panelX + 80;
  const item3X = panelX + 135;

  pdf.setFontSize(8);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Rank', item1X, itemY, { align: 'center' });
  pdf.text('Score', item2X, itemY, { align: 'center' });
  pdf.text('Correct', item3X, itemY, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFont('helvetica', 'bold');
  pdf.text(getOrdinal(result.rank || 0), item1X, itemY + 9, { align: 'center' });
  pdf.text(result.totalScore.toString(), item2X, itemY + 9, { align: 'center' });
  pdf.text(result.correctCount.toString(), item3X, itemY + 9, { align: 'center' });

  yPos += 32;

  // Scholarship medal
  if (scholarship && scholarship.approvalStatus === 'APPROVED') {
    pdf.setFillColor(accent.r, accent.g, accent.b);
    pdf.circle(pageWidth / 2, yPos, 8, 'F');
    
    pdf.setFillColor(255, 215, 0);
    pdf.circle(pageWidth / 2, yPos, 6.5, 'F');

    pdf.setFontSize(8);
    pdf.setTextColor(primary.r, primary.g, primary.b);
    pdf.setFont('helvetica', 'bold');
    pdf.text('★', pageWidth / 2, yPos + 1.5, { align: 'center' });

    yPos += 12;

    pdf.setFontSize(10);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.setFont('times', 'bold');
    const scholarshipText = scholarship.amount
      ? `Scholarship Award: ₹${scholarship.amount.toLocaleString('en-IN')}`
      : `${scholarship.scholarshipType} Scholarship Recipient`;
    pdf.text(scholarshipText, pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
  }

  // Footer with signatures
  const footerY = pageHeight - 32;

  // Date on left
  pdf.setFontSize(9);
  pdf.setTextColor(60, 60, 60);
  pdf.setFont('times', 'normal');
  pdf.text('Date of Issue:', 25, footerY);
  pdf.setFont('times', 'bold');
  pdf.text(formatDateTime(certificate.issuedAt).split(',')[0], 25, footerY + 5);

  // Signature lines
  const sig1X = pageWidth / 2 - 50;
  const sig2X = pageWidth / 2 + 50;

  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.line(sig1X - 20, footerY + 12, sig1X + 20, footerY + 12);
  pdf.line(sig2X - 20, footerY + 12, sig2X + 20, footerY + 12);

  pdf.setFontSize(8);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('times', 'normal');
  pdf.text('Director', sig1X, footerY + 18, { align: 'center' });
  pdf.text(config.institutionName, sig1X, footerY + 23, { align: 'center' });
  
  pdf.text('Academic Officer', sig2X, footerY + 18, { align: 'center' });
  pdf.text('Examination Board', sig2X, footerY + 23, { align: 'center' });

  // Official seal
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(2);
  pdf.circle(pageWidth - 30, footerY + 5, 12);
  
  pdf.setFontSize(7);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OFFICIAL', pageWidth - 30, footerY + 3, { align: 'center' });
  pdf.text('SEAL', pageWidth - 30, footerY + 8, { align: 'center' });

  // QR Code
  const qrSize = 18;
  const qrX = 25;
  const qrY = footerY + 12;
  const qrDataUrl = await generateQRCode(certificate.certificateId);
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  }

  // Certificate ID
  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('courier', 'normal');
  pdf.text(`ID: ${certificate.certificateId}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

  return pdf;
}

export async function generateCertificateByTemplate(
  template: 'CLASSIC' | 'MODERN' | 'PRESTIGIOUS',
  data: CertificateData,
  config: CertificateTemplateConfig
): Promise<jsPDF> {
  switch (template) {
    case 'CLASSIC':
      return generateClassicCertificate(data, config);
    case 'MODERN':
      return generateModernCertificate(data, config);
    case 'PRESTIGIOUS':
      return generatePrestigiousCertificate(data, config);
    default:
      return generateClassicCertificate(data, config);
  }
}
