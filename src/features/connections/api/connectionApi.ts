import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

export interface IConnectionRequest {
    id: string;
    requester_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    message?: string;
    created_at: string;
    display_name: string;
    profile_photo?: string;
    role_name?: string;
    department_name?: string;
    ship_name?: string;
    cruise_line_name?: string;
}

export interface IConnection {
    id: string;
    user1_id: string;
    user2_id: string;
    created_at: string;
    display_name: string;
    profile_photo?: string;
    role_name?: string;
    department_name?: string;
    ship_name?: string;
    cruise_line_name?: string;
}

export interface IConnectionStatus {
    success: boolean;
    status: 'none' | 'pending' | 'accepted' | 'declined' | 'blocked' | 'connected';
}

export interface IConnectionRequestsResponse {
    success: boolean;
    requests: IConnectionRequest[];
}

export interface IConnectionsResponse {
    success: boolean;
    connections: IConnection[];
}

// Send connection request
export const useSendConnectionRequest = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ receiverId, message }: { receiverId: string; message?: string }) => {
            const response = await api.post('/connections/request', {
                receiverId,
                message
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate connection-related queries
            queryClient.invalidateQueries({ queryKey: ['connection-status'] });
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
        },
        onError: (error: any) => {
            console.error('Send connection request error:', error);
            throw error;
        }
    });
};

// Get pending connection requests
export const usePendingRequests = () => {
    return useQuery<IConnectionRequestsResponse>({
        queryKey: ['pending-requests'],
        queryFn: async () => {
            const response = await api.get('/connections/pending');
            return response.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        retry: 2,
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

// Respond to connection request
export const useRespondToConnectionRequest = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ requestId, action }: { requestId: string; action: 'accept' | 'decline' }) => {
            const response = await api.post('/connections/respond', {
                requestId,
                action
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate connection-related queries
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
            queryClient.invalidateQueries({ queryKey: ['connections'] });
            queryClient.invalidateQueries({ queryKey: ['connection-status'] });
        },
        onError: (error: any) => {
            console.error('Respond to connection request error:', error);
            throw error;
        }
    });
};

// Get all connections
export const useConnections = () => {
    return useQuery<IConnectionsResponse>({
        queryKey: ['connections'],
        queryFn: async () => {
            const response = await api.get('/connections/list');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

// Remove connection
export const useRemoveConnection = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (connectionId: string) => {
            const response = await api.delete(`/connections/${connectionId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate connection-related queries
            queryClient.invalidateQueries({ queryKey: ['connections'] });
            queryClient.invalidateQueries({ queryKey: ['connection-status'] });
        },
        onError: (error: any) => {
            console.error('Remove connection error:', error);
            throw error;
        }
    });
};

// Check connection status between current user and target user
export const useConnectionStatus = (targetUserId: string) => {
    return useQuery<IConnectionStatus>({
        queryKey: ['connection-status', targetUserId],
        queryFn: async () => {
            const response = await api.get(`/connections/status/${targetUserId}`);
            return response.data;
        },
        enabled: !!targetUserId && !!localStorage.getItem('token'), // Only run when user is authenticated and targetUserId is provided
        staleTime: 30 * 1000, // 30 seconds
        retry: 2
    });
};