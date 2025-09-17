export interface IFavorite {
    id: string;
    userId: string; // User who marked as favorite
    favoriteUserId: string; // User who is favorited
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
    date: string; // YYYY-MM-DD format
    isRead: boolean;
    createdAt: string;
    message: string;
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

export interface IFavoriteContext {
    favorites: IFavorite[];
    alerts: IFavoriteAlert[];
    unreadAlertsCount: number;
    addFavorite: (userId: string) => void;
    removeFavorite: (userId: string) => void;
    markAlertAsRead: (alertId: string) => void;
    checkForAlerts: () => void;
    isFavorite: (userId: string) => boolean;
}
