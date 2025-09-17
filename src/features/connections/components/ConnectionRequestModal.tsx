import React, { useState, useEffect } from 'react';
import { useCrewSearch } from '../api/crewSearchApi';
import { useSendConnectionRequest } from '../api/connectionApi';

interface ConnectionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [requestMessage, setRequestMessage] = useState('');
    
    const { data: crewData, isLoading, error } = useCrewSearch(searchQuery);
    const sendRequestMutation = useSendConnectionRequest();

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSelectedUser(null);
            setRequestMessage('');
        }
    }, [isOpen]);

    const handleSendRequest = async () => {
        if (!selectedUser) return;

        try {
            await sendRequestMutation.mutateAsync({
                receiverId: selectedUser.id,
                message: requestMessage.trim() || undefined
            });
            
            // Success - close modal and reset
            onClose();
            setSelectedUser(null);
            setRequestMessage('');
        } catch (error) {
            console.error('Failed to send connection request:', error);
        }
    };

    const handleUserSelect = (user: any) => {
        setSelectedUser(user);
        setSearchQuery(user.display_name);
    };

    const handleBackToSearch = () => {
        setSelectedUser(null);
        setRequestMessage('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#069B93] to-[#058a7a] p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">🔗 Send Connection Request</h2>
                            <p className="text-teal-100 text-sm mt-1">
                                {selectedUser ? 'Add a personal message' : 'Search for crew members to connect with'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-teal-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {!selectedUser ? (
                        // Search View
                        <div>
                            {/* Search Input */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name, department, or role..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#069B93] focus:border-transparent outline-none transition-all"
                                    />
                                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Search Results Header */}
                            {!isLoading && !error && crewData?.crew && crewData.crew.length > 0 && (
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        {searchQuery ? `Found ${crewData.crew.length} crew member${crewData.crew.length !== 1 ? 's' : ''}` : `Showing ${crewData.crew.length} crew member${crewData.crew.length !== 1 ? 's' : ''}`}
                                    </h4>
                                </div>
                            )}

                            {/* Search Results */}
                            <div className={`space-y-3 ${crewData?.crew && crewData.crew.length > 3 ? 'max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="ml-3 text-gray-600">Loading crew members...</span>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-500 mb-4">Failed to load crew members</p>
                                        <button 
                                            onClick={() => window.location.reload()} 
                                            className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : crewData?.crew?.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-gray-600 font-medium mb-2">No crew members found</h4>
                                        <p className="text-gray-500 text-sm">
                                            {searchQuery ? 'Try adjusting your search terms' : 'Start typing to search for crew members'}
                                        </p>
                                    </div>
                                ) : (
                                    crewData?.crew?.map((member) => (
                                        <div
                                            key={member.id}
                                            onClick={() => handleUserSelect(member)}
                                            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                            {/* Profile Photo */}
                                            <div className="flex-shrink-0 relative">
                                                {member.profile_photo ? (
                                                    <img
                                                        src={member.profile_photo}
                                                        alt={member.display_name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                                        {member.display_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                            </div>

                                            {/* User Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                    {member.display_name}
                                                </h4>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {member.role_name && member.department_name 
                                                        ? `${member.role_name} • ${member.department_name}`
                                                        : member.role_name || member.department_name || 'Crew Member'
                                                    }
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {member.ship_name} • {member.cruise_line_name}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex-shrink-0">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        // Selected User View
                        <div>
                            {/* Selected User Info */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl mb-6">
                                <div className="flex-shrink-0 relative">
                                    {selectedUser.profile_photo ? (
                                        <img
                                            src={selectedUser.profile_photo}
                                            alt={selectedUser.display_name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                                            {selectedUser.display_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {selectedUser.display_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedUser.role_name && selectedUser.department_name 
                                            ? `${selectedUser.role_name} • ${selectedUser.department_name}`
                                            : selectedUser.role_name || selectedUser.department_name || 'Crew Member'
                                        }
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {selectedUser.ship_name} • {selectedUser.cruise_line_name}
                                    </p>
                                </div>

                                <button
                                    onClick={handleBackToSearch}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Message Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Personal Message (Optional)
                                </label>
                                <textarea
                                    placeholder="Add a personal message to your connection request..."
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#069B93] focus:border-transparent outline-none transition-all resize-none"
                                    rows={4}
                                    maxLength={500}
                                />
                                <div className="text-right text-xs text-gray-500 mt-1">
                                    {requestMessage.length}/500 characters
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleBackToSearch}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Back to Search
                                </button>
                                <button
                                    onClick={handleSendRequest}
                                    disabled={sendRequestMutation.isLoading}
                                    className="flex-1 px-4 py-3 bg-[#069B93] text-white rounded-xl hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {sendRequestMutation.isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Sending...
                                        </div>
                                    ) : (
                                        'Send Request'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
