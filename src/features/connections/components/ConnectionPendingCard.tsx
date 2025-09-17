import React from 'react';
import { usePendingRequests, useRespondToConnectionRequest } from '../api/connectionApi';

interface ConnectionPendingCardProps {
    className?: string;
}

export const ConnectionPendingCard: React.FC<ConnectionPendingCardProps> = () => {
    const { data: requestsData, isLoading, error } = usePendingRequests();
    const respondMutation = useRespondToConnectionRequest();

    const handleAccept = async (requestId: string) => {
        try {
            await respondMutation.mutateAsync({ requestId, action: 'accept' });
        } catch (error) {
            console.error('Error accepting connection:', error);
        }
    };

    const handleDecline = async (requestId: string) => {
        try {
            await respondMutation.mutateAsync({ requestId, action: 'decline' });
        } catch (error) {
            console.error('Error declining connection:', error);
        }
    };

    const pendingRequests = requestsData?.requests || [];

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">👥 New Connections</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        ...
                    </span>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">👥 New Connections</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        0
                    </span>
                </div>
                <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Unable to load connection requests</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#069B93]">👥 New Connections</h3>
                <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                    {pendingRequests.length}
                </span>
            </div>

            {/* Content */}
            {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <h4 className="text-gray-600 font-medium mb-2">No Pending Requests</h4>
                    <p className="text-gray-500 text-sm">You don't have any new connection requests</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            {/* Left side - User info */}
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                {/* Profile Photo */}
                                <div className="flex-shrink-0 relative">
                                    {request.profile_photo ? (
                                        <img
                                            src={request.profile_photo}
                                            alt={request.display_name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                            {request.display_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>

                                {/* User Details */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {request.display_name}
                                    </h4>
                                    <p className="text-xs text-gray-600 truncate">
                                        {request.ship_name} • {request.cruise_line_name}
                                    </p>
                                    {request.message && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            "{request.message}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right side - Action buttons */}
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => handleAccept(request.id)}
                                    disabled={respondMutation.isLoading}
                                    className="px-3 py-1 bg-[#069B93] text-white text-xs rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleDecline(request.id)}
                                    disabled={respondMutation.isLoading}
                                    className="px-3 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:border-[#069B93] hover:text-[#069B93] transition-colors"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer - View All Button */}
            {pendingRequests.length > 3 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-[#069B93] hover:text-white font-semibold text-sm py-3 border-2 border-[#069B93] rounded-xl hover:bg-gradient-to-r hover:from-[#069B93] hover:to-[#058a7a] transition-all duration-200 transform hover:scale-105">
                        View All {pendingRequests.length} Requests
                    </button>
                </div>
            )}
        </div>
    );
};
