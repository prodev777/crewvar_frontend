import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// Types
export interface IPortConnection {
    id: string;
    shipId1: string;
    shipId2: string;
    portName: string;
    date: string;
    startTime: string;
    endTime?: string;
    status: 'active' | 'ended';
    createdAt: string;
    ship1Name?: string;
    ship2Name?: string;
}

export interface ICrewInPort {
    id: string;
    displayName: string;
    role: string;
    department: string;
    shipId: string;
    shipName: string;
    cruiseLineName: string;
    profilePhoto?: string;
    isOnline: boolean;
}

export interface IPortConnectionFormData {
    linkedShipId: string;
    portName: string;
    date: string;
    startTime: string;
}

// API functions
export const getCrewInPort = async (date?: string): Promise<{ crew: ICrewInPort[] }> => {
    const params = date ? { date } : {};
    const response = await api.get('/port-linking/crew-in-port', { params });
    return response.data;
};

export const linkShips = async (data: {
    linkedShipId: string;
    portName: string;
    date: string;
    startTime: string;
}): Promise<{ message: string; connectionId: string }> => {
    const response = await api.post('/port-linking/link-ships', data);
    return response.data;
};

export const unlinkShips = async (connectionId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/port-linking/unlink-ships/${connectionId}`);
    return response.data;
};

export const getPortConnections = async (shipId?: string, date?: string): Promise<{ connections: IPortConnection[] }> => {
    const params: any = {};
    if (shipId) params.shipId = shipId;
    if (date) params.date = date;
    
    const response = await api.get('/port-linking/connections', { params });
    return response.data;
};

// React Query hooks
export const useCrewInPort = (date?: string) => {
    return useQuery({
        queryKey: ['port-linking', 'crew-in-port', date],
        queryFn: () => getCrewInPort(date),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

export const useLinkShips = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: linkShips,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['port-linking'] });
        },
    });
};

export const useUnlinkShips = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: unlinkShips,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['port-linking'] });
        },
    });
};

export const usePortConnections = (shipId?: string, date?: string) => {
    return useQuery({
        queryKey: ['port-linking', 'connections', shipId, date],
        queryFn: () => getPortConnections(shipId, date),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};
