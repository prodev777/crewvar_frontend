import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

export interface IFavorite {
    id: string;
    userId: string;
    favoriteUserId: string;
    createdAt: string;
    isActive?: boolean;
    favoriteUser?: {
        id: string;
        displayName: string;
        profilePhoto?: string;
        role?: string;
        department?: string;
        shipName?: string;
        cruiseLine?: string;
    };
}

export interface IFavoriteAlert {
    id: string;
    userId: string;
    favoriteUserId: string;
    alertType: 'same_ship' | 'same_port' | 'both';
    shipName: string;
    port?: string;
    date: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    favoriteUser?: {
        id: string;
        displayName: string;
        profilePhoto?: string;
        role?: string;
        department?: string;
        shipName?: string;
        cruiseLine?: string;
    };
}

export interface IFavoritesResponse {
    success: boolean;
    favorites: IFavorite[];
    total: number;
}

export interface IFavoriteAlertsResponse {
    success: boolean;
    alerts: IFavoriteAlert[];
    total: number;
}

export interface IUnreadAlertsCountResponse {
    success: boolean;
    count: number;
}

// Get user's favorites
export const useFavoritesQuery = () => {
    return useQuery({
        queryKey: ['favorites'],
        queryFn: async (): Promise<IFavoritesResponse> => {
            try {
                const response = await api.get('/favorites');
                return response.data;
            } catch (error) {
                console.warn('Favorites API failed, using empty data:', error);
                return {
                    success: true,
                    favorites: [],
                    total: 0
                };
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Only retry once
        enabled: !!localStorage.getItem('token')
    });
};

// Get user's favorite alerts
export const useFavoriteAlertsQuery = () => {
    return useQuery({
        queryKey: ['favorite-alerts'],
        queryFn: async (): Promise<IFavoriteAlertsResponse> => {
            try {
                const response = await api.get('/favorites/alerts');
                return response.data;
            } catch (error) {
                console.warn('Favorite alerts API failed, using empty data:', error);
                return {
                    success: true,
                    alerts: [],
                    total: 0
                };
            }
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1, // Only retry once
        enabled: !!localStorage.getItem('token')
    });
};

// Get unread alerts count
export const useUnreadAlertsCountQuery = () => {
    return useQuery({
        queryKey: ['unread-alerts-count'],
        queryFn: async (): Promise<IUnreadAlertsCountResponse> => {
            try {
                const response = await api.get('/favorites/alerts/unread-count');
                return response.data;
            } catch (error) {
                console.warn('Unread alerts count API failed, using zero:', error);
                return {
                    success: true,
                    count: 0
                };
            }
        },
        staleTime: 1 * 60 * 1000, // 1 minute
        retry: 1, // Only retry once
        enabled: !!localStorage.getItem('token')
    });
};

// Add favorite
export const useAddFavorite = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (favoriteUserId: string) => {
            const response = await api.post('/favorites', { favoriteUserId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
        onError: (error: any) => {
            console.error('Failed to add favorite:', error);
            throw error;
        }
    });
};

// Remove favorite
export const useRemoveFavorite = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (favoriteUserId: string) => {
            const response = await api.delete(`/favorites/${favoriteUserId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
        onError: (error: any) => {
            console.error('Failed to remove favorite:', error);
            throw error;
        }
    });
};

// Mark alert as read
export const useMarkAlertAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (alertId: string) => {
            const response = await api.put(`/favorites/alerts/${alertId}/read`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorite-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['unread-alerts-count'] });
        },
        onError: (error: any) => {
            console.error('Failed to mark alert as read:', error);
            throw error;
        }
    });
};

// Check if user is favorite
export const useCheckFavoriteStatus = (userId: string) => {
    return useQuery({
        queryKey: ['favorite-status', userId],
        queryFn: async (): Promise<{ success: boolean; isFavorite: boolean }> => {
            try {
                const response = await api.get(`/favorites/status/${userId}`);
                return response.data;
            } catch (error) {
                console.warn('Check favorite status API failed:', error);
                return {
                    success: true,
                    isFavorite: false
                };
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        enabled: !!localStorage.getItem('token') && !!userId
    });
};