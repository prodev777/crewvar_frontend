// Port Connections Types
export interface IPortConnection {
    id: string;
    userId: string;
    userDisplayName: string;
    userRole: string;
    shipId: string;
    shipName: string;
    portName: string;
    dockedWithShipId: string;
    dockedWithShipName: string;
    date: string; // YYYY-MM-DD format
    createdAt: string;
    status: 'active' | 'expired';
}

export interface IShipDocking {
    shipId: string;
    shipName: string;
    cruiseLineId: string;
    cruiseLineName: string;
    portName: string;
    date: string;
    connectedShips: string[]; // Array of ship IDs docked together
    crewCount: number;
}

export interface IPort {
    id: string;
    name: string;
    country: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface IPortConnectionContext {
    portConnections: IPortConnection[];
    isLoading?: boolean;
    addPortConnection: (connection: Omit<IPortConnection, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    removePortConnection: (connectionId: string) => Promise<void>;
    getConnectionsForPort: (portName: string, date: string) => IPortConnection[];
    getConnectionsForShip: (shipId: string, date: string) => IPortConnection[];
    getCrewInSamePort: (portName: string, shipId: string, date: string) => IPortConnection[];
    isShipDockedInPort: (shipId: string, portName: string, date: string) => boolean;
}

export interface IPortConnectionFormData {
    cruiseLineId: string;
    dockedWithShipId: string;
    date: string;
}
