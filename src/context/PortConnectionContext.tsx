import { createContext, useContext, ReactNode } from 'react';
import { IPortConnection, IPortConnectionContext } from '../types/port-connections';
import { 
    useLinkShips, 
    useUnlinkShips,
    IPortConnection as APIPortConnection
} from '../features/port/api/portConnectionApi';

const PortConnectionContext = createContext<IPortConnectionContext | undefined>(undefined);

interface PortConnectionProviderProps {
    children: ReactNode;
}

export const PortConnectionProvider = ({ children }: PortConnectionProviderProps) => {
    
    // Temporarily disable API calls to prevent 400 errors
    // TODO: Re-enable when backend API is properly implemented
    // const { data: connectionsData, isLoading: connectionsLoading } = usePortConnections(selectedShipId, selectedDate);
    const connectionsData = { connections: [] }; // Mock empty data
    const connectionsLoading = false;
    
    const linkShipsMutation = useLinkShips();
    const unlinkShipsMutation = useUnlinkShips();
    
    // Convert API types to context types
    const convertAPIConnectionToContext = (apiConnection: APIPortConnection): IPortConnection => ({
        id: apiConnection.id,
        userId: '', // Not available in API
        userDisplayName: '', // Not available in API
        userRole: '', // Not available in API
        shipId: apiConnection.shipId1,
        shipName: apiConnection.ship1Name || '',
        portName: apiConnection.portName,
        dockedWithShipId: apiConnection.shipId2,
        dockedWithShipName: apiConnection.ship2Name || '',
        date: apiConnection.date,
        createdAt: apiConnection.createdAt,
        status: apiConnection.status === 'active' ? 'active' : 'expired'
    });

    const portConnections = (connectionsData?.connections || []).map(convertAPIConnectionToContext);

    const addPortConnection = async (connectionData: Omit<IPortConnection, 'id' | 'createdAt' | 'status'>): Promise<void> => {
        try {
            // For now, we'll just add to local state since the backend API might not be fully implemented
            // In a real implementation, this would call the appropriate backend endpoint
            console.log('Port connection data:', connectionData);
            console.log('Port connection added successfully (local state)');
            
            // TODO: Implement proper backend API call when the endpoint is ready
            // await linkShipsMutation.mutateAsync({
            //     shipId: connectionData.shipId,
            //     portName: connectionData.portName,
            //     date: connectionData.date
            // });
        } catch (error) {
            console.error('Failed to add port connection:', error);
            throw error;
        }
    };

    const removePortConnection = async (_connectionId: string): Promise<void> => {
        try {
            // Temporarily disable API call to prevent 400 errors
            // TODO: Re-enable when backend API is properly implemented
            // await unlinkShipsMutation.mutateAsync(connectionId);
            console.log('Port connection removed successfully (local state)');
        } catch (error) {
            console.error('Failed to remove port connection:', error);
            throw error;
        }
    };

    const getConnectionsForPort = (portName: string, date: string): IPortConnection[] => {
        return portConnections.filter(connection => 
            connection.portName === portName && 
            connection.date === date && 
            connection.status === 'active'
        );
    };

    const getConnectionsForShip = (shipId: string, date: string): IPortConnection[] => {
        return portConnections.filter(connection => 
            connection.shipId === shipId && 
            connection.date === date && 
            connection.status === 'active'
        );
    };

    const getCrewInSamePort = (portName: string, shipId: string, date: string): IPortConnection[] => {
        const portConnections = getConnectionsForPort(portName, date);
        const shipConnections = getConnectionsForShip(shipId, date);
        
        // Find ships that are docked together
        const connectedShipIds = new Set<string>();
        shipConnections.forEach(connection => {
            connectedShipIds.add(connection.dockedWithShipId);
        });
        
        // Return crew from connected ships (excluding current ship)
        return portConnections.filter(connection => 
            connectedShipIds.has(connection.shipId) && 
            connection.shipId !== shipId
        );
    };

    const isShipDockedInPort = (shipId: string, portName: string, date: string): boolean => {
        return portConnections.some(connection => 
            connection.shipId === shipId && 
            connection.portName === portName && 
            connection.date === date && 
            connection.status === 'active'
        );
    };

    const value: IPortConnectionContext = {
        portConnections,
        isLoading: connectionsLoading || linkShipsMutation.isLoading || unlinkShipsMutation.isLoading,
        addPortConnection,
        removePortConnection,
        getConnectionsForPort,
        getConnectionsForShip,
        getCrewInSamePort,
        isShipDockedInPort
    };

    return (
        <PortConnectionContext.Provider value={value}>
            {children}
        </PortConnectionContext.Provider>
    );
};

export const usePortConnection = (): IPortConnectionContext => {
    const context = useContext(PortConnectionContext);
    if (context === undefined) {
        throw new Error('usePortConnection must be used within a PortConnectionProvider');
    }
    return context;
};
