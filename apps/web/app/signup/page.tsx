"use client";
import React, { useState } from 'react';
import { UserPlus, Lock, Mail, User, Building2, Loader2, ArrowRight, CheckCircle, FileText, Upload, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<'details' | 'otp' | 'documents'>('details');
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [govtId, setGovtId] = useState<File | null>(null);
  const [clinicId, setClinicId] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           email: formData.email,
           password: formData.password,
           full_name: formData.name,
           phone_number: "", 
           role: "doctor" 
        })
      });

      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.detail || 'Registration failed');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
          const res = await fetch('/api/auth/register-verify', {
            method: 'POST',
             headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.email,
                otp: otp
            })
          });

          const data = await res.json();
          if (!res.ok) {
              // Special case: if account created but needs approval, we get a token or message
              if (res.status === 403 && data.access_token) {
                  // This shouldn't happen with my latest backend change, but handling anyway
              }
              throw new Error(data.detail || 'Verification failed');
          }

          setToken(data.access_token);
          setStep('documents');
      } catch (err: any) {
        // If the error message indicates pending approval, we might already be registered
        if (err.message.includes('pending admin approval') || err.message.includes('already active')) {
            // We need to login to get a token for upload
            setError("Your account is registered. Please sign in to upload documents.");
            setTimeout(() => router.push('/login'), 2000);
        } else {
            setError(err.message || 'Verification failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
  }

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!govtId || !clinicId) {
        setError("Please upload both documents");
        return;
    }

    setError('');
    setIsLoading(true);

    try {
        const formDataUpload = new FormData();
        formDataUpload.append('govt_id', govtId);
        formDataUpload.append('clinic_id', clinicId);

        const res = await fetch('/api/auth/upload-verification', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formDataUpload
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Upload failed');
        }

        // Success - redirect to pending status
        router.push('/login?status=pending');
    } catch (err: any) {
        setError(err.message || 'Upload failed. Please try again.');
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-primary-700 opacity-90"></div>
        <div className="relative z-10 text-white max-w-md px-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Join RAHI Network</h2>
            <p className="text-blue-100 text-lg">
                Register your clinic today to access AI-powered tools and connect with specialists instantly.
            </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 'details' ? 'Create your account' : step === 'otp' ? 'Verify Email' : 'Upload Documents'}
            </h1>
            <p className="text-gray-500 text-sm">
                {step === 'details' ? 'Join the rural healthcare revolution' : 
                 step === 'otp' ? `Enter the OTP sent to ${formData.email}` : 
                 'Please upload required documents for verification'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Full Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 md:text-sm"
                    placeholder="Dr. Rajesh Kumar"
                    required
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="clinicName">Clinic Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="clinicName"
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 md:text-sm"
                    placeholder="Seva Health Center"
                    required
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 md:text-sm"
                    placeholder="contact@sevahealth.com"
                    required
                    />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 md:text-sm"
                        placeholder="••••••••"
                        required
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">Confirm</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 md:text-sm"
                        placeholder="••••••••"
                        required
                        />
                    </div>
                    </div>
                </div>

                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {isLoading ? (
                    <div className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Wait...
                    </div>
                ) : (
                    <div className="flex items-center">
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                )}
                </button>
            </form>
          )}

          {step === 'otp' && (
             <form onSubmit={handleOtpSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otp">One-Time Password (OTP)</label>
                    <div className="relative">
                        <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 text-center tracking-[0.5em] text-xl font-bold"
                        placeholder="XXXXXX"
                        maxLength={6}
                        required
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Check your email {formData.email} for the code.</p>
                </div>
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Verify & Next <CheckCircle className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </button>
                 <button type="button" onClick={() => setStep('details')} className="w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-4">
                    Back to details
                 </button>
             </form>
          )}

          {step === 'documents' && (
              <form onSubmit={handleDocumentSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Government ID Proof (Aadhaar/PAN)</label>
                            <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Upload masked ID proof only for privacy purpose</span>
                        </div>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">{govtId ? govtId.name : 'Click to upload Govt ID'}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setGovtId(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    </div>

                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary transition-colors">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Clinic/Hospital ID Card</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileText className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">{clinicId ? clinicId.name : 'Click to upload Clinic ID'}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setClinicId(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !govtId || !clinicId}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center">
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Uploading...
                        </div>
                    ) : (
                        <div className="flex items-center">
                        Complete Registration <CheckCircle className="ml-2 h-4 w-4" />
                        </div>
                    )}
                </button>
              </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
