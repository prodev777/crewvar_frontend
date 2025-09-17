import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../app/api";

// Types
export interface IVerificationResponse {
    success: boolean;
    message: string;
}

export interface IVerificationStatus {
    isVerified: boolean;
    email: string;
}

export interface IResendVerificationResponse {
    success: boolean;
    message: string;
}

// API Functions
export const verifyEmail = async (token: string): Promise<IVerificationResponse> => {
    const response = await api.post("/auth/verify-email", { token });
    return response.data;
};

export const resendVerificationEmail = async (email: string): Promise<IResendVerificationResponse> => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
};

export const checkVerificationStatus = async (): Promise<IVerificationStatus> => {
    const response = await api.get("/auth/verification-status");
    return response.data;
};

// React Query Hooks
export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: verifyEmail,
        onSuccess: (data) => {
            console.log('Email verification successful:', data.message);
        },
        onError: (error: any) => {
            console.error('Email verification failed:', error.response?.data?.error || error.message);
        }
    });
};

export const useResendVerificationEmail = () => {
    return useMutation({
        mutationFn: resendVerificationEmail,
        onSuccess: (data) => {
            console.log('Verification email resent:', data.message);
        },
        onError: (error: any) => {
            console.error('Failed to resend verification email:', error.response?.data?.error || error.message);
        }
    });
};

export const useVerificationStatus = () => {
    return useQuery({
        queryKey: ['verification-status'],
        queryFn: checkVerificationStatus,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token')
    });
};
