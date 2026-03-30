"use client";
import React, { useState } from 'react';
import { UserPlus, Lock, Mail, User, Building2, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/register-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           email: formData.email,
           password: formData.password,
           full_name: formData.name,
           phone_number: "", 
           role: "doctor" // Default role
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
          const res = await fetch('http://localhost:8000/api/v1/auth/register-verify', {
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
              throw new Error(data.detail || 'Verification failed');
          }

          login(data.access_token, null); // Will redirect to dashboard
      } catch (err: any) {
        setError(err.message || 'Verification failed. Please try again.');
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {step === 'details' ? 'Create your account' : 'Verify Email'}
            </h1>
            <p className="text-gray-500 text-sm">
                {step === 'details' ? 'Join the rural healthcare revolution' : `Enter the OTP sent to ${formData.email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          {step === 'details' ? (
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
          ) : (
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
                      Verify & Register <CheckCircle className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </button>
                 <button type="button" onClick={() => setStep('details')} className="w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-4">
                    Back to details
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
