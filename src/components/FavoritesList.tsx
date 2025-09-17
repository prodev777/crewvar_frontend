import { useState } from "react";
import { useFavorites } from "../context/FavoritesContext";

interface FavoritesListProps {
    onViewProfile?: (userId: string) => void;
    onStartChat?: (userId: string) => void;
}

export const FavoritesList = ({ onViewProfile, onStartChat }: FavoritesListProps) => {
    const { favorites, removeFavorite } = useFavorites();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFavorites = favorites.filter(favorite => {
        if (!searchTerm) return true;
        
        const displayName = favorite.favoriteUser?.displayName || `User ${favorite.favoriteUserId.slice(-4)}`;
        return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleRemoveFavorite = async (userId: string, userName: string) => {
        if (window.confirm(`Remove ${userName} from your favorites?`)) {
            try {
                await removeFavorite(userId);
            } catch (error) {
                console.error('Failed to remove favorite:', error);
                alert('Failed to remove favorite. Please try again.');
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-lg lg:text-xl font-semibold text-[#069B93]">My Favorites</h2>
                <div className="text-sm text-gray-500">
                    {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Search */}
            <div className="mb-4 lg:mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search favorites..."
                    className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                />
            </div>

            {/* Favorites List */}
            <div className="space-y-4">
                {filteredFavorites.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⭐</span>
                        </div>
                        <p className="text-gray-500">
                            {searchTerm ? 'No favorites match your search' : 'No favorites yet'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {searchTerm 
                                ? 'Try adjusting your search terms'
                                : 'Add crew members to your favorites to get alerts when you\'re sailing together!'
                            }
                        </p>
                    </div>
                ) : (
                    filteredFavorites.map((favorite) => {
                        const user = favorite.favoriteUser;
                        if (!user) return null;

                        return (
                            <div
                                key={favorite.id}
                                className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 lg:p-4 border border-gray-200 rounded-lg hover:border-[#069B93] hover:bg-[#069B93]/5 transition-colors"
                            >
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="relative flex-shrink-0">
                                        {user.profilePhoto ? (
                                            <img 
                                                src={user.profilePhoto} 
                                                alt={user.displayName}
                                                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-teal-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm lg:text-base">
                                                    {user.displayName.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">
                                            {user.displayName}
                                        </h3>
                                        <p className="text-xs lg:text-sm text-gray-600 truncate">
                                            {user.role || 'Crew Member'} • {user.department || 'Not specified'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.shipName || 'Not specified'} ({user.cruiseLine || 'Not specified'})
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between sm:justify-end space-x-2">
                                    <div className="flex items-center space-x-1">
                                        <span className="text-yellow-500 text-sm">⭐</span>
                                        <span className="text-xs text-gray-500 hidden sm:inline">
                                            Added {new Date(favorite.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1 lg:space-x-2">
                                        {onViewProfile && (
                                            <button
                                                onClick={() => onViewProfile(user.id)}
                                                className="px-2 lg:px-3 py-1 text-xs font-medium text-[#069B93] border border-[#069B93] hover:bg-[#069B93] hover:text-white rounded transition-colors"
                                            >
                                                View
                                            </button>
                                        )}
                                        {onStartChat && (
                                            <button
                                                onClick={() => onStartChat(user.id)}
                                                className="px-2 lg:px-3 py-1 text-xs font-medium text-white bg-[#069B93] hover:bg-[#058a7a] rounded transition-colors"
                                            >
                                                Chat
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRemoveFavorite(favorite.favoriteUserId, user.displayName)}
                                            className="px-2 lg:px-3 py-1 text-xs font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">ℹ</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Favorites & Alerts</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            We'll notify you when your favorite crew members are on the same ship or in the same port as you. 
                            This helps you stay connected with your crew family!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
