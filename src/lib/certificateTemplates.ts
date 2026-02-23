import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Student, ExamResult, Certificate, Scholarship, CertificateTemplateConfig } from '@/types';
import { formatDateTime, getOrdinal, getDivision } from './utils';

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

// Helper to load image as base64
async function loadImage(url: string): Promise<string> {
  if (!url) return '';
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load image:', url, error);
    return '';
  }
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

  const primary = hexToRgb(config.primaryColor || '#1e3a8a'); // Default Navy Blue
  const accent = hexToRgb(config.accentColor || '#ca8a04');  // Default Gold

  // --- BORDER DESIGN ---
  // Outer Gold Border
  pdf.setDrawColor(accent.r, accent.g, accent.b);
  pdf.setLineWidth(1.5);
  pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);

  // Inner Blue Border
  pdf.setDrawColor(primary.r, primary.g, primary.b);
  pdf.setLineWidth(3);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Decorative Corner Ornaments (Simple geometric for professional look)
  pdf.setFillColor(primary.r, primary.g, primary.b);
  const ornamentSize = 15;
  // Top Left
  pdf.triangle(8, 8, 8 + ornamentSize, 8, 8, 8 + ornamentSize, 'F');
  // Top Right
  pdf.triangle(pageWidth - 8, 8, pageWidth - 8 - ornamentSize, 8, pageWidth - 8, 8 + ornamentSize, 'F');
  // Bottom Left
  pdf.triangle(8, pageHeight - 8, 8 + ornamentSize, pageHeight - 8, 8, pageHeight - 8 - ornamentSize, 'F');
  // Bottom Right
  pdf.triangle(pageWidth - 8, pageHeight - 8, pageWidth - 8 - ornamentSize, pageHeight - 8, pageWidth - 8, pageHeight - 8 - ornamentSize, 'F');

  let yPos = 30;

  // --- LOGO / SEAL (Code Generated for Reliability) ---
  // Draw a professional seal if no image is provided or as a fallback
  const sealBase64 = config.sealUrl ? await loadImage(config.sealUrl) : '';

  if (sealBase64 && sealBase64.startsWith('data:image/png')) {
    // Only use image if it's a PNG/JPEG (SVG support is flaky)
    pdf.addImage(sealBase64, 'PNG', pageWidth / 2 - 12, yPos - 12, 24, 24);
  } else {
    // Draw GPHDM Seal Placeholder for Classic
    const sealX = pageWidth / 2;
    const sealY = yPos;
    const sealR = 12;

    // Outer Ring (Simple for Classic)
    pdf.setDrawColor(primary.r, primary.g, primary.b);
    pdf.setLineWidth(1);
    pdf.setFillColor(255, 255, 255);
    pdf.circle(sealX, sealY, sealR, 'FD');

    // Inner Text
    pdf.setTextColor(primary.r, primary.g, primary.b);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(config.sealText.substring(0, 5), sealX, sealY + 1, { align: 'center', baseline: 'middle' });
  }

  yPos += 20;

  // --- HEADER TEXT ---
  // Organization Name
  // Title
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(32);
  pdf.setFont('times', 'bold');
  pdf.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;
  // Use Hardcoded Name if likely default, otherwise use config
  // Institution name (Regular Classic Style)
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(config.institutionName, pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;

  // Tagline / Reg No
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Empowering rural education through technology', pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Certificate Title
  pdf.setTextColor(accent.r, accent.g, accent.b); // Gold
  pdf.setFontSize(36);
  pdf.setFont('times', 'bold');
  pdf.text('CERTIFICATE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  pdf.setFontSize(16);
  pdf.setCharSpace(2); // Spacing for "OF ACHIEVEMENT"
  pdf.text('OF ACHIEVEMENT', pageWidth / 2, yPos, { align: 'center' });
  pdf.setCharSpace(0); // Reset

  yPos += 15;

  // Separator Line
  pdf.setDrawColor(primary.r, primary.g, primary.b);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);

  yPos += 15;

  // --- BODY CONTENT ---
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This is to certify that', pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  // Student Name
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFontSize(28);
  pdf.setFont('times', 'bold italic');
  pdf.text(student.name, pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;

  // Parent Name
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`S/D/W of ${student.fatherName}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Achievement Text
  pdf.setTextColor(31, 41, 55);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const splitText = pdf.splitTextToSize(
    `has successfully completed the examination for Class ${student.class} and secured ${getOrdinal(result.rank || 0)} position out of ${totalStudents} participants with a remarkable score of ${result.totalScore} marks.`,
    180
  );
  pdf.text(splitText, pageWidth / 2, yPos, { align: 'center' });

  yPos += 25;

  // --- PERFORMANCE BOX ---
  const boxWidth = 160;
  const boxHeight = 24;
  const boxX = (pageWidth - boxWidth) / 2;

  pdf.setFillColor(248, 250, 252); // Very light gray/blue
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(boxX, yPos, boxWidth, boxHeight, 3, 3, 'FD');

  const metricY = yPos + 16;
  const sectionWidth = boxWidth / 3;

  // Rank
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('RANK', boxX + sectionWidth * 0.5, yPos + 7, { align: 'center' });
  pdf.setFontSize(14);
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFont('helvetica', 'bold');
  pdf.text(getOrdinal(result.rank || 0), boxX + sectionWidth * 0.5, metricY, { align: 'center' });

  // Score
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SCORE', boxX + sectionWidth * 1.5, yPos + 7, { align: 'center' });
  pdf.setFontSize(14);
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${result.totalScore}`, boxX + sectionWidth * 1.5, metricY, { align: 'center' });

  // Division
  const accuracy = Math.round((result.correctCount / (result.correctCount + result.wrongCount + result.unansweredCount)) * 100);
  const division = getDivision(accuracy);

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text('DIVISION', boxX + sectionWidth * 2.5, yPos + 7, { align: 'center' });
  pdf.setFontSize(14);
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFont('helvetica', 'bold');
  pdf.text(division, boxX + sectionWidth * 2.5, metricY, { align: 'center' });

  yPos += 35;

  // --- SCHOLARSHIP (If applicable) ---
  if (scholarship && scholarship.approvalStatus === 'APPROVED') {
    pdf.setFillColor(220, 252, 231); // Light green
    pdf.setDrawColor(34, 197, 94);
    pdf.roundedRect(pageWidth / 2 - 60, yPos, 120, 10, 5, 5, 'FD');

    pdf.setFontSize(9);
    pdf.setTextColor(21, 128, 61); // Green
    pdf.setFont('helvetica', 'bold');
    const schText = scholarship.amount ? `SCHOLARSHIP AWARDED: ₹${scholarship.amount}` : 'SCHOLARSHIP AWARDED';
    pdf.text(schText, pageWidth / 2, yPos + 6.5, { align: 'center' });
  }

  // --- FOOTER ---
  const footerY = pageHeight - 35;
  const leftX = 40;
  const rightX = pageWidth - 40;

  // Date
  pdf.setFontSize(10);
  pdf.setTextColor(50, 50, 50);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date: ${formatDateTime(certificate.issuedAt).split(',')[0]}`, leftX, footerY);

  // Signatures
  // Left: Director
  pdf.setDrawColor(50, 50, 50);
  pdf.setLineWidth(0.5);
  pdf.line(leftX, footerY + 15, leftX + 50, footerY + 15);
  pdf.text('Director', leftX + 25, footerY + 20, { align: 'center' });

  // Right: Authorized Signatory
  pdf.line(rightX - 50, footerY + 15, rightX, footerY + 15);
  pdf.text('Authorized Signatory', rightX - 25, footerY + 20, { align: 'center' });

  // Signature Image (If available) - Right side
  const sigBase64 = config.signatureUrl ? await loadImage(config.signatureUrl) : '';
  if (sigBase64) {
    pdf.addImage(sigBase64, 'PNG', rightX - 45, footerY - 5, 40, 20);
  }

  // QR Code (Bottom Left or Center Bottom)
  // --- QR CODE (BOTTOM LEFT) ---
  const qrSize = 25;
  const qrX = 20;
  const qrY = pageHeight - 35;
  const qrDataUrl = await generateQRCode(certificate.certificateId);
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  }

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

  // Institution seal/logo
  const sealBase64 = config.sealUrl ? await loadImage(config.sealUrl) : '';
  if (sealBase64) {
    pdf.addImage(sealBase64, 'PNG', 15, 10, 20, 20);
  }

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

  pdf.text('ACCURACY', startX + (cardWidth + cardGap) * 2 + cardWidth / 2, yPos + 25, { align: 'center' });

  // Division (added dynamically)
  pdf.setFontSize(12);
  pdf.setTextColor(primary.r, primary.g, primary.b);
  pdf.setFont('helvetica', 'bold');
  const division = getDivision(accuracy);
  pdf.text(`${division}`, pageWidth / 2, yPos + 45, { align: 'center' });

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

  // Authorized Signature Image
  const sigBase64 = config.signatureUrl ? await loadImage(config.signatureUrl) : '';
  if (sigBase64) {
    pdf.addImage(sigBase64, 'PNG', signX + 7.5, footerY - 10, 30, 15);
  }

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

  // Seal Image overlay
  const sealBase64 = config.sealUrl ? await loadImage(config.sealUrl) : '';
  if (sealBase64) {
    pdf.addImage(sealBase64, 'PNG', pageWidth / 2 - 15, yPos - 15, 30, 30);
  }

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

  // Division
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.setFontSize(10);
  const accuracy = Math.round((result.correctCount / (result.correctCount + result.wrongCount + result.unansweredCount)) * 100);
  const division = getDivision(accuracy);
  pdf.text(`Division: ${division}`, panelX + panelWidth / 2, itemY + 18, { align: 'center' });

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

  // Authorized Signature Image (Near Academic Officer)
  const sigBase64 = config.signatureUrl ? await loadImage(config.signatureUrl) : '';
  if (sigBase64) {
    pdf.addImage(sigBase64, 'PNG', sig2X - 15, footerY - 10, 30, 15);
  }

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

// GPHDM TEMPLATE - Official Premium Design (Matches Stitch Design)
export async function generateGPHDMCertificate(
  data: CertificateData,
  config: CertificateTemplateConfig
): Promise<jsPDF> {
  const { student, result, certificate, scholarship, totalStudents } = data;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Draw Header details
  pdf.setFillColor(15, 23, 42); // slate-900 / navy
  pdf.rect(0, 0, pageWidth, 40, 'F');

  // Blue accent border under header
  pdf.setDrawColor(59, 130, 246); // blue-500
  pdf.setLineWidth(2);
  pdf.line(0, 39, pageWidth, 39);

  // Header Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE', pageWidth / 2, 18, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Gram Panchayat Help Desk Mission', pageWidth / 2, 26, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setTextColor(209, 213, 219); // gray-300
  pdf.setFont('times', 'italic');
  pdf.text('Empowering Future Leaders', pageWidth / 2, 33, { align: 'center' });

  // Body Content
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This certifies that', pageWidth / 2, 60, { align: 'center' });

  // Student Name
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(38);
  pdf.setFont('helvetica', 'bold');
  pdf.text(student.name, pageWidth / 2, 75, { align: 'center' });

  // Father Name
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(9);
  pdf.setFont('times', 'italic');
  pdf.text(`Child of / Ward of ${student.fatherName}`, pageWidth / 2, 85, { align: 'center' });

  // Achievement Text
  pdf.setTextColor(51, 65, 85); // slate-700
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`has achieved exceptional results in the Class ${student.class} Examination`, pageWidth / 2, 98, { align: 'center' });
  pdf.text(`securing Rank ${result.rank || '-'} among ${totalStudents || 150} participants`, pageWidth / 2, 105, { align: 'center' });

  // --- STAT BOXES ---
  const boxW = 55;
  const boxH = 28;
  const gap = 8;
  const totalW = (boxW * 3) + (gap * 2);
  const startX = (pageWidth - totalW) / 2;
  const boxY = 118;

  // Box 1: Rank
  pdf.setFillColor(51, 51, 51); // #333
  pdf.setDrawColor(75, 85, 99); // border
  pdf.setLineWidth(0.5);
  pdf.roundedRect(startX, boxY, boxW, boxH, 2, 2, 'FD');

  pdf.setTextColor(59, 130, 246); // blue-500
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text(getOrdinal(result.rank || 0), startX + boxW / 2, boxY + 16, { align: 'center' });

  pdf.setTextColor(156, 163, 175); // gray-400
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CLASS RANK', startX + boxW / 2, boxY + 23, { align: 'center' });

  // Box 2: Score
  pdf.setFillColor(42, 47, 58); // #2a2f3a
  pdf.setDrawColor(59, 130, 246); // blue-500 border
  pdf.setLineWidth(0.8);
  pdf.roundedRect(startX + boxW + gap, boxY, boxW, boxH, 2, 2, 'FD');

  pdf.setTextColor(96, 165, 250); // blue-400
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text(result.totalScore.toString(), startX + boxW + gap + boxW / 2, boxY + 16, { align: 'center' });

  pdf.setTextColor(156, 163, 175);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('TOTAL SCORE', startX + boxW + gap + boxW / 2, boxY + 23, { align: 'center' });

  // Box 3: Accuracy
  pdf.setFillColor(33, 47, 39); // #212f27
  pdf.setDrawColor(34, 197, 94); // green-500 border
  pdf.setLineWidth(0.8);
  pdf.roundedRect(startX + (boxW + gap) * 2, boxY, boxW, boxH, 2, 2, 'FD');

  pdf.setTextColor(34, 197, 94); // green-500
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  const accuracy = Math.round((result.correctCount / (result.correctCount + result.wrongCount + result.unansweredCount || 1)) * 100);
  pdf.text(accuracy + '%', startX + (boxW + gap) * 2 + boxW / 2, boxY + 16, { align: 'center' });

  pdf.setFontSize(8);
  pdf.text('ACCURACY', startX + (boxW + gap) * 2 + boxW / 2, boxY + 23, { align: 'center' });

  // Distinction Text
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Distinction', pageWidth / 2, boxY + 40, { align: 'center' });

  // --- FOOTER SECTION ---
  const blueBarY = pageHeight - 25;
  const whiteBarY = pageHeight - 15;

  // Blue Bar
  pdf.setFillColor(59, 130, 246); // blue-500
  pdf.rect(0, blueBarY, pageWidth, 10, 'F');

  // White Bar is just the page bg, no drawing needed

  // QR Code
  const qrSize = 25;
  const qrX = 30;
  const qrY = pageHeight - 33; // Intersects blue bar

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(209, 213, 219); // gray-300
  pdf.setLineWidth(0.3);
  pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 'FD');

  const qrDataUrl = await generateQRCode(certificate.certificateId);
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  }

  // Texts in Blue Bar
  pdf.setTextColor(219, 234, 254); // blue-100
  pdf.setFontSize(8);
  pdf.setFont('courier', 'normal');
  pdf.text(`Certificate ID: ${certificate.certificateId}`, qrX + qrSize + 10, blueBarY + 6);

  if (scholarship) {
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const schText = scholarship.amount ? `₹${scholarship.amount}` : 'APPROVED';
    pdf.text(`& SCHOLARSHIP AWARDED : ${schText} &`, pageWidth / 2 + 15, blueBarY + 6, { align: 'center' });
  }

  // Texts in White Bar
  pdf.setTextColor(107, 114, 128); // gray-500
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Issue Date: ${formatDateTime(certificate.issuedAt).split(',')[0]}`, qrX + qrSize + 10, whiteBarY + 8);

  const sigX = pageWidth - 65;
  pdf.setDrawColor(156, 163, 175);
  pdf.setLineWidth(0.5);
  pdf.line(sigX, whiteBarY + 5, sigX + 45, whiteBarY + 5);
  pdf.text('Authorized Signature', sigX + 22.5, whiteBarY + 9, { align: 'center' });

  return pdf;
}

export async function generateCertificateByTemplate(
  template: 'CLASSIC' | 'MODERN' | 'PRESTIGIOUS' | 'GPHDM',
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
    case 'GPHDM':
      return generateGPHDMCertificate(data, config);
    default:
      return generateClassicCertificate(data, config);
  }
}
