import { createContext, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
    useNotifications,
    useUnreadNotificationCount,
    useNotificationPreferences,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useDeleteNotification,
    useUpdateNotificationPreferences,
    INotification,
    INotificationPreferences
} from '../features/notifications/api/notificationApi';

export interface INotificationContext {
    notifications: INotification[];
    unreadCount: number;
    preferences: INotificationPreferences[];
    isLoading: boolean;
    isLoadingCount: boolean;
    isLoadingPreferences: boolean;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    updatePreferences: (preferences: Array<{
        type: string;
        emailEnabled?: boolean;
        pushEnabled?: boolean;
        inAppEnabled?: boolean;
    }>) => Promise<void>;
    refetchNotifications: () => void;
    refetchUnreadCount: () => void;
}

const NotificationContext = createContext<INotificationContext | undefined>(undefined);

export const useNotificationsContext = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationsContext must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    // Query client for cache invalidation
    const queryClient = useQueryClient();
    
    // API hooks
    const { 
        data: notificationsData, 
        isLoading: isLoadingNotifications,
        refetch: refetchNotifications,
        error: notificationsError
    } = useNotifications({ limit: 50 });
    
    const { 
        data: unreadCountData, 
        isLoading: isLoadingCount,
        refetch: refetchUnreadCount,
        error: unreadCountError
    } = useUnreadNotificationCount();

    // Debug logging (reduced to prevent infinite loops)
    if (notificationsError || unreadCountError) {
        console.log('🔔 NotificationProvider Error:', {
            notificationsError,
            unreadCountError
        });
    }
    
    const { 
        data: preferencesData, 
        isLoading: isLoadingPreferences 
    } = useNotificationPreferences();
    
    // Mutation hooks
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const deleteNotificationMutation = useDeleteNotification();
    const updatePreferencesMutation = useUpdateNotificationPreferences();

    // Extract data
    const notifications = notificationsData?.notifications || [];
    const unreadCount = unreadCountData?.unreadCount || 0;
    const preferences = preferencesData?.preferences || [];

    // Action functions
    const markAsRead = async (notificationId: string) => {
        await markAsReadMutation.mutateAsync(notificationId);
    };

    const markAllAsRead = async () => {
        await markAllAsReadMutation.mutateAsync();
    };

    const deleteNotification = async (notificationId: string) => {
        await deleteNotificationMutation.mutateAsync(notificationId);
    };

    const updatePreferences = async (preferences: Array<{
        type: string;
        emailEnabled?: boolean;
        pushEnabled?: boolean;
        inAppEnabled?: boolean;
    }>) => {
        await updatePreferencesMutation.mutateAsync(preferences);
    };

    const isLoading = isLoadingNotifications || 
                     markAsReadMutation.isLoading || 
                     markAllAsReadMutation.isLoading || 
                     deleteNotificationMutation.isLoading || 
                     updatePreferencesMutation.isLoading;

    // Listen for real-time notifications
    useEffect(() => {
        const handleRealtimeNotification = (event: CustomEvent) => {
            const notification = event.detail;
            console.log('🔔 Processing real-time notification:', notification);
            
            // Show toast alert based on notification type
            switch (notification.type) {
                case 'ship_connected':
                    toast.success(notification.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    break;
                case 'connection_request':
                    toast.info(notification.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    // Invalidate connection requests cache to update UI immediately
                    queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
                    queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
                    break;
                case 'connection_accepted':
                    toast.success(notification.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    // Invalidate connection-related caches
                    queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
                    queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
                    queryClient.invalidateQueries({ queryKey: ['connections'] });
                    break;
                case 'connection_declined':
                    toast.warning(notification.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    // Invalidate connection-related caches
                    queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
                    queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
                    break;
                default:
                    toast.info(notification.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
            }
            
            // Refresh notifications to show the new one
            refetchNotifications();
            refetchUnreadCount();
        };

        // Add event listener
        window.addEventListener('realtime-notification', handleRealtimeNotification as EventListener);

        // Cleanup
        return () => {
            window.removeEventListener('realtime-notification', handleRealtimeNotification as EventListener);
        };
    }, [refetchNotifications, refetchUnreadCount, queryClient]);

    const value: INotificationContext = {
        notifications,
        unreadCount,
        preferences,
        isLoading,
        isLoadingCount,
        isLoadingPreferences,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        updatePreferences,
        refetchNotifications,
        refetchUnreadCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
