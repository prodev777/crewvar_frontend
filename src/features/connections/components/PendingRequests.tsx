import { usePendingRequests, useRespondToConnectionRequest } from '../api/connectionApi';
import { defaultAvatar } from '../../../utils/images';

export const PendingRequests = () => {
    const { data: pendingData, isLoading, error } = usePendingRequests();
    const respondToRequest = useRespondToConnectionRequest();

    const handleRespondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
        try {
            await respondToRequest.mutateAsync({ requestId, action });
            alert(`Connection request ${action}ed successfully!`);
        } catch (error: any) {
            console.error(`Failed to ${action} connection request:`, error);
            alert(error.response?.data?.error || `Failed to ${action} connection request. Please try again.`);
        }
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
                <p className="text-gray-600">Failed to load pending connection requests.</p>
            </div>
        );
    }

    const requests = pendingData?.requests || [];

    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">You don't have any pending connection requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start space-x-4">
                        <img 
                            src={request.profile_photo || defaultAvatar} 
                            alt={request.display_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{request.display_name}</h3>
                                    <p className="text-sm text-gray-600">{request.role_name} • {request.department_name}</p>
                                    <p className="text-xs text-gray-500">{request.ship_name} • {request.cruise_line_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            {request.message && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                                </div>
                            )}
                            
                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={() => handleRespondToRequest(request.id, 'accept')}
                                    disabled={respondToRequest.isLoading}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {respondToRequest.isLoading ? 'Processing...' : 'Accept'}
                                </button>
                                <button
                                    onClick={() => handleRespondToRequest(request.id, 'decline')}
                                    disabled={respondToRequest.isLoading}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {respondToRequest.isLoading ? 'Processing...' : 'Decline'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
