import { useRef } from 'react';
import { formatDateTime } from '@/lib/utils';
import type { Student, ExamResult, Certificate } from '@/types';

interface CertificateGeneratorProps {
    student: Student;
    result: ExamResult;
    certificate: Certificate;
}

export function CertificateGenerator({ student, result, certificate }: CertificateGeneratorProps) {
    const certificateRef = useRef<HTMLDivElement>(null);

    const getCertificateTitle = () => {
        switch (certificate.certificateType) {
            case 'SCHOLARSHIP':
                return 'SCHOLARSHIP CERTIFICATE';
            case 'MERIT':
                return 'CERTIFICATE OF MERIT';
            default:
                return 'CERTIFICATE OF PARTICIPATION';
        }
    };

    const getCertificateColor = () => {
        switch (certificate.certificateType) {
            case 'SCHOLARSHIP':
                return '#d4af37'; // Gold
            case 'MERIT':
                return '#c0c0c0'; // Silver
            default:
                return '#cd7f32'; // Bronze
        }
    };

    return (
        <div
            ref={certificateRef}
            className="w-[210mm] h-[297mm] bg-white p-8 mx-auto"
            style={{
                fontFamily: 'serif',
                border: `8px double ${getCertificateColor()}`,
                position: 'relative',
            }}
        >
            {/* Decorative Corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4" style={{ borderColor: getCertificateColor() }}></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4" style={{ borderColor: getCertificateColor() }}></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4" style={{ borderColor: getCertificateColor() }}></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4" style={{ borderColor: getCertificateColor() }}></div>

            {/* Tricolor Bar */}
            <div className="flex h-2 mb-6">
                <div className="flex-1 bg-[#FF9933]"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-[#138808]"></div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="mb-4 flex justify-center">
                    {/* GPHDM Logo */}
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-lg bg-white" style={{ borderColor: getCertificateColor() }}>
                        <img
                            src="https://i.imgur.com/placeholder-logo.png"
                            alt="GPHDM Logo - Gram Panchayat Help Desk Mission"
                            className="w-full h-full object-contain p-2"
                            style={{
                                background: 'white',
                                borderRadius: '50%'
                            }}
                        />
                    </div>
                </div>
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#1e3a8a' }}>GPHDM</h1>
                <h2 className="text-2xl font-semibold mb-1" style={{ color: '#1e3a8a' }}>NATIONAL SCHOLARSHIP EXAM</h2>
                <p className="text-sm italic text-gray-600">Empowering Rural Education</p>
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4" style={{ color: getCertificateColor() }}>
                    {getCertificateTitle()}
                </h3>
                <p className="text-lg mb-2">This is to certify that</p>
            </div>

            {/* Student Details */}
            <div className="mb-8 space-y-4">
                <div className="text-center">
                    <p className="text-3xl font-bold mb-2" style={{ color: '#1e3a8a' }}>{student.name}</p>
                    <p className="text-lg text-gray-700">S/o {student.fatherName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                    <div className="border-b border-gray-300 pb-2">
                        <span className="text-gray-600">Class:</span>
                        <span className="ml-2 font-semibold">Class {student.class}</span>
                    </div>
                    <div className="border-b border-gray-300 pb-2">
                        <span className="text-gray-600">Certificate ID:</span>
                        <span className="ml-2 font-mono font-semibold">{certificate.certificateId}</span>
                    </div>
                    <div className="border-b border-gray-300 pb-2">
                        <span className="text-gray-600">Center Code:</span>
                        <span className="ml-2 font-mono font-semibold">{student.centerCode || 'N/A'}</span>
                    </div>
                    <div className="border-b border-gray-300 pb-2">
                        <span className="text-gray-600">School:</span>
                        <span className="ml-2 font-semibold">{student.schoolName.length > 20 ? student.schoolName.substring(0, 20) + '...' : student.schoolName}</span>
                    </div>
                </div>
            </div>

            {/* Achievement Details */}
            <div className="mb-8">
                <p className="text-center text-lg mb-4">has successfully participated in the National Scholarship Exam and achieved:</p>
                <div className="flex justify-center gap-6">
                    <div className="text-center p-4 border-2 rounded-lg" style={{ borderColor: getCertificateColor() }}>
                        <p className="text-sm text-gray-600">Score</p>
                        <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>{result.totalScore}/40</p>
                    </div>
                    <div className="text-center p-4 border-2 rounded-lg" style={{ borderColor: getCertificateColor() }}>
                        <p className="text-sm text-gray-600">Rank</p>
                        <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>#{result.rank}</p>
                    </div>
                    <div className="text-center p-4 border-2 rounded-lg" style={{ borderColor: getCertificateColor() }}>
                        <p className="text-sm text-gray-600">Percentage</p>
                        <p className="text-2xl font-bold" style={{ color: '#1e3a8a' }}>{((result.totalScore / 40) * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            {/* Issue Date */}
            <div className="text-center mb-8">
                <p className="text-sm text-gray-600">
                    Issued on: <span className="font-semibold">{formatDateTime(certificate.issuedAt).split(',')[0]}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Valid for 5 years from date of issue</p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end mt-12">
                <div className="text-center">
                    <div className="border-t-2 border-gray-800 w-40 mb-2"></div>
                    <p className="text-sm font-semibold">Director, GPHDM</p>
                </div>
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs">
                        Official<br />Seal
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-gray-800 w-40 mb-2"></div>
                    <p className="text-sm font-semibold">Chief Examiner</p>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-8 right-8">
                <div className="flex justify-between items-center text-xs text-gray-600">
                    <div>
                        <p>Mobile: 9120057559</p>
                        <p>Email: grampanchayat023@gmail.com</p>
                    </div>
                    <div className="w-16 h-16 border border-gray-400 flex items-center justify-center">
                        <span className="text-[8px]">QR Code</span>
                    </div>
                </div>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <p className="text-9xl font-bold transform -rotate-45">GPHDM</p>
            </div>
        </div>
    );
}
