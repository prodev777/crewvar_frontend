import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useVerifyEmail, useResendVerificationEmail } from "../api/emailVerification";
import { toast } from "react-toastify";

export const EmailVerificationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState('');
    
    const verifyEmailMutation = useVerifyEmail();
    const resendVerificationMutation = useResendVerificationEmail();

    // Auto-verify if token is present
    useEffect(() => {
        if (token) {
            handleVerifyEmail();
        }
    }, [token]);

    const handleVerifyEmail = async () => {
        if (!token) {
            setErrorMessage('No verification token provided');
            setVerificationStatus('error');
            return;
        }

        setIsVerifying(true);
        setErrorMessage('');
        
        try {
            await verifyEmailMutation.mutateAsync(token);
            setVerificationStatus('success');
            toast.success('Email verified successfully!');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/auth/login', { 
                    state: { 
                        message: 'Email verified successfully! You can now sign in.' 
                    }
                });
            }, 2000);
            
        } catch (error: any) {
            setErrorMessage(error.response?.data?.error || 'Verification failed. Please try again.');
            setVerificationStatus('error');
            toast.error('Email verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Email address not found');
            return;
        }

        setIsResending(true);
        
        try {
            await resendVerificationMutation.mutateAsync(email);
            toast.success('Verification email sent! Check your inbox.');
        } catch (error: any) {
            toast.error('Failed to resend verification email');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                                {verificationStatus === 'success' ? (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : verificationStatus === 'error' ? (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {verificationStatus === 'success' ? 'Email Verified!' : 
                                 verificationStatus === 'error' ? 'Verification Failed' : 
                                 'Verify Your Email'}
                            </h1>
                            <p className="text-gray-600">
                                {verificationStatus === 'success' ? 'Your email has been successfully verified.' :
                                 verificationStatus === 'error' ? 'There was an issue verifying your email.' :
                                 'Please verify your email address to continue.'}
                            </p>
                        </div>

                        {/* Content */}
                        {verificationStatus === 'pending' && !token && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-white text-xs">ℹ</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-blue-900">Check Your Email</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                We've sent a verification link to your email address. 
                                                Click the link to verify your account.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {email && (
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-4">
                                            Didn't receive the email? Check your spam folder or resend it.
                                        </p>
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={isResending}
                                            className="px-6 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50"
                                        >
                                            {isResending ? 'Sending...' : 'Resend Verification Email'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {verificationStatus === 'success' && (
                            <div className="text-center space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-700 text-sm">
                                        You will be redirected to the login page shortly.
                                    </p>
                                </div>
                                <Link
                                    to="/auth/login"
                                    className="inline-block px-6 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        )}

                        {verificationStatus === 'error' && (
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm">
                                        {errorMessage}
                                    </p>
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleVerifyEmail}
                                        disabled={isVerifying}
                                        className="flex-1 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50"
                                    >
                                        {isVerifying ? 'Verifying...' : 'Try Again'}
                                    </button>
                                    {email && (
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={isResending}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-[#069B93] hover:text-[#069B93] transition-colors font-medium disabled:opacity-50"
                                        >
                                            {isResending ? 'Sending...' : 'Resend Email'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <Link
                                to="/auth/login"
                                className="text-sm text-[#069B93] hover:text-[#058a7a] transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
