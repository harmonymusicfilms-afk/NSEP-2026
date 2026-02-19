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
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Colors from Design
  const colors = {
    navy: { r: 30, g: 58, b: 138 },      // #1e3a8a
    gold: { r: 212, g: 175, b: 55 },     // #d4af37
    saffron: { r: 255, g: 153, b: 51 },  // #FF9933
    green: { r: 19, g: 136, b: 8 },      // #138808
    slate: { r: 100, g: 116, b: 139 },   // #64748b
  };

  const margin = 10;

  // 1. Draw Background & Border
  // Safe printable area
  const printX = margin;
  const printY = margin;
  // const printW = pageWidth - margin * 2; // Unused
  const printW = pageWidth - margin * 2;
  const printH = pageHeight - margin * 2;

  // Outer Gold Rect
  pdf.setDrawColor(colors.gold.r, colors.gold.g, colors.gold.b);
  pdf.setLineWidth(1.5);
  pdf.rect(printX, printY, printW, printH);

  // Inner Gold Rect (creating the double border effect)
  const innerOffset = 1.5;
  pdf.setLineWidth(0.5);
  pdf.rect(printX + innerOffset, printY + innerOffset, printW - innerOffset * 2, printH - innerOffset * 2);

  // Corner Accents
  pdf.setDrawColor(colors.gold.r, colors.gold.g, colors.gold.b);
  pdf.setLineWidth(1.5);
  const cornerSize = 10;

  // Top Left
  pdf.line(printX - 0.5, printY + cornerSize, printX - 0.5, printY - 0.5);
  pdf.line(printX - 0.5, printY - 0.5, printX + cornerSize, printY - 0.5);

  // Top Right
  pdf.line(printX + printW + 0.5, printY + cornerSize, printX + printW + 0.5, printY - 0.5);
  pdf.line(printX + printW + 0.5, printY - 0.5, printX + printW - cornerSize, printY - 0.5);

  // Bottom Left
  pdf.line(printX - 0.5, printY + printH - cornerSize, printX - 0.5, printY + printH + 0.5);
  pdf.line(printX - 0.5, printY + printH + 0.5, printX + cornerSize, printY + printH + 0.5);

  // Bottom Right
  pdf.line(printX + printW + 0.5, printY + printH - cornerSize, printX + printW + 0.5, printY + printH + 0.5);
  pdf.line(printX + printW + 0.5, printY + printH + 0.5, printX + printW - cornerSize, printY + printH + 0.5);


  let yPos = printY + 15;

  // 2. Header Info (Top Right)
  pdf.setFont('times', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
  pdf.text(`CERTIFICATE ID: ${certificate.certificateId}`, printX + printW - 5, yPos, { align: 'right' });
  yPos += 4;
  pdf.text(`ISSUED ON: ${formatDateTime(certificate.issuedAt).split(',')[0]}`, printX + printW - 5, yPos, { align: 'right' });

  // 3. Logo (Centered)
  const logoUrl = '/images/gphdm_logo.png';
  const logoBase64 = await loadImage(logoUrl).catch(() => '');

  if (logoBase64) {
    pdf.addImage(logoBase64, 'PNG', pageWidth / 2 - 20, yPos, 40, 40);
    yPos += 45;
  } else {
    // Fallback Circle
    yPos += 20;
    pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.circle(pageWidth / 2, yPos, 15);
    pdf.text('GPHDM', pageWidth / 2, yPos, { align: 'center' });
    yPos += 25;
  }

  // 4. Main Titles
  pdf.setFont('times', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
  pdf.text('GPHDM', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  pdf.setFontSize(16);
  pdf.text('NATIONAL SCHOLARSHIP EXAM', pageWidth / 2, yPos, { align: 'center' });

  yPos += 6;
  // Decorative lines with text
  const centerX = pageWidth / 2;
  pdf.setDrawColor(colors.gold.r, colors.gold.g, colors.gold.b);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - 45, yPos, centerX - 35, yPos); // Left dash
  pdf.line(centerX + 35, yPos, centerX + 45, yPos); // Right dash

  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139); // Slate 500
  pdf.setFont('helvetica', 'bold');
  const tagline = 'EMPOWERING RURAL EDUCATION';
  pdf.text(tagline, centerX, yPos + 1, { align: 'center' });

  yPos += 15;

  // 5. "This is to certify that"
  pdf.setFont('times', 'italic');
  pdf.setFontSize(12);
  pdf.setTextColor(71, 85, 105); // Slate 600
  pdf.text('This is to certify that', centerX, yPos, { align: 'center' });

  yPos += 15;

  // 6. Student Details Section (Photo Left, Text Right)
  const contentStartX = printX + 15;

  // Photo Box (Left)
  const photoW = 30;
  const photoH = 38; // approx passport ratio
  const photoX = contentStartX + 10;
  const photoY = yPos;

  // Load student photo
  const photoBase64 = student.photoUrl ? await loadImage(student.photoUrl).catch(() => '') : '';

  pdf.setDrawColor(colors.gold.r, colors.gold.g, colors.gold.b);
  pdf.setLineWidth(0.5);
  pdf.rect(photoX, photoY, photoW, photoH); // Border

  if (photoBase64) {
    pdf.addImage(photoBase64, 'JPEG', photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
  } else {
    // Placeholder icon/text
    pdf.setFontSize(8);
    pdf.setTextColor(colors.gold.r, colors.gold.g, colors.gold.b);
    pdf.text('PASSPORT', photoX + photoW / 2, photoY + photoH / 2 - 2, { align: 'center' });
    pdf.text('PHOTO', photoX + photoW / 2, photoY + photoH / 2 + 2, { align: 'center' });
  }

  // Details (Right)
  const detailsX = photoX + photoW + 15;
  const detailsY = yPos + 2;

  // Name
  pdf.setFont('times', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(15, 23, 42); // Slate 900
  pdf.text(student.name, detailsX, detailsY + 6);

  // Divider under name
  pdf.setDrawColor(colors.gold.r, colors.gold.g, colors.gold.b);
  pdf.setLineWidth(0.2);
  pdf.line(detailsX, detailsY + 9, detailsX + 100, detailsY + 9);

  let detailRowY = detailsY + 18;

  // Grid for details
  const labelStyle = { font: 'helvetica', style: 'bold', size: 7, color: colors.gold };
  const valueStyle = { font: 'helvetica', style: 'bold', size: 10, color: colors.navy };

  // Father Name
  pdf.setFont(labelStyle.font, labelStyle.style);
  pdf.setFontSize(labelStyle.size);
  pdf.setTextColor(labelStyle.color.r, labelStyle.color.g, labelStyle.color.b);
  pdf.text("FATHER'S NAME", detailsX, detailRowY);

  pdf.setFont(valueStyle.font, valueStyle.style);
  pdf.setFontSize(valueStyle.size);
  pdf.setTextColor(valueStyle.color.r, valueStyle.color.g, valueStyle.color.b);
  pdf.text(student.fatherName || 'N/A', detailsX, detailRowY + 4);

  // Address/Location
  const col2X = detailsX + 60;

  pdf.setFont(labelStyle.font, labelStyle.style);
  pdf.setFontSize(labelStyle.size);
  pdf.setTextColor(labelStyle.color.r, labelStyle.color.g, labelStyle.color.b);
  pdf.text("ACADEMIC LEVEL", col2X, detailRowY);

  pdf.setFont(valueStyle.font, valueStyle.style);
  pdf.setFontSize(valueStyle.size);
  pdf.setTextColor(valueStyle.color.r, valueStyle.color.g, valueStyle.color.b);
  pdf.text(`Class ${student.class}`, col2X, detailRowY + 4);

  detailRowY += 12;

  // Institution
  pdf.setFont(labelStyle.font, labelStyle.style);
  pdf.setFontSize(labelStyle.size);
  pdf.setTextColor(labelStyle.color.r, labelStyle.color.g, labelStyle.color.b);
  pdf.text("EDUCATIONAL INSTITUTION", detailsX, detailRowY);

  pdf.setFont(valueStyle.font, valueStyle.style);
  pdf.setFontSize(valueStyle.size);
  pdf.setTextColor(valueStyle.color.r, valueStyle.color.g, valueStyle.color.b);
  pdf.text(student.schoolName || 'N/A', detailsX, detailRowY + 4);

  yPos += photoH + 15;

  // 7. Success Text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139); // Slate 500
  const successText = 'Has successfully qualified in the national scholarship examination and is hereby awarded this certificate of academic excellence.';
  const splitSuccess = pdf.splitTextToSize(successText, 140);
  pdf.text(splitSuccess, centerX, yPos, { align: 'center' });

  yPos += 15;

  // 8. Stats Box (3 Columns)
  // Box Container
  const statsBoxH = 20;

  // Draw simplified boxes
  const boxW = 50;
  const boxGap = 5;
  const totalStatsW = (boxW * 3) + (boxGap * 2);
  const startStatsX = (pageWidth - totalStatsW) / 2;

  const drawStatBox = (x: number, label: string, value: string) => {
    // Bg
    pdf.setFillColor(248, 250, 252); // Slate 50
    pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b); // Navy border with opacity?
    pdf.setLineWidth(0.1);
    pdf.rect(x, yPos, boxW, statsBoxH, 'FD'); // Fill and Draw

    // Label
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139); // Slate 500
    pdf.text(label, x + boxW / 2, yPos + 6, { align: 'center' });

    // Value
    pdf.setFont('times', 'bold'); // Font Display approx
    pdf.setFontSize(14);
    pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
    pdf.text(value, x + boxW / 2, yPos + 14, { align: 'center' });
  };

  // Calculations
  const percentage = ((result.totalScore / 240) * 100).toFixed(2) + '%';

  drawStatBox(startStatsX, 'EXAM SCORE', `${result.totalScore}/240`);
  drawStatBox(startStatsX + boxW + boxGap, 'NATIONAL RANK', `AIR ${result.rank || '-'}`);
  drawStatBox(startStatsX + (boxW + boxGap) * 2, 'PERCENTAGE', percentage);

  yPos += 35;

  // 9. Signatures Area
  const sigY = pageHeight - 55;

  // Left: Director
  const dirSigUrl = '/images/director_sig.png'; // Use downloaded
  const dirSigBase64 = await loadImage(dirSigUrl).catch(() => '');

  if (dirSigBase64) {
    pdf.addImage(dirSigBase64, 'PNG', printX + 15, sigY - 10, 40, 15);
  }
  pdf.setDrawColor(colors.navy.r, colors.navy.g, colors.navy.b);
  pdf.setLineWidth(0.5);
  pdf.line(printX + 15, sigY + 6, printX + 55, sigY + 6);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
  pdf.text('DIRECTOR, GPHDM', printX + 35, sigY + 10, { align: 'center' });

  // Center: QR Code
  const qrSize = 25;
  const qrX = centerX - qrSize / 2;
  const qrY = sigY - 12;
  const qrDataUrl = await generateQRCode(certificate.certificateId);

  // Border for QR
  pdf.setDrawColor(226, 232, 240); // Slate 200
  pdf.setLineWidth(0.5);
  pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  }
  pdf.setFontSize(7);
  pdf.setFont('courier', 'normal'); // Mono
  pdf.setTextColor(148, 163, 184); // Slate 400
  pdf.text(`ID: ${certificate.certificateId}`, centerX, qrY + qrSize + 6, { align: 'center' });

  // Right: Chief Examiner
  const exSigUrl = '/images/examiner_sig.png'; // Use downloaded
  const exSigBase64 = await loadImage(exSigUrl).catch(() => '');

  if (exSigBase64) {
    pdf.addImage(exSigBase64, 'PNG', printX + printW - 55, sigY - 8, 30, 12);
  }
  pdf.line(printX + printW - 55, sigY + 6, printX + printW - 15, sigY + 6);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
  pdf.text('CHIEF EXAMINER', printX + printW - 35, sigY + 10, { align: 'center' });

  // 10. Footer (Contacts + Flags)
  const bottomY = pageHeight - margin - 15;

  // Contact Line
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105); // Slate 600
  pdf.setFont('helvetica', 'bold');
  const contacts = 'CALL: 9120057559  |  MAIL: grampanchayat023@gmail.com  |  WEB: www.gphdm.org.in';
  pdf.text(contacts, centerX, bottomY, { align: 'center' });

  // Flag Bars
  const barH = 1.5; // mm
  const barY = bottomY + 3;

  pdf.setFillColor(colors.saffron.r, colors.saffron.g, colors.saffron.b);
  pdf.rect(printX, barY, printW / 3, barH, 'F');

  pdf.setFillColor(255, 255, 255); // White (border visible if bg is not white)
  pdf.setDrawColor(241, 245, 249); // Slight slate border for white part
  pdf.rect(printX + printW / 3, barY, printW / 3, barH, 'FD');

  pdf.setFillColor(colors.green.r, colors.green.g, colors.green.b);
  pdf.rect(printX + (printW / 3) * 2, barY, printW / 3, barH, 'F');

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
