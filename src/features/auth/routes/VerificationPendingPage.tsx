import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResendVerificationEmail } from "../api/emailVerification";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";

export const VerificationPendingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();
    const [isResending, setIsResending] = useState(false);
    
    const resendVerificationMutation = useResendVerificationEmail();
    
    // Get email from location state or use placeholder
    const email = location.state?.email || 'your email address';

    const handleResendVerification = async () => {
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

    const handleSignOut = () => {
        signOut();
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Email Verification Required
                            </h1>
                            <p className="text-gray-600">
                                Please verify your email address to access all features.
                            </p>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">ℹ</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Check Your Email</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            We've sent a verification link to <strong>{email}</strong>. 
                                            Click the link to verify your account and unlock all features.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">⚠</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-yellow-900">Limited Access</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Until your email is verified, you cannot explore ships or view profiles.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    className="w-full px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50"
                                >
                                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                                
                                <button
                                    onClick={handleSignOut}
                                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-[#069B93] hover:text-[#069B93] transition-colors font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                Didn't receive the email? Check your spam folder or contact support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
