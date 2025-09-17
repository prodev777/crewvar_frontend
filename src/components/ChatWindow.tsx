import { useState, useEffect, useRef } from "react";
import { useSendMessage, useUpdateMessageStatus } from "../features/chat/api/chatApi";
import { useSocket } from "../features/chat/hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { IChatMessage } from "../features/chat/api/chatApi";

interface ChatWindowProps {
    chatUser: { id: string; name: string; avatar: string };
    onClose: () => void;
    messages: IChatMessage[];
    isLoading?: boolean;
}

export const ChatWindow = ({ chatUser, onClose, messages, isLoading }: ChatWindowProps) => {
    const { currentUser } = useAuth();
    const { emitEvent, onEvent, offEvent } = useSocket();
    const sendMessageMutation = useSendMessage();
    const updateStatusMutation = useUpdateMessageStatus();
    
    const [messageInput, setMessageInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    console.log('ChatWindow render:', { 
        currentUser: currentUser?.uid, 
        chatUser, 
        messagesCount: messages.length,
        isLoading,
        messageInput,
        sendMessageMutation: {
            isLoading: sendMessageMutation.isLoading,
            isError: sendMessageMutation.isError,
            error: sendMessageMutation.error
        }
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle typing indicator
    useEffect(() => {
        if (isTyping) {
            emitEvent('typing-start', { senderId: currentUser?.uid, receiverId: chatUser.id });
        } else {
            emitEvent('typing-stop', { senderId: currentUser?.uid, receiverId: chatUser.id });
        }
    }, [isTyping, emitEvent, currentUser?.uid, chatUser.id]);

    // Socket event listeners
    useEffect(() => {
        const handleTyping = (data: { userId: string; isTyping: boolean }) => {
            if (data.userId === chatUser.id) {
                setTypingUsers(prev => 
                    data.isTyping 
                        ? [...prev.filter(id => id !== data.userId), data.userId]
                        : prev.filter(id => id !== data.userId)
                );
            }
        };

        const handleNewMessage = (_data: any) => {
            // Message will be updated via React Query cache
        };

        const handleMessageStatusUpdate = (data: { messageId: string; status: string }) => {
            updateStatusMutation.mutate({
                messageId: data.messageId,
                status: data.status
            });
        };

        onEvent('user-typing', handleTyping);
        onEvent('new-message', handleNewMessage);
        onEvent('message-status-update', handleMessageStatusUpdate);

        return () => {
            offEvent('user-typing', handleTyping);
            offEvent('new-message', handleNewMessage);
            offEvent('message-status-update', handleMessageStatusUpdate);
        };
    }, [chatUser.id, onEvent, offEvent, updateStatusMutation]);

    const handleSendMessage = async () => {
        console.log('handleSendMessage called!', {
            messageInput: messageInput.trim(),
            currentUser: currentUser?.uid,
            chatUser: chatUser.id
        });
        
        // Simple workaround: Use a mock user ID for now
        const mockUserId = 'user-mock-12345';
        
        if (!messageInput.trim()) {
            console.log('Early return from handleSendMessage: No message content');
            return;
        }

        const messageContent = messageInput.trim();
        console.log('Sending message:', {
            receiverId: chatUser.id,
            content: messageContent,
            senderId: mockUserId
        });

        try {
            const result = await sendMessageMutation.mutateAsync({
                receiverId: chatUser.id,
                content: messageContent
            });
            
            console.log('Message sent successfully:', result);
            
            setMessageInput("");
            setIsTyping(false);
            
            // Emit socket event for real-time delivery
            emitEvent('send-message', {
                senderId: mockUserId,
                receiverId: chatUser.id,
                content: messageContent
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log('Input changed:', value);
        setMessageInput(value);
        
        // Handle typing indicator
        if (!isTyping) {
            setIsTyping(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        console.log('Key pressed:', e.key);
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            console.log('Enter key pressed, calling handleSendMessage');
            handleSendMessage();
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getMessageStatusIcon = (status: string) => {
        switch (status) {
            case 'read':
                return <span className="text-white text-xs">✓✓</span>;
            case 'delivered':
                return <span className="text-white text-xs">✓✓</span>;
            case 'sent':
                return <span className="text-white text-xs">✓</span>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#069B93] mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                    <img 
                        src={chatUser.avatar} 
                        alt={chatUser.name}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{chatUser.name}</h3>
                        <p className="text-xs text-gray-500">
                            {typingUsers.includes(chatUser.id) ? 'typing...' : 'online'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        // Determine message ownership based on who we're chatting with
                        // If the sender_id matches the chatUser.id, it's THEIR message (left/gray)
                        // If the sender_id is different, it's OUR message (right/teal)
                        const isOwnMessage = message.sender_id !== chatUser.id;
                        
                        
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                            >
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                                    isOwnMessage 
                                        ? 'bg-teal-500 text-white rounded-br-md' 
                                        : 'bg-gray-200 text-gray-800 rounded-bl-md'
                                }`}>
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    <div className={`flex items-center justify-between mt-2 ${
                                        isOwnMessage ? 'text-teal-100' : 'text-gray-500'
                                    }`}>
                                        <span className="text-xs">
                                            {formatTime(message.timestamp)}
                                        </span>
                                        {isOwnMessage && getMessageStatusIcon(message.status)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 lg:p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none text-sm lg:text-base"
                        disabled={sendMessageMutation.isLoading}
                    />
                    <button
                        onClick={() => {
                            console.log('Send button clicked!', {
                                messageInput: messageInput.trim(),
                                hasContent: !!messageInput.trim(),
                                isLoading: sendMessageMutation.isLoading,
                                disabled: !messageInput.trim() || sendMessageMutation.isLoading
                            });
                            handleSendMessage();
                        }}
                        disabled={!messageInput.trim() || sendMessageMutation.isLoading}
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sendMessageMutation.isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};