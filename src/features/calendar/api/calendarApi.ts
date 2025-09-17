import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// API Response Types
export interface ICruiseAssignmentResponse {
    assignments: Array<{
        id: string;
        user_id: string;
        cruise_line_id: string;
        ship_id: string;
        start_date: string;
        end_date: string;
        status: 'upcoming' | 'current' | 'completed' | 'cancelled';
        created_at: string;
        updated_at: string;
        cruise_line_name: string;
        ship_name: string;
    }>;
}

export interface ICalendarEventResponse {
    events: Array<{
        id: string;
        user_id: string;
        title: string;
        start_date: string;
        end_date: string;
        event_type: 'assignment' | 'port' | 'personal';
        assignment_id: string | null;
        description: string | null;
        color: string;
        created_at: string;
        updated_at: string;
    }>;
}

export interface IAssignmentResponse {
    assignment: {
        id: string;
        user_id: string;
        cruise_line_id: string;
        ship_id: string;
        start_date: string;
        end_date: string;
        status: 'upcoming' | 'current' | 'completed' | 'cancelled';
        created_at: string;
        updated_at: string;
        cruise_line_name: string;
        ship_name: string;
    };
}

export interface IEventResponse {
    event: {
        id: string;
        user_id: string;
        title: string;
        start_date: string;
        end_date: string;
        event_type: 'assignment' | 'port' | 'personal';
        assignment_id: string | null;
        description: string | null;
        color: string;
        created_at: string;
        updated_at: string;
    };
}

// API Functions
export const getCruiseAssignments = async (params?: { startDate?: string; endDate?: string }): Promise<ICruiseAssignmentResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/calendar/assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
};

export const getCalendarEvents = async (params?: { startDate?: string; endDate?: string }): Promise<ICalendarEventResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/calendar/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
};

export const createCruiseAssignment = async (assignmentData: {
    cruiseLineId: string;
    shipId: string;
    startDate: string;
    endDate: string;
    status?: 'upcoming' | 'current' | 'completed' | 'cancelled';
}): Promise<IAssignmentResponse> => {
    const response = await api.post('/calendar/assignments', assignmentData);
    return response.data;
};

export const updateCruiseAssignment = async (assignmentId: string, updates: {
    cruiseLineId?: string;
    shipId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'upcoming' | 'current' | 'completed' | 'cancelled';
}): Promise<IAssignmentResponse> => {
    const response = await api.put(`/calendar/assignments/${assignmentId}`, updates);
    return response.data;
};

export const deleteCruiseAssignment = async (assignmentId: string): Promise<void> => {
    await api.delete(`/calendar/assignments/${assignmentId}`);
};

export const createCalendarEvent = async (eventData: {
    title: string;
    startDate: string;
    endDate: string;
    eventType: 'assignment' | 'port' | 'personal';
    assignmentId?: string;
    description?: string;
    color?: string;
}): Promise<IEventResponse> => {
    const response = await api.post('/calendar/events', eventData);
    return response.data;
};

export const getCurrentAssignment = async (): Promise<{ assignment: any }> => {
    const response = await api.get('/calendar/assignments/current');
    return response.data;
};

export const getUpcomingAssignments = async (limit?: number): Promise<ICruiseAssignmentResponse> => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const url = `/calendar/assignments/upcoming${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
};

// React Query Hooks
export const useCruiseAssignments = (params?: { startDate?: string; endDate?: string }) => {
    return useQuery<ICruiseAssignmentResponse, Error>({
        queryKey: ['cruiseAssignments', params],
        queryFn: () => getCruiseAssignments(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useCalendarEvents = (params?: { startDate?: string; endDate?: string }) => {
    return useQuery<ICalendarEventResponse, Error>({
        queryKey: ['calendarEvents', params],
        queryFn: () => getCalendarEvents(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useCreateCruiseAssignment = () => {
    const queryClient = useQueryClient();
    
    return useMutation<IAssignmentResponse, Error, Parameters<typeof createCruiseAssignment>[0]>({
        mutationFn: createCruiseAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cruiseAssignments'] });
            queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
        },
    });
};

export const useUpdateCruiseAssignment = () => {
    const queryClient = useQueryClient();
    
    return useMutation<IAssignmentResponse, Error, { assignmentId: string; updates: Parameters<typeof updateCruiseAssignment>[1] }>({
        mutationFn: ({ assignmentId, updates }) => updateCruiseAssignment(assignmentId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cruiseAssignments'] });
            queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
        },
    });
};

export const useDeleteCruiseAssignment = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, string>({
        mutationFn: deleteCruiseAssignment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cruiseAssignments'] });
            queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
        },
    });
};

export const useCreateCalendarEvent = () => {
    const queryClient = useQueryClient();
    
    return useMutation<IEventResponse, Error, Parameters<typeof createCalendarEvent>[0]>({
        mutationFn: createCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
        },
    });
};

export const useCurrentAssignment = () => {
    return useQuery<{ assignment: any }, Error>({
        queryKey: ['currentAssignment'],
        queryFn: getCurrentAssignment,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useUpcomingAssignments = (limit?: number) => {
    return useQuery<ICruiseAssignmentResponse, Error>({
        queryKey: ['upcomingAssignments', limit],
        queryFn: () => getUpcomingAssignments(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};
