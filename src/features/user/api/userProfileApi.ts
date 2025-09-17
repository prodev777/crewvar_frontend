import { useQuery } from '@tanstack/react-query';
import { api } from '../../../app/api';

export interface IUserProfile {
    id: string;
    email: string;
    display_name: string;
    profile_photo?: string;
    bio?: string;
    phone?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
    website?: string;
    additional_photo_1?: string;
    additional_photo_2?: string;
    additional_photo_3?: string;
    department_id?: string;
    subcategory_id?: string;
    role_id?: string;
    current_ship_id?: string;
    is_email_verified: boolean;
    created_at: string;
    updated_at: string;
    department_name?: string;
    subcategory_name?: string;
    role_name?: string;
    ship_name?: string;
    cruise_line_name?: string;
    connectionStatus: 'none' | 'connected' | 'pending' | 'blocked';
    requestStatus: 'none' | 'pending' | 'accepted' | 'declined';
}

export interface IUserProfileResponse {
    user: IUserProfile;
}

// Get user profile by ID
export const getUserById = async (userId: string): Promise<IUserProfileResponse> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

// Hook for fetching user profile by ID
export const useUserById = (userId: string) => {
    return useQuery<IUserProfileResponse, Error>({
        queryKey: ['user', userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId && !!localStorage.getItem('token'), // Only run when user is authenticated and userId is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
