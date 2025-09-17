import { useState } from 'react';
import { useConnectionStatus, useSendConnectionRequest } from '../api/connectionApi';

interface ConnectionButtonProps {
    userId: string;
    userName: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const ConnectionButton = ({ userId, userName, className = '', size = 'md' }: ConnectionButtonProps) => {
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState('');
    
    const { data: statusData, isLoading: statusLoading } = useConnectionStatus(userId);
    const sendRequestMutation = useSendConnectionRequest();

    const handleSendRequest = async () => {
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }
        
        try {
            await sendRequestMutation.mutateAsync({
                receiverId: userId,
                message: message.trim()
            });
            setShowMessageModal(false);
            setMessage('');
            alert('Connection request sent successfully!');
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
            alert(error.response?.data?.error || 'Failed to send connection request');
        }
    };

    const getButtonConfig = () => {
        if (statusLoading) {
            return {
                text: 'Loading...',
                className: 'opacity-50 cursor-not-allowed',
                disabled: true,
                onClick: () => {}
            };
        }

        switch (statusData?.status) {
            case 'connected':
                return {
                    text: 'Connected',
                    className: 'bg-green-600 text-white cursor-not-allowed',
                    disabled: true,
                    onClick: () => {}
                };
            case 'pending':
                return {
                    text: 'Request Sent',
                    className: 'bg-yellow-500 text-white cursor-not-allowed',
                    disabled: true,
                    onClick: () => {}
                };
            case 'declined':
                return {
                    text: 'Connect',
                    className: 'bg-[#069B93] hover:bg-[#058a7a] text-white',
                    disabled: false,
                    onClick: () => setShowMessageModal(true)
                };
            case 'blocked':
                return {
                    text: 'Blocked',
                    className: 'bg-red-500 text-white cursor-not-allowed',
                    disabled: true,
                    onClick: () => {}
                };
            default:
                return {
                    text: 'Connect',
                    className: 'bg-[#069B93] hover:bg-[#058a7a] text-white',
                    disabled: false,
                    onClick: () => setShowMessageModal(true)
                };
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1 text-xs';
            case 'lg':
                return 'px-6 py-3 text-base';
            default:
                return 'px-4 py-2 text-sm';
        }
    };

    const buttonConfig = getButtonConfig();

    return (
        <>
            <button
                onClick={buttonConfig.onClick}
                disabled={buttonConfig.disabled}
                className={`${getSizeClasses()} ${buttonConfig.className} ${className} rounded-lg transition-colors font-medium`}
            >
                {buttonConfig.text}
            </button>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Send Connection Request to {userName}
                        </h3>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hi! I'd like to connect with you..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                                rows={3}
                            />
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setMessage('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendRequest}
                                disabled={sendRequestMutation.isLoading}
                                className="flex-1 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {sendRequestMutation.isLoading ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
