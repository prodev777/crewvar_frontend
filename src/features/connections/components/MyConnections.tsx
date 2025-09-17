import { useConnections, useRemoveConnection } from '../api/connectionApi';
import { defaultAvatar } from '../../../utils/images';
import { useNavigate } from 'react-router-dom';

export const MyConnections = () => {
    const { data: connectionsData, isLoading, error } = useConnections();
    const removeConnection = useRemoveConnection();
    const navigate = useNavigate();

    const handleRemoveConnection = async (connectionId: string) => {
        if (!confirm('Are you sure you want to remove this connection?')) {
            return;
        }

        try {
            await removeConnection.mutateAsync(connectionId);
            alert('Connection removed successfully!');
        } catch (error: any) {
            console.error('Failed to remove connection:', error);
            alert(error.response?.data?.error || 'Failed to remove connection. Please try again.');
        }
    };

    const handleViewProfile = (userId: string) => {
        navigate(`/crew/${userId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Connections</h3>
                <p className="text-gray-600">Failed to load your connections.</p>
            </div>
        );
    }

    const connections = connectionsData?.connections || [];

    if (connections.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Connections Yet</h3>
                <p className="text-gray-600 mb-4">You haven't connected with any crew members yet.</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                >
                    Browse Crew Members
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
                <div key={connection.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="text-center">
                        <img 
                            src={connection.profile_photo || defaultAvatar} 
                            alt={connection.display_name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4"
                        />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{connection.display_name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{connection.role_name}</p>
                        <p className="text-xs text-gray-500 mb-3">{connection.department_name}</p>
                        <p className="text-xs text-gray-400 mb-4">{connection.ship_name} • {connection.cruise_line_name}</p>
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleViewProfile(connection.user1_id === connection.id ? connection.user2_id : connection.user1_id)}
                                className="flex-1 px-3 py-2 bg-[#069B93] text-white text-sm font-medium rounded-lg hover:bg-[#058a7a] transition-colors"
                            >
                                View Profile
                            </button>
                            <button
                                onClick={() => handleRemoveConnection(connection.id)}
                                disabled={removeConnection.isLoading}
                                className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Remove
                            </button>
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-3">
                            Connected {new Date(connection.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
