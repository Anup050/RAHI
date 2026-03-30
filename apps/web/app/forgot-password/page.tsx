"use client";
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, CheckCircle, Key } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const res = await fetch('http://localhost:8000/api/v1/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });

        if (!res.ok) { // 404 handled by backend usually
            throw new Error('User not found or error sending email');
        }

        setStep('reset');
    } catch (err: any) {
        setError(err.message || "Failed to send OTP");
    } finally {
        setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          return;
      }

      setIsLoading(true);
      try {
          const res = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                otp: otp,
                new_password: newPassword
            })
          });

          const data = await res.json();
          if (!res.ok) {
              throw new Error(data.detail || 'Failed to reset password');
          }

          setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to reset password");
      } finally {
        setIsLoading(false);
      }
  }

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                <p className="text-gray-500 mb-6">Your password has been updated. You can now login with your new password.</p>
                <Link href="/login" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full">
                    Go to Login
                </Link>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Key className="w-6 h-6 text-primary" />
            </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 'email' ? 'Enter your email to receive a recovery code' : `Enter the code sent to ${email}`}
          </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

        {step === 'email' ? (
             <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 md:text-sm"
                    placeholder="name@hospital.com"
                    required
                    />
                </div>
                </div>
                
                 <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Send Reset Code <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </button>
             </form>
        ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otp">OTP Code</label>
                     <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 text-center tracking-[0.5em] text-lg font-bold"
                        placeholder="XXXXXX"
                         maxLength={6}
                        required
                        />
                </div>

                 <div className="grid grid-cols-1 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 md:text-sm"
                        placeholder="••••••••"
                        required
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">Confirm Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Resetting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Reset Password <CheckCircle className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </button>
            </form>
        )}

        <div className="mt-6 text-center">
            <Link href="/login" className="font-medium text-sm text-gray-600 hover:text-gray-900">
                Back to Login
            </Link>
          </div>
      </div>
    </div>
  );
}
