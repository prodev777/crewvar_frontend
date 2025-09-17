export interface ICrewMember {
    id: string;
    name: string;
    role: string;
    department: string;
    shipName: string;
    port?: string;
    photo?: string;
    bio?: string;
    contacts?: string[];
    links?: string[];
    todayAssignment?: string;
    isOnline?: boolean;
    lastSeen?: Date;
}
