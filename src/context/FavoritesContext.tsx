import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IFavorite, IFavoriteAlert, IFavoriteContext } from "../types/favorites";
import { 
    useFavoritesQuery,
    useFavoriteAlertsQuery,
    useUnreadAlertsCountQuery,
    useAddFavorite as useAddFavoriteMutation,
    useRemoveFavorite as useRemoveFavoriteMutation,
    useMarkAlertAsRead as useMarkAlertAsReadMutation
} from "../features/favorites/api/favoritesApi";

const FavoritesContext = createContext<IFavoriteContext | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
    // API queries - disabled until backend endpoints are implemented
    const { data: favoritesData } = useFavoritesQuery();
    const { data: alertsData } = useFavoriteAlertsQuery();
    const { data: unreadCountData } = useUnreadAlertsCountQuery();
    
    // Mutations
    const addFavoriteMutation = useAddFavoriteMutation();
    const removeFavoriteMutation = useRemoveFavoriteMutation();
    const markAlertAsReadMutation = useMarkAlertAsReadMutation();

    // Local state with mock data fallback
    const [favorites, setFavorites] = useState<IFavorite[]>([]);
    const [alerts, setAlerts] = useState<IFavoriteAlert[]>([]);
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

    // Update local state when API data changes
    useEffect(() => {
        if (favoritesData?.success) {
            setFavorites(favoritesData.favorites);
        }
    }, [favoritesData]);

    useEffect(() => {
        if (alertsData?.success) {
            setAlerts(alertsData.alerts);
        }
    }, [alertsData]);

    useEffect(() => {
        if (unreadCountData?.success) {
            setUnreadAlertsCount(unreadCountData.count);
        }
    }, [unreadCountData]);

    const addFavorite = async (userId: string) => {
        try {
            const result = await addFavoriteMutation.mutateAsync(userId);
            console.log(`Added ${userId} to favorites`);
            
            // Immediately update local state for better UX
            setFavorites(prev => {
                const newFavorite: IFavorite = {
                    id: result.favoriteId || `temp-${Date.now()}`,
                    userId: '', // Will be updated when query refetches
                    favoriteUserId: userId,
                    createdAt: new Date().toISOString(),
                    isActive: true
                };
                return [...prev, newFavorite];
            });
        } catch (error: any) {
            console.error('Failed to add favorite:', error);
            throw error;
        }
    };

    const removeFavorite = async (userId: string) => {
        try {
            await removeFavoriteMutation.mutateAsync(userId);
            console.log(`Removed ${userId} from favorites`);
            
            // Immediately update local state for better UX
            setFavorites(prev => prev.filter(fav => fav.favoriteUserId !== userId));
        } catch (error: any) {
            console.error('Failed to remove favorite:', error);
            throw error;
        }
    };

    const markAlertAsRead = async (alertId: string) => {
        try {
            await markAlertAsReadMutation.mutateAsync(alertId);
            console.log(`Marked alert ${alertId} as read`);
        } catch (error) {
            console.error('Failed to mark alert as read:', error);
            throw error;
        }
    };

    const checkForAlerts = () => {
        // This would trigger a refetch of alerts
        // In a real implementation, this might be handled by WebSocket updates
        console.log('Checking for new alerts...');
    };

    const isFavorite = (userId: string): boolean => {
        return favorites.some(fav => fav.favoriteUserId === userId);
    };

    const value: IFavoriteContext = {
        favorites,
        alerts,
        unreadAlertsCount,
        addFavorite,
        removeFavorite,
        markAlertAsRead,
        checkForAlerts,
        isFavorite
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};
