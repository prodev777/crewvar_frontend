import { useState } from "react";
import { useFavorites } from "../context/FavoritesContext";
import { IFavoriteAlert } from "../types/favorites";
import { useConnections } from "../features/connections/api/connectionApi";
import { IConnection } from "../features/connections/api/connectionApi";

interface FavoritesAlertsProps {
    onViewProfile?: (userId: string) => void;
    onStartChat?: (userId: string) => void;
}

export const FavoritesAlerts = ({ onViewProfile, onStartChat }: FavoritesAlertsProps) => {
    const { alerts, unreadAlertsCount, markAlertAsRead } = useFavorites();
    const { data: connectionsData } = useConnections();
    const [filter, setFilter] = useState<'all' | 'unread' | 'same_ship' | 'same_port'>('all');

    // Get connected users for display names
    const connectedUsers = connectionsData?.connections?.map((conn: IConnection) => {
        const otherUserId = conn.user1_id === 'current-user-id' ? conn.user2_id : conn.user1_id;
        return {
            id: otherUserId,
            displayName: conn.display_name || `User ${otherUserId.slice(-4)}`,
        };
    }) || [];

    const filteredAlerts = alerts.filter(alert => {
        switch (filter) {
            case 'unread':
                return !alert.isRead;
            case 'same_ship':
                return alert.alertType === 'same_ship' || alert.alertType === 'both';
            case 'same_port':
                return alert.alertType === 'same_port' || alert.alertType === 'both';
            default:
                return true;
        }
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const getAlertIcon = (alertType: string) => {
        switch (alertType) {
            case 'same_ship':
                return '🚢';
            case 'same_port':
                return '⚓';
            case 'both':
                return '🌟';
            default:
                return '⭐';
        }
    };

    const getAlertColor = (alertType: string) => {
        switch (alertType) {
            case 'same_ship':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'same_port':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'both':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const handleAlertClick = async (alert: IFavoriteAlert) => {
        if (!alert.isRead) {
            try {
                await markAlertAsRead(alert.id);
            } catch (error) {
                console.error('Failed to mark alert as read:', error);
            }
        }
        
        if (onViewProfile) {
            onViewProfile(alert.favoriteUserId);
        }
    };

    const getCrewMemberName = (userId: string) => {
        const profile = connectedUsers.find((p: any) => p.id === userId);
        return profile?.displayName || 'Unknown Crew Member';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg lg:text-xl font-semibold text-[#069B93]">Favorites Alerts</h2>
                    {unreadAlertsCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {unreadAlertsCount}
                        </span>
                    )}
                </div>
                <div className="text-xs lg:text-sm text-gray-500">
                    We'll let you know when you sail together again
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 mb-4 lg:mb-6 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 min-w-0 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-md transition-colors ${
                        filter === 'all'
                            ? 'bg-white text-[#069B93] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    All ({alerts.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 min-w-0 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-md transition-colors ${
                        filter === 'unread'
                            ? 'bg-white text-[#069B93] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Unread ({unreadAlertsCount})
                </button>
                <button
                    onClick={() => setFilter('same_ship')}
                    className={`flex-1 min-w-0 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-md transition-colors ${
                        filter === 'same_ship'
                            ? 'bg-white text-[#069B93] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Same Ship
                </button>
                <button
                    onClick={() => setFilter('same_port')}
                    className={`flex-1 min-w-0 px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-md transition-colors ${
                        filter === 'same_port'
                            ? 'bg-white text-[#069B93] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Same Port
                </button>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⭐</span>
                        </div>
                        <p className="text-gray-500">
                            {filter === 'unread' 
                                ? 'No unread alerts' 
                                : filter === 'same_ship'
                                ? 'No same ship alerts'
                                : filter === 'same_port'
                                ? 'No same port alerts'
                                : 'No favorite alerts yet'
                            }
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Add crew members to your favorites to get alerts when you're sailing together!
                        </p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            onClick={() => handleAlertClick(alert)}
                            className={`
                                border rounded-lg p-3 lg:p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                                ${alert.isRead 
                                    ? 'border-gray-200 bg-white' 
                                    : 'border-[#069B93] bg-[#069B93]/5'
                                }
                            `}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-base lg:text-lg ${getAlertColor(alert.alertType)}`}>
                                        {getAlertIcon(alert.alertType)}
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-1 sm:space-y-0">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">
                                            {getCrewMemberName(alert.favoriteUserId)} - {alert.alertType === 'same_ship' ? 'Same Ship Today!' :
                                             alert.alertType === 'same_port' ? 'Same Port Today!' :
                                             'Sailing Together!'}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">
                                                {formatDate(alert.date)}
                                            </span>
                                            {!alert.isRead && (
                                                <div className="w-2 h-2 bg-[#069B93] rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs lg:text-sm text-gray-600 mt-1">
                                        {alert.message}
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 space-y-2 sm:space-y-0">
                                        <div className="text-xs text-gray-500">
                                            <span className="font-medium">{alert.shipName}</span>
                                            {alert.port && (
                                                <span> • {alert.port}</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                            {onViewProfile && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewProfile(alert.favoriteUserId);
                                                    }}
                                                    className="text-xs text-[#069B93] hover:text-[#058a7a] font-medium"
                                                >
                                                    View Profile
                                                </button>
                                            )}
                                            {onStartChat && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onStartChat(alert.favoriteUserId);
                                                    }}
                                                    className="text-xs text-[#069B93] hover:text-[#058a7a] font-medium"
                                                >
                                                    Start Chat
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
