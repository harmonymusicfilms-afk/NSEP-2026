import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { formatDateTime } from '@/lib/utils';
import type { Student, ExamResult, Certificate } from '@/types';
import { getOrdinal } from '@/lib/utils';

interface CertificateGeneratorProps {
    student: Student;
    result: ExamResult;
    certificate: Certificate;
}

export function CertificateGenerator({ student, result, certificate }: CertificateGeneratorProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
        const verificationUrl = `${window.location.origin}/verify?id=${certificate.certificateId}`;
        QRCode.toDataURL(verificationUrl, {
            width: 120,
            margin: 1,
            color: { dark: '#1e3a8a', light: '#ffffff' },
        }).then(setQrCodeUrl).catch(console.error);
    }, [certificate.certificateId]);

    const accuracy = Math.round((result.correctCount / (result.correctCount + result.wrongCount + result.unansweredCount || 1)) * 100);

    return (
        <div
            ref={certificateRef}
            className="w-[297mm] h-[210mm] bg-white mx-auto flex flex-col relative shadow-xl overflow-hidden"
            style={{ fontFamily: 'sans-serif' }}
        >
            {/* Header: Dark Navy */}
            <div className="bg-[#0f172a] text-center pt-8 pb-6 border-b-8 border-blue-500 relative z-10 w-full shrink-0">
                <h1 className="text-5xl font-bold text-white mb-2 tracking-wide font-sans mt-2">CERTIFICATE</h1>
                <p className="text-white text-base font-medium font-sans">Gram Panchayat Help Desk Mission</p>
                <p className="text-gray-300 text-sm italic mt-2 font-serif">Empowering Future Leaders</p>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col items-center justify-center -mt-4 text-center px-12 z-0 relative">
                <p className="text-gray-500 text-sm mb-3 font-sans">This certifies that</p>
                <h2 className="text-5xl font-bold text-black mb-2 tracking-tight">{student.name}</h2>
                <p className="text-gray-500 text-xs italic mb-8 font-serif">Child of / Ward of {student.fatherName}</p>

                <p className="text-gray-700 text-sm font-sans mb-1">has achieved exceptional results in the Class {student.class} Examination</p>
                <p className="text-gray-700 text-sm font-sans mb-8">securing Rank {result.rank || '-'} among 150 participants</p>

                {/* 3 Stat Boxes */}
                <div className="flex justify-center gap-6 mb-8 w-full max-w-2xl mx-auto">
                    {/* Rank Box */}
                    <div className="bg-[#333333] rounded-lg py-5 px-4 flex-1 shadow-lg border border-gray-700 flex flex-col items-center justify-center group overflow-hidden relative">
                        <p className="text-blue-500 text-4xl font-bold mb-2 z-10">{getOrdinal(result.rank || 0)}</p>
                        <p className="text-gray-400 text-[10px] tracking-widest uppercase z-10">CLASS RANK</p>
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Score Box */}
                    <div className="bg-[#2a2f3a] rounded-lg py-5 px-4 flex-1 shadow-lg border border-blue-500 flex flex-col items-center justify-center group relative overflow-hidden">
                        <p className="text-blue-400 text-4xl font-bold mb-2 z-10">{result.totalScore}</p>
                        <p className="text-gray-400 text-[10px] tracking-widest uppercase z-10">TOTAL SCORE</p>
                        <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Accuracy Box */}
                    <div className="bg-[#212f27] rounded-lg py-5 px-4 flex-1 shadow-lg border border-green-500 flex flex-col items-center justify-center group relative overflow-hidden">
                        <p className="text-green-500 text-4xl font-bold mb-2 z-10">{accuracy}%</p>
                        <p className="text-green-500 text-[10px] tracking-widest uppercase z-10 font-bold">ACCURACY</p>
                        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>

                <p className="text-base font-bold text-black font-sans mt-2 tracking-wide">Distinction</p>
            </div>

            {/* Footer Area */}
            <div className="relative mt-auto w-full flex flex-col shrink-0">
                {/* QR Code Container (Overlaps blue and white sections) */}
                <div className="absolute left-[8%] bottom-6 w-24 h-24 bg-white p-1.5 shadow-md flex items-center justify-center border z-20">
                    {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Certificate Verification QR" className="w-full h-full object-contain" />
                    ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-400">QR CODE</div>
                    )}
                </div>

                {/* Blue Bar */}
                <div className="bg-blue-500 h-10 w-full flex items-center z-10 pr-[10%]">
                    {/* Space reserved for QR offset */}
                    <div className="w-[18%] h-full shrink-0"></div>
                    <div className="text-blue-100 text-[9px] font-mono tracking-wider w-[25%] truncate shrink-0">
                        Certificate ID: {certificate.certificateId}
                    </div>
                    <div className="flex-1 text-center text-white text-xs font-bold tracking-[0.15em] shrink-0">
                        & SCHOLARSHIP AWARDED: ₹10,000 &
                    </div>
                </div>

                {/* White Bottom Strip */}
                <div className="bg-white h-12 w-full flex items-end pb-3 z-0 pr-[10%]">
                    <div className="w-[18%] h-full shrink-0"></div>
                    <div className="text-gray-500 text-[9px] w-[25%] font-sans shrink-0">
                        Issue Date: {formatDateTime(certificate.issuedAt).split(',')[0]}
                    </div>
                    <div className="flex-1 text-right flex flex-col items-end shrink-0">
                        <div className="w-40 border-b border-gray-400 mb-1"></div>
                        <div className="text-[8px] text-gray-500 pr-4">Authorized Signature</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
