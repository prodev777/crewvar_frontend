import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// Types
export interface IReport {
    id: string;
    reporterId: string;
    reportedUserId: string;
    reportType: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'other';
    description: string;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    resolution?: string;
    createdAt: string;
    updatedAt: string;
    reporterName?: string;
    reportedUserName?: string;
}

export interface IModerationAction {
    id: string;
    reportId?: string;
    moderatorId: string;
    targetUserId: string;
    actionType: 'warning' | 'temporary_ban' | 'permanent_ban';
    reason: string;
    isActive: boolean;
    createdAt: string;
}

export interface IModerationStats {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    totalActions: number;
    warnings: number;
    temporaryBans: number;
    permanentBans: number;
}

export interface ISuspiciousActivity {
    id: string;
    userId: string;
    activityType: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    status: 'active' | 'investigated' | 'resolved';
    createdAt: string;
}

// API functions
export const getReports = async (): Promise<{ reports: IReport[] }> => {
    const response = await api.get('/moderation/reports');
    return response.data;
};

export const getReportById = async (id: string): Promise<{ report: IReport }> => {
    const response = await api.get(`/moderation/reports/${id}`);
    return response.data;
};

export const updateReportStatus = async ({ 
    id, 
    status, 
    resolution 
}: { 
    id: string; 
    status: IReport['status']; 
    resolution?: string; 
}): Promise<{ message: string }> => {
    const response = await api.put(`/moderation/reports/${id}/status`, {
        status,
        resolution
    });
    return response.data;
};

export const getSuspiciousActivities = async (): Promise<{ activities: ISuspiciousActivity[] }> => {
    const response = await api.get('/moderation/suspicious');
    return response.data;
};

export const getModerationStats = async (): Promise<{ stats: IModerationStats }> => {
    const response = await api.get('/moderation/stats');
    return response.data;
};

export const performModerationAction = async (data: {
    reportId?: string;
    actionType: IModerationAction['actionType'];
    targetUserId: string;
    reason: string;
    isActive?: boolean;
}): Promise<{ message: string }> => {
    const response = await api.post('/moderation/actions', data);
    return response.data;
};

export const submitReport = async (data: {
    reportedUserId: string;
    reportType: IReport['reportType'];
    description: string;
}): Promise<{ message: string }> => {
    const response = await api.post('/moderation/reports', data);
    return response.data;
};

// React Query hooks
export const useReports = () => {
    return useQuery({
        queryKey: ['moderation', 'reports'],
        queryFn: getReports,
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useReportById = (id: string) => {
    return useQuery({
        queryKey: ['moderation', 'reports', id],
        queryFn: () => getReportById(id),
        enabled: !!id && !!localStorage.getItem('token'), // Only run when user is authenticated and id is provided
    });
};

export const useUpdateReportStatus = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateReportStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderation', 'reports'] });
            queryClient.invalidateQueries({ queryKey: ['moderation', 'stats'] });
        },
    });
};

export const useSuspiciousActivities = () => {
    return useQuery({
        queryKey: ['moderation', 'suspicious'],
        queryFn: getSuspiciousActivities,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useModerationStats = () => {
    return useQuery({
        queryKey: ['moderation', 'stats'],
        queryFn: getModerationStats,
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const usePerformModerationAction = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: performModerationAction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderation', 'reports'] });
            queryClient.invalidateQueries({ queryKey: ['moderation', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['moderation', 'actions'] });
        },
    });
};

export const useSubmitReport = () => {
    return useMutation({
        mutationFn: submitReport,
    });
};
