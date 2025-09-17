import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// API Response Types
export interface INotification {
    id: string;
    type: 'connection_request' | 'connection_accepted' | 'connection_declined' | 'message' | 'system' | 'assignment' | 'port_connection' | 'moderation';
    title: string;
    message: string;
    data?: any;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export interface INotificationResponse {
    notifications: INotification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface INotificationPreferences {
    type: string;
    email_enabled: boolean;
    push_enabled: boolean;
    in_app_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface IUnreadCountResponse {
    unreadCount: number;
}

// API Functions
export const getNotifications = async (params?: { 
    page?: number; 
    limit?: number; 
    unreadOnly?: boolean; 
}): Promise<INotificationResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());
    
    const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
};

export const getUnreadNotificationCount = async (): Promise<IUnreadCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.put('/notifications/read-all');
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
};

export const getNotificationPreferences = async (): Promise<{ preferences: INotificationPreferences[] }> => {
    const response = await api.get('/notifications/preferences');
    return response.data;
};

export const updateNotificationPreferences = async (preferences: Array<{
    type: string;
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    inAppEnabled?: boolean;
}>): Promise<void> => {
    await api.put('/notifications/preferences', { preferences });
};

// React Query Hooks
export const useNotifications = (params?: { 
    page?: number; 
    limit?: number; 
    unreadOnly?: boolean; 
}) => {
    return useQuery<INotificationResponse, Error>({
        queryKey: ['notifications', params],
        queryFn: () => getNotifications(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
        // Removed refetchInterval to prevent infinite loops
    });
};

export const useUnreadNotificationCount = () => {
    return useQuery<IUnreadCountResponse, Error>({
        queryKey: ['unreadNotificationCount'],
        queryFn: getUnreadNotificationCount,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
        // Removed refetchInterval to prevent infinite loops
    });
};

export const useNotificationPreferences = () => {
    return useQuery<{ preferences: INotificationPreferences[] }, Error>({
        queryKey: ['notificationPreferences'],
        queryFn: getNotificationPreferences,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, string>({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
        },
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, void>({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, string>({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
        },
    });
};

export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, Array<{
        type: string;
        emailEnabled?: boolean;
        pushEnabled?: boolean;
        inAppEnabled?: boolean;
    }>>({
        mutationFn: updateNotificationPreferences,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
        },
    });
};
