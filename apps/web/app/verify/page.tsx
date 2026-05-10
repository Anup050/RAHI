"use client";
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Loader2, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [govtId, setGovtId] = useState<File | null>(null);
    const [clinicId, setClinicId] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (!authLoading && user && user.is_approved) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!govtId || !clinicId) {
            setError("Please upload both documents");
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('govt_id', govtId);
            formData.append('clinic_id', clinicId);

            const res = await fetch('/api/auth/upload-verification', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Upload failed');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-primary p-8 text-white text-center">
                    <h1 className="text-2xl font-bold mb-2">Account Verification</h1>
                    <p className="text-primary-foreground/80">
                        Admin approval required to access the dashboard.
                    </p>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Documents Submitted</h2>
                            <p className="text-gray-600 mb-8">
                                Our administration team will review your documents within 24-48 hours. You will receive an email once approved.
                            </p>
                            <Button onClick={() => logout()} className="w-full">
                                Back to Login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start">
                                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Upload required for existing doctors</p>
                                    <p>RAHI has updated its security policies. All doctors must now provide ID verification for clinical safety.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Government ID Proof (Aadhaar/PAN)</label>
                                        <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Upload masked ID proof only for privacy purpose</span>
                                    </div>
                                    <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">{govtId ? govtId.name : 'Click to select file'}</p>
                                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setGovtId(e.target.files?.[0] || null)} />
                                    </label>
                                </div>

                                <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary transition-colors">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Clinic/Hospital ID Card</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg">
                                        <FileText className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">{clinicId ? clinicId.name : 'Click to select file'}</p>
                                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setClinicId(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => logout()}>
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </Button>
                                <Button type="submit" className="flex-1" disabled={isLoading || !govtId || !clinicId}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Submit for Review
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
