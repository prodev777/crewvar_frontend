import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../app/api";

// Types
interface IUserProfile {
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
    is_email_verified?: boolean;
    created_at: string;
    updated_at: string;
}

interface IUpdateProfileData {
    displayName: string;
    profilePhoto?: string;
    departmentId: string;
    subcategoryId: string;
    roleId: string;
    currentShipId: string;
}

interface IUpdateProfileDetailsData {
    bio?: string | null;
    phone?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    facebook?: string | null;
    snapchat?: string | null;
    website?: string | null;
    additionalPhotos?: string[];
}

// Get user profile
const getUserProfile = async (): Promise<IUserProfile> => {
    return api.get("/users/profile").then(response => response.data.user);
};

// Update user profile
const updateUserProfile = async (data: IUpdateProfileData): Promise<{ message: string }> => {
    return api.put("/users/profile", data).then(response => response.data);
};

// Update profile details
const updateProfileDetails = async (data: IUpdateProfileDetailsData): Promise<{ message: string }> => {
    return api.put("/users/profile-details", data).then(response => response.data);
};

// Hooks
export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: getUserProfile,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            // Invalidate and refetch user profile
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });
};

export const useUpdateProfileDetails = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateProfileDetails,
        onSuccess: () => {
            // Invalidate and refetch user profile
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });
};
