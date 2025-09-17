import { useQuery } from '@tanstack/react-query';
import { api } from '../../../app/api';

export interface ICrewMember {
    id: string;
    display_name: string;
    profile_photo?: string;
    department_name?: string;
    subcategory_name?: string;
    role_name?: string;
    ship_name: string;
    cruise_line_name: string;
}

export interface ICrewOnboardResponse {
    success: boolean;
    crew: ICrewMember[];
    shipInfo: {
        ship_name: string;
        cruise_line_name: string;
        total_crew: number;
    };
}

export interface IUserProfileResponse {
    success: boolean;
    profile: {
        id: string;
        display_name: string;
        profile_photo?: string;
        department_name?: string;
        subcategory_name?: string;
        role_name?: string;
        ship_name: string;
        cruise_line_name: string;
        bio?: string;
        phone?: string;
        instagram?: string;
        twitter?: string;
        facebook?: string;
        snapchat?: string;
        website?: string;
        additional_photos?: string[];
        created_at: string;
        is_same_ship: boolean;
        connection_status: 'none' | 'pending' | 'connected' | 'blocked';
    };
}

// Hook to fetch crew members on the same ship
export const useCrewOnboard = () => {
    return useQuery<ICrewOnboardResponse>({
        queryKey: ['crew-onboard'],
        queryFn: async () => {
            try {
                console.log('🚢 Starting crew onboard API call...');
                console.log('Token check:', !!localStorage.getItem('token'));
                
                const response = await api.get('/crew/onboard');
                console.log('✅ Crew onboard response:', response.data);
                return response.data;
            } catch (error: any) {
                console.error('❌ Crew onboard API error:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url
                });
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

// Hook to fetch a specific user's profile
export const useUserProfile = (userId: string) => {
    return useQuery<IUserProfileResponse>({
        queryKey: ['user-profile', userId],
        queryFn: async () => {
            try {
                console.log('Fetching crew profile for userId:', userId);
                const response = await api.get(`/crew/profile/${userId}`);
                console.log('Crew profile API response:', response.data);
                return response.data;
            } catch (error: any) {
                console.error('Crew profile API error:', error);
                console.error('Error status:', error.response?.status);
                console.error('Error data:', error.response?.data);
                throw error;
            }
        },
        enabled: !!userId && !!localStorage.getItem('token'), // Only run when user is authenticated and userId is provided
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2
    });
};
