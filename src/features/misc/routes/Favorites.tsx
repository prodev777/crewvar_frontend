import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FavoritesList } from "../../../components/FavoritesList";
import { FavoritesAlerts } from "../../../components/FavoritesAlerts";
import logo from "../../../assets/images/Home/logo.png";

export const Favorites = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'favorites' | 'alerts'>('favorites');

    const handleViewProfile = (userId: string) => {
        navigate(`/profile/${userId}`);
    };

    const handleStartChat = (userId: string) => {
        navigate(`/chat/${userId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Favorites & Alerts</h1>
                            <p className="text-xs text-teal-100">Stay connected with your crew</p>
                        </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center space-x-2 hover:bg-teal-700 rounded-lg px-3 py-2 transition-colors">
                        <img 
                            src={logo} 
                            alt="Crewvar Logo" 
                            className="h-6 w-auto"
                        />
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                </div>
            </div>

            <div className="p-4 space-y-4">

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'favorites'
                                    ? 'bg-white text-teal-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            My Favorites
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'alerts'
                                    ? 'bg-white text-teal-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Alerts
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'favorites' ? (
                        <FavoritesList 
                            onViewProfile={handleViewProfile}
                            onStartChat={handleStartChat}
                        />
                    ) : (
                        <FavoritesAlerts 
                            onViewProfile={handleViewProfile}
                            onStartChat={handleStartChat}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
