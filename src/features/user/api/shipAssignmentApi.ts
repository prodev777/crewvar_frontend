import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

export interface ShipAssignmentUpdate {
    currentShipId: string;
}

export interface ShipAssignmentResponse {
    message: string;
}

// Update user's current ship assignment
export const updateShipAssignment = async (data: ShipAssignmentUpdate): Promise<ShipAssignmentResponse> => {
    const response = await api.put('/users/ship-assignment', {
        currentShipId: data.currentShipId
    });
    return response.data;
};

// Hook for updating ship assignment
export const useUpdateShipAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateShipAssignment,
        onSuccess: () => {
            // Invalidate and refetch user profile data
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
            // Also invalidate crew data since ship assignment affects crew visibility
            queryClient.invalidateQueries({ queryKey: ['crew', 'onboard'] });
            // Invalidate connections data
            queryClient.invalidateQueries({ queryKey: ['connections'] });
        },
        onError: (error) => {
            console.error('Failed to update ship assignment:', error);
        }
    });
};

// Get current ship assignment from user profile
export const useCurrentShipAssignment = () => {
    // This will be used with the existing user profile query
    // The ship assignment is part of the user profile data
    return null; // Placeholder - will use existing user profile hook
};
